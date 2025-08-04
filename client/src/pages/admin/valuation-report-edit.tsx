import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, Eye, Calculator, TrendingUp, MapPin, FileText, Shield, Home, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PropertyValuationReport, Property } from "@shared/schema";

export default function ValuationReportEdit() {
  const [, params] = useRoute("/admin-panel/valuation-reports/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reportId = params?.id;

  // Fetch valuation report
  const { data: report, isLoading } = useQuery<PropertyValuationReport>({
    queryKey: ["/api/valuation-reports", reportId],
    enabled: !!reportId,
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Helper function to parse array fields
    const parseArrayField = (value: string) => {
      if (!value || value.trim() === '') return [];
      return value.split('\n').map(item => item.trim()).filter(Boolean);
    };

    const updateData = {
      // Basic Information
      reportTitle: formData.get("reportTitle") as string,
      projectName: formData.get("projectName") as string,
      towerUnit: formData.get("towerUnit") as string,
      unitType: formData.get("unitType") as string,
      configuration: formData.get("configuration") as string,
      
      // Property Profile
      undividedLandShare: formData.get("undividedLandShare") as string,
      facing: formData.get("facing") as string,
      vastuCompliance: formData.get("vastuCompliance") === "true",
      ocCcStatus: formData.get("ocCcStatus") as string,
      possessionStatus: formData.get("possessionStatus") as string,
      khataType: formData.get("khataType") as string,
      landTitleStatus: formData.get("landTitleStatus") as string,
      builderReputationScore: formData.get("builderReputationScore") ? parseFloat(formData.get("builderReputationScore") as string) : undefined,
      
      // Market Valuation
      estimatedMarketValue: formData.get("estimatedMarketValue") ? parseFloat(formData.get("estimatedMarketValue") as string) : undefined,
      ratePerSqft: formData.get("ratePerSqft") ? parseFloat(formData.get("ratePerSqft") as string) : undefined,
      builderQuotedPrice: formData.get("builderQuotedPrice") ? parseFloat(formData.get("builderQuotedPrice") as string) : undefined,
      landShareValue: formData.get("landShareValue") ? parseFloat(formData.get("landShareValue") as string) : undefined,
      constructionValue: formData.get("constructionValue") ? parseFloat(formData.get("constructionValue") as string) : undefined,
      guidanceValueZoneRate: formData.get("guidanceValueZoneRate") ? parseFloat(formData.get("guidanceValueZoneRate") as string) : undefined,
      marketPremiumDiscount: formData.get("marketPremiumDiscount") ? parseFloat(formData.get("marketPremiumDiscount") as string) : undefined,
      
      // Comparable Sales (JSON structure)
      comparableSales: formData.get("comparableSales") ? JSON.parse(formData.get("comparableSales") as string || "[]") : [],
      volatilityIndex: formData.get("volatilityIndex") ? parseFloat(formData.get("volatilityIndex") as string) : undefined,
      averageDaysOnMarket: formData.get("averageDaysOnMarket") ? parseInt(formData.get("averageDaysOnMarket") as string) : undefined,
      
      // Location Assessment
      planningAuthority: formData.get("planningAuthority") as string,
      zonalClassification: formData.get("zonalClassification") as string,
      landUseStatus: formData.get("landUseStatus") as string,
      connectivity: formData.get("connectivity") as string,
      waterSupply: formData.get("waterSupply") as string,
      drainage: formData.get("drainage") as string,
      socialInfrastructure: formData.get("socialInfrastructure") as string,
      futureInfrastructure: parseArrayField(formData.get("futureInfrastructure") as string),
      
      // Legal Compliance
      reraRegistration: formData.get("reraRegistration") as string,
      khataVerification: formData.get("khataVerification") as string,
      titleClearance: formData.get("titleClearance") as string,
      dcConversion: formData.get("dcConversion") as string,
      planApproval: formData.get("planApproval") as string,
      loanApproval: parseArrayField(formData.get("loanApproval") as string),
      titleClarityNotes: formData.get("titleClarityNotes") as string,
      
      // Rental Analysis
      expectedMonthlyRent: formData.get("expectedMonthlyRent") ? parseFloat(formData.get("expectedMonthlyRent") as string) : undefined,
      grossRentalYield: formData.get("grossRentalYield") ? parseFloat(formData.get("grossRentalYield") as string) : undefined,
      tenantDemand: formData.get("tenantDemand") as string,
      exitLiquidity: formData.get("exitLiquidity") as string,
      yieldScore: formData.get("yieldScore") ? parseFloat(formData.get("yieldScore") as string) : undefined,
      
      // Cost Analysis
      baseUnitCost: formData.get("baseUnitCost") ? parseFloat(formData.get("baseUnitCost") as string) : undefined,
      amenitiesCharges: formData.get("amenitiesCharges") ? parseFloat(formData.get("amenitiesCharges") as string) : undefined,
      floorRiseCharges: formData.get("floorRiseCharges") ? parseFloat(formData.get("floorRiseCharges") as string) : undefined,
      gstAmount: formData.get("gstAmount") ? parseFloat(formData.get("gstAmount") as string) : undefined,
      stampDutyRegistration: formData.get("stampDutyRegistration") ? parseFloat(formData.get("stampDutyRegistration") as string) : undefined,
      totalAllInPrice: formData.get("totalAllInPrice") ? parseFloat(formData.get("totalAllInPrice") as string) : undefined,
      khataTransferCosts: formData.get("khataTransferCosts") ? parseFloat(formData.get("khataTransferCosts") as string) : undefined,
      
      // Analysis & Recommendations
      pros: parseArrayField(formData.get("pros") as string),
      cons: parseArrayField(formData.get("cons") as string),
      buyerFit: formData.get("buyerFit") as string,
      negotiationAdvice: formData.get("negotiationAdvice") as string,
      riskSummary: formData.get("riskSummary") as string,
      appreciationOutlook: formData.get("appreciationOutlook") as string,
      exitPlan: formData.get("exitPlan") as string,
      overallScore: formData.get("overallScore") as string,
      riskScore: formData.get("riskScore") ? parseFloat(formData.get("riskScore") as string) : undefined,
      valuationVerdict: formData.get("valuationVerdict") as string,
      recommendation: formData.get("recommendation") as string,
      
      // Executive Summary
      executiveSummary: formData.get("executiveSummary") as string,
      keyHighlights: parseArrayField(formData.get("keyHighlights") as string),
    };

    updateReportMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading report...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
            <p className="text-muted-foreground">The requested valuation report could not be found.</p>
            <Button className="mt-4" onClick={() => navigate("/admin-panel/valuation-reports")}>
              Back to Reports
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin-panel/valuation-reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Valuation Report</h1>
              <p className="text-muted-foreground">
                Comprehensive property valuation for {getPropertyName(report.propertyId)}
              </p>
              <Badge variant="outline" className="mt-2">
                Status: {report.reportStatus?.replace('_', ' ').toUpperCase() || 'DRAFT'}
              </Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Executive Summary */}
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
                  <Label htmlFor="reportTitle">Report Title</Label>
                  <Input
                    name="reportTitle"
                    defaultValue={report.reportTitle}
                    placeholder="Property Valuation Report - [Property Name]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="projectName">Project Name & Unit</Label>
                  <Input
                    name="projectName"
                    defaultValue={report.projectName || ""}
                    placeholder="e.g., Assetz Marq 3.0, 3BHK, Tower B"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedMarketValue">Estimated Market Value (₹)</Label>
                  <Input
                    name="estimatedMarketValue"
                    type="number"
                    step="0.01"
                    defaultValue={report.estimatedMarketValue || ""}
                    placeholder="22000000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ratePerSqft">Rate per Sqft (₹)</Label>
                  <Input
                    name="ratePerSqft"
                    type="number"
                    step="0.01"
                    defaultValue={report.ratePerSqft || ""}
                    placeholder="10200.00"
                  />
                </div>
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
                    step="0.1"
                    defaultValue={report.riskScore || ""}
                    placeholder="3.0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="valuationVerdict">Valuation Verdict</Label>
                <Textarea
                  name="valuationVerdict"
                  defaultValue={report.valuationVerdict || ""}
                  placeholder="e.g., Slightly Overpriced (₹1,000/sqft above resale)"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="recommendation">Final Recommendation</Label>
                <Textarea
                  name="recommendation"
                  defaultValue={report.recommendation || ""}
                  placeholder="e.g., ✅ Buy if negotiated ~₹10L lower"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="executiveSummary">Executive Summary</Label>
                <Textarea
                  name="executiveSummary"
                  defaultValue={report.executiveSummary || ""}
                  placeholder="Comprehensive summary of the valuation analysis and key findings..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="keyHighlights">Key Highlights (one per line)</Label>
                <Textarea
                  name="keyHighlights"
                  defaultValue={Array.isArray(report.keyHighlights) ? report.keyHighlights.join('\n') : ""}
                  placeholder="Strong location advantage&#10;Legal compliance verified&#10;Market rate alignment"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Profile */}
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
                  <Label htmlFor="towerUnit">Tower/Unit</Label>
                  <Input
                    name="towerUnit"
                    defaultValue={report.towerUnit || ""}
                    placeholder="Tower B, Unit 1203"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="undividedLandShare">UDS (Undivided Land Share)</Label>
                  <Input
                    name="undividedLandShare"
                    defaultValue={report.undividedLandShare || ""}
                    placeholder="42% or 650 sq.ft"
                  />
                </div>
                <div>
                  <Label htmlFor="facing">Facing & Vastu</Label>
                  <div className="flex space-x-2">
                    <Input
                      name="facing"
                      defaultValue={report.facing || ""}
                      placeholder="East facing"
                      className="flex-1"
                    />
                    <Select name="vastuCompliance" defaultValue={report.vastuCompliance ? "true" : "false"}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Vastu Compliant</SelectItem>
                        <SelectItem value="false">Non-Vastu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ocCcStatus">OC/CC Status</Label>
                  <Select name="ocCcStatus" defaultValue={report.ocCcStatus || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="A">A Khata</SelectItem>
                      <SelectItem value="B">B Khata</SelectItem>
                      <SelectItem value="E">E Khata</SelectItem>
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
                    placeholder="Clear title / Encumbered / Under litigation"
                  />
                </div>
                <div>
                  <Label htmlFor="builderReputationScore">Builder Reputation Score (0-10)</Label>
                  <Input
                    name="builderReputationScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    defaultValue={report.builderReputationScore || ""}
                    placeholder="8.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Valuation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Market Valuation Estimate
              </CardTitle>
              <CardDescription>
                Detailed market analysis and price comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="builderQuotedPrice">Builder Quoted Price (₹)</Label>
                  <Input
                    name="builderQuotedPrice"
                    type="number"
                    step="0.01"
                    defaultValue={report.builderQuotedPrice || ""}
                    placeholder="21500000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="marketPremiumDiscount">Market Premium/Discount (%)</Label>
                  <Input
                    name="marketPremiumDiscount"
                    type="number"
                    step="0.1"
                    defaultValue={report.marketPremiumDiscount || ""}
                    placeholder="14.0 (above market) or -5.0 (below market)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="landShareValue">Land Share Value (₹)</Label>
                  <Input
                    name="landShareValue"
                    type="number"
                    step="0.01"
                    defaultValue={report.landShareValue || ""}
                    placeholder="8500000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="constructionValue">Construction Component (₹)</Label>
                  <Input
                    name="constructionValue"
                    type="number"
                    step="0.01"
                    defaultValue={report.constructionValue || ""}
                    placeholder="13500000.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guidanceValueZoneRate">Guidance Value Zone Rate (₹/sqft)</Label>
                  <Input
                    name="guidanceValueZoneRate"
                    type="number"
                    step="0.01"
                    defaultValue={report.guidanceValueZoneRate || ""}
                    placeholder="6500.00"
                  />
                </div>
                <div>
                  <Label htmlFor="volatilityIndex">Volatility Index (6-month trend)</Label>
                  <Input
                    name="volatilityIndex"
                    type="number"
                    step="0.1"
                    defaultValue={report.volatilityIndex || ""}
                    placeholder="2.5 (stable) to 8.0 (volatile)"
                  />
                </div>
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

              <div>
                <Label htmlFor="comparableSales">Comparable Sales (JSON format)</Label>
                <Textarea
                  name="comparableSales"
                  defaultValue={JSON.stringify(report.comparableSales || [], null, 2)}
                  placeholder={`[
  {
    "project": "Brigade Utopia",
    "config": "3BHK",
    "area": 1640,
    "date": "Jan 2025",
    "ratePerSqft": 9100,
    "source": "MagicBricks"
  }
]`}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Infrastructure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location & Infrastructure Assessment
              </CardTitle>
              <CardDescription>
                Zoning, connectivity, and infrastructure analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <SelectValue placeholder="Select zone" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="drainage">Drainage System</Label>
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
                <div>
                  <Label htmlFor="tenantDemand">Tenant Demand</Label>
                  <Select name="tenantDemand" defaultValue={report.tenantDemand || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select demand level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="connectivity">Connectivity Details</Label>
                <Textarea
                  name="connectivity"
                  defaultValue={report.connectivity || ""}
                  placeholder="Distance to Metro, ORR, major roads, airports, etc."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="socialInfrastructure">Social Infrastructure</Label>
                <Textarea
                  name="socialInfrastructure"
                  defaultValue={report.socialInfrastructure || ""}
                  placeholder="Schools, Hospitals, Malls, IT parks within 5 km"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="futureInfrastructure">Future Developments (one per line)</Label>
                <Textarea
                  name="futureInfrastructure"
                  defaultValue={Array.isArray(report.futureInfrastructure) ? report.futureInfrastructure.join('\n') : ""}
                  placeholder="Peripheral Ring Road Plan&#10;Metro Phase 3 Extensions&#10;Planned SEZs / Tech Parks nearby"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Legal & Compliance Snapshot
              </CardTitle>
              <CardDescription>
                Legal clearances and compliance status
              </CardDescription>
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
                <Label htmlFor="planApproval">Plan Approval Authority</Label>
                <Input
                  name="planApproval"
                  defaultValue={report.planApproval || ""}
                  placeholder="From BDA/BMRDA"
                />
              </div>

              <div>
                <Label htmlFor="loanApproval">Loan Approval Banks (one per line)</Label>
                <Textarea
                  name="loanApproval"
                  defaultValue={Array.isArray(report.loanApproval) ? report.loanApproval.join('\n') : ""}
                  placeholder="HDFC&#10;ICICI&#10;SBI"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="titleClarityNotes">Title Clarity Notes</Label>
                <Textarea
                  name="titleClarityNotes"
                  defaultValue={report.titleClarityNotes || ""}
                  placeholder="No ongoing disputes / pending litigations"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rental & Yield Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Rental & Yield Potential
              </CardTitle>
              <CardDescription>
                Investment returns and rental market analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expectedMonthlyRent">Expected Monthly Rent (₹)</Label>
                  <Input
                    name="expectedMonthlyRent"
                    type="number"
                    step="0.01"
                    defaultValue={report.expectedMonthlyRent || ""}
                    placeholder="45000"
                  />
                </div>
                <div>
                  <Label htmlFor="grossRentalYield">Gross Rental Yield (%)</Label>
                  <Input
                    name="grossRentalYield"
                    type="number"
                    step="0.1"
                    defaultValue={report.grossRentalYield || ""}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <Label htmlFor="yieldScore">Yield Score (0-10)</Label>
                  <Input
                    name="yieldScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    defaultValue={report.yieldScore || ""}
                    placeholder="6.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exitLiquidity">Exit Liquidity (for resale)</Label>
                <Input
                  name="exitLiquidity"
                  defaultValue={report.exitLiquidity || ""}
                  placeholder="Moderate, 3–6 months"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Cost Sheet Breakdown
              </CardTitle>
              <CardDescription>
                Detailed cost analysis and financial breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseUnitCost">Base Unit Cost (₹)</Label>
                  <Input
                    name="baseUnitCost"
                    type="number"
                    step="0.01"
                    defaultValue={report.baseUnitCost || ""}
                    placeholder="19500000"
                  />
                </div>
                <div>
                  <Label htmlFor="amenitiesCharges">Clubhouse + Amenities (₹)</Label>
                  <Input
                    name="amenitiesCharges"
                    type="number"
                    step="0.01"
                    defaultValue={report.amenitiesCharges || ""}
                    placeholder="550000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floorRiseCharges">Floor Rise Charges (₹)</Label>
                  <Input
                    name="floorRiseCharges"
                    type="number"
                    step="0.01"
                    defaultValue={report.floorRiseCharges || ""}
                    placeholder="240000"
                  />
                </div>
                <div>
                  <Label htmlFor="gstAmount">GST @5% (₹)</Label>
                  <Input
                    name="gstAmount"
                    type="number"
                    step="0.01"
                    defaultValue={report.gstAmount || ""}
                    placeholder="975000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stampDutyRegistration">Stamp Duty + Registration (₹)</Label>
                  <Input
                    name="stampDutyRegistration"
                    type="number"
                    step="0.01"
                    defaultValue={report.stampDutyRegistration || ""}
                    placeholder="1300000"
                  />
                </div>
                <div>
                  <Label htmlFor="khataTransferCosts">Khata Transfer Costs (₹)</Label>
                  <Input
                    name="khataTransferCosts"
                    type="number"
                    step="0.01"
                    defaultValue={report.khataTransferCosts || ""}
                    placeholder="40000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="totalAllInPrice">Total All-In Price (₹)</Label>
                <Input
                  name="totalAllInPrice"
                  type="number"
                  step="0.01"
                  defaultValue={report.totalAllInPrice || ""}
                  placeholder="22600000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Final Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Final Analysis & Recommendations</CardTitle>
              <CardDescription>
                Comprehensive assessment and investment advice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pros">Pros (one per line)</Label>
                  <Textarea
                    name="pros"
                    defaultValue={Array.isArray(report.pros) ? report.pros.join('\n') : ""}
                    placeholder="Legally Clear Property&#10;High UDS (42%)&#10;Strong Social Infra&#10;OC Received"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="cons">Cons (one per line)</Label>
                  <Textarea
                    name="cons"
                    defaultValue={Array.isArray(report.cons) ? report.cons.join('\n') : ""}
                    placeholder="Slightly overpriced&#10;Some areas still rely on tanker&#10;Rental yield not investor-attractive"
                    rows={4}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="negotiationAdvice">Negotiation Advice</Label>
                <Textarea
                  name="negotiationAdvice"
                  defaultValue={report.negotiationAdvice || ""}
                  placeholder="Ask builder for ₹1,000/sqft discount due to oversupply in area"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="riskSummary">Risk Summary</Label>
                <Textarea
                  name="riskSummary"
                  defaultValue={report.riskSummary || ""}
                  placeholder="Low legal risk, moderate infra dependency"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="appreciationOutlook">Appreciation Outlook (5 yr)</Label>
                <Textarea
                  name="appreciationOutlook"
                  defaultValue={report.appreciationOutlook || ""}
                  placeholder="₹2.6–2.8 Cr expected with 7% CAGR"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="exitPlan">Exit Plan (for investor)</Label>
                <Textarea
                  name="exitPlan"
                  defaultValue={report.exitPlan || ""}
                  placeholder="Hold minimum 5–6 years for ROI"
                  rows={2}
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pb-8">
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
              {updateReportMutation.isPending ? "Saving..." : "Save Report"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}