import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Save, ArrowLeft, Plus, Trash2, Calculator, TrendingUp, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

interface ValuationReportForm {
  propertyId: string;
  reportVersion: string;
  generatedBy: string;
  
  // Cost Analysis
  costBreakdown: {
    landValue: number;
    constructionCost: number;
    developmentCharges: number;
    registrationStampDuty: number;
    gstOnConstruction: number;
    parkingCharges: number;
    clubhouseMaintenance: number;
    interiorFittings: number;
    movingCosts: number;
    legalCharges: number;
    totalEstimatedCost: number;
    hiddenCosts: Array<{ item: string; amount: number; description: string }>;
  };
  
  // Market Intelligence
  marketAnalysis: {
    currentMarketTrend: string;
    areaGrowthRate: number;
    demandSupplyRatio: string;
    marketSentiment: string;
    competitorAnalysis: Array<{
      propertyName: string;
      pricePerSqft: number;
      distanceKm: number;
      amenitiesComparison: string;
    }>;
  };
  
  // Investment Analysis
  financialAnalysis: {
    currentValuation: number;
    rentalYield: number;
    monthlyRentalIncome: number;
    roiAnalysis: {
      breakEvenPeriod: number;
      totalRoi5Years: number;
      totalRoi10Years: number;
    };
    loanEligibility: {
      maxLoanAmount: number;
      suggestedDownPayment: number;
      emiEstimate: number;
    };
  };
  
  // Property Assessment
  propertyAssessment: {
    structuralCondition: string;
    ageOfProperty: number;
    maintenanceLevel: string;
    amenitiesRating: number;
    locationAdvantages: string[];
    locationDisadvantages: string[];
    futureGrowthPotential: number;
  };
  
  // Final Assessment
  investmentRecommendation: "excellent-buy" | "good-buy" | "hold" | "avoid";
  riskAssessment: {
    overallRisk: "low" | "medium" | "high";
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  executiveSummary: string;
  overallScore: number;
  keyHighlights: string[];
}

export default function ValuationReportEdit() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin-panel/valuation-reports/:action/:id?");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditMode = params?.action === "edit" && params?.id;
  const isCreateMode = params?.action === "create";
  const [, navigate] = useLocation();
  
  // Get property ID from URL params for create mode
  useEffect(() => {
    if (isCreateMode && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const propertyId = urlParams.get('propertyId');
      if (propertyId) {
        setFormData(prev => ({ ...prev, propertyId }));
      }
    }
  }, [isCreateMode]);
  
  const [formData, setFormData] = useState<ValuationReportForm>({
    propertyId: "",
    reportVersion: "1.0",
    generatedBy: "",
    costBreakdown: {
      landValue: 0,
      constructionCost: 0,
      developmentCharges: 0,
      registrationStampDuty: 0,
      gstOnConstruction: 0,
      parkingCharges: 0,
      clubhouseMaintenance: 0,
      interiorFittings: 0,
      movingCosts: 0,
      legalCharges: 0,
      totalEstimatedCost: 0,
      hiddenCosts: []
    },
    marketAnalysis: {
      currentMarketTrend: "",
      areaGrowthRate: 0,
      demandSupplyRatio: "",
      marketSentiment: "",
      competitorAnalysis: []
    },
    financialAnalysis: {
      currentValuation: 0,
      rentalYield: 0,
      monthlyRentalIncome: 0,
      roiAnalysis: {
        breakEvenPeriod: 0,
        totalRoi5Years: 0,
        totalRoi10Years: 0
      },
      loanEligibility: {
        maxLoanAmount: 0,
        suggestedDownPayment: 0,
        emiEstimate: 0
      }
    },
    propertyAssessment: {
      structuralCondition: "",
      ageOfProperty: 0,
      maintenanceLevel: "",
      amenitiesRating: 0,
      locationAdvantages: [],
      locationDisadvantages: [],
      futureGrowthPotential: 0
    },
    investmentRecommendation: "good-buy",
    riskAssessment: {
      overallRisk: "medium",
      riskFactors: [],
      mitigationStrategies: []
    },
    executiveSummary: "",
    overallScore: 0,
    keyHighlights: []
  });

