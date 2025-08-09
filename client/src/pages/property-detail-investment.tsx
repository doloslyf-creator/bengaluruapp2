import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  IndianRupee, 
  BarChart3, 
  Target, 
  Calendar,
  MapPin,
  Building2,
  ArrowLeft,
  DollarSign,
  Percent,
  TrendingDown,
  Users,
  Shield,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Calculator,
  ArrowUpRight
} from "lucide-react";
import type { Property, PropertyConfiguration, CivilMepReport, PropertyValuationReport } from "@shared/schema";

interface PropertyWithDetails extends Property {
  configurations?: PropertyConfiguration[];
  civilMepReport?: CivilMepReport;
  valuationReport?: PropertyValuationReport;
}

export default function PropertyDetailInvestment() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  // Fetch property with configurations
  const { data: property, isLoading } = useQuery<PropertyWithDetails>({
    queryKey: ["/api/properties", id, "with-configurations"],
    enabled: !!id,
  });

  // Fetch related reports
  const { data: civilReports = [] } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
  });

  const { data: valuationReports = [] } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/find-property")}>
            Find Properties
          </Button>
        </div>
      </div>
    );
  }

  // Get related reports
  const civilReport = civilReports.find(report => report.propertyId === property.id);
  const valuationReport = valuationReports.find(report => report.propertyId === property.id);

  // Calculate investment metrics
  const getInvestmentScore = () => {
    if (valuationReport?.yieldScore) {
      return parseFloat(valuationReport.yieldScore.toString());
    }
    if (civilReport?.overallScore) {
      return civilReport.overallScore;
    }
    return property.overallScore ? parseFloat(property.overallScore.toString()) : 7.5;
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const getPriceRange = () => {
    if (property.configurations && property.configurations.length > 0) {
      const prices = property.configurations.map((c: PropertyConfiguration) => {
        const pricePerSqft = parseFloat(c.pricePerSqft.toString());
        const builtUpArea = c.builtUpArea;
        return pricePerSqft * builtUpArea;
      });
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return { min: minPrice, max: maxPrice };
    }
    
    if (valuationReport?.estimatedMarketValue) {
      const marketValue = parseFloat(valuationReport.estimatedMarketValue.toString());
      return { min: marketValue, max: marketValue };
    }
    
    // Fallback pricing
    const defaultRates = { 'north': 12000, 'south': 15000, 'east': 10000, 'west': 11000, 'central': 18000 };
    const ratePerSqft = defaultRates[property.zone as keyof typeof defaultRates] || 12000;
    const estimatedPrice = ratePerSqft * 1200;
    return { min: estimatedPrice, max: estimatedPrice * 1.2 };
  };

  const priceRange = getPriceRange();
  const investmentScore = getInvestmentScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/find-property")}
              data-testid="button-back-to-search"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Find Properties
            </Button>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600">Investment Analysis</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)}
                    </div>
                    <p className="text-gray-500">by {property.developer}</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Investment Focus
                  </Badge>
                </div>

                {/* Key Investment Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {valuationReport?.grossRentalYield || "1.8%"}
                    </div>
                    <div className="text-sm text-gray-600">Rental Yield</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {investmentScore.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-gray-600">Investment Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {priceRange.min === priceRange.max 
                        ? formatPrice(priceRange.min)
                        : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`
                      }
                    </div>
                    <div className="text-sm text-gray-600">Price Range</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Analysis */}
            {valuationReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Investment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ROI Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Rental Income Potential</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Monthly Rent</span>
                          <span className="font-semibold">{valuationReport.expectedMonthlyRent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Rental Income</span>
                          <span className="font-semibold">
                            ₹{valuationReport.expectedMonthlyRent ? 
                              (parseFloat(valuationReport.expectedMonthlyRent.toString().replace(/[₹,]/g, '')) * 12).toLocaleString()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gross Rental Yield</span>
                          <span className="font-semibold text-green-600">{valuationReport.grossRentalYield}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Investment Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Market Value</span>
                          <span className="font-semibold">{formatPrice(parseFloat(valuationReport.estimatedMarketValue.toString()))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Builder Price</span>
                          <span className="font-semibold">{formatPrice(parseFloat(valuationReport.builderQuotedPrice.toString()))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exit Liquidity</span>
                          <Badge variant="outline">{valuationReport.exitLiquidity}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Recommendation */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-600" />
                      Investment Recommendation
                    </h3>
                    <p className="text-gray-700">{valuationReport.recommendation}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600 mr-2">Overall Verdict:</span>
                      <Badge variant="default">{valuationReport.valuationVerdict}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={((valuationReport?.riskScore || 3) / 5) * 100} className="w-24" />
                      <span className="font-semibold">{valuationReport?.riskScore || 3}/5</span>
                    </div>
                  </div>

                  {valuationReport?.pros && Array.isArray(valuationReport.pros) && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Investment Pros
                      </h4>
                      <ul className="space-y-1">
                        {valuationReport.pros.map((pro: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {valuationReport?.cons && Array.isArray(valuationReport.cons) && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Investment Risks
                      </h4>
                      <ul className="space-y-1">
                        {valuationReport.cons.map((con: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Assessment */}
            {civilReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                    Technical Assessment (Civil + MEP)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Construction Quality</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall Score</span>
                          <span className="font-semibold">{civilReport.overallScore}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Foundation</span>
                          <span className="font-semibold">9/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Structure</span>
                          <span className="font-semibold">9/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">MEP Systems</span>
                          <span className="font-semibold">9/10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Investment Factors</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Grade</span>
                          <Badge variant="default">
                            {civilReport.investmentRecommendation?.replace('-', ' ') || 'Good'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maintenance Cost</span>
                          <span className="text-sm text-gray-600">Low - High Quality Systems</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Future Repairs</span>
                          <span className="text-sm text-gray-600">Minimal for 10+ years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Engineer's Summary</h4>
                    <p className="text-sm text-gray-700">{civilReport.executiveSummary}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" data-testid="button-calculate-roi">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate ROI
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-download-report">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Investment Report
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-compare-properties">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Compare Properties
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-schedule-visit">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Site Visit
                </Button>
              </CardContent>
            </Card>

            {/* Key Investment Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expected Appreciation</span>
                  <span className="font-semibold text-green-600">8-12% p.a.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tenant Demand</span>
                  <Badge variant="default">
                    {valuationReport?.tenantDemand || 'High'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vacancy Risk</span>
                  <span className="text-sm text-green-600">Low</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RERA Status</span>
                  {property.reraApproved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Market Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Area Growth</span>
                    <span className="text-sm font-semibold">Strong</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Infrastructure</span>
                    <span className="text-sm font-semibold">Excellent</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Connectivity</span>
                    <span className="text-sm font-semibold">Very Good</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Contact for Investment Advisory */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Need Investment Advice?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Get personalized investment guidance from our experts
                </p>
                <Button variant="secondary" className="w-full" data-testid="button-consult-expert">
                  <Users className="h-4 w-4 mr-2" />
                  Consult Expert
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}