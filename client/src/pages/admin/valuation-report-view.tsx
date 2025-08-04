import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Home, 
  Calculator, 
  DollarSign,
  Star,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Building,
  Users,
  Calendar,
  Edit
} from "lucide-react";
import type { PropertyValuationReport } from "@shared/schema";

export default function ValuationReportView() {
  const [, params] = useRoute("/admin-panel/valuation-reports/view/:id");
  const [, navigate] = useLocation();
  const reportId = params?.id;

  // Fetch valuation report
  const { data: report, isLoading } = useQuery<PropertyValuationReport>({
    queryKey: ["/api/valuation-reports", reportId],
    enabled: !!reportId,
  });

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

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "draft": return "bg-gray-500";
      case "delivered": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-green-600 bg-green-50";
    if (score <= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const parseScore = (score: string | number | null | undefined): number => {
    if (!score) return 0;
    if (typeof score === 'number') return score;
    const scoreStr = score.toString();
    if (scoreStr.includes("excellent")) return 9;
    if (scoreStr.includes("good")) return 7;
    if (scoreStr.includes("average")) return 5;
    if (scoreStr.includes("poor")) return 3;
    return parseInt(scoreStr.split("-")[0]) || 0;
  };

  const parseArrayField = (field: any) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return field.split('\n').filter(item => item.trim() !== '');
      }
    }
    return [];
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/admin-panel/valuation-reports")}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Property Valuation Report</h1>
                  <p className="text-sm text-gray-600 mt-1">Bengaluru Edition • Comprehensive Analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(report.reportStatus || "")} text-white`}>
                  {report.reportStatus?.toUpperCase() || "DRAFT"}
                </Badge>
                <Button 
                  onClick={() => navigate(`/admin-panel/valuation-reports/edit/${reportId}`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Executive Summary - Hero Section */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <Building className="h-8 w-8" />
                      <div>
                        <h2 className="text-3xl font-bold">{report.projectName || "Property Analysis"}</h2>
                        <p className="text-blue-100 text-lg">{report.towerUnit}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-200" />
                        <span className="text-lg">{report.unitType} • {report.configuration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-200" />
                        <span>Report Status: {report.reportStatus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                      <div className="text-4xl font-bold mb-2">
                        {report.estimatedMarketValue || "₹2.8 Cr"}
                      </div>
                      <div className="text-blue-100 text-sm mb-3">Estimated Market Value</div>
                      <div className="text-lg font-semibold">
                        {report.ratePerSqftSbaUds || "₹18,500/sq.ft"}
                      </div>
                      <div className="text-blue-100 text-sm">Rate per Sq.Ft (SBA + UDS)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {report.appreciationOutlook || "Good"}
                </div>
                <div className="text-sm text-green-600">Appreciation Outlook</div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {report.buyerFit || "End Users"}
                </div>
                <div className="text-sm text-blue-600">Buyer Fit</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {parseScore(report.overallScore || "7")}/10
                </div>
                <div className="text-sm text-purple-600">Overall Score</div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getRiskColor(report.riskScore || 5)}`}>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {report.riskScore || 5}/10
                </div>
                <div className="text-sm">Risk Score</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Property Profile */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center text-xl">
                    <Home className="h-6 w-6 mr-3 text-blue-600" />
                    Property Profile & Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {report.undividedLandShare || "2.5%"}
                      </div>
                      <div className="text-sm text-gray-600">Land Share</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {report.facing || "North"}
                      </div>
                      <div className="text-sm text-gray-600">Facing</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        {report.vastuCompliance ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Vastu Compliant</div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Compliance Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">OC/CC Status</span>
                          <Badge variant={report.ocCcStatus === "received" ? "default" : "secondary"}>
                            {report.ocCcStatus || "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Possession Status</span>
                          <Badge variant={report.possessionStatus === "ready" ? "default" : "secondary"}>
                            {report.possessionStatus || "Under Construction"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Khata Type</span>
                          <Badge variant={report.khataType === "A" ? "default" : "secondary"}>
                            {report.khataType || "A Khata"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Builder Assessment</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {parseScore(report.builderReputationScore)}/10
                        </div>
                        <div className="text-sm text-gray-600">Reputation Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${parseScore(report.builderReputationScore) * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Analysis */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center text-xl">
                    <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
                    Market Valuation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Builder Quoted Price</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {report.builderQuotedPrice || "₹2.95 Cr"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Our Estimated Value</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {report.totalEstimatedValue || "₹2.8 Cr"}
                      </div>
                    </div>
                  </div>

                  {report.pricePerSqftAnalysis && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Price Analysis</h4>
                      <p className="text-sm text-gray-700">{report.pricePerSqftAnalysis}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {report.landShareValue || "₹1.2 Cr"}
                      </div>
                      <div className="text-sm text-gray-600">Land Share Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {report.constructionValue || "₹1.6 Cr"}
                      </div>
                      <div className="text-sm text-gray-600">Construction Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {report.guidanceValueZoneRate || "₹12,000/sq.ft"}
                      </div>
                      <div className="text-sm text-gray-600">Guidance Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Infrastructure */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center text-xl">
                    <MapPin className="h-6 w-6 mr-3 text-purple-600" />
                    Location & Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-sm font-medium">{report.planningAuthority || "BDA"}</div>
                      <div className="text-xs text-gray-600">Authority</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Home className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-sm font-medium">{report.zonalClassification || "Residential"}</div>
                      <div className="text-xs text-gray-600">Zone</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium">{report.waterSupply || "Corporation"}</div>
                      <div className="text-xs text-gray-600">Water</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-sm font-medium">{report.drainage || "Good"}</div>
                      <div className="text-xs text-gray-600">Drainage</div>
                    </div>
                  </div>

                  {report.connectivity && (
                    <div className="bg-purple-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Connectivity</h4>
                      <p className="text-sm text-gray-700">{report.connectivity}</p>
                    </div>
                  )}

                  {report.socialInfrastructure && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Social Infrastructure</h4>
                      <p className="text-sm text-gray-700">{report.socialInfrastructure}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Legal & Compliance */}
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center text-xl">
                    <Shield className="h-6 w-6 mr-3 text-red-600" />
                    Legal & Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Registration & Approvals</h4>
                      <div className="space-y-3">
                        {[
                          { label: "RERA Registration", value: report.reraRegistration, key: "rera" },
                          { label: "Title Clearance", value: report.titleClearance, key: "title" },
                          { label: "Plan Approval", value: report.planApproval, key: "plan" },
                          { label: "DC Conversion", value: report.dcConversion, key: "dc" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item.label}</span>
                            <div className="flex items-center gap-2">
                              {item.value === "registered" || item.value === "clear" || item.value === "approved" || item.value === "done" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : item.value === "pending" || item.value === "applied" ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              <Badge variant={
                                (item.value === "registered" || item.value === "clear" || item.value === "approved" || item.value === "done") 
                                  ? "default" : "secondary"
                              }>
                                {item.value || "Pending"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Rental & Yield Assessment</h4>
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {report.grossRentalYield || "3.2%"}
                        </div>
                        <div className="text-sm text-gray-600">Gross Rental Yield</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Rent</span>
                          <span className="font-medium">{report.expectedMonthlyRent || "₹45,000"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tenant Demand</span>
                          <Badge variant="outline">{report.tenantDemand || "High"}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Exit Liquidity</span>
                          <Badge variant="outline">{report.exitLiquidity || "Moderate"}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {report.titleClarityNotes && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Title Clarity Notes
                      </h4>
                      <p className="text-sm text-yellow-700">{report.titleClarityNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Cost Breakdown */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center text-lg">
                    <Calculator className="h-5 w-5 mr-2 text-orange-600" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[
                      { label: "Base Unit Cost", value: report.baseUnitCost },
                      { label: "Amenities", value: report.amenitiesCharges },
                      { label: "Floor Rise", value: report.floorRiseCharges },
                      { label: "GST", value: report.gstAmount },
                      { label: "Registration", value: report.stampDutyRegistration },
                      { label: "Khata Transfer", value: report.khataTransferCosts }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.value || "—"}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total All-In Price</span>
                      <span className="text-orange-600">{report.totalAllInPrice || "₹2.83 Cr"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pros & Cons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Pros
                      </h4>
                      <div className="space-y-2">
                        {parseArrayField(report.pros).map((pro: string, index: number) => (
                          <div key={index} className="text-sm text-gray-700 flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 shrink-0"></div>
                            {pro}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cons
                      </h4>
                      <div className="space-y-2">
                        {parseArrayField(report.cons).map((con: string, index: number) => (
                          <div key={index} className="text-sm text-gray-700 flex items-start">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 shrink-0"></div>
                            {con}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Verdict */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">Investment Verdict</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-blue-700 mb-2">
                      {report.valuationVerdict || "Fairly Priced"}
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      {report.buyerTypeFit || "End User Family"}
                    </Badge>
                  </div>
                  
                  {report.recommendation && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <p className="text-sm text-gray-800">{report.recommendation}</p>
                    </div>
                  )}

                  {report.negotiationAdvice && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <h5 className="font-semibold text-yellow-800 text-xs mb-1">NEGOTIATION ADVICE</h5>
                      <p className="text-xs text-yellow-700">{report.negotiationAdvice}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Bottom Summary */}
          {report.customNotes && (
            <Card className="mt-8 border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{report.customNotes}</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}