  // Load existing report data if editing
  const { data: existingReport } = useQuery({
    queryKey: ["/api/valuation-reports", params?.id],
    enabled: isEditMode,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  useEffect(() => {
    if (existingReport && isEditMode) {
      setFormData({
        propertyId: existingReport.propertyId,
        reportVersion: existingReport.reportVersion || "1.0",
        generatedBy: existingReport.generatedBy || "",
        costBreakdown: existingReport.costBreakdown || formData.costBreakdown,
        marketAnalysis: existingReport.marketAnalysis || formData.marketAnalysis,
        financialAnalysis: existingReport.financialAnalysis || formData.financialAnalysis,
        propertyAssessment: existingReport.propertyAssessment || formData.propertyAssessment,
        investmentRecommendation: existingReport.investmentRecommendation || "good-buy",
        riskAssessment: existingReport.riskAssessment || formData.riskAssessment,
        executiveSummary: existingReport.executiveSummary || "",
        overallScore: parseFloat(existingReport.overallScore) || 0,
        keyHighlights: existingReport.keyHighlights || []
      });
    }
  }, [existingReport, isEditMode]);

  // Calculate total cost automatically
  useEffect(() => {
    const total = 
      formData.costBreakdown.landValue +
      formData.costBreakdown.constructionCost +
      formData.costBreakdown.developmentCharges +
      formData.costBreakdown.registrationStampDuty +
      formData.costBreakdown.gstOnConstruction +
      formData.costBreakdown.parkingCharges +
      formData.costBreakdown.clubhouseMaintenance +
      formData.costBreakdown.interiorFittings +
      formData.costBreakdown.movingCosts +
      formData.costBreakdown.legalCharges +
      formData.costBreakdown.hiddenCosts.reduce((sum, cost) => sum + cost.amount, 0);

    setFormData(prev => ({
      ...prev,
      costBreakdown: {
        ...prev.costBreakdown,
        totalEstimatedCost: total
      }
    }));
  }, [
    formData.costBreakdown.landValue,
    formData.costBreakdown.constructionCost,
    formData.costBreakdown.developmentCharges,
    formData.costBreakdown.registrationStampDuty,
    formData.costBreakdown.gstOnConstruction,
    formData.costBreakdown.parkingCharges,
    formData.costBreakdown.clubhouseMaintenance,
    formData.costBreakdown.interiorFittings,
    formData.costBreakdown.movingCosts,
    formData.costBreakdown.legalCharges,
    formData.costBreakdown.hiddenCosts
  ]);

  const saveReportMutation = useMutation({
    mutationFn: (data: ValuationReportForm) => {
      if (isEditMode) {
        return apiRequest("PUT", `/api/valuation-reports/${params?.id}`, data);
      } else {
        return apiRequest("POST", "/api/valuation-reports", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      toast({
        title: "Success",
        description: `Report ${isEditMode ? "updated" : "created"} successfully`,
      });
      setLocation("/admin-panel/valuation-reports");
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} report`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveReportMutation.mutate(formData);
  };

  const addHiddenCost = () => {
    setFormData(prev => ({
      ...prev,
      costBreakdown: {
        ...prev.costBreakdown,
        hiddenCosts: [
          ...prev.costBreakdown.hiddenCosts,
          { item: "", amount: 0, description: "" }
        ]
      }
    }));
  };

  const removeHiddenCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      costBreakdown: {
        ...prev.costBreakdown,
        hiddenCosts: prev.costBreakdown.hiddenCosts.filter((_, i) => i !== index)
      }
    }));
  };

  const addCompetitor = () => {
    setFormData(prev => ({
      ...prev,
      marketAnalysis: {
        ...prev.marketAnalysis,
        competitorAnalysis: [
          ...prev.marketAnalysis.competitorAnalysis,
          { propertyName: "", pricePerSqft: 0, distanceKm: 0, amenitiesComparison: "" }
        ]
      }
    }));
  };

  const removeCompetitor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      marketAnalysis: {
        ...prev.marketAnalysis,
        competitorAnalysis: prev.marketAnalysis.competitorAnalysis.filter((_, i) => i !== index)
      }
    }));
  };

  const addKeyHighlight = () => {
    setFormData(prev => ({
      ...prev,
      keyHighlights: [...prev.keyHighlights, ""]
    }));
  };

  const removeKeyHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyHighlights: prev.keyHighlights.filter((_, i) => i !== index)
    }));
  };

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  return (
    <AdminLayout title={`${isEditMode ? "Edit" : "Create"} Valuation Report`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/admin-panel/valuation-reports")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {isEditMode ? "Edit" : "Create"} Valuation Report
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedProperty ? `Property: ${selectedProperty.name}` : "Select a property to continue"}
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saveReportMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveReportMutation.isPending ? "Saving..." : "Save Report"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
                <TabsTrigger value="market">Market Intelligence</TabsTrigger>
                <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
                <TabsTrigger value="assessment">Final Assessment</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Report Information
                    </CardTitle>
                    <CardDescription>Basic report details and property selection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="property">Property</Label>
                        <Select value={formData.propertyId} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property..." />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name} - {property.developer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="version">Report Version</Label>
                        <Input
                          id="version"
                          value={formData.reportVersion}
                          onChange={(e) => setFormData(prev => ({ ...prev, reportVersion: e.target.value }))}
                          placeholder="1.0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="generatedBy">Generated By (Valuer Name)</Label>
                      <Input
                        id="generatedBy"
                        value={formData.generatedBy}
                        onChange={(e) => setFormData(prev => ({ ...prev, generatedBy: e.target.value }))}
                        placeholder="Enter valuer name..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cost Analysis */}
              <TabsContent value="cost" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Cost Breakdown Analysis
                    </CardTitle>
                    <CardDescription>Detailed cost components and hidden charges</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Cost Components */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="landValue">Land Value (₹)</Label>
                        <Input
                          id="landValue"
                          type="number"
                          value={formData.costBreakdown.landValue}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, landValue: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="constructionCost">Construction Cost (₹)</Label>
                        <Input
                          id="constructionCost"
                          type="number"
                          value={formData.costBreakdown.constructionCost}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, constructionCost: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="developmentCharges">Development Charges (₹)</Label>
                        <Input
                          id="developmentCharges"
                          type="number"
                          value={formData.costBreakdown.developmentCharges}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, developmentCharges: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="registrationStampDuty">Registration & Stamp Duty (₹)</Label>
                        <Input
                          id="registrationStampDuty"
                          type="number"
                          value={formData.costBreakdown.registrationStampDuty}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, registrationStampDuty: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gstOnConstruction">GST on Construction (₹)</Label>
                        <Input
                          id="gstOnConstruction"
                          type="number"
                          value={formData.costBreakdown.gstOnConstruction}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, gstOnConstruction: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parkingCharges">Parking Charges (₹)</Label>
                        <Input
                          id="parkingCharges"
                          type="number"
                          value={formData.costBreakdown.parkingCharges}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, parkingCharges: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="clubhouseMaintenance">Clubhouse Maintenance (₹)</Label>
                        <Input
                          id="clubhouseMaintenance"
                          type="number"
                          value={formData.costBreakdown.clubhouseMaintenance}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, clubhouseMaintenance: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="interiorFittings">Interior Fittings (₹)</Label>
                        <Input
                          id="interiorFittings"
                          type="number"
                          value={formData.costBreakdown.interiorFittings}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, interiorFittings: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="movingCosts">Moving Costs (₹)</Label>
                        <Input
                          id="movingCosts"
                          type="number"
                          value={formData.costBreakdown.movingCosts}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            costBreakdown: { ...prev.costBreakdown, movingCosts: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="legalCharges">Legal Charges (₹)</Label>
                      <Input
                        id="legalCharges"
                        type="number"
                        value={formData.costBreakdown.legalCharges}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          costBreakdown: { ...prev.costBreakdown, legalCharges: Number(e.target.value) }
                        }))}
                      />
                    </div>

                    {/* Hidden Costs */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Hidden Costs</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addHiddenCost}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Hidden Cost
                        </Button>
                      </div>
                      {formData.costBreakdown.hiddenCosts.map((cost, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                          <Input
                            placeholder="Cost item"
                            value={cost.item}
                            onChange={(e) => {
                              const newHiddenCosts = [...formData.costBreakdown.hiddenCosts];
                              newHiddenCosts[index].item = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                costBreakdown: { ...prev.costBreakdown, hiddenCosts: newHiddenCosts }
                              }));
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={cost.amount}
                            onChange={(e) => {
                              const newHiddenCosts = [...formData.costBreakdown.hiddenCosts];
                              newHiddenCosts[index].amount = Number(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                costBreakdown: { ...prev.costBreakdown, hiddenCosts: newHiddenCosts }
                              }));
                            }}
                          />
                          <Input
                            placeholder="Description"
                            value={cost.description}
                            onChange={(e) => {
                              const newHiddenCosts = [...formData.costBreakdown.hiddenCosts];
                              newHiddenCosts[index].description = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                costBreakdown: { ...prev.costBreakdown, hiddenCosts: newHiddenCosts }
                              }));
                            }}
                          />
                          <Button variant="ghost" size="sm" onClick={() => removeHiddenCost(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Total Cost Display */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-blue-900">
                        Total Estimated Cost: ₹{formData.costBreakdown.totalEstimatedCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        This includes all components and hidden costs
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Market Intelligence */}
              <TabsContent value="market" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Market Intelligence & Analysis
                    </CardTitle>
                    <CardDescription>Market trends, competitor analysis, and growth projections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="areaGrowthRate">Area Growth Rate (% per annum)</Label>
                        <Input
                          id="areaGrowthRate"
                          type="number"
                          step="0.1"
                          value={formData.marketAnalysis.areaGrowthRate}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            marketAnalysis: { ...prev.marketAnalysis, areaGrowthRate: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="demandSupplyRatio">Demand-Supply Ratio</Label>
                        <Select
                          value={formData.marketAnalysis.demandSupplyRatio}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            marketAnalysis: { ...prev.marketAnalysis, demandSupplyRatio: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ratio..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-demand">High Demand</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="oversupply">Oversupply</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="currentMarketTrend">Current Market Trend</Label>
                      <Textarea
                        id="currentMarketTrend"
                        value={formData.marketAnalysis.currentMarketTrend}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marketAnalysis: { ...prev.marketAnalysis, currentMarketTrend: e.target.value }
                        }))}
                        placeholder="Describe the current market trends in this area..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="marketSentiment">Market Sentiment</Label>
                      <Textarea
                        id="marketSentiment"
                        value={formData.marketAnalysis.marketSentiment}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marketAnalysis: { ...prev.marketAnalysis, marketSentiment: e.target.value }
                        }))}
                        placeholder="Overall market sentiment and buyer behavior..."
                        rows={3}
                      />
                    </div>

                    {/* Competitor Analysis */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Competitor Analysis</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addCompetitor}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Competitor
                        </Button>
                      </div>
                      {formData.marketAnalysis.competitorAnalysis.map((competitor, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                          <Input
                            placeholder="Property name"
                            value={competitor.propertyName}
                            onChange={(e) => {
                              const newCompetitors = [...formData.marketAnalysis.competitorAnalysis];
                              newCompetitors[index].propertyName = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                marketAnalysis: { ...prev.marketAnalysis, competitorAnalysis: newCompetitors }
                              }));
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Price/sqft"
                            value={competitor.pricePerSqft}
                            onChange={(e) => {
                              const newCompetitors = [...formData.marketAnalysis.competitorAnalysis];
                              newCompetitors[index].pricePerSqft = Number(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                marketAnalysis: { ...prev.marketAnalysis, competitorAnalysis: newCompetitors }
                              }));
                            }}
                          />
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Distance (km)"
                            value={competitor.distanceKm}
                            onChange={(e) => {
                              const newCompetitors = [...formData.marketAnalysis.competitorAnalysis];
                              newCompetitors[index].distanceKm = Number(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                marketAnalysis: { ...prev.marketAnalysis, competitorAnalysis: newCompetitors }
                              }));
                            }}
                          />
                          <Input
                            placeholder="Amenities comparison"
                            value={competitor.amenitiesComparison}
                            onChange={(e) => {
                              const newCompetitors = [...formData.marketAnalysis.competitorAnalysis];
                              newCompetitors[index].amenitiesComparison = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                marketAnalysis: { ...prev.marketAnalysis, competitorAnalysis: newCompetitors }
                              }));
                            }}
                          />
                          <Button variant="ghost" size="sm" onClick={() => removeCompetitor(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Investment Analysis */}
              <TabsContent value="investment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Investment & Financial Analysis
                    </CardTitle>
                    <CardDescription>ROI calculations, rental yields, and loan eligibility</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Valuation */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentValuation">Current Valuation (₹)</Label>
                        <Input
                          id="currentValuation"
                          type="number"
                          value={formData.financialAnalysis.currentValuation}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            financialAnalysis: { ...prev.financialAnalysis, currentValuation: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthlyRentalIncome">Monthly Rental Income (₹)</Label>
                        <Input
                          id="monthlyRentalIncome"
                          type="number"
                          value={formData.financialAnalysis.monthlyRentalIncome}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            financialAnalysis: { ...prev.financialAnalysis, monthlyRentalIncome: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="rentalYield">Rental Yield (% per annum)</Label>
                      <Input
                        id="rentalYield"
                        type="number"
                        step="0.1"
                        value={formData.financialAnalysis.rentalYield}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          financialAnalysis: { ...prev.financialAnalysis, rentalYield: Number(e.target.value) }
                        }))}
                      />
                    </div>

                    {/* ROI Analysis */}
                    <div>
                      <Label className="text-base font-medium">ROI Analysis</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label htmlFor="breakEvenPeriod">Break-Even Period (years)</Label>
                          <Input
                            id="breakEvenPeriod"
                            type="number"
                            value={formData.financialAnalysis.roiAnalysis.breakEvenPeriod}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              financialAnalysis: {
                                ...prev.financialAnalysis,
                                roiAnalysis: { ...prev.financialAnalysis.roiAnalysis, breakEvenPeriod: Number(e.target.value) }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalRoi5Years">Total ROI - 5 Years (%)</Label>
                          <Input
                            id="totalRoi5Years"
                            type="number"
                            step="0.1"
                            value={formData.financialAnalysis.roiAnalysis.totalRoi5Years}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              financialAnalysis: {
                                ...prev.financialAnalysis,
                                roiAnalysis: { ...prev.financialAnalysis.roiAnalysis, totalRoi5Years: Number(e.target.value) }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalRoi10Years">Total ROI - 10 Years (%)</Label>
                          <Input
                            id="totalRoi10Years"
                            type="number"
                            step="0.1"
                            value={formData.financialAnalysis.roiAnalysis.totalRoi10Years}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              financialAnalysis: {
                                ...prev.financialAnalysis,
                                roiAnalysis: { ...prev.financialAnalysis.roiAnalysis, totalRoi10Years: Number(e.target.value) }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Loan Eligibility */}
                    <div>
                      <Label className="text-base font-medium">Loan Eligibility</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label htmlFor="maxLoanAmount">Max Loan Amount (₹)</Label>
                          <Input
                            id="maxLoanAmount"
                            type="number"
                            value={formData.financialAnalysis.loanEligibility.maxLoanAmount}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              financialAnalysis: {
                                ...prev.financialAnalysis,
                                loanEligibility: { ...prev.financialAnalysis.loanEligibility, maxLoanAmount: Number(e.target.value) }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="suggestedDownPayment">Suggested Down Payment (₹)</Label>
                          <Input
                            id="suggestedDownPayment"
                            type="number"
                            value={formData.financialAnalysis.loanEligibility.suggestedDownPayment}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              financialAnalysis: {
                                ...prev.financialAnalysis,
                                loanEligibility: { ...prev.financialAnalysis.loanEligibility, suggestedDownPayment: Number(e.target.value) }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="emiEstimate">EMI Estimate (₹)</Label>
                          <Input
                            id="emiEstimate"
                            type="number"
                            value={formData.financialAnalysis.loanEligibility.emiEstimate}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              financialAnalysis: {
                                ...prev.financialAnalysis,
                                loanEligibility: { ...prev.financialAnalysis.loanEligibility, emiEstimate: Number(e.target.value) }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Property Assessment */}
                    <div>
                      <Label className="text-base font-medium">Property Assessment</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="ageOfProperty">Age of Property (years)</Label>
                          <Input
                            id="ageOfProperty"
                            type="number"
                            value={formData.propertyAssessment.ageOfProperty}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              propertyAssessment: { ...prev.propertyAssessment, ageOfProperty: Number(e.target.value) }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="amenitiesRating">Amenities Rating (1-10)</Label>
                          <Input
                            id="amenitiesRating"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.propertyAssessment.amenitiesRating}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              propertyAssessment: { ...prev.propertyAssessment, amenitiesRating: Number(e.target.value) }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Final Assessment */}
              <TabsContent value="assessment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Final Assessment & Recommendations
                    </CardTitle>
                    <CardDescription>Investment recommendation, risk assessment, and executive summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="investmentRecommendation">Investment Recommendation</Label>
                        <Select
                          value={formData.investmentRecommendation}
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, investmentRecommendation: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent-buy">Excellent Buy</SelectItem>
                            <SelectItem value="good-buy">Good Buy</SelectItem>
                            <SelectItem value="hold">Hold</SelectItem>
                            <SelectItem value="avoid">Avoid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="overallRisk">Overall Risk Level</Label>
                        <Select
                          value={formData.riskAssessment.overallRisk}
                          onValueChange={(value: any) => setFormData(prev => ({
                            ...prev,
                            riskAssessment: { ...prev.riskAssessment, overallRisk: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="overallScore">Overall Score (1-10)</Label>
                      <Input
                        id="overallScore"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.overallScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, overallScore: Number(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="executiveSummary">Executive Summary</Label>
                      <Textarea
                        id="executiveSummary"
                        value={formData.executiveSummary}
                        onChange={(e) => setFormData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                        placeholder="Provide a comprehensive executive summary of the valuation..."
                        rows={5}
                      />
                    </div>

                    {/* Key Highlights */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Key Highlights</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addKeyHighlight}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Highlight
                        </Button>
                      </div>
                      {formData.keyHighlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            placeholder="Key highlight point..."
                            value={highlight}
                            onChange={(e) => {
                              const newHighlights = [...formData.keyHighlights];
                              newHighlights[index] = e.target.value;
                              setFormData(prev => ({ ...prev, keyHighlights: newHighlights }));
                            }}
                          />
                          <Button variant="ghost" size="sm" onClick={() => removeKeyHighlight(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}