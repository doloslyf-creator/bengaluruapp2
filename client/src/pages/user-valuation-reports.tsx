import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Download, Calendar, IndianRupee, MapPin, Building, Eye } from "lucide-react";

// Simple header component for user reports
const UserHeader = () => (
  <header className="bg-white border-b shadow-sm">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <div className="text-lg font-black tracking-tight text-gray-900">
              Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
            </div>
            <span className="text-xs text-gray-500 -mt-1">Curated Properties</span>
          </div>
        </div>
        <nav className="flex space-x-6">
          <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/find-property" className="text-gray-600 hover:text-gray-900">Find Property</a>
          <a href="/user-panel" className="text-primary font-medium">My Panel</a>
        </nav>
      </div>
    </div>
  </header>
);

interface ValuationReport {
  id: string;
  propertyId: string;
  propertyName: string;
  reportVersion: string;
  generatedBy: string;
  createdAt: string;
  costBreakdown: {
    totalEstimatedCost: number;
    landValue: number;
    constructionCost: number;
    landAreaSqft: number;
    builtUpAreaSqft: number;
    landCostPerSqft: number;
    constructionCostPerSqft: number;
    basicCost: number;
    totalTaxes: number;
    totalAdditionalCost: number;
    gstOnConstruction: number;
    registrationStampDuty: number;
    constructionBreakdown: Array<{
      component: string;
      specification: string;
      rate: number;
      quantity: number;
      unit: string;
      amount: number;
    }>;
    hiddenCosts: Array<{
      item: string;
      amount: number;
      description: string;
      category: string;
    }>;
  };
  marketAnalysis: {
    averagePricePerSqft: number;
    marketTrend: string;
    demandSupplyRatio: string;
    priceAppreciation: number;
    competitorAnalysis: string;
  };
  propertyAssessment: {
    propertyAge: number;
    condition: string;
    locationAdvantages: string[];
    locationDisadvantages: string[];
    amenitiesRating: number;
  };
  investmentRecommendation: string;
  riskAssessment: {
    overallRisk: string;
    marketRisk: string;
    legalRisk: string;
    liquidityRisk: string;
  };
  executiveSummary: string;
  overallScore: string;
  keyHighlights: string[];
}

interface Property {
  id: string;
  name: string;
  developer: string;
  zone: string;
  propertyType: string;
  address: string;
}

