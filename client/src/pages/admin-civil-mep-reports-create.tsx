import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/layout/admin-layout";
import { Save, ArrowLeft, Plus, Trash2, FileText, Wrench, Zap, Building2, Home, Settings, Layers, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { insertCivilMepReportSchema } from "@shared/schema";

// Form schema for validation - using string dates for form input
const formSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  reportTitle: z.string().min(1, "Report title is required"),
  engineerName: z.string().min(1, "Engineer name is required"),
  engineerLicense: z.string().min(1, "Engineer license is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  reportDate: z.string().min(1, "Report date is required"),
  status: z.enum(["draft", "in-progress", "completed", "approved"]).default("draft"),
  overallScore: z.number().min(0).max(10).default(0),
  executiveSummary: z.string().default(""),
  recommendations: z.string().default(""),
  conclusions: z.string().default(""),
  investmentRecommendation: z.enum(["highly-recommended", "recommended", "conditional", "not-recommended"]).default("conditional"),
  // Simplified form fields for basic site information and key details
  siteLocation: z.string().default(""),
  plotArea: z.string().default(""),
  builtUpArea: z.string().default(""),
  foundationType: z.string().default(""),
  structuralSystem: z.string().default(""),
  concreteGrade: z.string().default(""),
  steelGrade: z.string().default(""),
  structuralCondition: z.string().default(""),
  wallMaterial: z.string().default(""),
  roofType: z.string().default(""),
  electricalLoad: z.string().default(""),
  plumbingType: z.string().default(""),
  hvacSystem: z.string().default(""),
  fireSafetyGrade: z.string().default(""),
  // Detailed notes fields
  civilNotes: z.string().default(""),
  mechanicalNotes: z.string().default(""),
  electricalNotes: z.string().default(""),
  plumbingNotes: z.string().default(""),
});

type FormData = z.infer<typeof formSchema>;

