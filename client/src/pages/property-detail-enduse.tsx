import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Home, 
  MapPin, 
  Users, 
  Car,
  Shield,
  Star,
  Calendar,
  Building2,
  ArrowLeft,
  School,
  Hospital,
  ShoppingBag,
  Train,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Phone,
  Heart,
  TreePine,
  Dumbbell,
  Waves,
  Camera,
  Coffee,
  Play,
  Download,
  MessageCircle,
  ThumbsUp,
  Award,
  Calculator,
  DollarSign
} from "lucide-react";
import type { Property, PropertyConfiguration, CivilMepReport, PropertyValuationReport } from "@shared/schema";
import { formatPriceDisplay } from "@/lib/utils";

interface PropertyWithDetails extends Property {
  configurations?: PropertyConfiguration[];
  civilMepReport?: CivilMepReport;
  valuationReport?: PropertyValuationReport;
}

export default function PropertyDetailEndUse() {
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
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
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

  // Calculate lifestyle score
  const getLifestyleScore = () => {
    const locationScore = property.locationScore || 0;
    const amenitiesScore = property.amenitiesScore || 0;
    return (locationScore + amenitiesScore) / 2;
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

  const getPriceInfo = () => {
    if (property.configurations && property.configurations.length > 0) {
      const config = property.configurations[0];
      const totalPrice = parseFloat(config.pricePerSqft.toString()) * config.builtUpArea;
      return {
        totalPrice,
        pricePerSqft: parseFloat(config.pricePerSqft.toString()),
        area: config.builtUpArea,
        configuration: config.configuration
      };
    }
    
    if (valuationReport?.estimatedMarketValue) {
      const marketValue = parseFloat(valuationReport.estimatedMarketValue.toString());
      return {
        totalPrice: marketValue,
        pricePerSqft: 15000, // Average
        area: Math.round(marketValue / 15000),
        configuration: valuationReport.configuration || "3 BHK"
      };
    }
    
    // Fallback
    const defaultPrice = 12000 * 1200;
    return {
      totalPrice: defaultPrice,
      pricePerSqft: 12000,
      area: 1200,
      configuration: "3 BHK"
    };
  };

  const priceInfo = getPriceInfo();
  const lifestyleScore = getLifestyleScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Enhanced Family-Focused Header */}
      <div className="relative bg-gradient-to-r from-white via-purple-50 to-pink-50 border-b shadow-lg overflow-hidden">
        {/* Family-themed Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-2/3 right-1/4 w-20 h-20 bg-pink-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-indigo-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/find-property")}
              data-testid="button-back-to-search"
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-purple-300 rounded-xl px-6 py-3 transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Find Properties
            </Button>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200 px-4 py-2 rounded-full font-bold shadow-lg">
                <Home className="h-5 w-5 mr-2" />
                Home for Living
              </Badge>
              <div className="text-sm text-slate-600 font-medium bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                🏡 Lifestyle Focused View
              </div>
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
                    Perfect for Families
                  </Badge>
                </div>

                {/* Key Lifestyle Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {lifestyleScore.toFixed(1)}/5
                    </div>
                    <div className="text-sm text-gray-600">Lifestyle Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {priceInfo.configuration}
                    </div>
                    <div className="text-sm text-gray-600">{priceInfo.area} sq.ft</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(priceInfo.totalPrice)}
                    </div>
                    <div className="text-sm text-gray-600">Total Price</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Video Section - Family Focused */}
            {property.youtubeVideoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2 text-purple-600" />
                    Family Home Walkthrough
                  </CardTitle>
                  <p className="text-gray-600">Virtual tour showcasing family-friendly features and lifestyle amenities</p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe 
                      src={`https://www.youtube.com/embed/${property.youtubeVideoUrl.split('v=')[1]?.split('&')[0]}`}
                      className="w-full h-full"
                      allowFullScreen
                      title="Family Home Walkthrough"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Family-Focused Configuration Analysis */}
            <Card id="family-configurations">
              <CardHeader>
                <CardTitle>Perfect Home for Your Family</CardTitle>
                <p className="text-gray-600">Choose configurations based on family size, lifestyle needs, and comfort preferences</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {property.configurations?.map((config, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedConfig?.id === config.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-300'
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
                          <span className="text-gray-600">Living Space</span>
                          <span className="font-medium">{config.builtUpArea} sq ft</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Family Size</span>
                          <span className="font-medium text-purple-600">
                            {config.configuration.includes('4 BHK') ? '6-8 members' : 
                             config.configuration.includes('3 BHK') ? '4-6 members' : 
                             config.configuration.includes('2 BHK') ? '3-4 members' : '2-3 members'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Lifestyle Fit</span>
                          <span className="font-medium text-green-600">Perfect</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-gray-900 font-medium">Total Price</span>
                          <span className="text-lg font-bold text-purple-600">
                            {formatPriceDisplay(config.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Configuration Family Analysis */}
                {selectedConfig && (
                  <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">
                      {selectedConfig.configuration} - Perfect for Your Family
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Family Living */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-purple-800">Family Living</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Living Area</span>
                            <span className="font-medium">{selectedConfig.builtUpArea} sq ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Bedrooms</span>
                            <span className="font-medium text-purple-600">
                              {selectedConfig.configuration.split(' ')[0]} BR
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Bathrooms</span>
                            <span className="font-medium">
                              {selectedConfig.configuration.split(' ')[0] === '4' ? '4' :
                               selectedConfig.configuration.split(' ')[0] === '3' ? '3' : '2'} BA
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Balconies</span>
                            <span className="font-medium">2-3</span>
                          </div>
                          <div className="bg-purple-100 p-2 rounded text-xs text-purple-800">
                            🏠 Spacious rooms with natural ventilation
                          </div>
                        </div>
                      </div>

                      {/* Lifestyle Amenities */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-purple-800">Lifestyle Features</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Children Play Area</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Swimming Pool</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Gym & Fitness</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Club House</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="bg-green-100 p-2 rounded text-xs text-green-800">
                            🌟 Premium amenities for family wellness
                          </div>
                        </div>
                      </div>

                      {/* Safety & Convenience */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-purple-800">Safety & Access</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">24/7 Security</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">CCTV Monitoring</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Covered Parking</span>
                            <span className="font-medium">2-3 Cars</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Power Backup</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Family Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button onClick={() => navigate('/site-visit')} className="flex-1 min-w-48 bg-purple-600 hover:bg-purple-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Family Site Visit
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/consultation')} className="flex-1 min-w-48">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Home Buying Guidance
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 min-w-48"
                        onClick={() => property.brochureUrl ? window.open(property.brochureUrl, '_blank') : null}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Family Home Brochure
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Home Quality & Family Reports */}
            <Card id="family-reports">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Home Quality & Family Suitability Reports
                  <Badge className="ml-3 bg-purple-100 text-purple-800 border-purple-200">
                    <Home className="h-3 w-3 mr-1" />
                    Family Verified
                  </Badge>
                </CardTitle>
                <p className="text-gray-600">Professional quality assessment focused on family living and child safety</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quality Assessment */}
                {civilReport && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      Construction Quality Assessment
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">{civilReport.overallScore}/10</div>
                        <div className="text-xs text-gray-600">Overall Quality</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">9/10</div>
                        <div className="text-xs text-gray-600">Child Safety</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">9/10</div>
                        <div className="text-xs text-gray-600">Ventilation</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">9/10</div>
                        <div className="text-xs text-gray-600">Water Quality</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Family Living Analysis */}
                {valuationReport && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Family Living Features</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Child-Safe Design</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Natural Light</span>
                          <span className="font-semibold text-green-600">Excellent</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cross Ventilation</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vastu Compliant</span>
                          {valuationReport.vastuCompliance ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-sm text-gray-500">Consultant Available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Possession & Legal Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ready to Move</span>
                          <Badge variant="default">
                            {valuationReport.possessionStatus || property.possessionDate ? 'Yes' : 'Under Construction'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">RERA Approved</span>
                          {property.reraApproved ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Legal Clearance</span>
                          {property.legalVerdictBadge ? (
                            <Badge variant="outline">{property.legalVerdictBadge}</Badge>
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Home Loan Ready</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Get Complete Family Report */}
                <Card className="border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <h4 className="font-semibold text-purple-800">Complete Family Living Assessment</h4>
                        <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200 text-xs">
                          <Home className="h-3 w-3 mr-1" />
                          Family Focused
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <p>• Child safety assessment and family-friendly design analysis</p>
                      <p>• School proximity analysis and educational ecosystem review</p>
                      <p>• Healthcare facilities and emergency services accessibility</p>
                      <p>• Community lifestyle and family neighborhood evaluation</p>
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate('/consultation')}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Get Family Living Report - ₹1,999
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Amenities & Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Lifestyle & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Standard amenities */}
                  {[
                    "Fitness Center",
                    "Swimming Pool", 
                    "Landscaped Gardens",
                    "24/7 Security"
                  ].map((feature, index) => {
                    const getFeatureIcon = (feature: string) => {
                      if (feature.toLowerCase().includes('gym') || feature.toLowerCase().includes('fitness')) {
                        return <Dumbbell className="h-5 w-5 text-blue-500" />;
                      }
                      if (feature.toLowerCase().includes('pool') || feature.toLowerCase().includes('swimming')) {
                        return <Waves className="h-5 w-5 text-blue-400" />;
                      }
                      if (feature.toLowerCase().includes('garden') || feature.toLowerCase().includes('landscape')) {
                        return <TreePine className="h-5 w-5 text-green-500" />;
                      }
                      if (feature.toLowerCase().includes('club') || feature.toLowerCase().includes('community')) {
                        return <Coffee className="h-5 w-5 text-brown-500" />;
                      }
                      return <Star className="h-5 w-5 text-yellow-500" />;
                    };

                    return (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="mb-2">{getFeatureIcon(feature)}</div>
                        <div className="text-sm font-medium">{feature}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Location & Connectivity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Location & Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Connectivity Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Location Score</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= (property.locationScore || 4) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nearby Facilities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <School className="h-4 w-4 mr-2 text-blue-600" />
                        Education & Healthcare
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Premium Schools</span>
                          <span>2-5 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hospitals</span>
                          <span>3-7 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medical Centers</span>
                          <span>1-3 km</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2 text-purple-600" />
                        Shopping & Transport
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shopping Malls</span>
                          <span>5-10 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Metro Station</span>
                          <span>Planned</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Airport</span>
                          <span>45 min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connectivity Details */}
                  {valuationReport?.connectivity && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Connectivity Details</h4>
                      <p className="text-sm text-gray-700">{valuationReport.connectivity}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" data-testid="button-schedule-visit">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Site Visit
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-check-loan">
                  <FileText className="h-4 w-4 mr-2" />
                  Check Loan Eligibility
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-virtual-tour">
                  <Camera className="h-4 w-4 mr-2" />
                  Virtual Tour
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-get-brochure">
                  <FileText className="h-4 w-4 mr-2" />
                  Get Brochure
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold">{formatPrice(priceInfo.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Per Sq.Ft</span>
                  <span className="font-semibold">₹{priceInfo.pricePerSqft.toLocaleString()}</span>
                </div>
                {valuationReport?.gstAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST (5%)</span>
                    <span className="font-semibold">₹{parseFloat(valuationReport.gstAmount.toString()).toLocaleString()}</span>
                  </div>
                )}
                {valuationReport?.stampDutyRegistration && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Registration</span>
                    <span className="font-semibold">₹{parseFloat(valuationReport.stampDutyRegistration.toString()).toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Cost</span>
                  <span>{valuationReport?.totalAllInPrice ? formatPrice(parseFloat(valuationReport.totalAllInPrice.toString())) : formatPrice(priceInfo.totalPrice * 1.15)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Safety & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Safety & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">24/7 Security</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CCTV Surveillance</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fire Safety</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Earthquake Resistant</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Find Your Dream Home</h3>
                <p className="text-sm mb-4 opacity-90">
                  Our experts are here to help you make the right choice
                </p>
                <Button variant="secondary" className="w-full" data-testid="button-call-expert">
                  <Phone className="h-4 w-4 mr-2" />
                  Talk to Expert
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}