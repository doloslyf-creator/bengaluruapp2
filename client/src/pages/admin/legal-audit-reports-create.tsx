import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  FileText, 
  Building, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Save,
  ArrowLeft
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { useEffect, useState } from "react";

// Form schema based on the Legal Audit Report structure
const formSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  reportTitle: z.string().min(1, "Report title is required"),
  lawyerName: z.string().min(1, "Lawyer name is required"),
  lawyerBarNumber: z.string().min(1, "Bar registration number is required"),
  auditDate: z.string().min(1, "Audit date is required"),
  reportDate: z.string().min(1, "Report date is required"),
  status: z.enum(["draft", "in-progress", "completed", "approved"]),
  overallScore: z.number().min(0).max(100),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  executiveSummary: z.string(),
  keyFindings: z.string(),
  recommendations: z.string(),
  legalConclusion: z.string(),
  
  // Property Ownership & Title
  currentOwnership: z.object({
    ownerName: z.string(),
    ownershipType: z.string(),
    acquisitionDate: z.string(),
    acquisitionMode: z.string(),
    previousOwners: z.array(z.string()),
  }),
  
  titleVerification: z.object({
    titleDeedNumber: z.string(),
    registrationDate: z.string(),
    registrarOffice: z.string(),
    titleClarity: z.enum(["clear", "disputed", "encumbered", "unclear"]),
    encumbrances: z.array(z.string()),
    titleDefects: z.array(z.string()),
  }),
  
  // Legal Documentation
  statutoryApprovals: z.object({
    reraRegistration: z.boolean(),
    reraNumber: z.string(),
    planApproval: z.boolean(),
    approvalNumber: z.string(),
    completionCertificate: z.boolean(),
    occupancyCertificate: z.boolean(),
    environmentClearance: z.boolean(),
  }),
  
  taxCompliance: z.object({
    propertyTaxStatus: z.enum(["current", "arrears", "disputed"]),
    khataStatus: z.enum(["a-khata", "b-khata", "revenue-records", "disputed"]),
    surveyNumber: z.string(),
    dcConversion: z.boolean(),
    landRevenuePaid: z.boolean(),
  }),
  
  // Legal Risk Assessment
  litigationHistory: z.object({
    pendingCases: z.array(z.string()),
    pastDisputes: z.array(z.string()),
    courtOrders: z.array(z.string()),
    legalNotices: z.array(z.string()),
  }),
  
  complianceStatus: z.object({
    municipalCompliance: z.boolean(),
    fireNocStatus: z.boolean(),
    pollutionClearance: z.boolean(),
    waterConnectionLegal: z.boolean(),
    electricityConnectionLegal: z.boolean(),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminLegalAuditReportsCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Extract report ID from URL if in edit mode
  const currentPath = window.location.pathname;
  const editMatch = currentPath.match(/\/edit$/) && currentPath.includes('/legal-audit-reports/');
  const reportId = editMatch ? currentPath.split('/').slice(-2, -1)[0] : null;
  const isEditMode = !!reportId;

  // Fetch properties for dropdown
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch existing report data if in edit mode
  const { data: existingReport, isLoading: isLoadingReport } = useQuery({
    queryKey: [`/api/legal-audit-reports/${reportId}`],
    enabled: isEditMode && !!reportId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      reportTitle: "",
      lawyerName: "",
      lawyerBarNumber: "",
      auditDate: "",
      reportDate: "",
      status: "draft",
      overallScore: 0,
      riskLevel: "medium",
      executiveSummary: "",
      keyFindings: "",
      recommendations: "",
      legalConclusion: "",
      currentOwnership: {
        ownerName: "",
        ownershipType: "",
        acquisitionDate: "",
        acquisitionMode: "",
        previousOwners: [],
      },
      titleVerification: {
        titleDeedNumber: "",
        registrationDate: "",
        registrarOffice: "",
        titleClarity: "clear",
        encumbrances: [],
        titleDefects: [],
      },
      statutoryApprovals: {
        reraRegistration: false,
        reraNumber: "",
        planApproval: false,
        approvalNumber: "",
        completionCertificate: false,
        occupancyCertificate: false,
        environmentClearance: false,
      },
      taxCompliance: {
        propertyTaxStatus: "current",
        khataStatus: "a-khata",
        surveyNumber: "",
        dcConversion: false,
        landRevenuePaid: false,
      },
      litigationHistory: {
        pendingCases: [],
        pastDisputes: [],
        courtOrders: [],
        legalNotices: [],
      },
      complianceStatus: {
        municipalCompliance: false,
        fireNocStatus: false,
        pollutionClearance: false,
        waterConnectionLegal: false,
        electricityConnectionLegal: false,
      },
    },
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (existingReport && isEditMode) {
      const report = existingReport as any;
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      form.reset({
        propertyId: report.propertyId || "",
        reportTitle: report.reportTitle || "",
        lawyerName: report.lawyerName || "",
        lawyerBarNumber: report.lawyerBarNumber || "",
        auditDate: formatDateForInput(report.auditDate) || "",
        reportDate: formatDateForInput(report.reportDate) || "",
        status: report.status || "draft",
        overallScore: report.overallScore || 0,
        riskLevel: report.riskLevel || "medium",
        executiveSummary: report.executiveSummary || "",
        keyFindings: report.keyFindings || "",
        recommendations: report.recommendations || "",
        legalConclusion: report.legalConclusion || "",
        currentOwnership: report.currentOwnership || {
          ownerName: "",
          ownershipType: "",
          acquisitionDate: "",
          acquisitionMode: "",
          previousOwners: [],
        },
        titleVerification: report.titleVerification || {
          titleDeedNumber: "",
          registrationDate: "",
          registrarOffice: "",
          titleClarity: "clear",
          encumbrances: [],
          titleDefects: [],
        },
        statutoryApprovals: report.statutoryApprovals || {
          reraRegistration: false,
          reraNumber: "",
          planApproval: false,
          approvalNumber: "",
          completionCertificate: false,
          occupancyCertificate: false,
          environmentClearance: false,
        },
        taxCompliance: report.taxCompliance || {
          propertyTaxStatus: "current",
          khataStatus: "a-khata",
          surveyNumber: "",
          dcConversion: false,
          landRevenuePaid: false,
        },
        litigationHistory: report.litigationHistory || {
          pendingCases: [],
          pastDisputes: [],
          courtOrders: [],
          legalNotices: [],
        },
        complianceStatus: report.complianceStatus || {
          municipalCompliance: false,
          fireNocStatus: false,
          pollutionClearance: false,
          waterConnectionLegal: false,
          electricityConnectionLegal: false,
        },
      });
    }
  }, [existingReport, isEditMode, form]);

  const saveReportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditMode ? `/api/legal-audit-reports/${reportId}` : "/api/legal-audit-reports";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} report`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-audit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-audit-reports-stats"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/legal-audit-reports/${reportId}`] });
      }
      toast({ title: `Legal Audit Report ${isEditMode ? 'updated' : 'created'} successfully` });
      setLocation("/admin-panel/legal-audit-reports");
    },
    onError: (error: any) => {
      toast({
        title: `Error ${isEditMode ? 'updating' : 'creating'} report`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Clean and prepare data for submission
    const submitData = {
      propertyId: data.propertyId,
      reportTitle: data.reportTitle,
      lawyerName: data.lawyerName,
      lawyerBarNumber: data.lawyerBarNumber,
      auditDate: data.auditDate,
      reportDate: data.reportDate,
      status: data.status,
      overallScore: Number(data.overallScore) || 0,
      riskLevel: data.riskLevel,
      executiveSummary: data.executiveSummary || "",
      keyFindings: data.keyFindings || "",
      recommendations: data.recommendations || "",
      legalConclusion: data.legalConclusion || "",
      // Store complex objects as JSON strings
      currentOwnership: JSON.stringify(data.currentOwnership || {}),
      titleVerification: JSON.stringify(data.titleVerification || {}),
      statutoryApprovals: JSON.stringify(data.statutoryApprovals || {}),
      taxCompliance: JSON.stringify(data.taxCompliance || {}),
      litigationHistory: JSON.stringify(data.litigationHistory || {}),
      complianceStatus: JSON.stringify(data.complianceStatus || {}),
    };
    
    console.log("Submitting Legal Audit report data:", submitData);
    saveReportMutation.mutate(submitData);
  };

  if (isLoadingReport || isLoadingProperties) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/admin-panel/legal-audit-reports")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit Legal Audit Report' : 'Create Legal Audit Report'}
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive legal due diligence analysis for property investment decisions
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="ownership" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Ownership
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Legal Docs
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Compliance
                    </TabsTrigger>
                    <TabsTrigger value="assessment" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Assessment
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-property">
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.name} - {property.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reportTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Title *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Legal Audit Report - Property Name" data-testid="input-report-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lawyerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lawyer Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Advocate Name" data-testid="input-lawyer-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lawyerBarNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bar Registration Number *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Bar Council Registration No." data-testid="input-bar-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="auditDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audit Date *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-audit-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reportDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Date *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-report-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="overallScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Score (0-100)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" max="100" 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-overall-score" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="riskLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Risk Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-risk-level">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low Risk</SelectItem>
                                <SelectItem value="medium">Medium Risk</SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                                <SelectItem value="critical">Critical Risk</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="executiveSummary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Executive Summary</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} 
                                placeholder="Brief overview of the legal audit findings..."
                                data-testid="textarea-executive-summary" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="keyFindings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Key Findings</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} 
                                placeholder="Key legal findings and observations..."
                                data-testid="textarea-key-findings" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recommendations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recommendations</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} 
                                placeholder="Legal recommendations and action items..."
                                data-testid="textarea-recommendations" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="legalConclusion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Legal Conclusion</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} 
                                placeholder="Final legal conclusion and investment recommendation..."
                                data-testid="textarea-legal-conclusion" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Property Ownership Tab */}
              <TabsContent value="ownership" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Property Ownership & Title Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Current Ownership</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currentOwnership.ownerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Current property owner" data-testid="input-owner-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentOwnership.ownershipType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ownership Type</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Individual/Joint/Corporate" data-testid="input-ownership-type" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentOwnership.acquisitionDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Acquisition Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-acquisition-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentOwnership.acquisitionMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Acquisition Mode</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Purchase/Inheritance/Gift" data-testid="input-acquisition-mode" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Title Verification</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="titleVerification.titleDeedNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Deed Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Registration deed number" data-testid="input-title-deed-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="titleVerification.registrationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" data-testid="input-registration-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="titleVerification.registrarOffice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registrar Office</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Sub-registrar office location" data-testid="input-registrar-office" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="titleVerification.titleClarity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Clarity</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-title-clarity">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="clear">Clear Title</SelectItem>
                                  <SelectItem value="disputed">Disputed</SelectItem>
                                  <SelectItem value="encumbered">Encumbered</SelectItem>
                                  <SelectItem value="unclear">Unclear</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Legal Documentation Tab */}
              <TabsContent value="legal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Legal Documentation & Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Statutory Approvals</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="statutoryApprovals.reraRegistration"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-rera-registration"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>RERA Registration</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="statutoryApprovals.reraNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RERA Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="PRM/KA/RERA/1251/446/PR/..." data-testid="input-rera-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="statutoryApprovals.planApproval"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-plan-approval"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Building Plan Approval</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="statutoryApprovals.approvalNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approval Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="BBMP/BDA approval number" data-testid="input-approval-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="statutoryApprovals.completionCertificate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-completion-certificate"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Completion Certificate</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="statutoryApprovals.occupancyCertificate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-occupancy-certificate"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Occupancy Certificate</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="statutoryApprovals.environmentClearance"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-environment-clearance"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Environment Clearance</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tax Compliance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="taxCompliance.propertyTaxStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Tax Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-property-tax-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="current">Current</SelectItem>
                                  <SelectItem value="arrears">In Arrears</SelectItem>
                                  <SelectItem value="disputed">Disputed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="taxCompliance.khataStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Khata Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-khata-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="a-khata">A-Khata</SelectItem>
                                  <SelectItem value="b-khata">B-Khata</SelectItem>
                                  <SelectItem value="revenue-records">Revenue Records</SelectItem>
                                  <SelectItem value="disputed">Disputed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="taxCompliance.surveyNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Survey Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Revenue survey number" data-testid="input-survey-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="taxCompliance.dcConversion"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-dc-conversion"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>DC Conversion Done</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="taxCompliance.landRevenuePaid"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-land-revenue-paid"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Land Revenue Paid</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compliance Status Tab */}
              <TabsContent value="compliance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="complianceStatus.municipalCompliance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-municipal-compliance"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Municipal Compliance</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complianceStatus.fireNocStatus"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-fire-noc"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Fire NOC Status</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complianceStatus.pollutionClearance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-pollution-clearance"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Pollution Clearance</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complianceStatus.waterConnectionLegal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-water-connection"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Legal Water Connection</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complianceStatus.electricityConnectionLegal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-electricity-connection"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Legal Electricity Connection</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Risk Assessment Tab */}
              <TabsContent value="assessment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Legal Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Document any pending legal cases, disputes, court orders, or legal notices related to the property.
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-2">Litigation History</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add each item on a new line. Leave blank if none.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Pending Cases</label>
                            <Textarea 
                              placeholder="List any pending court cases (one per line)..."
                              rows={3}
                              className="mt-1"
                              data-testid="textarea-pending-cases"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Past Disputes</label>
                            <Textarea 
                              placeholder="List any resolved past disputes (one per line)..."
                              rows={3}
                              className="mt-1"
                              data-testid="textarea-past-disputes"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Court Orders</label>
                            <Textarea 
                              placeholder="List any court orders or injunctions (one per line)..."
                              rows={3}
                              className="mt-1"
                              data-testid="textarea-court-orders"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Legal Notices</label>
                            <Textarea 
                              placeholder="List any legal notices served (one per line)..."
                              rows={3}
                              className="mt-1"
                              data-testid="textarea-legal-notices"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin-panel/legal-audit-reports")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saveReportMutation.isPending}
                data-testid="button-submit"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveReportMutation.isPending 
                  ? `${isEditMode ? 'Updating' : 'Creating'}...` 
                  : `${isEditMode ? 'Update' : 'Create'} Report`
                }
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}