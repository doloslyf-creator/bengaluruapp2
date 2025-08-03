import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserDashboardHeader } from "@/components/layout/UserDashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Download, Calendar, IndianRupee, MapPin, Building, Eye } from "lucide-react";



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
    if (amount === 0) return "₹0";
    
    const onecrore = 10000000; // 1 crore = 1,00,00,000
    const onelakh = 100000;    // 1 lakh = 1,00,000
    
    if (amount >= onecrore) {
      const crores = amount / onecrore;
      // Remove unnecessary decimals for whole numbers
      if (crores % 1 === 0) {
        return `₹${crores} Cr`;
      }
      // Limit to 2 decimal places for precision
      return `₹${parseFloat(crores.toFixed(2))} Cr`;
    } else {
      const lakhs = amount / onelakh;
      // Remove unnecessary decimals for whole numbers
      if (lakhs % 1 === 0) {
        return `₹${lakhs} Lakh`;
      }
      // Limit to 1 decimal place for lakhs
      return `₹${parseFloat(lakhs.toFixed(1))} Lakh`;
    }
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-50">
        {/* Professional Header Box */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Property Valuation Report
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Prepared exclusively for <span className="font-semibold text-blue-600">John Doe</span>
                </DialogDescription>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-2">
                  v{report.reportVersion}
                </Badge>
                <div className="text-sm text-gray-500">Report ID: {report.id.slice(0, 8)}...</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{report.propertyName}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property?.zone || 'Premium Location'} • Generated on {formatDate(report.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(report.costBreakdown?.totalEstimatedCost || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Fair Market Value</div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-6">
          {/* Property Information Box */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Name:</span>
                    <span className="font-medium">{report.propertyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Developer:</span>
                    <span className="font-medium">{property?.developer || 'Premium Developer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{property?.zone || 'Premium Location'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium">{property?.propertyType || 'Residential'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-3">Report Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Report Date:</span>
                    <span className="font-medium">{formatDate(report.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Report Version:</span>
                    <span className="font-medium">v{report.reportVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Generated By:</span>
                    <span className="font-medium">{report.generatedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Purpose:</span>
                    <span className="font-medium">Fair Market Value</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Specifications Box */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Specifications</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center group hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-gray-900">{(report.costBreakdown?.landAreaSqft || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Land Area (sq ft)</div>
                {report.costBreakdown?.landAreaSqftComment && (
                  <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600 border-l-2 border-gray-400">
                    <div className="font-medium text-gray-700 mb-1">Valuer Note:</div>
                    {report.costBreakdown.landAreaSqftComment}
                  </div>
                )}
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200 group hover:bg-green-100 transition-colors">
                <div className="text-2xl font-bold text-green-700">{(report.costBreakdown?.builtUpAreaSqft || 0).toLocaleString()}</div>
                <div className="text-sm text-green-600 mt-1">Built-up Area (sq ft)</div>
                {report.costBreakdown?.builtUpAreaSqftComment && (
                  <div className="mt-2 p-2 bg-white rounded text-xs text-green-600 border-l-2 border-green-400">
                    <div className="font-medium text-green-700 mb-1">Valuer Note:</div>
                    {report.costBreakdown.builtUpAreaSqftComment}
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200 group hover:bg-blue-100 transition-colors">
                <div className="text-2xl font-bold text-blue-700">{report.propertyAssessment?.propertyAge || 0}</div>
                <div className="text-sm text-blue-600 mt-1">Property Age (years)</div>
                {report.propertyAssessment?.propertyAgeComment && (
                  <div className="mt-2 p-2 bg-white rounded text-xs text-blue-600 border-l-2 border-blue-400">
                    <div className="font-medium text-blue-700 mb-1">Valuer Note:</div>
                    {report.propertyAssessment.propertyAgeComment}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Valuation Summary Box */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Valuation Summary</h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-6 rounded-lg">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {formatCurrency(report.costBreakdown?.totalEstimatedCost || 0)}
                </div>
                <div className="text-lg text-green-600 mb-1">Fair Market Value</div>
                <div className="text-sm text-gray-600">
                  Rate per sq ft: <span className="font-semibold">{formatCurrency(Math.round((report.costBreakdown?.totalEstimatedCost || 0) / (report.costBreakdown?.builtUpAreaSqft || 1)))}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center group hover:shadow-md transition-shadow">
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(report.costBreakdown?.basicCost || 0)}</div>
                  <div className="text-sm text-gray-600 mt-1">Basic Cost</div>
                  <div className="text-xs text-gray-500 mt-1">{((report.costBreakdown?.basicCost || 0) / (report.costBreakdown?.totalEstimatedCost || 1) * 100).toFixed(1)}%</div>
                  {report.costBreakdown?.basicCostComment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-gray-400 text-left">
                      <div className="font-medium text-gray-700 mb-1">Valuer Note:</div>
                      {report.costBreakdown.basicCostComment}
                    </div>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center group hover:shadow-md transition-shadow">
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(report.costBreakdown?.totalTaxes || 0)}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Taxes</div>
                  <div className="text-xs text-gray-500 mt-1">{((report.costBreakdown?.totalTaxes || 0) / (report.costBreakdown?.totalEstimatedCost || 1) * 100).toFixed(1)}%</div>
                  {report.costBreakdown?.totalTaxesComment && (
                    <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-600 border-l-2 border-orange-400 text-left">
                      <div className="font-medium text-orange-700 mb-1">Valuer Note:</div>
                      {report.costBreakdown.totalTaxesComment}
                    </div>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center group hover:shadow-md transition-shadow">
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(report.costBreakdown?.totalAdditionalCost || 0)}</div>
                  <div className="text-sm text-gray-600 mt-1">Additional Costs</div>
                  <div className="text-xs text-gray-500 mt-1">{((report.costBreakdown?.totalAdditionalCost || 0) / (report.costBreakdown?.totalEstimatedCost || 1) * 100).toFixed(1)}%</div>
                  {report.costBreakdown?.totalAdditionalCostComment && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600 border-l-2 border-blue-400 text-left">
                      <div className="font-medium text-blue-700 mb-1">Valuer Note:</div>
                      {report.costBreakdown.totalAdditionalCostComment}
                    </div>
                  )}
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
      <UserDashboardHeader currentPage="Property Valuation Reports" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Valuation Reports</h1>
              <p className="text-gray-600">Welcome back, John! Here are your professional property assessment reports</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Your Account</div>
              <div className="font-semibold text-gray-900">John Doe</div>
              <div className="text-sm text-gray-500">Member since Jan 2024</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Report Portfolio</h2>
              <p className="text-sm text-gray-500">Personalized valuation reports for your property investments</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredReports.length} Reports Available
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports by property name or generated by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              Total Portfolio Value: <span className="font-semibold text-green-600">₹{(filteredReports.reduce((sum, report) => sum + (report.costBreakdown?.totalEstimatedCost || 0), 0) / 100000).toFixed(1)}L</span>
            </div>
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const property = getPropertyDetails(report.propertyId);
                return (
                  <div key={report.id} className="bg-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200">
                    {/* Property Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{report.propertyName}</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          v{report.reportVersion}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property?.zone || 'Premium Location'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Report prepared exclusively for John Doe
                      </div>
                    </div>

                    {/* Valuation Summary Box */}
                    <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                      <div className="text-center mb-3">
                        <div className="text-lg font-bold text-green-700">
                          {formatCurrency(report.costBreakdown?.totalEstimatedCost || 0)}
                        </div>
                        <div className="text-xs text-gray-500">Fair Market Value</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-600">Rate/sq ft</div>
                          <div className="font-semibold">
                            {formatCurrency(Math.round((report.costBreakdown?.totalEstimatedCost || 0) / (report.costBreakdown?.builtUpAreaSqft || 1)))}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-600">Built-up Area</div>
                          <div className="font-semibold">{(report.costBreakdown?.builtUpAreaSqft || 0).toLocaleString()} sq ft</div>
                        </div>
                      </div>
                    </div>

                    {/* Report Metadata */}
                    <div className="bg-white border rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Report Date:</span>
                          <div className="font-medium">{formatDate(report.createdAt)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Generated By:</span>
                          <div className="font-medium">{report.generatedBy}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportDialog(true);
                        }}
                        className="flex-1 h-9"
                        size="sm"
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-3">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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