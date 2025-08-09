import { useState } from "react";
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
  Building,
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
  ArrowUpRight,
  Play,
  Download,
  Lock,
  MessageCircle
} from "lucide-react";
import type { Property, PropertyConfiguration, CivilMepReport, PropertyValuationReport } from "@shared/schema";
import { formatPriceDisplay } from "@/lib/utils";

// Utility function for price formatting
const formatPrice = (price: number) => {
  if (price >= 10000000) { // 1 crore or more
    return `₹${(price / 10000000).toFixed(1)} Cr`;
  } else { // Less than 1 crore, show in lakhs
    return `₹${(price / 100000).toFixed(0)} L`;
  }
};

interface PropertyWithDetails extends Property {
  configurations?: PropertyConfiguration[];
  civilMepReport?: CivilMepReport;
  valuationReport?: PropertyValuationReport;
}

export default function PropertyDetailInvestment() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [selectedConfig, setSelectedConfig] = useState<PropertyConfiguration | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Hero Section with Dynamic Image Gallery */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Image Carousel Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-green-900">
          {property.images && property.images.length > 0 ? (
            <div className="relative w-full h-full">
              <img 
                src={`/images/${property.images[0]}`}
                alt={property.name}
                className="w-full h-full object-cover opacity-70"
                onError={(e) => {
                  // Fallback gradient background if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-emerald-700"></div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-8">
          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/find-property")}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Find Properties
            </Button>
            
            <Badge className="bg-green-500/80 backdrop-blur-sm text-white border-green-400/50 px-4 py-2 rounded-full font-bold">
              <TrendingUp className="h-5 w-5 mr-2" />
              Investment Focus
            </Badge>
          </div>

          {/* Property Title & Details */}
          <div className="text-white space-y-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">{property.name}</h1>
              <div className="flex items-center text-xl text-white/90 mb-2">
                <MapPin className="h-6 w-6 mr-2" />
                <span>{property.area}, {property.zone?.charAt(0).toUpperCase() + property.zone?.slice(1)}</span>
              </div>
              <p className="text-lg text-white/80">by {property.developer}</p>
            </div>

            {/* Key Investment Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {property.overallScore}/100
                </div>
                <div className="text-sm text-white/80">Overall Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatPrice(Math.min(...property.configurations.map(c => c.price)))}
                </div>
                <div className="text-sm text-white/80">Starting Price</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  3.6%
                </div>
                <div className="text-sm text-white/80">Rental Yield</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {property.reraApproved ? 'RERA' : 'Pending'}
                </div>
                <div className="text-sm text-white/80">
                  {property.reraApproved ? 'Approved' : 'Approval'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white border-0 px-8 py-3 text-lg"
                onClick={() => navigate('/book-visit', { 
                  state: { 
                    property: {
                      id: property.id,
                      name: property.name,
                      area: property.area,
                      developer: property.developer
                    }
                  }
                })}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Site Visit
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-8 py-3 text-lg"
                onClick={() => navigate('/consultation', { 
                  state: { 
                    property: {
                      id: property.id,
                      name: property.name,
                      area: property.area,
                      zone: property.zone,
                      developer: property.developer
                    }
                  }
                })}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Expert Consultation
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-6 py-3"
                onClick={() => {
                  const url = window.location.href;
                  const text = `🏠 *${property.name}* - Investment Opportunity\n📍 ${property.area}\n💰 Starting ${formatPrice(Math.min(...property.configurations.map(c => c.price)))}\n📊 Score: ${property.overallScore}/100\n\nView details: ${url}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                Share Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery Section */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-600" />
                  Property Gallery
                </CardTitle>
                <p className="text-gray-600">Explore the property through professional photographs</p>
              </CardHeader>
              <CardContent className="p-0">
                {property.images && property.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Featured Image */}
                    <div className="relative h-[400px] bg-gray-100 overflow-hidden">
                      <img 
                        src={`/images/${property.images[0]}`}
                        alt={`${property.name} - Main View`}
                        className="main-property-image w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm image-counter">
                        1 of {property.images.length}
                      </div>
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {property.images.length > 1 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-6 pb-6">
                        {property.images.slice(1).map((image, index) => (
                          <div key={index} className="relative h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-300 transition-all">
                            <img 
                              src={`/images/${image}`}
                              alt={`${property.name} - View ${index + 2}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onClick={() => {
                                // Simple image swap functionality
                                const mainImg = document.querySelector('.main-property-image') as HTMLImageElement;
                                if (mainImg) {
                                  mainImg.src = `/images/${image}`;
                                  const counter = document.querySelector('.image-counter');
                                  if (counter) counter.textContent = `${index + 2} of ${property.images.length}`;
                                }
                              }}
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OWEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[400px] bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                    <div className="text-center text-green-800">
                      <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Property images will be updated soon</p>
                      <p className="text-sm opacity-70">Check back for professional photography</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Overview - Dynamic Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Investment Project Overview
                </CardTitle>
                <p className="text-gray-600">Comprehensive property details for informed investment decisions</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Developer & Project Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Developer Credentials</h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-900">{property.developer}</span>
                        <Badge className="bg-green-600 text-white">Trusted Builder</Badge>
                      </div>
                      <p className="text-sm text-green-700">
                        Established developer with proven track record in premium residential projects
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Project Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Status</span>
                        <Badge className={`capitalize ${property.status === 'active' ? 'bg-green-100 text-green-800' : 
                                      property.status === 'under-construction' ? 'bg-blue-100 text-blue-800' :
                                      property.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {property.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Possession</span>
                        <span className="font-medium">{property.possessionDate ? 
                          new Date(property.possessionDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 
                          'TBD'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">RERA Status</span>
                        <div className="flex items-center space-x-2">
                          {property.reraApproved ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">
                            {property.reraApproved ? 'RERA Approved' : 'RERA Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure & Zoning */}
                {(property.infrastructureVerdict || property.zoningInfo) && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Location & Infrastructure Analysis</h4>
                    
                    {property.infrastructureVerdict && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-blue-900 mb-1">Infrastructure Assessment</h5>
                            <p className="text-blue-800">{property.infrastructureVerdict}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {property.zoningInfo && (
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-indigo-900 mb-1">Zoning & Compliance</h5>
                            <p className="text-indigo-800">{property.zoningInfo}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Premium Features & Investment Highlights */}
                {property.tags && property.tags.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Investment Highlights</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {property.tags.map((tag, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800 capitalize">
                              {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal & RERA Information */}
                {property.reraNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Legal Information</h5>
                    <div className="text-sm text-gray-700">
                      <strong>RERA Number:</strong> {property.reraNumber}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Map - Minimal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Strategic Location Map
                </CardTitle>
                <p className="text-gray-600">Prime investment location with connectivity analysis</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-600">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">{property.area}</p>
                    <p className="text-sm">{property.zone?.charAt(0).toUpperCase() + property.zone?.slice(1)} Bengaluru</p>
                    <p className="text-xs mt-2 text-gray-500">Interactive map integration available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Calculator - Investment Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-green-600" />
                  Investment EMI Calculator
                </CardTitle>
                <p className="text-gray-600">Calculate your monthly investment with real property pricing</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.configurations && property.configurations.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.configurations.slice(0, 2).map((config, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-2">{config.configuration}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Property Price</span>
                            <span className="font-medium">{formatPrice(config.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Area</span>
                            <span className="font-medium">{config.builtUpArea} sq ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price/sq ft</span>
                            <span className="font-medium">₹{parseFloat(config.pricePerSqft).toLocaleString()}</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-green-700 font-medium">Est. EMI (20% down)</span>
                              <span className="font-bold text-green-800">
                                ₹{Math.round((config.price * 0.8) / (20 * 12)).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">*20 year loan @ 8.5% interest</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Properties - Investment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-green-600" />
                  Similar Investment Opportunities
                </CardTitle>
                <p className="text-gray-600">Compare investment options in {property.area}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-green-900">Premium Properties in {property.area}</h4>
                        <p className="text-sm text-green-700">3-4 similar projects available</p>
                      </div>
                      <Badge className="bg-green-600 text-white">Hot Zone</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-800">₹{property.areaAvgPriceMin}L - ₹{property.areaAvgPriceMax}L</div>
                        <div className="text-green-600">Area Range</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-800">{property.overallScore}/100</div>
                        <div className="text-green-600">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-800">3.2-4.1%</div>
                        <div className="text-green-600">Rental Yield</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Analysis Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Investment Analysis Dashboard
                </CardTitle>
                <p className="text-gray-600">Comprehensive investment metrics and projections</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-800">{property.overallScore}/100</div>
                    <div className="text-sm text-green-600">Investment Score</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-800">3.6%</div>
                    <div className="text-sm text-blue-600">Rental Yield</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center">
                    <div className="text-2xl font-bold text-emerald-800">12-15%</div>
                    <div className="text-sm text-emerald-600">Appreciation</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center">
                    <div className="text-2xl font-bold text-indigo-800">{property.priceComparison || 'Market Rate'}</div>
                    <div className="text-sm text-indigo-600">vs Area Avg</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">5-Year Investment Projection</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Value</span>
                        <div className="font-medium">{property.configurations ? formatPrice(Math.min(...property.configurations.map(c => c.price))) : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Projected Value</span>
                        <div className="font-medium text-green-600">{property.configurations ? formatPrice(Math.min(...property.configurations.map(c => c.price)) * 1.7) : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Rental Income/Year</span>
                        <div className="font-medium text-blue-600">₹{property.configurations ? (Math.min(...property.configurations.map(c => c.price)) * 0.036 / 100000).toFixed(0) : '0'}L</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Market Price Analysis
                </CardTitle>
                <p className="text-gray-600">Real-time market comparison from admin data</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">{property.area} Area Average</h4>
                      <div className="text-lg font-bold text-green-800">
                        ₹{property.areaAvgPriceMin}L - ₹{property.areaAvgPriceMax}L
                      </div>
                      <p className="text-sm text-green-600">Price range in locality</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">City Average</h4>
                      <div className="text-lg font-bold text-blue-800">
                        ₹{property.cityAvgPriceMin}L - ₹{property.cityAvgPriceMax}L
                      </div>
                      <p className="text-sm text-blue-600">Bengaluru comparison</p>
                    </div>
                  </div>
                  
                  {property.priceComparison && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-yellow-900">Market Position</span>
                        <Badge className="bg-yellow-600 text-white">{property.priceComparison}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Tour & Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-600" />
                  Property Media & Reports
                </CardTitle>
                <p className="text-gray-600">Virtual tours and professional reports</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.youtubeVideoUrl && (
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Virtual Property Tour</h4>
                        <p className="text-sm text-gray-600">Professional video walkthrough</p>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => property.youtubeVideoUrl && window.open(property.youtubeVideoUrl, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Tour
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.hasCivilMepReport && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900">CIVIL+MEP Report</h4>
                        <Badge className={`${property.civilMepReportStatus === 'completed' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                          {property.civilMepReportStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">Professional structural assessment</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-800">₹{property.civilMepReportPrice ? parseFloat(property.civilMepReportPrice).toLocaleString() : '0'}</span>
                        <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                          <FileText className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  )}

                  {property.hasValuationReport && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-emerald-900">Valuation Report</h4>
                        <Badge className={`${property.valuationReportStatus === 'completed' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                          {property.valuationReportStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-emerald-700 mb-3">Independent property valuation</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-800">₹{property.valuationReportPrice ? parseFloat(property.valuationReportPrice).toLocaleString() : '0'}</span>
                        <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                          <Award className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.area}, {property.zone ? property.zone.charAt(0).toUpperCase() + property.zone.slice(1) : 'Bengaluru'}
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

            {/* Property Video Section */}
            {property.youtubeVideoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2 text-blue-600" />
                    Investment Property Walkthrough
                  </CardTitle>
                  <p className="text-gray-600">Expert investment analysis and virtual property tour</p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe 
                      src={`https://www.youtube.com/embed/${property.youtubeVideoUrl.split('v=')[1]?.split('&')[0]}`}
                      className="w-full h-full"
                      allowFullScreen
                      title="Investment Property Walkthrough"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment-Focused Configuration Analysis */}
            <Card id="investment-configurations">
              <CardHeader>
                <CardTitle>Investment Configuration Analysis</CardTitle>
                <p className="text-gray-600">Select configurations based on rental yield potential and capital appreciation</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {property.configurations?.map((config, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedConfig?.id === config.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => setSelectedConfig(config)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{config.configuration}</h3>
                        <Badge variant={config.availabilityStatus === 'available' ? 'default' : 
                                       config.availabilityStatus === 'limited' ? 'secondary' : 'destructive'}>
                          {config.availabilityStatus}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Area</span>
                          <span className="font-medium">{config.builtUpArea} sq ft</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expected Rent</span>
                          <span className="font-medium text-green-600">₹{Math.round(config.price * 0.003).toLocaleString()}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rental Yield</span>
                          <span className="font-medium text-green-600">3.6%</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-gray-900 font-medium">Investment</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatPriceDisplay(config.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Configuration Investment Analysis */}
                {selectedConfig && (
                  <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                    <h3 className="text-xl font-bold text-green-900 mb-4">
                      {selectedConfig.configuration} - Investment Analysis
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Investment Returns */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-800">Investment Returns</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Initial Investment</span>
                            <span className="font-medium">{formatPriceDisplay(selectedConfig.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Monthly Rental</span>
                            <span className="font-medium text-green-600">₹{Math.round(selectedConfig.price * 0.003).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Annual Rental Income</span>
                            <span className="font-medium">₹{Math.round(selectedConfig.price * 0.036).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Gross Yield</span>
                            <span className="font-medium text-green-600">3.6% p.a.</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-green-800 font-semibold">5-year Returns</span>
                            <span className="font-bold text-green-600">+65%</span>
                          </div>
                        </div>
                      </div>

                      {/* Market Analysis */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-800">Market Dynamics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Demand Level</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Price Trend</span>
                            <span className="font-medium text-green-600">↗ +12% CAGR</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Rental Demand</span>
                            <span className="font-medium text-green-600">Strong</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Liquidity</span>
                            <span className="font-medium">Good</span>
                          </div>
                          <div className="bg-green-100 p-2 rounded text-xs text-green-800">
                            📊 IT corridor proximity drives rental demand
                          </div>
                        </div>
                      </div>

                      {/* Exit Strategy */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-800">Exit Strategy</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Hold Period</span>
                            <span className="font-medium">5-7 years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Expected Sale Price</span>
                            <span className="font-medium">{formatPriceDisplay(selectedConfig.price * 1.65)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Capital Gains</span>
                            <span className="font-medium text-green-600">{formatPriceDisplay(selectedConfig.price * 0.65)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Total Returns</span>
                            <span className="font-medium text-green-600">IRR: 18.2%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Investment Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button onClick={() => navigate('/site-visit')} className="flex-1 min-w-48 bg-green-600 hover:bg-green-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Investment Site Visit
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/consultation')} className="flex-1 min-w-48">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Investment Consultation
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 min-w-48"
                        onClick={() => property.brochureUrl ? window.open(property.brochureUrl, '_blank') : null}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Investment Brochure
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Analysis & ROI Reports */}
            {valuationReport && (
              <Card id="investment-reports">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Investment Analysis & ROI Reports
                    <Badge className="ml-3 bg-green-100 text-green-800 border-green-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Investment Verified
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-600">Professional investment analysis backed by market research and rental data</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ROI Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Rental Income Analysis</h3>
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
                        <div className="flex justify-between">
                          <span className="text-gray-600">Net Yield (post expenses)</span>
                          <span className="font-semibold text-green-600">2.8%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Capital Appreciation</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Market Value</span>
                          <span className="font-semibold">{formatPriceDisplay(parseFloat(valuationReport.estimatedMarketValue?.toString() || '0'))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Builder Price</span>
                          <span className="font-semibold">{formatPriceDisplay(parseFloat(valuationReport.builderQuotedPrice?.toString() || '0'))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">5-year Projection</span>
                          <span className="font-semibold text-green-600">+65%</span>
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
                      <span className="text-sm text-gray-600 mr-2">Investment Verdict:</span>
                      <Badge variant="default">{valuationReport.valuationVerdict}</Badge>
                    </div>
                  </div>

                  {/* Get Full Investment Report */}
                  <Card className="border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <h4 className="font-semibold text-green-800">Complete Investment Analysis Report</h4>
                          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            ROI Focused
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm text-gray-600 mb-4">
                        <p>• Detailed rental yield calculations and market comparisons</p>
                        <p>• 5-year capital appreciation projections with exit strategies</p>
                        <p>• Tax implications and investment structuring recommendations</p>
                        <p>• Risk analysis and portfolio diversification insights</p>
                      </div>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/consultation')}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Get Complete Investment Report - ₹2,499
                      </Button>
                    </CardContent>
                  </Card>
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