import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Home, 
  Users, 
  Car, 
  Dumbbell,
  Wifi,
  Shield,
  Phone,
  Mail,
  Clock,
  Star,
  Heart,
  Share2
} from "lucide-react";
import type { Property } from "@shared/schema";

export default function PropertyDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ['/api/properties', id],
    enabled: !!id
  });

  const { data: configuration } = useQuery({
    queryKey: ['/api/property-configurations', id],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Property Not Found</h2>
          <p className="text-slate-600 mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/find-property/results')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 100) {
      return `₹${(price / 100).toFixed(1)} Cr`;
    }
    return `₹${price} L`;
  };

  const amenityIcons: Record<string, any> = {
    'Swimming Pool': '🏊',
    'Gym': <Dumbbell className="h-4 w-4" />,
    'Parking': <Car className="h-4 w-4" />,
    'Security': <Shield className="h-4 w-4" />,
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Power Backup': '⚡',
    'Garden': '🌳',
    'Club House': '🏛️',
    'Children Play Area': '🎠',
    'Jogging Track': '🏃'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/find-property/results')}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Results</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                      {property.name}
                    </CardTitle>
                    <p className="text-lg text-slate-600 flex items-center mt-2">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      {property.location}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Bengaluru
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Property Image */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Building2 className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-medium">Property Image</p>
                  <p className="text-sm opacity-90">{property.name}</p>
                </div>
              </div>
            </Card>

            {/* Property Overview */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span>Property Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-800">Property Type</div>
                    <div className="text-sm text-slate-600 capitalize">{property.type}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-800">Developer</div>
                    <div className="text-sm text-slate-600">{property.developer}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-800">Status</div>
                    <div className="text-sm text-slate-600 capitalize">{property.status}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-800">RERA ID</div>
                    <div className="text-sm text-slate-600">{property.reraId || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurations */}
            {configuration && Array.isArray(configuration) && configuration.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span>Available Configurations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {configuration.map((config: any, index: number) => (
                      <div key={index} className="p-4 border border-blue-100 rounded-lg bg-gradient-to-r from-blue-50/50 to-slate-50/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-800">{config.bhkType || config.configuration}</span>
                          <span className="text-blue-600 font-bold">{formatPrice(config.price)}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <div>Area: {config.area} sq ft</div>
                          {config.balconies && <div>Balconies: {config.balconies}</div>}
                          {config.bathrooms && <div>Bathrooms: {config.bathrooms}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <span>Amenities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600">
                          {amenityIcons[amenity] || <CheckCircle className="h-4 w-4" />}
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {property.tags && Array.isArray(property.tags) && property.tags.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Property Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-center bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                  Interested in this Property?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/book-visit?property=${property.id}&name=${encodeURIComponent(property.name)}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Site Visit
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate(`/consultation?property=${property.id}&name=${encodeURIComponent(property.name)}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Get Expert Consultation
                </Button>

                <Separator />

                <div className="text-center text-sm text-slate-600">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>Response within 2 hours</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>100% Verified Properties</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Location</span>
                  <span className="font-medium">{property.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Zone</span>
                  <span className="font-medium capitalize">{property.zone} Bengaluru</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Developer</span>
                  <span className="font-medium">{property.developer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                    {property.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}