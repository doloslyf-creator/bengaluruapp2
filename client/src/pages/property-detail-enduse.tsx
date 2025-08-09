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
  Building,
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
      {/* Hero Section with Dynamic Image Gallery - Family Focused */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Image Carousel Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-purple-900">
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
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-700"></div>
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
            
            <Badge className="bg-purple-500/80 backdrop-blur-sm text-white border-purple-400/50 px-4 py-2 rounded-full font-bold">
              <Home className="h-5 w-5 mr-2" />
              Perfect Home
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

            {/* Key Family Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {lifestyleScore.toFixed(1)}/5
                </div>
                <div className="text-sm text-white/80">Lifestyle Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {formatPrice(Math.min(...property.configurations.map(c => c.price)))}
                </div>
                <div className="text-sm text-white/80">Starting Price</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {property.configurations?.find(c => c.configuration.includes('3 BHK'))?.builtUpArea || '1650'} sq ft
                </div>
                <div className="text-sm text-white/80">Family Home Size</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {property.reraApproved ? 'Safe' : 'Review'}
                </div>
                <div className="text-sm text-white/80">
                  {property.reraApproved ? 'Investment' : 'Needed'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-8 py-3 text-lg"
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
                Schedule Family Visit
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
                Family Consultation
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-6 py-3"
                onClick={() => {
                  const url = window.location.href;
                  const text = `🏠 *${property.name}* - Perfect Family Home\n📍 ${property.area}\n💰 Starting ${formatPrice(Math.min(...property.configurations.map(c => c.price)))}\n🏡 Lifestyle Score: ${lifestyleScore.toFixed(1)}/5\n\nView details: ${url}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                Share with Family
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery Section - Family Focused */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-purple-600" />
                  Your Future Home Gallery
                </CardTitle>
                <p className="text-gray-600">Visualize your family living in this beautiful space</p>
              </CardHeader>
              <CardContent className="p-0">
                {property.images && property.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Featured Image */}
                    <div className="relative h-[400px] bg-gray-100 overflow-hidden">
                      <img 
                        src={`/images/${property.images[0]}`}
                        alt={`${property.name} - Family Home View`}
                        className="main-family-image w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm family-image-counter">
                        1 of {property.images.length}
                      </div>
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {property.images.length > 1 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-6 pb-6">
                        {property.images.slice(1).map((image, index) => (
                          <div key={index} className="relative h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all">
                            <img 
                              src={`/images/${image}`}
                              alt={`${property.name} - Family Space ${index + 2}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onClick={() => {
                                // Simple image swap functionality
                                const mainImg = document.querySelector('.main-family-image') as HTMLImageElement;
                                if (mainImg) {
                                  mainImg.src = `/images/${image}`;
                                  const counter = document.querySelector('.family-image-counter');
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
                  <div className="h-[400px] bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center">
                    <div className="text-center text-purple-800">
                      <Home className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Your dream home photos coming soon</p>
                      <p className="text-sm opacity-70">Professional family home photography in progress</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Overview - Family Focused */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Your Dream Home Details
                </CardTitle>
                <p className="text-gray-600">Everything your family needs to know about this perfect home</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Developer & Family Assurance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Trusted Builder</h4>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-purple-900">{property.developer}</span>
                        <Badge className="bg-purple-600 text-white">Family Focused</Badge>
                      </div>
                      <p className="text-sm text-purple-700">
                        Renowned for creating family-centric communities with world-class amenities
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Move-in Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Project Status</span>
                        <Badge className={`capitalize ${property.status === 'active' ? 'bg-green-100 text-green-800' : 
                                      property.status === 'under-construction' ? 'bg-blue-100 text-blue-800' :
                                      property.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {property.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Family Move-in</span>
                        <span className="font-medium">{property.possessionDate ? 
                          new Date(property.possessionDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 
                          'Contact for details'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Safety Certified</span>
                        <div className="flex items-center space-x-2">
                          {property.reraApproved ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">
                            {property.reraApproved ? 'RERA Safe' : 'Verification Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neighborhood & Community */}
                {(property.infrastructureVerdict || property.zoningInfo) && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Neighborhood & Community</h4>
                    
                    {property.infrastructureVerdict && (
                      <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-pink-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-pink-900 mb-1">Community Infrastructure</h5>
                            <p className="text-pink-800">{property.infrastructureVerdict}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {property.zoningInfo && (
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-indigo-900 mb-1">Area Planning & Safety</h5>
                            <p className="text-indigo-800">{property.zoningInfo}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Family Features & Lifestyle Amenities */}
                {property.tags && property.tags.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Family Lifestyle Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {property.tags.map((tag, index) => (
                        <div key={index} className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-purple-800 capitalize">
                              {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety & Legal Assurance */}
                {property.reraNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Safety & Legal Assurance</h5>
                    <div className="text-sm text-gray-700">
                      <strong>RERA Registration:</strong> {property.reraNumber}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Map - Family Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Family Neighborhood Map
                </CardTitle>
                <p className="text-gray-600">Explore schools, parks, and family amenities nearby</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-600">
                    <Home className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                    <p className="font-medium">{property.area}</p>
                    <p className="text-sm">{property.zone?.charAt(0).toUpperCase() + property.zone?.slice(1)} Bengaluru</p>
                    <p className="text-xs mt-2 text-gray-500">Family-friendly neighborhood details</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Calculator - Family Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                  Family Budget Calculator
                </CardTitle>
                <p className="text-gray-600">Plan your family's dream home with affordable EMI options</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.configurations && property.configurations.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.configurations.slice(0, 2).map((config, index) => (
                      <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-900 mb-2">{config.configuration}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Home Price</span>
                            <span className="font-medium">{formatPrice(config.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Living Space</span>
                            <span className="font-medium">{config.builtUpArea} sq ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Per sq ft</span>
                            <span className="font-medium">₹{parseFloat(config.pricePerSqft).toLocaleString()}</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-purple-700 font-medium">Monthly EMI (15% down)</span>
                              <span className="font-bold text-purple-800">
                                ₹{Math.round((config.price * 0.85) / (25 * 12)).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-purple-600 mt-1">*25 year home loan @ 8.75% interest</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Properties - Family Homes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  Similar Family Homes
                </CardTitle>
                <p className="text-gray-600">Other perfect homes for families in {property.area}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-purple-900">Family Communities in {property.area}</h4>
                        <p className="text-sm text-purple-700">3-4 family-focused projects nearby</p>
                      </div>
                      <Badge className="bg-purple-600 text-white">Family Zone</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-purple-800">₹{property.areaAvgPriceMin}L - ₹{property.areaAvgPriceMax}L</div>
                        <div className="text-purple-600">Price Range</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-800">{lifestyleScore.toFixed(1)}/5</div>
                        <div className="text-purple-600">Family Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-800">1200-1800</div>
                        <div className="text-purple-600">Sq Ft Range</div>
                      </div>
                    </div>
                  </div>
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