export function AdminCivilMepReportsCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Extract report ID from URL if in edit mode
  const currentPath = window.location.pathname;
  const editMatch = currentPath.match(/\/edit$/) && currentPath.includes('/civil-mep-reports/');
  const reportId = editMatch ? currentPath.split('/').slice(-2, -1)[0] : null;
  const isEditMode = !!reportId;

  // Fetch properties for dropdown
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch existing report data if in edit mode
  const { data: existingReport, isLoading: isLoadingReport } = useQuery({
    queryKey: [`/api/civil-mep-reports/${reportId}`],
    enabled: isEditMode && !!reportId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      reportTitle: "",
      engineerName: "",
      engineerLicense: "",
      inspectionDate: "",
      reportDate: "",
      status: "draft",
      overallScore: 0,
      executiveSummary: "",
      recommendations: "",
      conclusions: "",
      investmentRecommendation: "conditional",
      // Initialize simplified fields
      siteLocation: "",
      plotArea: "",
      builtUpArea: "",
      foundationType: "",
      structuralSystem: "",
      concreteGrade: "",
      steelGrade: "",
      structuralCondition: "",
      wallMaterial: "",
      roofType: "",
      electricalLoad: "",
      plumbingType: "",
      hvacSystem: "",
      fireSafetyGrade: "",
      civilNotes: "",
      mechanicalNotes: "",
      electricalNotes: "",
      plumbingNotes: "",
    },
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (existingReport && isEditMode) {
      const report = existingReport as any; // Type cast to handle the dynamic nature of the report data
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      form.reset({
        propertyId: report.propertyId || "",
        reportTitle: report.reportTitle || "",
        engineerName: report.engineerName || "",
        engineerLicense: report.engineerLicense || "",
        inspectionDate: formatDateForInput(report.inspectionDate) || "",
        reportDate: formatDateForInput(report.reportDate) || "",
        status: report.status || "draft",
        overallScore: report.overallScore || 0,
        executiveSummary: report.executiveSummary || "",
        recommendations: report.recommendations || "",
        conclusions: report.conclusions || "",
        investmentRecommendation: report.investmentRecommendation || "conditional",
        // Populate JSON fields with existing data or empty objects
        siteLocation: report.siteLocation || "",
        plotArea: report.plotArea || "",
        builtUpArea: report.builtUpArea || "",
        foundationType: report.foundationType || "",
        structuralSystem: report.structuralSystem || "",
        concreteGrade: report.concreteGrade || "",
        steelGrade: report.steelGrade || "",
        structuralCondition: report.structuralCondition || "",
        wallMaterial: report.wallMaterial || "",
        roofType: report.roofType || "",
        electricalLoad: report.electricalLoad || "",
        plumbingType: report.plumbingType || "",
        hvacSystem: report.hvacSystem || "",
        fireSafetyGrade: report.fireSafetyGrade || "",
        civilNotes: report.civilNotes || "",
        mechanicalNotes: report.mechanicalNotes || "",
        electricalNotes: report.electricalNotes || "",
        plumbingNotes: report.plumbingNotes || "",
      });
    }
  }, [existingReport, isEditMode, form]);

  // Create/Update report mutation
  const saveReportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditMode ? `/api/civil-mep-reports/${reportId}` : "/api/civil-mep-reports";
      const method = isEditMode ? "PATCH" : "POST";
      
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
    onSuccess: (response) => {
      console.log("Report saved successfully:", response);
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports-stats"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: [`/api/civil-mep-reports/${reportId}`] });
      }
      toast({ 
        title: `Civil+MEP Report ${isEditMode ? 'updated' : 'created'} successfully`,
        description: `Report "${response.reportTitle}" has been ${isEditMode ? 'updated' : 'created'}.`,
      });
      
      // Only redirect if shouldRedirect is true (Save & Close)
      if (shouldRedirect || !isEditMode) {
        setLocation("/admin-panel/civil-mep-reports");
      }
    },
    onError: (error: any) => {
      console.error("Error saving report:", error);
      toast({
        title: `Error ${isEditMode ? 'updating' : 'creating'} report`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Track whether to redirect after save
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const onSubmit = (data: FormData, redirect: boolean = true) => {
    console.log("Form submitted with data:", data);
    setShouldRedirect(redirect);
    
    // Keep date strings as strings for submission
    const submitData = {
      propertyId: data.propertyId,
      reportTitle: data.reportTitle,
      engineerName: data.engineerName,
      engineerLicense: data.engineerLicense,
      inspectionDate: data.inspectionDate,
      reportDate: data.reportDate,
      status: data.status,
      overallScore: data.overallScore,
      executiveSummary: data.executiveSummary,
      recommendations: data.recommendations,
      conclusions: data.conclusions,
      investmentRecommendation: data.investmentRecommendation,
      siteLocation: data.siteLocation,
      plotArea: data.plotArea,
      builtUpArea: data.builtUpArea,
      foundationType: data.foundationType,
      structuralSystem: data.structuralSystem,
      concreteGrade: data.concreteGrade,
      steelGrade: data.steelGrade,
      structuralCondition: data.structuralCondition,
      wallMaterial: data.wallMaterial,
      roofType: data.roofType,
      electricalLoad: data.electricalLoad,
      plumbingType: data.plumbingType,
      hvacSystem: data.hvacSystem,
      fireSafetyGrade: data.fireSafetyGrade,
      civilNotes: data.civilNotes,
      mechanicalNotes: data.mechanicalNotes,
      electricalNotes: data.electricalNotes,
      plumbingNotes: data.plumbingNotes,
    };
    
    console.log("Submitting data to API:", submitData);
    saveReportMutation.mutate(submitData);
  };

  // Show loading state when in edit mode and report is being fetched
  if (isEditMode && isLoadingReport) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading report data...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div>
          <Link
            to="/admin-panel/civil-mep-reports"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
            data-testid="link-back-to-reports"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Civil+MEP Reports
          </Link>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {isEditMode ? "Edit Civil+MEP Engineering Report" : "New Civil+MEP Engineering Report"}
              </CardTitle>
              <CardDescription>
                {isEditMode ? "Update the comprehensive engineering assessment report" : "Create a comprehensive engineering assessment report for a property"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Main Form Content with Vertical Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex gap-6">
              {/* Vertical Sidebar Navigation */}
              <div className="w-64 shrink-0 hidden lg:block">
                <div className="sticky top-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Report Sections</CardTitle>
                      <CardDescription>Navigate through report sections</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <TabsList className="flex flex-col h-auto p-1 bg-transparent space-y-1">
                        <TabsTrigger 
                          value="basic" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Basic Information</div>
                              <div className="text-xs text-muted-foreground">Report details & setup</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="civil" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Civil Engineering</div>
                              <div className="text-xs text-muted-foreground">Structure & construction</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="mep" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">MEP Systems</div>
                              <div className="text-xs text-muted-foreground">Mechanical, electrical & plumbing</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="summary" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Summary & Assessment</div>
                              <div className="text-xs text-muted-foreground">Final analysis & recommendations</div>
                            </div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile Navigation - Show above content on small screens */}
              <div className="lg:hidden w-full mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Report Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 h-auto bg-transparent p-1">
                      <TabsTrigger 
                        value="basic" 
                        className="flex flex-col items-center gap-1 p-3 text-xs bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Basic</span>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="civil" 
                        className="flex flex-col items-center gap-1 p-3 text-xs bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Civil</span>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="mep" 
                        className="flex flex-col items-center gap-1 p-3 text-xs bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                      >
                        <Zap className="h-4 w-4" />
                        <span>MEP</span>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="summary" 
                        className="flex flex-col items-center gap-1 p-3 text-xs bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Summary</span>
                      </TabsTrigger>
                    </TabsList>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 space-y-6">

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="tab-content-transition space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                  <CardDescription>
                    Basic information about the report and property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property">
                                <SelectValue placeholder="Select a property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingProperties ? (
                                <div className="p-2 text-sm text-gray-500">Loading properties...</div>
                              ) : properties.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500">No properties available</div>
                              ) : (
                                (properties as any[]).map((property) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.name} - {property.address}
                                  </SelectItem>
                                ))
                              )}
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
                          <FormLabel>Report Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Civil+MEP Assessment - Property Name"
                              {...field}
                              data-testid="input-report-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engineerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engineer Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full name of the inspecting engineer"
                              {...field}
                              data-testid="input-engineer-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engineerLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engineer License</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Professional license number"
                              {...field}
                              data-testid="input-engineer-license"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inspectionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspection Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-inspection-date"
                            />
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
                          <FormLabel>Report Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-report-date"
                            />
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
                          <FormLabel>Overall Score (0-10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={field.value || 0}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-overall-score"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Civil Engineering Tab */}
            <TabsContent value="civil" className="tab-content-transition space-y-6">
              {/* Site Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Basic project and location details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="siteLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Site address/location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="plotArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plot Area (sq ft)</FormLabel>
                          <FormControl>
                            <Input placeholder="Total plot area" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="builtUpArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Built-up Area (sq ft)</FormLabel>
                          <FormControl>
                            <Input placeholder="Total built-up area" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="civilNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description & Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed site description and observations..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Foundation & Structure */}
              <Card>
                <CardHeader>
                  <CardTitle>Foundation & Structure</CardTitle>
                  <CardDescription>Foundation and structural assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="foundationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foundation Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select foundation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="isolated">Isolated Footing</SelectItem>
                              <SelectItem value="combined">Combined Footing</SelectItem>
                              <SelectItem value="raft">Raft Foundation</SelectItem>
                              <SelectItem value="pile">Pile Foundation</SelectItem>
                              <SelectItem value="strip">Strip Foundation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="structuralSystem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Structural System</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select structural system" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rcc-frame">RCC Frame</SelectItem>
                              <SelectItem value="load-bearing">Load Bearing</SelectItem>
                              <SelectItem value="steel-frame">Steel Frame</SelectItem>
                              <SelectItem value="composite">Composite</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="concreteGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concrete Grade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Concrete grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="m20">M20</SelectItem>
                              <SelectItem value="m25">M25</SelectItem>
                              <SelectItem value="m30">M30</SelectItem>
                              <SelectItem value="m35">M35</SelectItem>
                              <SelectItem value="m40">M40</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="steelGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steel Grade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Steel grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fe415">Fe 415</SelectItem>
                              <SelectItem value="fe500">Fe 500</SelectItem>
                              <SelectItem value="fe550">Fe 550</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="structuralCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Structural Condition</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Overall condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wallMaterial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wall Material</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wall material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="brick">Clay Brick</SelectItem>
                              <SelectItem value="concrete-block">Concrete Block</SelectItem>
                              <SelectItem value="aac">AAC Block</SelectItem>
                              <SelectItem value="flyash">Fly Ash Brick</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="roofType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roof Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Roof type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flat">Flat Roof</SelectItem>
                              <SelectItem value="sloped">Sloped Roof</SelectItem>
                              <SelectItem value="terrace">Terrace</SelectItem>
                              <SelectItem value="mixed">Mixed Type</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Superstructure Details */}
              <Card>
                <CardHeader>
                  <CardTitle>3. Superstructure Details</CardTitle>
                  <CardDescription>Structural framework assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Structure Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select structure type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rcc">RCC Frame</SelectItem>
                          <SelectItem value="steel">Steel Frame</SelectItem>
                          <SelectItem value="load-bearing">Load Bearing</SelectItem>
                          <SelectItem value="composite">Composite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Column Size</Label>
                      <Input placeholder="e.g., 12x18 inches" />
                    </div>
                    <div>
                      <Label>Beam Size</Label>
                      <Input placeholder="e.g., 12x24 inches" />
                    </div>
                    <div>
                      <Label>Slab Thickness (inches)</Label>
                      <Input type="number" placeholder="Slab thickness" />
                    </div>
                    <div>
                      <Label>Concrete Grade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Concrete grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m20">M20</SelectItem>
                          <SelectItem value="m25">M25</SelectItem>
                          <SelectItem value="m30">M30</SelectItem>
                          <SelectItem value="m35">M35</SelectItem>
                          <SelectItem value="m40">M40</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Steel Grade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Steel grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fe415">Fe 415</SelectItem>
                          <SelectItem value="fe500">Fe 500</SelectItem>
                          <SelectItem value="fe550">Fe 550</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Structural Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Overall condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cracks/Defects</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Visible defects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Structural Notes</Label>
                    <Textarea placeholder="Detailed structural observations..." />
                  </div>
                </CardContent>
              </Card>

              {/* Walls & Finishes */}
              <Card>
                <CardHeader>
                  <CardTitle>4. Walls & Finishes</CardTitle>
                  <CardDescription>Wall construction and finishing details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>External Wall Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="External wall material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brick">Clay Brick</SelectItem>
                          <SelectItem value="concrete-block">Concrete Block</SelectItem>
                          <SelectItem value="aac">AAC Block</SelectItem>
                          <SelectItem value="flyash">Fly Ash Brick</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Internal Wall Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Internal wall material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brick">Clay Brick</SelectItem>
                          <SelectItem value="concrete-block">Concrete Block</SelectItem>
                          <SelectItem value="aac">AAC Block</SelectItem>
                          <SelectItem value="partition">Partition Wall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Wall Thickness (inches)</Label>
                      <Input type="number" placeholder="Wall thickness" />
                    </div>
                    <div>
                      <Label>Plaster Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Plaster type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cement">Cement Plaster</SelectItem>
                          <SelectItem value="gypsum">Gypsum Plaster</SelectItem>
                          <SelectItem value="lime">Lime Plaster</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Paint Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Paint type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emulsion">Emulsion Paint</SelectItem>
                          <SelectItem value="distemper">Distemper</SelectItem>
                          <SelectItem value="texture">Texture Paint</SelectItem>
                          <SelectItem value="oil-based">Oil Based Paint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Finish Quality</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Finish quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Wall Finish Notes</Label>
                    <Textarea placeholder="Additional wall and finish observations..." />
                  </div>
                </CardContent>
              </Card>

              {/* Roofing Details */}
              <Card>
                <CardHeader>
                  <CardTitle>5. Roofing Details</CardTitle>
                  <CardDescription>Roof construction and protection systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Roof Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Roof type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Flat Roof</SelectItem>
                          <SelectItem value="sloped">Sloped Roof</SelectItem>
                          <SelectItem value="terrace">Terrace</SelectItem>
                          <SelectItem value="mixed">Mixed Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Roof Treatment</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Roof treatment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="waterproofing">Waterproofing Membrane</SelectItem>
                          <SelectItem value="thermal-insulation">Thermal Insulation</SelectItem>
                          <SelectItem value="cool-roof">Cool Roof Coating</SelectItem>
                          <SelectItem value="green-roof">Green Roof</SelectItem>
                          <SelectItem value="basic">Basic Treatment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Drainage System</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Roof drainage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal Drainage</SelectItem>
                          <SelectItem value="external">External Gutters</SelectItem>
                          <SelectItem value="combined">Combined System</SelectItem>
                          <SelectItem value="poor">Poor Drainage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Parapet Details</Label>
                      <Input placeholder="Parapet height and details" />
                    </div>
                    <div>
                      <Label>Roof Access</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Roof access type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staircase">Internal Staircase</SelectItem>
                          <SelectItem value="external-ladder">External Ladder</SelectItem>
                          <SelectItem value="hatch">Roof Hatch</SelectItem>
                          <SelectItem value="none">No Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Roof Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Overall roof condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Roofing Notes</Label>
                    <Textarea placeholder="Detailed roofing observations and recommendations..." />
                  </div>
                </CardContent>
              </Card>

              {/* Doors & Windows */}
              <Card>
                <CardHeader>
                  <CardTitle>6. Doors & Windows</CardTitle>
                  <CardDescription>Door and window specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Main Door Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Main door material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid-wood">Solid Wood</SelectItem>
                          <SelectItem value="engineered-wood">Engineered Wood</SelectItem>
                          <SelectItem value="steel">Steel</SelectItem>
                          <SelectItem value="fiber">Fiber Door</SelectItem>
                          <SelectItem value="pvc">PVC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Internal Door Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Internal door material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flush-door">Flush Door</SelectItem>
                          <SelectItem value="panel-door">Panel Door</SelectItem>
                          <SelectItem value="glass-door">Glass Door</SelectItem>
                          <SelectItem value="sliding">Sliding Door</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Window Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Window frame material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aluminum">Aluminum</SelectItem>
                          <SelectItem value="upvc">uPVC</SelectItem>
                          <SelectItem value="wood">Wood</SelectItem>
                          <SelectItem value="steel">Steel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Glazing Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Glass specifications" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-glazed">Single Glazed</SelectItem>
                          <SelectItem value="double-glazed">Double Glazed</SelectItem>
                          <SelectItem value="toughened">Toughened Glass</SelectItem>
                          <SelectItem value="laminated">Laminated Glass</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Security Features</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Security features" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safety-grills">Safety Grills</SelectItem>
                          <SelectItem value="multi-point-locks">Multi-point Locks</SelectItem>
                          <SelectItem value="security-film">Security Film</SelectItem>
                          <SelectItem value="basic">Basic Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Overall Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Doors & windows condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Doors & Windows Notes</Label>
                    <Textarea placeholder="Detailed observations about doors and windows..." />
                  </div>
                </CardContent>
              </Card>

              {/* Flooring Details */}
              <Card>
                <CardHeader>
                  <CardTitle>7. Flooring Details</CardTitle>
                  <CardDescription>Floor finishes and specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Living Area Flooring</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Living area floor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vitrified-tiles">Vitrified Tiles</SelectItem>
                          <SelectItem value="marble">Marble</SelectItem>
                          <SelectItem value="granite">Granite</SelectItem>
                          <SelectItem value="wooden">Wooden Flooring</SelectItem>
                          <SelectItem value="ceramic">Ceramic Tiles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bedroom Flooring</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Bedroom floor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vitrified-tiles">Vitrified Tiles</SelectItem>
                          <SelectItem value="marble">Marble</SelectItem>
                          <SelectItem value="wooden">Wooden Flooring</SelectItem>
                          <SelectItem value="laminate">Laminate</SelectItem>
                          <SelectItem value="ceramic">Ceramic Tiles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Kitchen Flooring</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Kitchen floor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vitrified-tiles">Vitrified Tiles</SelectItem>
                          <SelectItem value="granite">Granite</SelectItem>
                          <SelectItem value="ceramic">Ceramic Tiles</SelectItem>
                          <SelectItem value="anti-skid">Anti-skid Tiles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bathroom Flooring</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Bathroom floor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anti-skid-tiles">Anti-skid Tiles</SelectItem>
                          <SelectItem value="ceramic">Ceramic Tiles</SelectItem>
                          <SelectItem value="stone">Natural Stone</SelectItem>
                          <SelectItem value="mosaic">Mosaic Tiles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Skirting Details</Label>
                      <Input placeholder="Skirting height and material" />
                    </div>
                    <div>
                      <Label>Flooring Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Overall flooring condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Flooring Notes</Label>
                    <Textarea placeholder="Detailed flooring observations..." />
                  </div>
                </CardContent>
              </Card>

              {/* Staircases & Elevators */}
              <Card>
                <CardHeader>
                  <CardTitle>8. Staircases & Elevators</CardTitle>
                  <CardDescription>Vertical circulation systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Staircase Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Staircase type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rcc">RCC Staircase</SelectItem>
                          <SelectItem value="steel">Steel Staircase</SelectItem>
                          <SelectItem value="wooden">Wooden Staircase</SelectItem>
                          <SelectItem value="prefab">Prefab Staircase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Handrail Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Handrail material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ss">Stainless Steel</SelectItem>
                          <SelectItem value="ms">Mild Steel</SelectItem>
                          <SelectItem value="wooden">Wooden</SelectItem>
                          <SelectItem value="aluminum">Aluminum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Elevator Available</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Elevator availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passenger">Passenger Elevator</SelectItem>
                          <SelectItem value="service">Service Elevator</SelectItem>
                          <SelectItem value="both">Both Types</SelectItem>
                          <SelectItem value="none">No Elevator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Elevator Capacity</Label>
                      <Input placeholder="Elevator capacity (persons/kg)" />
                    </div>
                    <div>
                      <Label>Safety Compliance</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Safety compliance status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Compliance</SelectItem>
                          <SelectItem value="partial">Partial Compliance</SelectItem>
                          <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Overall condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Staircase & Elevator Notes</Label>
                    <Textarea placeholder="Detailed observations about vertical circulation..." />
                  </div>
                </CardContent>
              </Card>

              {/* External Works */}
              <Card>
                <CardHeader>
                  <CardTitle>9. External Works</CardTitle>
                  <CardDescription>External infrastructure and amenities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Compound Wall</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Compound wall type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rcc">RCC Wall</SelectItem>
                          <SelectItem value="brick">Brick Wall</SelectItem>
                          <SelectItem value="precast">Precast Panels</SelectItem>
                          <SelectItem value="fencing">Metal Fencing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Main Gate Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Main gate type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Gate</SelectItem>
                          <SelectItem value="automatic">Automatic Gate</SelectItem>
                          <SelectItem value="remote">Remote Operated</SelectItem>
                          <SelectItem value="security">Security Gate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Landscaping</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Landscaping status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional Landscaping</SelectItem>
                          <SelectItem value="basic">Basic Garden</SelectItem>
                          <SelectItem value="minimal">Minimal Greenery</SelectItem>
                          <SelectItem value="none">No Landscaping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>External Paving</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Paving type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interlocking">Interlocking Tiles</SelectItem>
                          <SelectItem value="concrete">Concrete Paving</SelectItem>
                          <SelectItem value="stone">Natural Stone</SelectItem>
                          <SelectItem value="asphalt">Asphalt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Parking Provision</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Parking availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="covered">Covered Parking</SelectItem>
                          <SelectItem value="open">Open Parking</SelectItem>
                          <SelectItem value="basement">Basement Parking</SelectItem>
                          <SelectItem value="stilt">Stilt Parking</SelectItem>
                          <SelectItem value="none">No Parking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>External Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Overall external condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>External Works Notes</Label>
                    <Textarea placeholder="Detailed observations about external infrastructure..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MEP Systems Tab */}
            <TabsContent value="mep" className="tab-content-transition space-y-6">
              {/* Mechanical Systems */}
              <Card>
                <CardHeader>
                  <CardTitle>Mechanical Systems</CardTitle>
                  <CardDescription>HVAC and mechanical equipment assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hvacSystem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HVAC System Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="HVAC system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="central-ac">Central AC</SelectItem>
                              <SelectItem value="split-ac">Split AC</SelectItem>
                              <SelectItem value="vrf">VRF System</SelectItem>
                              <SelectItem value="chilled-water">Chilled Water</SelectItem>
                              <SelectItem value="package-unit">Package Unit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="electricalLoad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Electrical Load (KW)</FormLabel>
                          <FormControl>
                            <Input placeholder="Total electrical load" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="plumbingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plumbing System</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Plumbing system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cpvc">CPVC Pipes</SelectItem>
                              <SelectItem value="pvc">PVC Pipes</SelectItem>
                              <SelectItem value="copper">Copper Pipes</SelectItem>
                              <SelectItem value="ppr">PPR Pipes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fireSafetyGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fire Safety Grade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Fire safety grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mechanicalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mechanical Systems Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="HVAC and mechanical observations..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="electricalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Electrical Systems Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Electrical systems observations..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="plumbingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plumbing & Fire Safety Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Plumbing and fire safety observations..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="tab-content-transition space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>Executive summary, recommendations, and conclusions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="executiveSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Executive Summary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Overall assessment summary..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
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
                          <Textarea 
                            placeholder="Key recommendations for improvements..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="conclusions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conclusions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Final conclusions and observations..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="investmentRecommendation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Recommendation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recommendation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                            <SelectItem value="conditional">Conditional</SelectItem>
                            <SelectItem value="not-recommended">Not Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            </div>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {saveReportMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Saving report...
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
                disabled={saveReportMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button
                type="submit"
                disabled={saveReportMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Update & Close" : "Save & Close"}
              </Button>
            </div>
          </div>
            </form>
          </Form>
        </div>
      </AdminLayout>
    );
}
