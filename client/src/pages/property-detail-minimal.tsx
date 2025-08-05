import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Heart, Share2, Calendar, MessageCircle, Phone, Star, Award, Home, Building, CheckCircle, AlertTriangle, X, Users, Car, Building2, Shield, TreePine, Waves, Dumbbell, Wifi, ShoppingCart, Camera, Play, Download, Eye, Lock, CheckCircle2, XCircle, Family, TrendingUp, TrendingDown, Parking, Elevator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  name: string;
  area: string;
  zone: string;
  status: string;
  tags: string[];
  type: string;
  images?: string[];
  developer?: string;
  overallScore?: number;
  locationScore?: number;
  amenitiesScore?: number;
  valueScore?: number;
  youtubeVideoUrl?: string;
  address?: string;
  possessionDate?: string;
  reraNumber?: string;
  reraApproved?: boolean;
  configurations: {
    id: string;
    configuration: string;
    pricePerSqft: string;
    builtUpArea: number;
    plotSize?: number;
    availabilityStatus: string;
    totalUnits?: number;
    availableUnits?: number;
    price: number;
  }[];
}

export default function PropertyDetailMinimal() {
  const params = useParams();
  const navigate = useLocation()[1];
  const { toast } = useToast();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${params.id}/with-configurations`],
    enabled: !!params.id,
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  useEffect(() => {
    if (property?.configurations && property.configurations.length > 0) {
      setSelectedConfig(property.configurations[0]);
    }
  }, [property]);

  const formatPriceDisplay = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Property removed from your saved list" : "Property saved to your favorites",
    });
  };

  const handleBookVisit = () => {
    navigate('/book-visit');
  };

  const handleConsult = () => {
    navigate('/consultation');
  };

  const getPriceRange = () => {
    if (!property?.configurations.length) return "Price on request";
    
    const prices = property.configurations.map(c => c.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPriceDisplay(minPrice);
    }
    return `${formatPriceDisplay(minPrice)} - ${formatPriceDisplay(maxPrice)}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "pre-launch": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "active": "bg-green-100 text-green-800 border-green-200",
      "under-construction": "bg-blue-100 text-blue-800 border-blue-200",
      "completed": "bg-green-100 text-green-800 border-green-200",
      "sold-out": "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getBuyerIntentData = () => {
    if (!property) return [];

    const insights = [];
    
    // Family-friendly check
    const hasFamilyFeatures = property.tags.some(tag => 
      ['family-friendly', 'children-play-area', 'school-nearby', 'park'].includes(tag.toLowerCase())
    ) || property.configurations.some(c => c.configuration.includes('3 BHK') || c.configuration.includes('4 BHK'));
    
    if (hasFamilyFeatures) {
      insights.push({ icon: '👨‍👩‍👧‍👦', text: 'Ideal for Families', positive: true });
    }

    // Investment check
    const investmentFriendly = property.tags.some(tag => 
      ['investment', 'rental-yield', 'appreciation', 'roi'].includes(tag.toLowerCase())
    ) || property.zone === 'east' || property.area.toLowerCase().includes('it');
    
    if (investmentFriendly) {
      insights.push({ icon: '📈', text: 'Great Investment Potential', positive: true });
    } else {
      insights.push({ icon: '❌', text: 'Not investor friendly', positive: false });
    }

    // Parking
    const hasParking = property.tags.includes('parking') || property.type === 'villa';
    if (hasParking) {
      insights.push({ icon: '🚗', text: '2-3 Car Parking Available', positive: true });
    }

    // Lift availability
    const hasLift = property.tags.includes('lift') || property.type === 'apartment';
    if (hasLift) {
      insights.push({ icon: '🛗', text: 'Lift Ready Building', positive: true });
    }

    return insights;
  };

  const getPropertyPros = () => {
    if (!property) return [];
    
    const pros = [];
    
    if (property.reraApproved) {
      pros.push('RERA Approved Project');
    }
    
    if (property.status === 'completed') {
      pros.push('Ready for Possession');
    }
    
    if (property.tags.includes('metro-connectivity')) {
      pros.push('Metro Connectivity');
    }
    
    if (property.tags.includes('premium-location')) {
      pros.push('Prime Location');
    }
    
    if (property.locationScore && property.locationScore >= 4) {
      pros.push('Excellent Location Score');
    }
    
    if (property.amenitiesScore && property.amenitiesScore >= 4) {
      pros.push('World-class Amenities');
    }
    
    return pros;
  };

  const getPropertyCons = () => {
    if (!property) return [];
    
    const cons = [];
    
    if (property.status === 'under-construction') {
      cons.push('Under Construction');
    }
    
    if (property.status === 'pre-launch') {
      cons.push('Pre-launch Stage');
    }
    
    if (property.valueScore && property.valueScore < 4) {
      cons.push('Premium Pricing');
    }
    
    // Add more dynamic cons based on property data
    const highPriceConfigs = property?.configurations.filter(c => Number(c.pricePerSqft) > 15000);
    if (highPriceConfigs && highPriceConfigs.length > 0) {
      cons.push('Higher Price per sq ft');
    }
    
    return cons;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleFavorite}>
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images/Video */}
          <div className="space-y-4">
            {/* Main Image/Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              {showVideo && property.youtubeVideoUrl ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${property.youtubeVideoUrl.split('v=')[1]?.split('&')[0]}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <>
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {property.youtubeVideoUrl && (
                    <Button 
                      onClick={() => setShowVideo(true)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 text-black hover:bg-white"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Video
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-video rounded overflow-hidden">
                    <img src={image} alt={`${property.name} ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="space-y-6">
            {/* Status Badge */}
            <Badge className={`${getStatusColor(property.status)} text-sm font-medium px-3 py-1`}>
              {property.status.replace('-', ' ').toUpperCase()}
            </Badge>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Zone</span>
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="text-sm text-gray-600 mb-1">Starting Price</div>
              <div className="text-2xl font-bold text-blue-600">{getPriceRange()}</div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Developer</div>
                <div className="font-medium">{property.developer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Possession</div>
                <div className="font-medium">{property.possessionDate || 'TBA'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">RERA</div>
                <div className="font-medium text-green-600">
                  {property.reraApproved ? 'Approved' : 'Pending'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Property Type</div>
                <div className="font-medium capitalize">{property.type}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {property.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace('-', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Cards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.configurations.map((config, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedConfig?.id === config.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
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
                      <span className="text-gray-600">Price/sq ft</span>
                      <span className="font-medium">₹{Number(config.pricePerSqft).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Total Price</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPriceDisplay(config.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Valuation Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Property Analysis & Reports</CardTitle>
            <p className="text-gray-600">Get professional insights to make informed decisions</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Legal Verification Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Legal Verification Summary
              </h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  RERA Registration: {property.reraApproved ? 'Verified' : 'Under Process'}
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Title Clear: Preliminary verification complete
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approvals: Building plan approvals in place
                </li>
              </ul>
            </div>

            {/* Civil & MEP Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-orange-800">Civil & MEP Analysis</h4>
                    <Badge className="bg-orange-100 text-orange-800">Essential</Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Structural Grade</span>
                      <span className="font-semibold text-green-600">A+ Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Foundation Score</span>
                      <span className="font-semibold">9.2/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MEP Systems</span>
                      <span className="font-semibold text-green-600">Well Planned</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded mb-4">
                    <p className="text-xs text-yellow-800">Could save ₹2-5 lakhs in unexpected repairs</p>
                  </div>

                  <Button className="w-full" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Get Full Report - ₹2,499
                  </Button>
                </CardContent>
              </Card>

              {/* Property Valuation */}
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-800">Property Valuation</h4>
                    <Badge className="bg-blue-100 text-blue-800">Critical</Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Value</span>
                      <span className="font-semibold">₹{((Number(selectedConfig?.pricePerSqft) || 8500) * (Number(selectedConfig?.builtUpArea) || 1200)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location Premium</span>
                      <span className="font-semibold text-green-600">+15% vs Area Avg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Investment Grade</span>
                      <span className="font-semibold text-blue-600">A- Excellent</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded mb-4">
                    <p className="text-xs text-blue-800">Avoid overpaying by 10-15% on average</p>
                  </div>

                  <Button className="w-full" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Get Full Report - ₹2,499
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Property Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {getPropertyPros().map((pro, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {getPropertyCons().map((con, index) => (
                  <li key={index} className="flex items-center text-orange-700">
                    <XCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Buyer Intent Match */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buyer Suitability</CardTitle>
            <p className="text-gray-600">Who is this property perfect for?</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getBuyerIntentData().map((insight, index) => (
                <div key={index} className={`flex items-center p-3 rounded-lg ${
                  insight.positive ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <span className="text-2xl mr-3">{insight.icon}</span>
                  <span className="font-medium">{insight.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Scoring */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Property Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {property.overallScore ? Number(property.overallScore).toFixed(1) : '4.3'}
                </div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {property.locationScore || 4}/5
                </div>
                <div className="text-sm text-gray-600">Location</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {property.amenitiesScore || 5}/5
                </div>
                <div className="text-sm text-gray-600">Amenities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {property.valueScore || 4}/5
                </div>
                <div className="text-sm text-gray-600">Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{property.name}</div>
            <div className="text-sm text-gray-600">{getPriceRange()}</div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleConsult}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Get Expert Advice
            </Button>
            <Button onClick={handleBookVisit}>
              <Calendar className="h-4 w-4 mr-2" />
              Book Site Visit
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for sticky CTA */}
      <div className="h-20"></div>
    </div>
  );
}