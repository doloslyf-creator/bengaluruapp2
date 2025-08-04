import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Save, FileText, Calculator, TrendingUp, MapPin, Shield, Home, DollarSign, Building, Scale, Plus, Edit, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PropertyValuationReport, Property, PropertyValuationReportConfiguration } from "@shared/schema";

export default function ValuationReportEditComprehensive() {
  const [, params] = useRoute("/admin-panel/valuation-reports/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reportId = params?.id;
  const [showAddConfigDialog, setShowAddConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PropertyValuationReportConfiguration | null>(null);

  // Fetch valuation report
  const { data: report, isLoading } = useQuery<PropertyValuationReport>({
    queryKey: ["/api/valuation-reports", reportId],
    enabled: !!reportId,
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch configurations for this report
  const { data: configurations = [], refetch: refetchConfigurations } = useQuery<PropertyValuationReportConfiguration[]>({
    queryKey: ["/api/valuation-reports", reportId, "configurations"],
    enabled: !!reportId,
  });

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/valuation-reports/${reportId}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      toast({
        title: "Success",
        description: "Valuation report updated successfully",
      });
      navigate("/admin-panel/valuation-reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update valuation report",
        variant: "destructive",
      });
    },
  });

  // Configuration mutations
  const createConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/valuation-reports/${reportId}/configurations`, "POST", data);
    },
    onSuccess: () => {
      refetchConfigurations();
      setShowAddConfigDialog(false);
      toast({
        title: "Success",
        description: "Property configuration created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create configuration",
        variant: "destructive",
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ configId, data }: { configId: string; data: any }) => {
      return await apiRequest(`/api/valuation-reports/${reportId}/configurations/${configId}`, "PUT", data);
    },
    onSuccess: () => {
      refetchConfigurations();
      setEditingConfig(null);
      toast({
        title: "Success",
        description: "Property configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (configId: string) => {
      return await apiRequest(`/api/valuation-reports/${reportId}/configurations/${configId}`, "DELETE");
    },
    onSuccess: () => {
      refetchConfigurations();
      toast({
        title: "Success",
        description: "Property configuration deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete configuration",
        variant: "destructive",
      });
    },
  });

  const setPrimaryConfigMutation = useMutation({
    mutationFn: async (configId: string) => {
      return await apiRequest(`/api/valuation-reports/${reportId}/configurations/${configId}/set-primary`, "PATCH");
    },
    onSuccess: () => {
      refetchConfigurations();
      toast({
        title: "Success",
        description: "Primary configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set primary configuration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Helper function to parse array fields
    const parseArrayField = (value: string) => {
      if (!value || value.trim() === '') return [];
      return value.split('\n').map(item => item.trim()).filter(Boolean);
    };

    // Helper function to parse JSON fields
    const parseJsonField = (value: string) => {
      try {
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    };

    const updateData = {
      // Basic Information
      reportTitle: formData.get("reportTitle") as string,
      reportStatus: formData.get("reportStatus") as string,
      assignedTo: formData.get("assignedTo") as string,
      
      // 1. Executive Summary
      projectName: formData.get("projectName") as string,
      towerUnit: formData.get("towerUnit") as string,
      estimatedMarketValue: formData.get("estimatedMarketValue") as string,
      ratePerSqftSbaUds: formData.get("ratePerSqftSbaUds") as string,
      buyerFit: formData.get("buyerFit") as string,
      valuationVerdict: formData.get("valuationVerdict") as string,
      appreciationOutlook: formData.get("appreciationOutlook") as string,
      riskScore: formData.get("riskScore") ? parseInt(formData.get("riskScore") as string) : 0,
      recommendation: formData.get("recommendation") as string,
      
      // 2. Property Profile
      unitType: formData.get("unitType") as string,
      configuration: formData.get("configuration") as string,
      undividedLandShare: formData.get("undividedLandShare") as string,
      facing: formData.get("facing") as string,
      vastuCompliance: formData.get("vastuCompliance") === "on",
      ocCcStatus: formData.get("ocCcStatus") as string,
      possessionStatus: formData.get("possessionStatus") as string,
      khataType: formData.get("khataType") as string,
      landTitleStatus: formData.get("landTitleStatus") as string,
      builderReputationScore: formData.get("builderReputationScore") as string,
      
      // 3. Market Valuation Estimate
      builderQuotedPrice: formData.get("builderQuotedPrice") as string,
      totalEstimatedValue: formData.get("totalEstimatedValue") as string,
      pricePerSqftAnalysis: formData.get("pricePerSqftAnalysis") as string,
      landShareValue: formData.get("landShareValue") as string,
      constructionValue: formData.get("constructionValue") as string,
      guidanceValueZoneRate: formData.get("guidanceValueZoneRate") as string,
      marketPremiumDiscount: formData.get("marketPremiumDiscount") as string,
      
      // 4. Comparable Sales Analysis
      comparableSales: parseJsonField(formData.get("comparableSales") as string),
      benchmarkingSources: formData.get("benchmarkingSources") as string,
      volatilityIndex: formData.get("volatilityIndex") as string,
      averageDaysOnMarket: formData.get("averageDaysOnMarket") ? parseInt(formData.get("averageDaysOnMarket") as string) : null,
      
      // 5. Location & Infrastructure Assessment
      planningAuthority: formData.get("planningAuthority") as string,
      zonalClassification: formData.get("zonalClassification") as string,
      landUseStatus: formData.get("landUseStatus") as string,
      connectivity: formData.get("connectivity") as string,
      waterSupply: formData.get("waterSupply") as string,
      drainage: formData.get("drainage") as string,
      socialInfrastructure: formData.get("socialInfrastructure") as string,
      futureInfrastructure: parseJsonField(formData.get("futureInfrastructure") as string),
      
      // 6. Legal & Compliance Snapshot
      reraRegistration: formData.get("reraRegistration") as string,
      khataVerification: formData.get("khataVerification") as string,
      titleClearance: formData.get("titleClearance") as string,
      dcConversion: formData.get("dcConversion") as string,
      planApproval: formData.get("planApproval") as string,
      loanApproval: parseJsonField(formData.get("loanApproval") as string),
      titleClarityNotes: formData.get("titleClarityNotes") as string,
      
      // 7. Rental & Yield Potential
      expectedMonthlyRent: formData.get("expectedMonthlyRent") as string,
      grossRentalYield: formData.get("grossRentalYield") as string,
      tenantDemand: formData.get("tenantDemand") as string,
      exitLiquidity: formData.get("exitLiquidity") as string,
      yieldScore: formData.get("yieldScore") as string,
      
      // 8. Cost Sheet Breakdown
      baseUnitCost: formData.get("baseUnitCost") as string,
      amenitiesCharges: formData.get("amenitiesCharges") as string,
      floorRiseCharges: formData.get("floorRiseCharges") as string,
      gstAmount: formData.get("gstAmount") as string,
      stampDutyRegistration: formData.get("stampDutyRegistration") as string,
      totalAllInPrice: formData.get("totalAllInPrice") as string,
      khataTransferCosts: formData.get("khataTransferCosts") as string,
      
      // 9. Pros & Cons Summary
      pros: parseArrayField(formData.get("pros") as string),
      cons: parseArrayField(formData.get("cons") as string),
      
      // 10. Final Recommendation
      buyerTypeFit: formData.get("buyerTypeFit") as string,
      negotiationAdvice: formData.get("negotiationAdvice") as string,
      riskSummary: formData.get("riskSummary") as string,
      appreciationOutlook5yr: formData.get("appreciationOutlook5yr") as string,
      exitPlan: formData.get("exitPlan") as string,
      overallScore: formData.get("overallScore") as string,
      
      // Additional
      customNotes: formData.get("customNotes") as string,
    };

    updateReportMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading valuation report...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Report not found</h2>
          <p className="text-muted-foreground">The valuation report you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin-panel/valuation-reports")} className="mt-4">
            Back to Reports
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p: Property) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin-panel/valuation-reports")} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate">Edit Valuation Report</h1>
              <p className="text-sm text-muted-foreground truncate">
                {getPropertyName(report.propertyId)} • {report.reportStatus}
              </p>
            </div>
          </div>
          <Badge variant={report.reportStatus === "completed" ? "default" : "secondary"} className="shrink-0">
            {report.reportStatus}
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="max-w-full">
          <Tabs defaultValue="executive" className="w-full">
            <TabsList className="grid grid-cols-3 sm:grid-cols-7 w-full gap-1">
              <TabsTrigger value="executive" className="flex items-center text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Executive
              </TabsTrigger>
              <TabsTrigger value="property" className="flex items-center text-xs">
                <Home className="h-3 w-3 mr-1" />
                Property
              </TabsTrigger>
              <TabsTrigger value="configurations" className="flex items-center text-xs">
                <Building className="h-3 w-3 mr-1" />
                Configs
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Market
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Location
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex items-center text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Legal
              </TabsTrigger>
              <TabsTrigger value="final" className="flex items-center text-xs">
                <Scale className="h-3 w-3 mr-1" />
                Final
              </TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reportTitle">Report Title *</Label>
                  <Input
                    name="reportTitle"
                    defaultValue={report.reportTitle}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reportStatus">Status</Label>
                  <Select name="reportStatus" defaultValue={report.reportStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    name="assignedTo"
                    defaultValue={report.assignedTo || ""}
                    placeholder="Customer name or ID"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 1. Executive Summary */}
            <TabsContent value="executive">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Executive Summary
                  </CardTitle>
                  <CardDescription>
                    High-level overview and key findings of the property valuation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Project Name & Unit</Label>
                      <Input
                        name="projectName"
                        defaultValue={report.projectName || ""}
                        placeholder="e.g., Assetz Marq 3.0, 3BHK, Tower B"
                      />
                    </div>
                    <div>
                      <Label htmlFor="towerUnit">Tower/Unit Details</Label>
                      <Input
                        name="towerUnit"
                        defaultValue={report.towerUnit || ""}
                        placeholder="Tower B, Unit 1204"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedMarketValue">Estimated Market Value</Label>
                      <Input
                        name="estimatedMarketValue"
                        defaultValue={report.estimatedMarketValue || ""}
                        placeholder="₹2.2 Cr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ratePerSqftSbaUds">Rate per Sqft (SBA & UDS)</Label>
                      <Input
                        name="ratePerSqftSbaUds"
                        defaultValue={report.ratePerSqftSbaUds || ""}
                        placeholder="₹10,200/sqft"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyerFit">Buyer Fit</Label>
                      <Select name="buyerFit" defaultValue={report.buyerFit || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select buyer fit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="end_use">End Use</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="riskScore">Risk Score (0-10)</Label>
                      <Input
                        name="riskScore"
                        type="number"
                        min="0"
                        max="10"
                        defaultValue={report.riskScore || 0}
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="valuationVerdict">Valuation Verdict</Label>
                    <Textarea
                      name="valuationVerdict"
                      defaultValue={report.valuationVerdict || ""}
                      placeholder="Slightly Overpriced (₹1,000/sqft above resale)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="appreciationOutlook">Appreciation Outlook</Label>
                    <Textarea
                      name="appreciationOutlook"
                      defaultValue={report.appreciationOutlook || ""}
                      placeholder="Moderate – 7% CAGR expected"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendation">Recommendation</Label>
                    <Textarea
                      name="recommendation"
                      defaultValue={report.recommendation || ""}
                      placeholder="✅ Buy if negotiated ~₹10L lower"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. Property Profile */}
            <TabsContent value="property">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    Property Profile
                  </CardTitle>
                  <CardDescription>
                    Detailed property characteristics and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="unitType">Unit Type</Label>
                      <Select name="unitType" defaultValue={report.unitType || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="rowhouse">Rowhouse</SelectItem>
                          <SelectItem value="plot">Plot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="configuration">Configuration</Label>
                      <Input
                        name="configuration"
                        defaultValue={report.configuration || ""}
                        placeholder="3BHK, 1550 sq.ft"
                      />
                    </div>
                    <div>
                      <Label htmlFor="undividedLandShare">UDS (Undivided Land Share)</Label>
                      <Input
                        name="undividedLandShare"
                        defaultValue={report.undividedLandShare || ""}
                        placeholder="42%"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facing">Facing</Label>
                      <Input
                        name="facing"
                        defaultValue={report.facing || ""}
                        placeholder="East"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox 
                        name="vastuCompliance" 
                        defaultChecked={report.vastuCompliance}
                      />
                      <Label htmlFor="vastuCompliance">Vastu Compliance</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ocCcStatus">OC/CC Status</Label>
                      <Input
                        name="ocCcStatus"
                        defaultValue={report.ocCcStatus || ""}
                        placeholder="OC Received"
                      />
                    </div>
                    <div>
                      <Label htmlFor="possessionStatus">Possession Status</Label>
                      <Select name="possessionStatus" defaultValue={report.possessionStatus || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="under_construction">Under Construction</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="khataType">Khata Type</Label>
                      <Select name="khataType" defaultValue={report.khataType || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select khata type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="landTitleStatus">Land Title Status</Label>
                      <Input
                        name="landTitleStatus"
                        defaultValue={report.landTitleStatus || ""}
                        placeholder="Clear Title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="builderReputationScore">Builder Reputation Score</Label>
                      <Input
                        name="builderReputationScore"
                        defaultValue={report.builderReputationScore || ""}
                        placeholder="Based on delivery record, delays, complaints"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2.5 Property Configurations */}
            <TabsContent value="configurations">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Property Configurations
                      </div>
                      <Button 
                        type="button"
                        onClick={() => setShowAddConfigDialog(true)}
                        size="sm"
                        data-testid="button-add-configuration"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Configuration
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Manage multiple property configurations (3BHK, 4BHK, etc.) with specific metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {configurations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No configurations added yet</p>
                        <p className="text-sm">Add configurations to specify different property types and their details</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {configurations.map((config) => (
                          <Card key={config.id} className={`relative ${config.isPrimary ? 'ring-2 ring-primary' : ''}`}>
                            {config.isPrimary && (
                              <Badge className="absolute top-2 right-2" variant="default">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">{config.configurationType}</CardTitle>
                                  {config.configurationName && (
                                    <CardDescription>{config.configurationName}</CardDescription>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {!config.isPrimary && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setPrimaryConfigMutation.mutate(config.id)}
                                      data-testid={`button-set-primary-${config.id}`}
                                    >
                                      <Star className="h-3 w-3 mr-1" />
                                      Set Primary
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingConfig(config)}
                                    data-testid={`button-edit-config-${config.id}`}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteConfigMutation.mutate(config.id)}
                                    data-testid={`button-delete-config-${config.id}`}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {config.builtUpArea && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Built-up Area</Label>
                                  <p className="font-medium">{config.builtUpArea} sq.ft</p>
                                </div>
                              )}
                              {config.plotArea && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Plot Area</Label>
                                  <p className="font-medium">{config.plotArea} sq.ft</p>
                                </div>
                              )}
                              {config.udsShare && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">UDS Share</Label>
                                  <p className="font-medium">{config.udsShare} sq.ft</p>
                                </div>
                              )}
                              {config.totalPrice && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Total Price</Label>
                                  <p className="font-medium">₹{config.totalPrice}</p>
                                </div>
                              )}
                              {config.numberOfBedrooms && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Bedrooms</Label>
                                  <p className="font-medium">{config.numberOfBedrooms}</p>
                                </div>
                              )}
                              {config.numberOfBathrooms && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Bathrooms</Label>
                                  <p className="font-medium">{config.numberOfBathrooms}</p>
                                </div>
                              )}
                              {config.facing && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Facing</Label>
                                  <p className="font-medium">{config.facing}</p>
                                </div>
                              )}
                              {config.floorNumber && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Floor</Label>
                                  <p className="font-medium">{config.floorNumber}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 3. Market Valuation */}
            <TabsContent value="market">
              <div className="space-y-6">
                {/* Market Valuation Estimate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Market Valuation Estimate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="builderQuotedPrice">Builder Quoted Price</Label>
                        <Input
                          name="builderQuotedPrice"
                          defaultValue={report.builderQuotedPrice || ""}
                          placeholder="₹2.5 Cr"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalEstimatedValue">Total Estimated Value</Label>
                        <Input
                          name="totalEstimatedValue"
                          defaultValue={report.totalEstimatedValue || ""}
                          placeholder="₹2.2 Cr"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pricePerSqftAnalysis">Price per Sqft Analysis</Label>
                      <Textarea
                        name="pricePerSqftAnalysis"
                        defaultValue={report.pricePerSqftAnalysis || ""}
                        placeholder="Carpet: ₹12,000/sqft, SBA: ₹10,200/sqft, UDS: ₹8,500/sqft"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="landShareValue">Land Share Value</Label>
                        <Input
                          name="landShareValue"
                          defaultValue={report.landShareValue || ""}
                          placeholder="₹85 L"
                        />
                      </div>
                      <div>
                        <Label htmlFor="constructionValue">Construction Value</Label>
                        <Input
                          name="constructionValue"
                          defaultValue={report.constructionValue || ""}
                          placeholder="₹1.35 Cr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guidanceValueZoneRate">Guidance Value Zone Rate</Label>
                        <Input
                          name="guidanceValueZoneRate"
                          defaultValue={report.guidanceValueZoneRate || ""}
                          placeholder="BDA/BBMP/BIAPPA rate"
                        />
                      </div>
                      <div>
                        <Label htmlFor="marketPremiumDiscount">Market Premium/Discount</Label>
                        <Input
                          name="marketPremiumDiscount"
                          defaultValue={report.marketPremiumDiscount || ""}
                          placeholder="Unit is priced 14% above average resale"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparable Sales Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparable Sales Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="comparableSales">Comparable Sales (JSON format)</Label>
                      <Textarea
                        name="comparableSales"
                        defaultValue={report.comparableSales ? JSON.stringify(report.comparableSales, null, 2) : ""}
                        placeholder='[{"project": "Brigade Utopia", "config": "3BHK", "area": "1640", "date": "Jan 2025", "rate": "₹9,100", "source": "MagicBricks"}]'
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="benchmarkingSources">Benchmarking Sources</Label>
                        <Input
                          name="benchmarkingSources"
                          defaultValue={report.benchmarkingSources || ""}
                          placeholder="MagicBricks, 99acres, local brokers"
                        />
                      </div>
                      <div>
                        <Label htmlFor="averageDaysOnMarket">Average Days on Market</Label>
                        <Input
                          name="averageDaysOnMarket"
                          type="number"
                          defaultValue={report.averageDaysOnMarket || ""}
                          placeholder="72"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="volatilityIndex">Volatility Index</Label>
                      <Input
                        name="volatilityIndex"
                        defaultValue={report.volatilityIndex || ""}
                        placeholder="6-month price trend"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 5. Location & Infrastructure */}
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location & Infrastructure Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zoning & Authority */}
                  <div>
                    <h4 className="font-semibold mb-4">Zoning & Authority</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="planningAuthority">Planning Authority</Label>
                        <Select name="planningAuthority" defaultValue={report.planningAuthority || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select authority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BDA">BDA</SelectItem>
                            <SelectItem value="BBMP">BBMP</SelectItem>
                            <SelectItem value="BMRDA">BMRDA</SelectItem>
                            <SelectItem value="BIAPPA">BIAPPA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zonalClassification">Zonal Classification</Label>
                        <Select name="zonalClassification" defaultValue={report.zonalClassification || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="landUseStatus">Land Use Status</Label>
                        <Select name="landUseStatus" defaultValue={report.landUseStatus || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="dc_converted">DC Converted</SelectItem>
                            <SelectItem value="bda_approved">BDA Approved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Physical & Social Infrastructure */}
                  <div>
                    <h4 className="font-semibold mb-4">Physical & Social Infrastructure</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="connectivity">Connectivity</Label>
                        <Textarea
                          name="connectivity"
                          defaultValue={report.connectivity || ""}
                          placeholder="Distance to Metro, ORR, Whitefield Station"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="waterSupply">Water Supply</Label>
                          <Select name="waterSupply" defaultValue={report.waterSupply || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select water supply" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bwssb">BWSSB</SelectItem>
                              <SelectItem value="borewell">Borewell</SelectItem>
                              <SelectItem value="tanker">Tanker</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="drainage">Drainage</Label>
                          <Select name="drainage" defaultValue={report.drainage || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select drainage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="underground">Underground</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="socialInfrastructure">Social Infrastructure</Label>
                        <Textarea
                          name="socialInfrastructure"
                          defaultValue={report.socialInfrastructure || ""}
                          placeholder="Schools, Hospitals, Malls within 5 km"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="futureInfrastructure">Future Developments (JSON format)</Label>
                        <Textarea
                          name="futureInfrastructure"
                          defaultValue={report.futureInfrastructure ? JSON.stringify(report.futureInfrastructure, null, 2) : ""}
                          placeholder='{"prr_plan": "Peripheral Ring Road Plan", "metro_phase3": "Metro Phase 3 Extensions", "tech_parks": "Planned SEZs / Tech Parks nearby"}'
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 6. Legal & Compliance */}
            <TabsContent value="legal">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Legal & Compliance Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reraRegistration">RERA Registration</Label>
                        <Input
                          name="reraRegistration"
                          defaultValue={report.reraRegistration || ""}
                          placeholder="PRM/KA/RERA/xxx"
                        />
                      </div>
                      <div>
                        <Label htmlFor="khataVerification">Khata Verification</Label>
                        <Input
                          name="khataVerification"
                          defaultValue={report.khataVerification || ""}
                          placeholder="A (verified from BBMP)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="titleClearance">Title Clearance</Label>
                        <Input
                          name="titleClearance"
                          defaultValue={report.titleClearance || ""}
                          placeholder="Clear (no encumbrance)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dcConversion">DC Conversion</Label>
                        <Select name="dcConversion" defaultValue={report.dcConversion || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="not_required">Not Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="planApproval">Plan Approval</Label>
                      <Input
                        name="planApproval"
                        defaultValue={report.planApproval || ""}
                        placeholder="From BDA/BMRDA"
                      />
                    </div>

                    <div>
                      <Label htmlFor="loanApproval">Loan Approval (JSON format)</Label>
                      <Textarea
                        name="loanApproval"
                        defaultValue={report.loanApproval ? JSON.stringify(report.loanApproval, null, 2) : ""}
                        placeholder='["HDFC", "ICICI", "SBI confirmed"]'
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="titleClarityNotes">Title Clarity Notes</Label>
                      <Textarea
                        name="titleClarityNotes"
                        defaultValue={report.titleClarityNotes || ""}
                        placeholder="No ongoing disputes / pending litigations"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Rental & Yield Potential */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Rental & Yield Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expectedMonthlyRent">Expected Monthly Rent</Label>
                        <Input
                          name="expectedMonthlyRent"
                          defaultValue={report.expectedMonthlyRent || ""}
                          placeholder="₹45,000–₹48,000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grossRentalYield">Gross Rental Yield</Label>
                        <Input
                          name="grossRentalYield"
                          defaultValue={report.grossRentalYield || ""}
                          placeholder="~2.5% p.a."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="tenantDemand">Tenant Demand</Label>
                        <Select name="tenantDemand" defaultValue={report.tenantDemand || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select demand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="exitLiquidity">Exit Liquidity</Label>
                        <Input
                          name="exitLiquidity"
                          defaultValue={report.exitLiquidity || ""}
                          placeholder="Moderate, 3–6 months"
                        />
                      </div>
                      <div>
                        <Label htmlFor="yieldScore">Yield Score</Label>
                        <Input
                          name="yieldScore"
                          defaultValue={report.yieldScore || ""}
                          placeholder="6.5/10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Sheet Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Cost Sheet Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="baseUnitCost">Base Unit Cost</Label>
                        <Input
                          name="baseUnitCost"
                          defaultValue={report.baseUnitCost || ""}
                          placeholder="₹1.95 Cr"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amenitiesCharges">Amenities Charges</Label>
                        <Input
                          name="amenitiesCharges"
                          defaultValue={report.amenitiesCharges || ""}
                          placeholder="Clubhouse + Amenities + Corpus ₹5.5 L"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="floorRiseCharges">Floor Rise Charges</Label>
                        <Input
                          name="floorRiseCharges"
                          defaultValue={report.floorRiseCharges || ""}
                          placeholder="₹2.4 L"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gstAmount">GST Amount</Label>
                        <Input
                          name="gstAmount"
                          defaultValue={report.gstAmount || ""}
                          placeholder="GST @5% ₹9.75 L"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stampDutyRegistration">Stamp Duty + Registration</Label>
                        <Input
                          name="stampDutyRegistration"
                          defaultValue={report.stampDutyRegistration || ""}
                          placeholder="₹13 L (approx)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalAllInPrice">Total All-In Price</Label>
                        <Input
                          name="totalAllInPrice"
                          defaultValue={report.totalAllInPrice || ""}
                          placeholder="₹2.26 Cr"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="khataTransferCosts">Khata Transfer Costs</Label>
                      <Input
                        name="khataTransferCosts"
                        defaultValue={report.khataTransferCosts || ""}
                        placeholder="₹30–50K"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 10. Final Analysis */}
            <TabsContent value="final">
              <div className="space-y-6">
                {/* Pros & Cons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pros & Cons Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pros">Pros (one per line)</Label>
                        <Textarea
                          name="pros"
                          defaultValue={report.pros ? (report.pros as string[]).join('\n') : ""}
                          placeholder="Legally Clear Property
High UDS (42%)
Strong Social Infra
OC Received"
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cons">Cons (one per line)</Label>
                        <Textarea
                          name="cons"
                          defaultValue={report.cons ? (report.cons as string[]).join('\n') : ""}
                          placeholder="Slightly overpriced
Some areas still rely on tanker
Rental yield not investor-attractive
Project resale cycle still slow"
                          rows={6}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Recommendation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scale className="h-5 w-5 mr-2" />
                      Final Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="buyerTypeFit">Buyer Type Fit</Label>
                      <Textarea
                        name="buyerTypeFit"
                        defaultValue={report.buyerTypeFit || ""}
                        placeholder="Ideal for End Users prioritizing legal clarity and social infra"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="negotiationAdvice">Negotiation Advice</Label>
                      <Textarea
                        name="negotiationAdvice"
                        defaultValue={report.negotiationAdvice || ""}
                        placeholder="Ask builder for ₹1,000/sqft discount due to oversupply in area"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="riskSummary">Risk Summary</Label>
                        <Textarea
                          name="riskSummary"
                          defaultValue={report.riskSummary || ""}
                          placeholder="Low legal risk, moderate infra dependency"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="appreciationOutlook5yr">5-Year Appreciation Outlook</Label>
                        <Textarea
                          name="appreciationOutlook5yr"
                          defaultValue={report.appreciationOutlook5yr || ""}
                          placeholder="₹2.6–2.8 Cr expected"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exitPlan">Exit Plan (for investor)</Label>
                        <Textarea
                          name="exitPlan"
                          defaultValue={report.exitPlan || ""}
                          placeholder="Hold minimum 5–6 years for ROI"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="overallScore">Overall Score</Label>
                        <Input
                          name="overallScore"
                          defaultValue={report.overallScore || ""}
                          placeholder="7.5/10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customNotes">Custom Notes</Label>
                      <Textarea
                        name="customNotes"
                        defaultValue={report.customNotes || ""}
                        placeholder="Additional observations and custom analysis"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-8 pb-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin-panel/valuation-reports")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateReportMutation.isPending}
              data-testid="button-save-report"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateReportMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Add Configuration Dialog */}
      <Dialog open={showAddConfigDialog} onOpenChange={setShowAddConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Property Configuration</DialogTitle>
            <DialogDescription>
              Add a new property configuration with specific details like BUA, plot area, and UDS share.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                configurationType: formData.get("configurationType"),
                configurationName: formData.get("configurationName"),
                builtUpArea: formData.get("builtUpArea") ? parseFloat(formData.get("builtUpArea") as string) : null,
                plotArea: formData.get("plotArea") ? parseFloat(formData.get("plotArea") as string) : null,
                udsShare: formData.get("udsShare") ? parseFloat(formData.get("udsShare") as string) : null,
                totalPrice: formData.get("totalPrice") || null,
                numberOfBedrooms: formData.get("numberOfBedrooms") ? parseInt(formData.get("numberOfBedrooms") as string) : null,
                numberOfBathrooms: formData.get("numberOfBathrooms") ? parseInt(formData.get("numberOfBathrooms") as string) : null,
                facing: formData.get("facing") || null,
                floorNumber: formData.get("floorNumber") ? parseInt(formData.get("floorNumber") as string) : null,
                isPrimary: configurations.length === 0, // First config is automatically primary
              };
              createConfigMutation.mutate(data);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="configurationType">Configuration Type *</Label>
                <Select name="configurationType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1BHK">1BHK</SelectItem>
                    <SelectItem value="2BHK">2BHK</SelectItem>
                    <SelectItem value="3BHK">3BHK</SelectItem>
                    <SelectItem value="4BHK">4BHK</SelectItem>
                    <SelectItem value="5BHK">5BHK</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="configurationName">Configuration Name</Label>
                <Input
                  name="configurationName"
                  placeholder="e.g., Premium East Facing"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="builtUpArea">Built-up Area (sq.ft)</Label>
                <Input
                  name="builtUpArea"
                  type="number"
                  step="0.01"
                  placeholder="1550"
                />
              </div>
              <div>
                <Label htmlFor="plotArea">Plot Area (sq.ft)</Label>
                <Input
                  name="plotArea"
                  type="number"
                  step="0.01"
                  placeholder="3000"
                />
              </div>
              <div>
                <Label htmlFor="udsShare">UDS Share (sq.ft)</Label>
                <Input
                  name="udsShare"
                  type="number"
                  step="0.01"
                  placeholder="1260"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  name="totalPrice"
                  placeholder="₹2.5 Cr"
                />
              </div>
              <div>
                <Label htmlFor="facing">Facing</Label>
                <Select name="facing">
                  <SelectTrigger>
                    <SelectValue placeholder="Select facing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="North-East">North-East</SelectItem>
                    <SelectItem value="North-West">North-West</SelectItem>
                    <SelectItem value="South-East">South-East</SelectItem>
                    <SelectItem value="South-West">South-West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numberOfBedrooms">Bedrooms</Label>
                <Input
                  name="numberOfBedrooms"
                  type="number"
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="numberOfBathrooms">Bathrooms</Label>
                <Input
                  name="numberOfBathrooms"
                  type="number"
                  placeholder="2"
                />
              </div>
              <div>
                <Label htmlFor="floorNumber">Floor Number</Label>
                <Input
                  name="floorNumber"
                  type="number"
                  placeholder="5"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddConfigDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createConfigMutation.isPending}>
                {createConfigMutation.isPending ? "Adding..." : "Add Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Property Configuration</DialogTitle>
            <DialogDescription>
              Update the property configuration details.
            </DialogDescription>
          </DialogHeader>
          {editingConfig && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  configurationType: formData.get("configurationType"),
                  configurationName: formData.get("configurationName"),
                  builtUpArea: formData.get("builtUpArea") ? parseFloat(formData.get("builtUpArea") as string) : null,
                  plotArea: formData.get("plotArea") ? parseFloat(formData.get("plotArea") as string) : null,
                  udsShare: formData.get("udsShare") ? parseFloat(formData.get("udsShare") as string) : null,
                  totalPrice: formData.get("totalPrice") || null,
                  numberOfBedrooms: formData.get("numberOfBedrooms") ? parseInt(formData.get("numberOfBedrooms") as string) : null,
                  numberOfBathrooms: formData.get("numberOfBathrooms") ? parseInt(formData.get("numberOfBathrooms") as string) : null,
                  facing: formData.get("facing") || null,
                  floorNumber: formData.get("floorNumber") ? parseInt(formData.get("floorNumber") as string) : null,
                };
                updateConfigMutation.mutate({ configId: editingConfig.id, data });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="configurationType">Configuration Type *</Label>
                  <Select name="configurationType" defaultValue={editingConfig.configurationType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                      <SelectItem value="5BHK">5BHK</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="configurationName">Configuration Name</Label>
                  <Input
                    name="configurationName"
                    defaultValue={editingConfig.configurationName || ""}
                    placeholder="e.g., Premium East Facing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="builtUpArea">Built-up Area (sq.ft)</Label>
                  <Input
                    name="builtUpArea"
                    type="number"
                    step="0.01"
                    defaultValue={editingConfig.builtUpArea || ""}
                    placeholder="1550"
                  />
                </div>
                <div>
                  <Label htmlFor="plotArea">Plot Area (sq.ft)</Label>
                  <Input
                    name="plotArea"
                    type="number"
                    step="0.01"
                    defaultValue={editingConfig.plotArea || ""}
                    placeholder="3000"
                  />
                </div>
                <div>
                  <Label htmlFor="udsShare">UDS Share (sq.ft)</Label>
                  <Input
                    name="udsShare"
                    type="number"
                    step="0.01"
                    defaultValue={editingConfig.udsShare || ""}
                    placeholder="1260"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalPrice">Total Price</Label>
                  <Input
                    name="totalPrice"
                    defaultValue={editingConfig.totalPrice || ""}
                    placeholder="₹2.5 Cr"
                  />
                </div>
                <div>
                  <Label htmlFor="facing">Facing</Label>
                  <Select name="facing" defaultValue={editingConfig.facing || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="North-East">North-East</SelectItem>
                      <SelectItem value="North-West">North-West</SelectItem>
                      <SelectItem value="South-East">South-East</SelectItem>
                      <SelectItem value="South-West">South-West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numberOfBedrooms">Bedrooms</Label>
                  <Input
                    name="numberOfBedrooms"
                    type="number"
                    defaultValue={editingConfig.numberOfBedrooms || ""}
                    placeholder="3"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfBathrooms">Bathrooms</Label>
                  <Input
                    name="numberOfBathrooms"
                    type="number"
                    defaultValue={editingConfig.numberOfBathrooms || ""}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label htmlFor="floorNumber">Floor Number</Label>
                  <Input
                    name="floorNumber"
                    type="number"
                    defaultValue={editingConfig.floorNumber || ""}
                    placeholder="5"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingConfig(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateConfigMutation.isPending}>
                  {updateConfigMutation.isPending ? "Updating..." : "Update Configuration"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}