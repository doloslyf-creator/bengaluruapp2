import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, FileText, Calculator, TrendingUp, MapPin, Shield, Home, DollarSign, Building, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function ValuationReportsCreateComprehensive() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      console.log("Creating valuation report with data:", reportData);

      // Clean up the data before sending
      const cleanData = {
        ...reportData,
        // Ensure numeric fields are properly formatted
        overallScore: reportData.overallScore ? String(reportData.overallScore) : "0.0",
        // Ensure dates are strings
        reportDate: reportData.reportDate || new Date().toISOString().split('T')[0],
        // Remove any undefined or null values
        ...Object.fromEntries(
          Object.entries(reportData).filter(([_, v]) => v !== undefined && v !== null)
        )
      };

      const response = await fetch("/api/valuation-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API error response:", error);
        throw new Error(error.error || "Failed to create report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      toast({ title: "Valuation report created successfully" });
      navigate("/admin-panel/valuation-reports");
    },
    onError: (error: any) => {
      console.error("Error creating valuation report:", error);
      toast({
        title: "Error creating valuation report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions for parsing complex fields
  const parseArrayField = (value: string) => {
    if (!value) return [];
    try {
      return value.split('\n').filter(item => item.trim() !== '');
    } catch {
      return [];
    }
  };

  const parseJsonField = (value: string) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const reportData = {
      // Basic Information
      propertyId: formData.get("propertyId") as string,
      reportTitle: formData.get("reportTitle") as string,
      reportStatus: formData.get("reportStatus") as string || "draft",
      assignedTo: formData.get("assignedTo") as string,
      createdBy: "admin",
      customerId: null, // Will be assigned later

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

    createReportMutation.mutate(reportData);
  };

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
              <h1 className="text-xl font-bold truncate">Create Comprehensive Valuation Report</h1>
              <p className="text-sm text-muted-foreground truncate">
                Create a detailed property valuation report with all assessment sections
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-full">
          <Tabs defaultValue="executive" className="w-full">
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
                          value="executive" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Executive Summary</div>
                              <div className="text-xs text-muted-foreground">Key findings & overview</div>
                            </div>
                          </div>
                        </TabsTrigger>

                        <TabsTrigger 
                          value="property" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Property Details</div>
                              <div className="text-xs text-muted-foreground">Specifications & features</div>
                            </div>
                          </div>
                        </TabsTrigger>

                        <TabsTrigger 
                          value="market" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Market Analysis</div>
                              <div className="text-xs text-muted-foreground">Valuation & trends</div>
                            </div>
                          </div>
                        </TabsTrigger>

                        <TabsTrigger 
                          value="location" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Location & Infrastructure</div>
                              <div className="text-xs text-muted-foreground">Area assessment</div>
                            </div>
                          </div>
                        </TabsTrigger>

                        <TabsTrigger 
                          value="legal" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Legal & Compliance</div>
                              <div className="text-xs text-muted-foreground">Documentation status</div>
                            </div>
                          </div>
                        </TabsTrigger>

                        <TabsTrigger 
                          value="final" 
                          className="w-full justify-start h-auto p-4 text-left bg-transparent border-none shadow-none hover:bg-muted data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Calculator className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">Final Recommendation</div>
                              <div className="text-xs text-muted-foreground">Investment advice</div>
                            </div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {/* Mobile Navigation */}
                <div className="lg:hidden mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                        <TabsTrigger value="executive" className="text-xs">Basic</TabsTrigger>
                        <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
                        <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
                        <TabsTrigger value="location" className="text-xs">Location</TabsTrigger>
                        <TabsTrigger value="legal" className="text-xs">Legal</TabsTrigger>
                        <TabsTrigger value="final" className="text-xs">Final</TabsTrigger>
                      </TabsList>
                    </CardContent>
                  </Card>
                </div>

                {/* Tab Contents */}
                <TabsContent value="executive" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <FileText className="h-5 w-5 mr-2" />
                        Basic Information & Executive Summary
                      </CardTitle>
                      <CardDescription>
                        Essential report details and key findings overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Report Info */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="propertyId">Property *</Label>
                          <Select name="propertyId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.name} - {property.area}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="reportTitle">Report Title *</Label>
                          <Input
                            name="reportTitle"
                            placeholder="Property Valuation Report - [Property Name]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reportStatus">Report Status</Label>
                          <Select name="reportStatus" defaultValue="draft">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="assignedTo">Assigned To</Label>
                          <Input
                            name="assignedTo"
                            placeholder="Analyst name"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Executive Summary Fields */}
                      <div>
                        <Label htmlFor="projectName">Project Name & Unit</Label>
                        <Input
                          name="projectName"
                          placeholder="e.g., Assetz Marq 3.0 - 3BHK Premium, Tower B"
                        />
                      </div>

                      <div>
                        <Label htmlFor="towerUnit">Tower & Unit Details</Label>
                        <Input
                          name="towerUnit"
                          placeholder="e.g., Tower B, Unit 1502, 15th Floor"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="estimatedMarketValue">Estimated Market Value (₹)</Label>
                          <Input
                            name="estimatedMarketValue"
                            placeholder="e.g., 2.8 Cr"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ratePerSqftSbaUds">Rate per Sq.Ft (SBA + UDS)</Label>
                          <Input
                            name="ratePerSqftSbaUds"
                            placeholder="e.g., ₹18,500/sq.ft"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="buyerFit">Buyer Fit Assessment</Label>
                        <Select name="buyerFit">
                          <SelectTrigger>
                            <SelectValue placeholder="Select buyer fit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="end-user-family">End User Family</SelectItem>
                            <SelectItem value="investor">Investor</SelectItem>
                            <SelectItem value="upgrader">Upgrader</SelectItem>
                            <SelectItem value="first-time-buyer">First Time Buyer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="valuationVerdict">Valuation Verdict</Label>
                        <Select name="valuationVerdict">
                          <SelectTrigger>
                            <SelectValue placeholder="Select verdict" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overpriced">Overpriced</SelectItem>
                            <SelectItem value="fairly-priced">Fairly Priced</SelectItem>
                            <SelectItem value="underpriced">Underpriced</SelectItem>
                            <SelectItem value="premium-justified">Premium Justified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="appreciationOutlook">Appreciation Outlook</Label>
                        <Select name="appreciationOutlook">
                          <SelectTrigger>
                            <SelectValue placeholder="Select outlook" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (12%+ p.a.)</SelectItem>
                            <SelectItem value="good">Good (8-12% p.a.)</SelectItem>
                            <SelectItem value="moderate">Moderate (5-8% p.a.)</SelectItem>
                            <SelectItem value="poor">Poor (Below 5% p.a.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="riskScore">Risk Score (1-10)</Label>
                        <Select name="riskScore">
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk score" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(score => (
                              <SelectItem key={score} value={score.toString()}>
                                {score} - {score <= 3 ? 'Low Risk' : score <= 6 ? 'Medium Risk' : 'High Risk'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="recommendation">Final Recommendation</Label>
                        <Textarea
                          name="recommendation"
                          placeholder="Summary recommendation for the buyer..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="property" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Home className="h-5 w-5 mr-2" />
                        Property Profile & Specifications
                      </CardTitle>
                      <CardDescription>
                        Detailed property characteristics and compliance status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unitType">Unit Type</Label>
                          <Select name="unitType">
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="penthouse">Penthouse</SelectItem>
                              <SelectItem value="duplex">Duplex</SelectItem>
                              <SelectItem value="plot">Plot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="configuration">Configuration</Label>
                          <Select name="configuration">
                            <SelectTrigger>
                              <SelectValue placeholder="Select configuration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1bhk">1 BHK</SelectItem>
                              <SelectItem value="2bhk">2 BHK</SelectItem>
                              <SelectItem value="3bhk">3 BHK</SelectItem>
                              <SelectItem value="4bhk">4 BHK</SelectItem>
                              <SelectItem value="5bhk+">5 BHK+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="undividedLandShare">Undivided Land Share</Label>
                          <Input
                            name="undividedLandShare"
                            placeholder="e.g., 2.5% or 450 sq.ft"
                          />
                        </div>
                        <div>
                          <Label htmlFor="facing">Facing</Label>
                          <Select name="facing">
                            <SelectTrigger>
                              <SelectValue placeholder="Select facing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="north">North</SelectItem>
                              <SelectItem value="south">South</SelectItem>
                              <SelectItem value="east">East</SelectItem>
                              <SelectItem value="west">West</SelectItem>
                              <SelectItem value="north-east">North-East</SelectItem>
                              <SelectItem value="north-west">North-West</SelectItem>
                              <SelectItem value="south-east">South-East</SelectItem>
                              <SelectItem value="south-west">South-West</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="vastuCompliance" name="vastuCompliance" />
                        <Label htmlFor="vastuCompliance">Vastu Compliant</Label>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ocCcStatus">OC/CC Status</Label>
                          <Select name="ocCcStatus">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="received">Received</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="applied">Applied</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="possessionStatus">Possession Status</Label>
                          <Select name="possessionStatus">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ready">Ready to Move</SelectItem>
                              <SelectItem value="under-construction">Under Construction</SelectItem>
                              <SelectItem value="delayed">Delayed</SelectItem>
                              <SelectItem value="launched">Recently Launched</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="khataType">Khata Type</Label>
                          <Select name="khataType">
                            <SelectTrigger>
                              <SelectValue placeholder="Select khata type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a-khata">A Khata</SelectItem>
                              <SelectItem value="b-khata">B Khata</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="conversion-pending">Conversion Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="landTitleStatus">Land Title Status</Label>
                          <Select name="landTitleStatus">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clear">Clear Title</SelectItem>
                              <SelectItem value="minor-issues">Minor Issues</SelectItem>
                              <SelectItem value="major-issues">Major Issues</SelectItem>
                              <SelectItem value="pending-verification">Pending Verification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="builderReputationScore">Builder Reputation Score</Label>
                        <Select name="builderReputationScore">
                          <SelectTrigger>
                            <SelectValue placeholder="Select score" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (9-10/10)</SelectItem>
                            <SelectItem value="good">Good (7-8/10)</SelectItem>
                            <SelectItem value="average">Average (5-6/10)</SelectItem>
                            <SelectItem value="poor">Poor (Below 5/10)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="market" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Market Valuation & Analysis
                      </CardTitle>
                      <CardDescription>
                        Pricing analysis, comparable sales, and market trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Market Valuation */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="builderQuotedPrice">Builder Quoted Price (₹)</Label>
                          <Input
                            name="builderQuotedPrice"
                            placeholder="e.g., 2.95 Cr"
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalEstimatedValue">Total Estimated Value (₹)</Label>
                          <Input
                            name="totalEstimatedValue"
                            placeholder="e.g., 2.8 Cr"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pricePerSqftAnalysis">Price per Sq.Ft Analysis</Label>
                        <Textarea
                          name="pricePerSqftAnalysis"
                          placeholder="Detailed analysis of price per square foot compared to market..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="landShareValue">Land Share Value (₹)</Label>
                          <Input
                            name="landShareValue"
                            placeholder="e.g., 1.2 Cr"
                          />
                        </div>
                        <div>
                          <Label htmlFor="constructionValue">Construction Value (₹)</Label>
                          <Input
                            name="constructionValue"
                            placeholder="e.g., 1.6 Cr"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="guidanceValueZoneRate">Guidance Value Zone Rate</Label>
                          <Input
                            name="guidanceValueZoneRate"
                            placeholder="e.g., ₹12,000 per sq.ft"
                          />
                        </div>
                        <div>
                          <Label htmlFor="marketPremiumDiscount">Market Premium/Discount</Label>
                          <Input
                            name="marketPremiumDiscount"
                            placeholder="e.g., 15% premium to guidance"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Comparable Sales */}
                      <div>
                        <Label htmlFor="comparableSales">Comparable Sales Data (JSON)</Label>
                        <Textarea
                          name="comparableSales"
                          placeholder='[{"property": "Project A", "price": "18500", "date": "2024-01"}]'
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="benchmarkingSources">Benchmarking Sources</Label>
                          <Input
                            name="benchmarkingSources"
                            placeholder="e.g., 99acres, Magicbricks, Direct Sales"
                          />
                        </div>
                        <div>
                          <Label htmlFor="volatilityIndex">Volatility Index</Label>
                          <Select name="volatilityIndex">
                            <SelectTrigger>
                              <SelectValue placeholder="Select volatility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="very-high">Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="averageDaysOnMarket">Average Days on Market</Label>
                        <Input
                          name="averageDaysOnMarket"
                          type="number"
                          placeholder="e.g., 120"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <MapPin className="h-5 w-5 mr-2" />
                        Location & Infrastructure Assessment
                      </CardTitle>
                      <CardDescription>
                        Area analysis, connectivity, and infrastructure evaluation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="planningAuthority">Planning Authority</Label>
                          <Select name="planningAuthority">
                            <SelectTrigger>
                              <SelectValue placeholder="Select authority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bda">BDA</SelectItem>
                              <SelectItem value="bmrda">BMRDA</SelectItem>
                              <SelectItem value="biapa">BIAPA</SelectItem>
                              <SelectItem value="bbmp">BBMP</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="zonalClassification">Zonal Classification</Label>
                          <Select name="zonalClassification">
                            <SelectTrigger>
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="mixed-use">Mixed Use</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="landUseStatus">Land Use Status</Label>
                        <Select name="landUseStatus">
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="conversion-required">Conversion Required</SelectItem>
                            <SelectItem value="non-convertible">Non-Convertible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="connectivity">Connectivity Assessment</Label>
                        <Textarea
                          name="connectivity"
                          placeholder="Details about road connectivity, public transport, major highways..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="waterSupply">Water Supply</Label>
                          <Select name="waterSupply">
                            <SelectTrigger>
                              <SelectValue placeholder="Select supply" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corporation">Corporation</SelectItem>
                              <SelectItem value="borewell">Borewell</SelectItem>
                              <SelectItem value="tanker">Tanker</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="drainage">Drainage System</Label>
                          <Select name="drainage">
                            <SelectTrigger>
                              <SelectValue placeholder="Select drainage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="average">Average</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="socialInfrastructure">Social Infrastructure</Label>
                        <Textarea
                          name="socialInfrastructure"
                          placeholder="Schools, hospitals, shopping centers, recreational facilities..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="futureInfrastructure">Future Infrastructure (JSON)</Label>
                        <Textarea
                          name="futureInfrastructure"
                          placeholder='[{"project": "Metro Line 3", "timeline": "2026", "impact": "High"}]'
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="legal" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Shield className="h-5 w-5 mr-2" />
                        Legal & Compliance Snapshot
                      </CardTitle>
                      <CardDescription>
                        Documentation status, approvals, and legal clearances
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reraRegistration">RERA Registration</Label>
                          <Select name="reraRegistration">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="registered">Registered</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="exempted">Exempted</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="khataVerification">Khata Verification</Label>
                          <Select name="khataVerification">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="issues-found">Issues Found</SelectItem>
                              <SelectItem value="not-applicable">Not Applicable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="titleClearance">Title Clearance</Label>
                          <Select name="titleClearance">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clear">Clear</SelectItem>
                              <SelectItem value="minor-issues">Minor Issues</SelectItem>
                              <SelectItem value="major-issues">Major Issues</SelectItem>
                              <SelectItem value="pending">Pending Verification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="dcConversion">DC Conversion</Label>
                          <Select name="dcConversion">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="done">Done</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="not-required">Not Required</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="planApproval">Plan Approval Status</Label>
                        <Select name="planApproval">
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="conditional">Conditional Approval</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="loanApproval">Loan Approval Banks (JSON)</Label>
                        <Textarea
                          name="loanApproval"
                          placeholder='["SBI", "HDFC", "ICICI", "Axis Bank"]'
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="titleClarityNotes">Title Clarity Notes</Label>
                        <Textarea
                          name="titleClarityNotes"
                          placeholder="Additional notes about title clarity, encumbrances, legal issues..."
                          rows={4}
                        />
                      </div>

                      <Separator />

                      {/* Rental & Yield */}
                      <div>
                        <h3 className="text-md font-semibold">Rental & Yield Potential</h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expectedMonthlyRent">Expected Monthly Rent (₹)</Label>
                          <Input
                            name="expectedMonthlyRent"
                            placeholder="e.g., 45,000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="grossRentalYield">Gross Rental Yield (%)</Label>
                          <Input
                            name="grossRentalYield"
                            placeholder="e.g., 3.2%"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tenantDemand">Tenant Demand</Label>
                          <Select name="tenantDemand">
                            <SelectTrigger>
                              <SelectValue placeholder="Select demand" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="very-low">Very Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="exitLiquidity">Exit Liquidity</Label>
                          <Select name="exitLiquidity">
                            <SelectTrigger>
                              <SelectValue placeholder="Select liquidity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="yieldScore">Overall Yield Score</Label>
                        <Select name="yieldScore">
                          <SelectTrigger>
                            <SelectValue placeholder="Select score" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (8-10/10)</SelectItem>
                            <SelectItem value="good">Good (6-7/10)</SelectItem>
                            <SelectItem value="average">Average (4-5/10)</SelectItem>
                            <SelectItem value="poor">Poor (1-3/10)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="final" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Calculator className="h-5 w-5 mr-2" />
                        Cost Breakdown & Final Recommendation
                      </CardTitle>
                      <CardDescription>
                        Complete cost analysis and investment recommendation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Cost Sheet */}
                      <div>
                        <h3 className="text-md font-semibold mb-4">Cost Sheet Breakdown</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="baseUnitCost">Base Unit Cost (₹)</Label>
                            <Input
                              name="baseUnitCost"
                              placeholder="e.g., 2.4 Cr"
                            />
                          </div>
                          <div>
                            <Label htmlFor="amenitiesCharges">Amenities Charges (₹)</Label>
                            <Input
                              name="amenitiesCharges"
                              placeholder="e.g., 8 Lakh"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="floorRiseCharges">Floor Rise Charges (₹)</Label>
                            <Input
                              name="floorRiseCharges"
                              placeholder="e.g., 3 Lakh"
                            />
                          </div>
                          <div>
                            <Label htmlFor="gstAmount">GST Amount (₹)</Label>
                            <Input
                              name="gstAmount"
                              placeholder="e.g., 12 Lakh"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="stampDutyRegistration">Stamp Duty & Registration (₹)</Label>
                            <Input
                              name="stampDutyRegistration"
                              placeholder="e.g., 18 Lakh"
                            />
                          </div>
                          <div>
                            <Label htmlFor="khataTransferCosts">Khata Transfer Costs (₹)</Label>
                            <Input
                              name="khataTransferCosts"
                              placeholder="e.g., 2 Lakh"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="totalAllInPrice">Total All-In Price (₹)</Label>
                          <Input
                            name="totalAllInPrice"
                            placeholder="e.g., 2.83 Cr"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Pros & Cons */}
                      <div>
                        <h3 className="text-md font-semibold mb-4">Pros & Cons Summary</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pros">Pros (One per line)</Label>
                            <Textarea
                              name="pros"
                              placeholder="Excellent location connectivity&#10;Premium amenities&#10;Reputed builder track record"
                              rows={5}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cons">Cons (One per line)</Label>
                            <Textarea
                              name="cons"
                              placeholder="Higher price point&#10;Traffic congestion during peak hours&#10;Limited parking availability"
                              rows={5}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Final Recommendation */}
                      <div>
                        <h3 className="text-md font-semibold mb-4">Final Investment Recommendation</h3>

                        <div>
                          <Label htmlFor="buyerTypeFit">Buyer Type Fit</Label>
                          <Select name="buyerTypeFit">
                            <SelectTrigger>
                              <SelectValue placeholder="Select buyer type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="end-user-family">End User Family</SelectItem>
                              <SelectItem value="working-professionals">Working Professionals</SelectItem>
                              <SelectItem value="investors">Investors</SelectItem>
                              <SelectItem value="nri-buyers">NRI Buyers</SelectItem>
                              <SelectItem value="upgraders">Upgraders</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="negotiationAdvice">Negotiation Advice</Label>
                          <Textarea
                            name="negotiationAdvice"
                            placeholder="Specific advice on price negotiation, timing, terms..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="riskSummary">Risk Summary</Label>
                          <Textarea
                            name="riskSummary"
                            placeholder="Key risks and mitigation strategies..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="appreciationOutlook5yr">5-Year Appreciation Outlook</Label>
                          <Textarea
                            name="appreciationOutlook5yr"
                            placeholder="Expected appreciation over 5 years with supporting factors..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="exitPlan">Exit Plan Strategy</Label>
                          <Textarea
                            name="exitPlan"
                            placeholder="Recommended exit strategy and timeline..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="overallScore">Overall Investment Score</Label>
                          <Select name="overallScore">
                            <SelectTrigger>
                              <SelectValue placeholder="Select overall score" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9-10">Excellent (9-10/10)</SelectItem>
                              <SelectItem value="7-8">Good (7-8/10)</SelectItem>
                              <SelectItem value="5-6">Average (5-6/10)</SelectItem>
                              <SelectItem value="3-4">Below Average (3-4/10)</SelectItem>
                              <SelectItem value="1-2">Poor (1-2/10)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="customNotes">Additional Custom Notes</Label>
                        <Textarea
                          name="customNotes"
                          placeholder="Any additional observations, special considerations, or custom analysis..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/admin-panel/valuation-reports")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReportMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {createReportMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
}