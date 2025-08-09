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
  Coffee
} from "lucide-react";
import type { Property, PropertyConfiguration, CivilMepReport, PropertyValuationReport } from "@shared/schema";

interface PropertyWithDetails extends Property {
  configurations?: PropertyConfiguration[];
  civilMepReport?: CivilMepReport;
  valuationReport?: PropertyValuationReport;
}

export default function PropertyDetailEndUse() {
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
              <Home className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-600">Home for Living</span>
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

            {/* Home Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-purple-600" />
                  Your Future Home
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Unit Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Unit Specifications</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Configuration</span>
                        <span className="font-semibold">{priceInfo.configuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Built-up Area</span>
                        <span className="font-semibold">{priceInfo.area.toLocaleString()} sq.ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facing</span>
                        <span className="font-semibold">{valuationReport?.facing || 'North-East'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vastu Compliant</span>
                        {valuationReport?.vastuCompliance ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-sm text-gray-500">Check with architect</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Possession & Legal</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Possession Status</span>
                        <Badge variant="default">
                          {valuationReport?.possessionStatus || property.possessionDate ? 'Ready' : 'Under Construction'}
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
                        <span className="text-gray-600">OC Status</span>
                        <Badge variant="outline">
                          {valuationReport?.ocCcStatus || 'Applied'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Legal Clearance</span>
                        {property.legalVerdictBadge ? (
                          <Badge variant="outline">{property.legalVerdictBadge}</Badge>
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
                        <div className="text-xs text-gray-600">Foundation</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">9/10</div>
                        <div className="text-xs text-gray-600">Electrical</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">9/10</div>
                        <div className="text-xs text-gray-600">Plumbing</div>
                      </div>
                    </div>
                  </div>
                )}
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