export default function UserValuationReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ValuationReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { data: reports = [], isLoading } = useQuery<ValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const filteredReports = reports.filter(report =>
    report.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.generatedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPropertyDetails = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generatePDFReport = (report: ValuationReport) => {
    // This would integrate with a PDF generation service
    console.log("Generating PDF for report:", report.id);
    // For now, we'll show an alert
    alert("PDF generation would be implemented here with professional formatting");
  };

  const ViewReportDialog = ({ report }: { report: ValuationReport }) => {
    const property = getPropertyDetails(report.propertyId);
    
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900">
            Property Valuation Report
          </DialogTitle>
          <DialogDescription>
            Professional valuation assessment for {report.propertyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 p-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Property Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Property Name:</span> {report.propertyName}</p>
                  <p><span className="font-medium">Developer:</span> {property?.developer}</p>
                  <p><span className="font-medium">Location:</span> {property?.zone}</p>
                  <p><span className="font-medium">Property Type:</span> {property?.propertyType}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Report Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Report Date:</span> {formatDate(report.createdAt)}</p>
                  <p><span className="font-medium">Report Version:</span> {report.reportVersion}</p>
                  <p><span className="font-medium">Generated By:</span> {report.generatedBy}</p>
                  <p><span className="font-medium">Purpose:</span> Fair Market Value Assessment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Specifications</h3>
            <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Land Area</p>
                <p className="text-lg font-semibold">{(report.costBreakdown?.landAreaSqft || 0).toLocaleString()} sq ft</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Built-up Area</p>
                <p className="text-lg font-semibold">{(report.costBreakdown?.builtUpAreaSqft || 0).toLocaleString()} sq ft</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property Age</p>
                <p className="text-lg font-semibold">{report.propertyAssessment?.propertyAge || 0} years</p>
              </div>
            </div>
          </div>

          {/* Valuation Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Valuation Summary</h3>
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <div className="text-center mb-4">
                <h4 className="text-2xl font-bold text-green-800">
                  Fair Market Value: {formatCurrency(report.costBreakdown?.totalEstimatedCost || 0)}
                </h4>
                <p className="text-green-600">
                  Rate per sq ft: {formatCurrency(Math.round((report.costBreakdown?.totalEstimatedCost || 0) / (report.costBreakdown?.builtUpAreaSqft || 1)))}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Basic Cost</p>
                  <p className="font-semibold">{formatCurrency(report.costBreakdown?.basicCost || 0)}</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Total Taxes</p>
                  <p className="font-semibold">{formatCurrency(report.costBreakdown?.totalTaxes || 0)}</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Additional Costs</p>
                  <p className="font-semibold">{formatCurrency(report.costBreakdown?.totalAdditionalCost || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Cost Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Component</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Land Value</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {(report.costBreakdown?.landValue || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {(((report.costBreakdown?.landValue || 0) / (report.costBreakdown?.totalEstimatedCost || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Construction Cost</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {(report.costBreakdown?.constructionCost || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {(((report.costBreakdown?.constructionCost || 0) / (report.costBreakdown?.totalEstimatedCost || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">GST on Construction</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {(report.costBreakdown?.gstOnConstruction || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {(((report.costBreakdown?.gstOnConstruction || 0) / (report.costBreakdown?.totalEstimatedCost || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Registration & Stamp Duty</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {(report.costBreakdown?.registrationStampDuty || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {(((report.costBreakdown?.registrationStampDuty || 0) / (report.costBreakdown?.totalEstimatedCost || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-blue-50 font-bold">
                    <td className="border border-gray-300 px-4 py-2">Total Estimated Cost</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {(report.costBreakdown?.totalEstimatedCost || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Analysis</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Average Market Rate</p>
                  <p className="text-lg font-semibold">{formatCurrency(report.marketAnalysis?.averagePricePerSqft || 0)}/sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Market Trend</p>
                  <Badge variant={(report.marketAnalysis?.marketTrend || '') === 'upward' ? 'default' : 'secondary'}>
                    {report.marketAnalysis?.marketTrend || 'stable'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price Appreciation</p>
                  <p className="text-lg font-semibold text-green-600">+{report.marketAnalysis?.priceAppreciation || 0}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Demand-Supply Analysis</p>
                <p className="text-sm">{report.marketAnalysis?.demandSupplyRatio || 'Balanced market conditions'}</p>
              </div>
            </div>
          </div>

          {/* Investment Recommendation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment Recommendation</h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <Badge 
                variant={report.investmentRecommendation === 'excellent-buy' ? 'default' : 'secondary'}
                className="mb-2"
              >
                {report.investmentRecommendation.replace('-', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-700">{report.executiveSummary || 'Professional investment analysis available upon request.'}</p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Overall Risk</p>
                <Badge variant={(report.riskAssessment?.overallRisk || '') === 'low' ? 'default' : 'destructive'}>
                  {report.riskAssessment?.overallRisk || 'medium'} RISK
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Market Risk</p>
                <Badge variant="secondary">{report.riskAssessment?.marketRisk || 'low'}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Legal Risk</p>
                <Badge variant="secondary">{report.riskAssessment?.legalRisk || 'low'}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Liquidity Risk</p>
                <Badge variant="secondary">{report.riskAssessment?.liquidityRisk || 'medium'}</Badge>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          {(report.keyHighlights || []).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Highlights</h3>
              <ul className="list-disc list-inside space-y-1">
                {(report.keyHighlights || []).map((highlight, index) => (
                  <li key={index} className="text-sm text-gray-700">{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Disclaimer</h4>
            <p className="text-xs text-gray-600">
              This report provides an indicative market value based on current market conditions and may not necessarily 
              reflect the guideline value. The valuation is valid for 30 days from the date of report generation. 
              Users are advised to take independent decisions while dealing with the property.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => generatePDFReport(report)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => setShowReportDialog(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Valuation Reports</h1>
          <p className="text-gray-600">Access your professional property valuation reports</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search reports by property name or generated by..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {searchTerm ? "No reports match your search criteria." : "No valuation reports available yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const property = getPropertyDetails(report.propertyId);
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{report.propertyName}</span>
                      <Badge variant="outline" className="ml-2">
                        v{report.reportVersion}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property?.zone} | {property?.propertyType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Valuation</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(report.costBreakdown?.totalEstimatedCost || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rate/sq ft</span>
                        <span className="font-medium">
                          {formatCurrency(Math.round((report.costBreakdown?.totalEstimatedCost || 0) / (report.costBreakdown?.builtUpAreaSqft || 1)))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Area</span>
                        <span className="font-medium">{(report.costBreakdown?.builtUpAreaSqft || 0).toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(report.createdAt)}
                        </span>
                        <span>By {report.generatedBy}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generatePDFReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Detail Dialog */}
      {selectedReport && (
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <ViewReportDialog report={selectedReport} />
        </Dialog>
      )}
    </div>
  );
}