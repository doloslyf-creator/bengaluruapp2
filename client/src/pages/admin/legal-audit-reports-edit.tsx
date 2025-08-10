import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Save,
  ArrowLeft
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";

export default function LegalAuditReportsEdit() {
  const [, params] = useRoute("/admin-panel/legal-audit-reports/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = params?.id;

  const [activeTab, setActiveTab] = useState("basic");
  const [basicFormData, setBasicFormData] = useState({
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
    legalConclusion: ""
  });

  const [formData, setFormData] = useState({
    currentOwnership: {
      ownerName: "",
      ownershipType: "",
      acquisitionDate: "",
      acquisitionMode: "",
      previousOwners: []
    },
    titleVerification: {
      titleDeedNumber: "",
      registrationDate: "",
      registrarOffice: "",
      titleClarity: "clear",
      encumbrances: [],
      titleDefects: []
    },
    statutoryApprovals: {
      reraRegistration: false,
      reraNumber: "",
      planApproval: false,
      approvalNumber: "",
      completionCertificate: false,
      occupancyCertificate: false,
      environmentClearance: false
    },
    taxCompliance: {
      propertyTaxStatus: "current",
      khataStatus: "a-khata",
      surveyNumber: "",
      dcConversion: false,
      landRevenuePaid: false
    },
    litigationHistory: {
      pendingCases: [],
      pastDisputes: [],
      courtOrders: [],
      legalNotices: []
    },
    complianceStatus: {
      municipalCompliance: false,
      fireNocStatus: false,
      pollutionClearance: false,
      waterConnectionLegal: false,
      electricityConnectionLegal: false
    }
  });

  // Fetch report data
  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: [`/api/legal-audit-reports/${id}`],
    enabled: !!id,
  });

  // Fetch properties for dropdown
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Populate form with existing data
  useEffect(() => {
    if (report) {
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const parseJsonField = (field: any) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return {};
          }
        }
        return field || {};
      };

      setBasicFormData({
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
        legalConclusion: report.legalConclusion || ""
      });

      const sectionData = {
        currentOwnership: parseJsonField(report.currentOwnership),
        titleVerification: parseJsonField(report.titleVerification),
        statutoryApprovals: parseJsonField(report.statutoryApprovals),
        taxCompliance: parseJsonField(report.taxCompliance),
        litigationHistory: parseJsonField(report.litigationHistory),
        complianceStatus: parseJsonField(report.complianceStatus)
      };
      
      setFormData(sectionData);
    }
  }, [report]);

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch(`/api/legal-audit-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-audit-reports"] });
      queryClient.invalidateQueries({ queryKey: [`/api/legal-audit-reports/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-audit-reports-stats"] });
      toast({ title: "Legal Audit report updated successfully" });
      navigate("/admin-panel/legal-audit-reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFieldChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBasicFieldChange = (field: string, value: any) => {
    setBasicFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!basicFormData.propertyId || !basicFormData.reportTitle || !basicFormData.lawyerName || 
        !basicFormData.lawyerBarNumber || !basicFormData.auditDate || !basicFormData.reportDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields in the Basic Info tab",
        variant: "destructive",
      });
      setActiveTab("basic");
      return;
    }

    // Combine with section data
    const reportData = {
      ...basicFormData,
      overallScore: Number(basicFormData.overallScore) || 0,
      currentOwnership: JSON.stringify(formData.currentOwnership),
      titleVerification: JSON.stringify(formData.titleVerification),
      statutoryApprovals: JSON.stringify(formData.statutoryApprovals),
      taxCompliance: JSON.stringify(formData.taxCompliance),
      litigationHistory: JSON.stringify(formData.litigationHistory),
      complianceStatus: JSON.stringify(formData.complianceStatus),
    };

    console.log("Submitting Legal Audit report data:", reportData);
    updateReportMutation.mutate(reportData);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin-panel/legal-audit-reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Legal Audit Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Legal Audit Report</h1>
              <p className="text-sm text-muted-foreground">
                Update legal due diligence analysis
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="space-y-2">
                      <Label htmlFor="propertyId">Property *</Label>
                      <Select
                        value={basicFormData.propertyId}
                        onValueChange={(value) => handleBasicFieldChange("propertyId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property: any) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name} - {property.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportTitle">Report Title *</Label>
                      <Input
                        id="reportTitle"
                        value={basicFormData.reportTitle}
                        onChange={(e) => handleBasicFieldChange("reportTitle", e.target.value)}
                        placeholder="Legal Due Diligence Report"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lawyerName">Lawyer Name *</Label>
                      <Input
                        id="lawyerName"
                        value={basicFormData.lawyerName}
                        onChange={(e) => handleBasicFieldChange("lawyerName", e.target.value)}
                        placeholder="Advocate Name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lawyerBarNumber">Bar Registration Number *</Label>
                      <Input
                        id="lawyerBarNumber"
                        value={basicFormData.lawyerBarNumber}
                        onChange={(e) => handleBasicFieldChange("lawyerBarNumber", e.target.value)}
                        placeholder="BAR/KAR/1234/2020"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auditDate">Audit Date *</Label>
                      <Input
                        id="auditDate"
                        type="date"
                        value={basicFormData.auditDate}
                        onChange={(e) => handleBasicFieldChange("auditDate", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportDate">Report Date *</Label>
                      <Input
                        id="reportDate"
                        type="date"
                        value={basicFormData.reportDate}
                        onChange={(e) => handleBasicFieldChange("reportDate", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={basicFormData.status}
                        onValueChange={(value) => handleBasicFieldChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select
                        value={basicFormData.riskLevel}
                        onValueChange={(value) => handleBasicFieldChange("riskLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                          <SelectItem value="critical">Critical Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overallScore">Overall Score (0-100)</Label>
                    <Input
                      id="overallScore"
                      type="number"
                      min="0"
                      max="100"
                      value={basicFormData.overallScore}
                      onChange={(e) => handleBasicFieldChange("overallScore", parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="executiveSummary">Executive Summary</Label>
                    <Textarea
                      id="executiveSummary"
                      value={basicFormData.executiveSummary}
                      onChange={(e) => handleBasicFieldChange("executiveSummary", e.target.value)}
                      placeholder="Brief overview of legal audit findings..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keyFindings">Key Findings</Label>
                    <Textarea
                      id="keyFindings"
                      value={basicFormData.keyFindings}
                      onChange={(e) => handleBasicFieldChange("keyFindings", e.target.value)}
                      placeholder="Critical observations and findings..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <Textarea
                      id="recommendations"
                      value={basicFormData.recommendations}
                      onChange={(e) => handleBasicFieldChange("recommendations", e.target.value)}
                      placeholder="Recommended actions..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalConclusion">Legal Conclusion</Label>
                    <Textarea
                      id="legalConclusion"
                      value={basicFormData.legalConclusion}
                      onChange={(e) => handleBasicFieldChange("legalConclusion", e.target.value)}
                      placeholder="Final legal opinion..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Current Ownership Tab */}
            <TabsContent value="ownership" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Current Ownership & Title Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input
                        id="ownerName"
                        value={formData.currentOwnership.ownerName}
                        onChange={(e) => handleFieldChange("currentOwnership", "ownerName", e.target.value)}
                        placeholder="Current legal owner"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownershipType">Ownership Type</Label>
                      <Select
                        value={formData.currentOwnership.ownershipType}
                        onValueChange={(value) => handleFieldChange("currentOwnership", "ownershipType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="joint">Joint Ownership</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="trust">Trust</SelectItem>
                          <SelectItem value="society">Society</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                      <Input
                        id="acquisitionDate"
                        type="date"
                        value={formData.currentOwnership.acquisitionDate}
                        onChange={(e) => handleFieldChange("currentOwnership", "acquisitionDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="acquisitionMode">Acquisition Mode</Label>
                      <Select
                        value={formData.currentOwnership.acquisitionMode}
                        onValueChange={(value) => handleFieldChange("currentOwnership", "acquisitionMode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How was property acquired" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="inheritance">Inheritance</SelectItem>
                          <SelectItem value="gift">Gift</SelectItem>
                          <SelectItem value="exchange">Exchange</SelectItem>
                          <SelectItem value="court-order">Court Order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Continue with other tabs... */}
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin-panel/legal-audit-reports")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateReportMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateReportMutation.isPending ? "Updating..." : "Update Report"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}