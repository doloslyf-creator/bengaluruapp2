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

  const formatAmount = (value: string | number | null | undefined): string => {
    if (!value) return "Not specified";
    
    // If it's already formatted (contains 'Cr' or 'L'), return as is
    if (typeof value === 'string' && (value.includes('Cr') || value.includes('L') || value.includes('₹'))) {
      return value;
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "Not specified";
    
    if (numValue >= 10000000) { // 1 Crore or more
      return `₹${(numValue / 10000000).toFixed(2)} Cr`;
    } else if (numValue >= 100000) { // 1 Lakh or more
      return `₹${(numValue / 100000).toFixed(1)} L`;
    } else {
      return `₹${numValue.toLocaleString()}`;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/admin-panel/valuation-reports")}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Property Valuation Report</h1>
                  <p className="text-sm text-gray-500">Bengaluru Edition</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(report.reportStatus || "")} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                  {report.reportStatus?.toUpperCase() || "DRAFT"}
                </Badge>
                <Button 
                  onClick={() => navigate(`/admin-panel/valuation-reports/edit/${reportId}`)}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Executive Summary - Hero Section */}
          <div className="mb-6">
            <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{report.projectName || "Property Analysis"}</h2>
                        <p className="text-gray-500 text-sm">{report.towerUnit}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{report.unitType} • {report.configuration}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700">Created by: {report.createdBy || "Property Analyst"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatAmount(report.estimatedMarketValue)}
                      </div>
                      <div className="text-gray-500 text-sm mb-4">Estimated Market Value</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {report.ratePerSqftSbaUds || "₹18,500/sq.ft"}
                      </div>
                      <div className="text-gray-500 text-sm">Rate per Sq.Ft (SBA + UDS)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    Positive
                  </Badge>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {report.appreciationOutlook || "Good"}
                </div>
                <div className="text-sm text-gray-500">Appreciation Outlook</div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                    Target
                  </Badge>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {report.buyerFit || "End Users"}
                </div>
                <div className="text-sm text-gray-500">Buyer Fit</div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                    Score
                  </Badge>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {parseScore(report.overallScore || "7")}/10
                </div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <Badge className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    (report.riskScore || 5) <= 3 ? 'bg-green-100 text-green-700' :
                    (report.riskScore || 5) <= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {(report.riskScore || 5) <= 3 ? 'Low' : (report.riskScore || 5) <= 6 ? 'Medium' : 'High'}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {report.riskScore || 5}/10
                </div>
                <div className="text-sm text-gray-500">Risk Score</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Property Profile */}
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Home className="h-4 w-4 text-blue-600" />
                    </div>
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
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    Market Valuation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Builder Quoted Price</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatAmount(report.builderQuotedPrice)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Our Estimated Value</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatAmount(report.totalEstimatedValue)}
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
                        {formatAmount(report.landShareValue)}
                      </div>
                      <div className="text-sm text-gray-600">Land Share Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {formatAmount(report.constructionValue)}
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
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    Location & Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Building className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{report.planningAuthority || "BDA"}</div>
                      <div className="text-xs text-gray-500">Authority</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Home className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{report.zonalClassification || "Residential"}</div>
                      <div className="text-xs text-gray-500">Zone</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{report.waterSupply || "Corporation"}</div>
                      <div className="text-xs text-gray-500">Water</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{report.drainage || "Good"}</div>
                      <div className="text-xs text-gray-500">Drainage</div>
                    </div>
                  </div>

                  {report.connectivity && (
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Connectivity</h4>
                      <p className="text-sm text-gray-700">{report.connectivity}</p>
                    </div>
                  )}

                  {report.socialInfrastructure && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">Social Infrastructure</h4>
                      <p className="text-sm text-gray-700">{report.socialInfrastructure}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Legal & Compliance */}
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
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
                      <h4 className="font-semibold text-gray-900 mb-4">Rental & Yield Assessment</h4>
                      <div className="text-center mb-4 bg-gray-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {report.grossRentalYield || "3.2%"}
                        </div>
                        <div className="text-sm text-gray-500">Gross Rental Yield</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Rent</span>
                          <span className="font-semibold text-gray-900">{report.expectedMonthlyRent || "₹45,000"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tenant Demand</span>
                          <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                            {report.tenantDemand || "High"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Exit Liquidity</span>
                          <Badge className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                            {report.exitLiquidity || "Moderate"}
                          </Badge>
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
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Calculator className="h-4 w-4 text-orange-600" />
                    </div>
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[
                      { label: "Base Unit Cost", value: formatAmount(report.baseUnitCost) },
                      { label: "Amenities", value: formatAmount(report.amenitiesCharges) },
                      { label: "Floor Rise", value: formatAmount(report.floorRiseCharges) },
                      { label: "GST", value: formatAmount(report.gstAmount) },
                      { label: "Registration", value: formatAmount(report.stampDutyRegistration) },
                      { label: "Khata Transfer", value: formatAmount(report.khataTransferCosts) }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total All-In Price</span>
                      <span className="text-orange-600">{formatAmount(report.totalAllInPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pros & Cons */}
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">Pros & Cons</CardTitle>
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
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">Investment Verdict</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {report.valuationVerdict || "Fairly Priced"}
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {report.buyerTypeFit || "End User Family"}
                    </Badge>
                  </div>
                  
                  {report.recommendation && (
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <p className="text-sm text-gray-700">{report.recommendation}</p>
                    </div>
                  )}

                  {report.negotiationAdvice && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                      <h5 className="font-semibold text-yellow-800 text-sm mb-2">Negotiation Advice</h5>
                      <p className="text-sm text-yellow-700">{report.negotiationAdvice}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Bottom Summary */}
          {report.customNotes && (
            <Card className="mt-6 bg-white rounded-2xl shadow-sm border-0">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{report.customNotes}</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}