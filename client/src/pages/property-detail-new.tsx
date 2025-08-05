import { useParams, useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Heart, Share2, Calendar, MessageCircle, Phone, Star, Award, Home, Building, CheckCircle, Shield, TreePine, Car, Waves, Dumbbell, Users, Zap, Wifi, ShoppingCart, Info, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
  configurations: {
    id: string;
    configuration: string;
    pricePerSqft: string;
    builtUpArea: number;
  }[];
}

export default function PropertyDetail() {
  const params = useParams();
  const navigate = useLocation()[1];
  const { toast } = useToast();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

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

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.name,
          text: `Check out ${property.name} in ${property.area}, ${property.zone}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Property link copied to clipboard",
      });
    }
  };

  const handleBookVisit = () => {
    navigate('/book-visit');
  };

  const handleConsult = () => {
    navigate('/consultation');
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Hi! I'm interested in ${property?.name} located in ${property?.area}, ${property?.zone}. Can you provide more details?`);
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  const getSimilarProperties = () => {
    if (!property || !properties.length) return [];
    
    const currentProperty = property;
    const otherProperties = properties.filter(p => p.id !== currentProperty.id);
    
    const scoredProperties = otherProperties.map(prop => {
      let score = 0;
      
      // Zone match (30 points)
      if (prop.zone === currentProperty.zone) score += 30;
      
      // Area match (25 points)
      if (prop.area === currentProperty.area) score += 25;
      
      // Type match (20 points)
      if (prop.type === currentProperty.type) score += 20;
      
      // Status match (15 points)
      if (prop.status === currentProperty.status) score += 15;
      
      // Tag overlap (up to 25 points)
      const commonTags = prop.tags.filter(tag => currentProperty.tags.includes(tag));
      score += Math.min(commonTags.length * 5, 25);
      
      // Price range similarity (if configurations available - up to 20 points)
      if (property.configurations.length > 0) {
        const currentPrices = property.configurations.map(c => {
          const pricePerSqft = parseFloat(c.pricePerSqft.toString());
          const builtUpArea = c.builtUpArea;
          return pricePerSqft * builtUpArea;
        });
        const currentAvgPrice = currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length;
        
        // This is a simplified scoring - in production you'd fetch all configurations
        // For now, we'll give some points for being in same general area
        if (prop.zone === currentProperty.zone) score += 10;
      }
      
      return { property: prop, score };
    });
    
    // Sort by score and return top 3
    return scoredProperties
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.property);
  };

  const similarProperties = getSimilarProperties();

  const getPriceRange = () => {
    if (!property?.configurations.length) {
      // Show default pricing if no configurations available
      return "₹45 L - ₹2.5 Cr";
    }
    
    // Calculate actual prices using pricePerSqft * builtUpArea
    const prices = property.configurations.map(c => {
      const pricePerSqft = parseFloat(c.pricePerSqft.toString());
      const builtUpArea = c.builtUpArea;
      return pricePerSqft * builtUpArea;
    });
    
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

  const amenityIcons = {
    "Swimming Pool": Waves,
    "Gymnasium": Dumbbell,
    "Club House": Users,
    "Children's Play Area": Users,
    "Landscaped Gardens": TreePine,
    "24/7 Security": Shield,
    "Power Backup": Zap,
    "Covered Parking": Car,
    "Wi-Fi": Wifi,
    "Shopping Center": ShoppingCart,
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

  if (error) {
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

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/find-property')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 border hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed top-6 right-6 z-50 flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleFavorite}
          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 border hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleShare}
          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 border hover:bg-white"
        >
          <Share2 className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60">
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-6 pb-20">
            <div className="max-w-3xl">
              {/* Property Status Badge */}
              <div className="mb-4">
                <Badge className={`${getStatusColor(property.status)} text-sm font-medium px-3 py-1`}>
                  {property.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Property Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {property.name}
              </h1>

              {/* Location */}
              <div className="flex items-center text-white/90 text-xl mb-6">
                <MapPin className="h-6 w-6 mr-3" />
                <span>{property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Zone</span>
              </div>

              {/* Key Features */}
              <div className="flex flex-wrap gap-3 mb-8">
                {property.tags.slice(0, 4).map((tag) => (
                  <div key={tag} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    {tag.replace('-', ' ').toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="text-white mb-8">
                <div className="text-lg text-white/80 mb-1">Starting Price</div>
                <div className="text-4xl font-bold">{getPriceRange()}</div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={handleBookVisit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Visit
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleConsult}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 px-8 py-3 text-lg font-semibold rounded-full"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Get Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery Thumbnails */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex space-x-2 justify-center">
              {property.images.slice(0, 5).map((image, index) => (
                <button
                  key={index}
                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/50 hover:border-white transition-all"
                >
                  <img src={image} alt={`${property.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {property.images.length > 5 && (
                <div className="w-16 h-16 rounded-lg bg-black/50 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white font-semibold">
                  +{property.images.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="relative -mt-20 z-10">
        {/* Property Configurations Card */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6">Available Units</h2>
              {property.configurations && property.configurations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {property.configurations.map((config, index) => (
                    <div 
                      key={index} 
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                        selectedConfig?.id === config.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedConfig(config)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">{config.configuration}</h3>
                        <Badge variant="outline" className="text-sm">
                          {config.configuration}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Built-up Area</span>
                          <span className="font-semibold">{config.builtUpArea} sq ft</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Price/sq ft</span>
                          <span className="font-semibold">₹{Number(config.pricePerSqft).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">Total Price</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatPriceDisplay(Number(config.pricePerSqft) * config.builtUpArea)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Configuration details coming soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Property Overview */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">About {property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Discover luxury living at {property.name}, located in the prestigious {property.area} area of {property.zone} zone. This premium development offers world-class amenities and modern architecture designed for the discerning homeowner.
                  </p>
                </CardContent>
              </Card>

              {/* Location Details */}
              <Card className="shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Location Advantages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <div className="font-semibold">Prime Location</div>
                        <div className="text-gray-600">{property.area}, {property.zone} Zone, Bengaluru</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Developer Info */}
              {property.developer && (
                <Card className="shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Developer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {property.developer.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xl font-semibold">{property.developer}</div>
                        <div className="text-gray-600">Trusted Developer</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="shadow-xl rounded-2xl sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl">Get More Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg" onClick={handleBookVisit}>
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Site Visit
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" onClick={handleConsult}>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Expert Consultation
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" onClick={handleWhatsAppShare}>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp Inquiry
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Speak to our property consultant</p>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-5 w-5 mr-2" />
                      +91 98765 43210
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Property Score */}
              <Card className="shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Property Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl text-yellow-500 font-bold">
                      {property.overallScore ? Number(property.overallScore).toFixed(1) : '4.3'}
                    </div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Location</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${star <= (property.locationScore || 4) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amenities</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${star <= (property.amenitiesScore || 5) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Value</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${star <= (property.valueScore || 4) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Professional Reports Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Professional Property Reports
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make informed decisions with our comprehensive analysis reports. Get insights that could save you thousands.
              </p>
              <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Professional Analysis
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Instant Download
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Expert Recommendations
                </div>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Civil + MEP Report */}
              <Card className="shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Civil + MEP Engineering Report</h3>
                    <Badge className="bg-red-100 text-red-800 pulse">Essential</Badge>
                  </div>
                  <p className="text-gray-600 mb-6">Avoid costly surprises with our comprehensive structural and MEP systems evaluation.</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Structural Grade</span>
                      <span className="font-semibold text-green-600">A+ Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Foundation Score</span>
                      <span className="font-semibold">9.2/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Assessment</span>
                      <span className="font-semibold text-green-600">Low Risk</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-yellow-800">Could save ₹2-5 lakhs in unexpected repairs</p>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Get Report for ₹2,499
                  </Button>
                </CardContent>
              </Card>

              {/* Property Valuation Report */}
              <Card className="shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Professional Property Valuation</h3>
                    <Badge className="bg-blue-100 text-blue-800">Critical</Badge>
                  </div>
                  <p className="text-gray-600 mb-6">Ensure you're paying the right price with our expert valuation and investment analysis.</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Value</span>
                      <span className="font-semibold">₹{((Number(selectedConfig?.pricePerSqft) || 8500) * (Number(selectedConfig?.builtUpArea) || 1200)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location Premium</span>
                      <span className="font-semibold text-green-600">+15% vs Area Avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment Grade</span>
                      <span className="font-semibold text-blue-600">A- Excellent</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">Avoid overpaying by 10-15% on average</p>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Get Report for ₹2,499
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <Card className="shadow-xl rounded-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Why Property Buyers Trust Our Reports</h3>
                  <p className="text-gray-600">Join 2,500+ smart property buyers who made informed decisions</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">2,500+</div>
                    <div className="text-gray-600">Properties Analyzed</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">₹12 Cr+</div>
                    <div className="text-gray-600">Saved for Clients</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600">98%</div>
                    <div className="text-gray-600">Client Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-3xl font-bold mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((similarProperty) => (
                <Card 
                  key={similarProperty.id} 
                  className="shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/property/${similarProperty.id}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-lg">{similarProperty.name}</h4>
                      <Badge className={getStatusColor(similarProperty.status)} variant="outline">
                        {similarProperty.status.replace('-', ' ').charAt(0).toUpperCase() + similarProperty.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 flex items-center mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {similarProperty.area}, {similarProperty.zone}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {similarProperty.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag.replace("-", " ").charAt(0).toUpperCase() + tag.slice(1)}
                          </Badge>
                        ))}
                      </div>
                      <p className="font-semibold text-blue-600">
                        {similarProperty.type.charAt(0).toUpperCase() + similarProperty.type.slice(1)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}