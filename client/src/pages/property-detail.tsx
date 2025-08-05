import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, MapPin, Calendar, IndianRupee, Building, Users, 
  Star, Heart, Share2, Phone, MessageCircle, CheckCircle, 
  Info, Award, Shield, TrendingUp, Clock, Eye, Camera,
  Bed, Bath, Car, TreePine, Dumbbell, ShoppingCart, Wifi,
  Waves, Zap, Home, ExternalLink, Download, ChevronLeft, ChevronRight, Play, BarChart3,
  TrendingUp as TrendingUpIcon, Lock, Unlock, FileText, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { formatPriceDisplay } from "@/lib/utils";
import { type Property, type PropertyConfiguration } from "@shared/schema";


import { Skeleton, PropertyDetailHeaderSkeleton } from "@/components/ui/skeleton";

interface PropertyWithConfigurations extends Property {
  configurations: PropertyConfiguration[];
}

// Helper function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
};



export default function PropertyDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/property/:id");
  const [selectedConfig, setSelectedConfig] = useState<PropertyConfiguration | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');

  const propertyId = params?.id;

  // Fetch property with configurations
  const { data: property, isLoading } = useQuery<PropertyWithConfigurations>({
    queryKey: ["/api/properties", propertyId, "with-configurations"],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/with-configurations`);
      if (!response.ok) {
        throw new Error("Property not found");
      }
      return response.json();
    },
    enabled: !!propertyId,
  });

  // Fetch all properties for similar properties logic
  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // Set default selected configuration
  useEffect(() => {
    if (property?.configurations.length && !selectedConfig) {
      setSelectedConfig(property.configurations[0]);
    }
  }, [property, selectedConfig]);

  const handleBookVisit = () => {
    navigate('/book-visit', { state: { property, configuration: selectedConfig } });
  };

  const handleConsult = () => {
    navigate('/consultation', { state: { property, configuration: selectedConfig } });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would save to user preferences
  };

  const handleShare = async () => {
    if (!property) return;
    
    const propertyUrl = window.location.href;
    const shareText = `🏠 *${property.name}*\n📍 ${property.area}, ${property.zone} Bengaluru\n🏗️ By ${property.developer}\n💰 ${getPriceRange()}\n\nView details: ${propertyUrl}`;
    
    const shareData = {
      title: `${property.name} - Property in ${property.area}, ${property.zone} Bengaluru`,
      text: shareText,
      url: propertyUrl
    };

    try {
      // Try native Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(propertyUrl);
      alert('Property link copied to clipboard!');
    } catch (error) {
      // Final fallback: Manual copy
      const textArea = document.createElement('textarea');
      textArea.value = propertyUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Property link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    if (!property) return;
    
    const propertyUrl = window.location.href;
    const whatsappText = `🏠 *${property.name}*\n📍 ${property.area}, ${property.zone} Bengaluru\n🏗️ By ${property.developer}\n💰 ${getPriceRange()}\n\nView details: ${propertyUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Calculate similar properties with scoring algorithm
  const getSimilarProperties = () => {
    if (!property || !allProperties.length) return [];
    
    const currentProperty = property;
    const otherProperties = allProperties.filter(p => p.id !== currentProperty.id);
    
    const scoredProperties = otherProperties.map(prop => {
      let score = 0;
      
      // Zone match (highest priority - 40 points)
      if (prop.zone === currentProperty.zone) score += 40;
      
      // Property type match (30 points)
      if (prop.type === currentProperty.type) score += 30;
      
      // Developer match (20 points)
      if (prop.developer === currentProperty.developer) score += 20;
      
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
    if (!property?.configurations.length) return "Price on request";
    
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

  const getTagIcon = (tag: string) => {
    const icons = {
      "rera-approved": Shield,
      "gated-community": Home,
      "premium": Star,
      "golf-course": TreePine,
      "eco-friendly": TreePine,
      "metro-connectivity": Car,
      "it-hub-proximity": Building,
      "swimming-pool": Waves,
      "gym": Dumbbell,
      "club-house": Users,
      "parking": Car,
      "power-backup": Zap,
      "wifi": Wifi,
    };
    return icons[tag as keyof typeof icons] || Info;
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
      <div className="min-h-screen bg-gray-50">
        <PropertyDetailHeaderSkeleton />
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Media Gallery Skeleton */}
          <div className="bg-white rounded-lg overflow-hidden">
            <Skeleton className="h-96 w-full" />
            <div className="p-4 flex space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded" />
              ))}
            </div>
          </div>
          
          {/* Content Tabs Skeleton */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex space-x-4 border-b pb-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
    <div className="min-h-screen bg-background">
      {/* Header - Stripe Style */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="container-stripe py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 rounded-xl focus-stripe transition-stripe hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-body font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-heading-2 text-foreground mb-1">{property.name}</h1>
                <p className="text-body-small text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.area}, {property.zone} Bengaluru
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={toggleFavorite}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleBookVisit}>
                <Eye className="h-4 w-4 mr-2" />
                Book Visit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Image Gallery */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Media - Combined Video and Image Slider */}
            <div className="lg:col-span-2">
              {(() => {
                // Combine video and images into single media array
                const mediaItems = [];
                if (property.youtubeVideoUrl) {
                  mediaItems.push({ type: 'video', url: property.youtubeVideoUrl });
                }
                if (property.images && property.images.length > 0) {
                  property.images.forEach(image => {
                    mediaItems.push({ type: 'image', url: image });
                  });
                }
                
                // If no media, show placeholder
                if (mediaItems.length === 0) {
                  return (
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Camera className="h-16 w-16 mx-auto mb-4" />
                          <p className="text-xl font-medium">Property Media</p>
                          <p className="text-sm">Photos and videos coming soon</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                const currentMedia = mediaItems[activeMediaIndex];
                
                return (
                  <div className="relative">
                    {/* Main Media Display */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                      {currentMedia.type === 'video' ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeVideoId(currentMedia.url)}`}
                          title="Property Overview Video"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <img 
                          src={currentMedia.url} 
                          alt={`Property view ${activeMediaIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Navigation Arrows */}
                      {mediaItems.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setActiveMediaIndex(activeMediaIndex === 0 ? mediaItems.length - 1 : activeMediaIndex - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setActiveMediaIndex(activeMediaIndex === mediaItems.length - 1 ? 0 : activeMediaIndex + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Media Type Indicator */}
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          {currentMedia.type === 'video' ? (
                            <><Play className="h-3 w-3 mr-1" /> Video</>
                          ) : (
                            <><Camera className="h-3 w-3 mr-1" /> Photo {activeMediaIndex + (property.youtubeVideoUrl ? 0 : 1)}</>
                          )}
                        </Badge>
                      </div>
                      
                      {/* Media Counter */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          {activeMediaIndex + 1} / {mediaItems.length}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {mediaItems.length > 1 && (
                      <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                        {mediaItems.map((media, index) => (
                          <button
                            key={index}
                            className={`flex-shrink-0 relative w-20 h-12 rounded border-2 overflow-hidden ${
                              index === activeMediaIndex ? 'border-primary' : 'border-gray-200'
                            }`}
                            onClick={() => setActiveMediaIndex(index)}
                          >
                            {media.type === 'video' ? (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                <Play className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <img 
                                src={media.url} 
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Property Quick Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Info</CardTitle>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price Range</span>
                    <span className="font-medium text-primary">{getPriceRange()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Developer</span>
                    <span className="font-medium">{property.developer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Property Type</span>
                    <span className="font-medium capitalize">{property.type}</span>
                  </div>
                  {property.possessionDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Possession</span>
                      <span className="font-medium">{property.possessionDate}</span>
                    </div>
                  )}
                  {property.reraApproved && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">RERA</span>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">Approved</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleBookVisit} className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Book Visit
                    </Button>
                    <Button variant="outline" onClick={handleConsult} className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Consult
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now: +91 98765 43210
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Selector */}
            {property.configurations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Available Configurations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {property.configurations.map((config) => (
                      <button
                        key={config.id}
                        onClick={() => setSelectedConfig(config)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedConfig?.id === config.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-lg">{config.configuration}</div>
                        <div className="text-sm text-gray-600">{config.builtUpArea.toLocaleString()} sq ft</div>
                        <div className="text-primary font-bold">{formatPriceDisplay(parseFloat(config.pricePerSqft.toString()) * config.builtUpArea)}</div>
                        <Badge variant="outline" className="mt-2">
                          {config.availabilityStatus}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Configuration Details */}
            {selectedConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Details - {selectedConfig.configuration}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium">{selectedConfig.builtUpArea.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Built-up Area</div>
                    </div>
                    {selectedConfig.plotSize && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-medium">{selectedConfig.plotSize.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Plot Size</div>
                      </div>
                    )}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <IndianRupee className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium">₹{selectedConfig.pricePerSqft}</div>
                      <div className="text-sm text-gray-600">Per Sq Ft</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium">{selectedConfig.availableUnits || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Available Units</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Details Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="legal">Legal</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">About {property.name}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {property.name} is a premium {property.type} project by {property.developer} 
                        located in the heart of {property.area}, {property.zone} Bengaluru. 
                        This {property.status} project offers modern living with world-class amenities 
                        and excellent connectivity to major IT hubs and commercial centers.
                      </p>
                    </div>
                    
                    {property.infrastructureVerdict && (
                      <div>
                        <h4 className="font-medium mb-2">Infrastructure Assessment</h4>
                        <p className="text-gray-600">{property.infrastructureVerdict}</p>
                      </div>
                    )}

                    {property.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Key Features</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {property.tags.map((tag) => {
                            const IconComponent = getTagIcon(tag);
                            return (
                              <div key={tag} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                <IconComponent className="h-4 w-4 text-primary" />
                                <span className="text-sm capitalize">{tag.replace('-', ' ')}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(amenityIcons).map(([amenity, IconComponent]) => (
                        <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="p-6 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Address</h4>
                      <p className="text-gray-600">{property.address}</p>
                    </div>
                    
                    {property.zoningInfo && (
                      <div>
                        <h4 className="font-medium mb-2">Zoning Information</h4>
                        <p className="text-gray-600">{property.zoningInfo}</p>
                      </div>
                    )}

                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p>Interactive Map Coming Soon</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="legal" className="p-4 space-y-4">
                    {/* Legal Verdict Badge */}
                    {property.legalVerdictBadge && (
                      <Card className="bg-success/10 border-success/20">
                        <CardContent className="p-3">
                          <div className="flex items-center text-success">
                            <Shield className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">{property.legalVerdictBadge}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Title and Ownership */}
                      <Card className="card-stripe">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-primary" />
                            Title & Ownership
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          {property.titleClearanceStatus && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Title Clearance</span>
                              <Badge variant={property.titleClearanceStatus === 'Clear' ? 'default' : property.titleClearanceStatus === 'Pending' ? 'secondary' : 'destructive'} className="text-xs">
                                {property.titleClearanceStatus}
                              </Badge>
                            </div>
                          )}
                          {property.ownershipType && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Ownership Type</span>
                              <span className="text-xs font-medium">{property.ownershipType}</span>
                            </div>
                          )}
                          {property.legalOpinionProvidedBy && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Legal Opinion By</span>
                              <span className="text-xs font-medium">{property.legalOpinionProvidedBy}</span>
                            </div>
                          )}
                          {property.titleFlowSummary && (
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">Title Flow Summary</span>
                              <p className="text-xs bg-muted/30 p-2 rounded-md">{property.titleFlowSummary}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* RERA Compliance */}
                      <Card className="card-stripe">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            RERA Compliance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">RERA Registered</span>
                            <div className="flex items-center">
                              <CheckCircle className={`h-3 w-3 mr-1 ${property.reraRegistered ? 'text-success' : 'text-muted'}`} />
                              <span className={`text-xs ${property.reraRegistered ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                                {property.reraRegistered ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                          {property.reraID && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">RERA ID</span>
                              <span className="font-mono text-xs bg-muted/30 px-1 py-0.5 rounded">{property.reraID}</span>
                            </div>
                          )}
                          {property.reraLink && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">RERA Record</span>
                              <Button variant="outline" size="sm" className="h-6 text-xs" asChild>
                                <a href={property.reraLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-2 w-2 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Documentation & Encumbrance */}
                      <Card className="card-stripe">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Info className="h-4 w-4 mr-2 text-warning" />
                            Documentation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          {property.encumbranceStatus && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Encumbrance Status</span>
                              <span className="text-xs text-right max-w-40">{property.encumbranceStatus}</span>
                            </div>
                          )}
                          {property.mutationStatus && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Mutation Status</span>
                              <span className="text-xs text-right max-w-40">{property.mutationStatus}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">DC Conversion</span>
                            <div className="flex items-center">
                              <CheckCircle className={`h-3 w-3 mr-1 ${property.conversionCertificate ? 'text-success' : 'text-muted'}`} />
                              <span className={`text-xs ${property.conversionCertificate ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                                {property.conversionCertificate ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {property.ecExtractLink && (
                              <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs" asChild>
                                <a href={property.ecExtractLink} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3 mr-1" />
                                  EC Extract
                                </a>
                              </Button>
                            )}
                            {property.layoutSanctionCopyLink && (
                              <Button variant="outline" size="sm" className="w-full justify-start h-7 text-xs" asChild>
                                <a href={property.layoutSanctionCopyLink} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3 mr-1" />
                                  Layout Approval
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Approvals & Litigation */}
                      <Card className="card-stripe">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Building className="h-4 w-4 mr-2 text-primary" />
                            Approvals & Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          {property.litigationStatus && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Litigation Status</span>
                              <span className="text-xs text-right max-w-40">{property.litigationStatus}</span>
                            </div>
                          )}
                          {property.approvingAuthorities && property.approvingAuthorities.length > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">Approving Authorities</span>
                              <div className="flex flex-wrap gap-1">
                                {property.approvingAuthorities.map((authority, index) => (
                                  <Badge key={index} variant="outline" className="text-xs h-5">
                                    {authority}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Legal Comments */}
                    {property.legalComments && (
                      <Card className="card-stripe">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                            Legal Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground italic">{property.legalComments}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Professional Reports Section - Action-Provoking Design */}
            <div className="space-y-8 mt-8">
              {/* Section Header */}
              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Professional Property Reports
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Make informed decisions with our comprehensive analysis reports. Get insights that could save you thousands.
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Professional Analysis
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Instant Download
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Expert Recommendations
                  </div>
                </div>
              </div>

              {/* Report Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Civil + MEP Report */}
                <div className="relative">
                  <ReportCard 
                    reportType="civil-mep"
                    propertyId={property.id}
                    propertyName={property.name}
                    price={2499}
                    title="Civil + MEP Engineering Report"
                    subtitle="Structural & Systems Analysis"
                    description="Avoid costly surprises with our comprehensive structural and MEP systems evaluation."
                    urgencyText="Essential before finalizing any property purchase"
                    features={[
                      "Structural integrity assessment",
                      "Foundation stability analysis", 
                      "Electrical systems safety check",
                      "Plumbing infrastructure review",
                      "HVAC efficiency evaluation",
                      "Maintenance cost estimation"
                    ]}
                    sampleData={{
                      "Structural Grade": "A+ Excellent",
                      "Foundation Score": "9.2/10",
                      "Electrical Safety": "Fully Compliant",
                      "Plumbing Status": "Good Condition",
                      "HVAC Efficiency": "85% Optimal",
                      "Risk Assessment": "Low Risk"
                    }}
                    highlights={[
                      "Could save ₹2-5 lakhs in unexpected repairs",
                      "Identifies safety issues before move-in",
                      "Provides negotiation leverage with seller"
                    ]}
                  />
                </div>

                {/* Property Valuation Report */}
                <div className="relative">
                  <ReportCard 
                    reportType="property-valuation"
                    propertyId={property.id}
                    propertyName={property.name}
                    price={2499}
                    title="Professional Property Valuation"
                    subtitle="Independent Market Analysis"
                    description="Ensure you're paying the right price with our expert valuation and investment analysis."
                    urgencyText="Critical for smart investment decisions"
                    features={[
                      "Current market value assessment",
                      "Comparable properties analysis",
                      "Location premium calculation",
                      "Future appreciation forecast",
                      "Rental yield projections",
                      "Investment risk evaluation"
                    ]}
                    sampleData={{
                      "Market Value": `₹${((Number(selectedConfig?.pricePerSqft) || 8500) * (Number(selectedConfig?.builtUpArea) || 1200)).toLocaleString()}`,
                      "Price Per Sq Ft": `₹${Number(selectedConfig?.pricePerSqft) || 8500}`,
                      "Location Premium": "+15% vs Area Avg",
                      "Annual Appreciation": "8.2% Expected",
                      "Rental Yield": "3.4% Annually",
                      "Investment Grade": "A- Excellent"
                    }}
                    highlights={[
                      "Avoid overpaying by 10-15% on average",
                      "Identifies best ROI potential areas",
                      "Professional bank-grade valuation"
                    ]}
                  />
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-white border rounded-xl p-6 mt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Why Property Buyers Trust Our Reports</h3>
                  <p className="text-gray-600">Join 2,500+ smart property buyers who made informed decisions</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">2,500+</div>
                    <div className="text-sm text-gray-600">Properties Analyzed</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">₹12 Cr+</div>
                    <div className="text-sm text-gray-600">Saved for Clients</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-purple-600">98%</div>
                    <div className="text-sm text-gray-600">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleBookVisit}>
                  <Eye className="h-4 w-4 mr-2" />
                  Schedule Site Visit
                </Button>
                <Button variant="outline" className="w-full" onClick={handleConsult}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Expert Consultation
                </Button>
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Speak to our property consultant</p>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    +91 98765 43210
                  </Button>
                </div>
              </CardContent>
            </Card>







            {/* Property Score Widget */}
            <Card className="card-stripe">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-foreground flex items-center">
                  <Award className="h-4 w-4 mr-2 text-warning" />
                  Property Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <div className="text-center mb-2">
                  <div className="text-xl text-warning font-bold">
                    {property.overallScore ? Number(property.overallScore).toFixed(1) : (((property.locationScore || 4) + (property.amenitiesScore || 5) + (property.valueScore || 4)) / 3).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Rating</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= (property.locationScore || 4) ? 'text-warning fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Amenities</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= (property.amenitiesScore || 5) ? 'text-warning fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Value for Money</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= (property.valueScore || 4) ? 'text-warning fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison Widget */}
            <Card className="card-stripe">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-foreground flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Price Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-xs text-muted-foreground">This Property</div>
                  <div className="text-lg text-primary font-semibold">{getPriceRange()}</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground">Area Average</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {property.areaAvgPriceMin && property.areaAvgPriceMax 
                        ? `₹${property.areaAvgPriceMin}L - ₹${property.areaAvgPriceMax}L`
                        : "₹95L - ₹1.2Cr"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground">City Average</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {property.cityAvgPriceMin && property.cityAvgPriceMax 
                        ? `₹${property.cityAvgPriceMin}L - ₹${property.cityAvgPriceMax}L`
                        : "₹85L - ₹1.1Cr"
                      }
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center text-success text-xs font-medium">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {property.priceComparison || "12% below area average - Great value!"}
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Similar Properties - Dynamic */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Properties</CardTitle>
                <p className="text-sm text-gray-600">Based on location, type, and features</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {similarProperties.length > 0 ? (
                    similarProperties.map((similarProperty) => (
                      <div 
                        key={similarProperty.id} 
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/property/${similarProperty.id}`)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm line-clamp-1">{similarProperty.name}</h4>
                          <Badge className={getStatusColor(similarProperty.status)} variant="outline">
                            {similarProperty.status.replace('-', ' ').charAt(0).toUpperCase() + similarProperty.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 flex items-center mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {similarProperty.area}, {similarProperty.zone.charAt(0).toUpperCase() + similarProperty.zone.slice(1)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {similarProperty.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag.replace("-", " ").charAt(0).toUpperCase() + tag.slice(1)}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {similarProperty.type.charAt(0).toUpperCase() + similarProperty.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm">No similar properties found</p>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/find-property')}
                  >
                    View All Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


    </div>
  );
}

// Report Card Component with Payment Integration - Action-Provoking Design
interface ReportCardProps {
  reportType: 'civil-mep' | 'property-valuation';
  propertyId: string;
  propertyName: string;
  price: number;
  title: string;
  subtitle: string;
  description: string;
  urgencyText: string;
  features: string[];
  sampleData: Record<string, string>;
  highlights: string[];
}

function ReportCard({ reportType, propertyId, propertyName, price, title, subtitle, description, urgencyText, features, sampleData, highlights }: ReportCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has access to this report
  const { data: accessData } = useQuery({
    queryKey: ["/api/payments/reports/access", propertyId, reportType, customerInfo.email],
    queryFn: async () => {
      if (!customerInfo.email) return { hasAccess: false };
      const response = await fetch(`/api/payments/reports/access/${propertyId}/${reportType}?customerEmail=${customerInfo.email}`);
      if (!response.ok) return { hasAccess: false };
      return response.json();
    },
    enabled: !!customerInfo.email,
  });

  // Create payment order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/payments/reports/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment order');
      }
      return response.json();
    }
  });

  // Payment verification mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (verificationData: any) => {
      const response = await fetch('/api/payments/reports/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments/reports/access"] });
      setIsPaymentDialogOpen(false);
      toast({
        title: "Payment Successful!",
        description: `${title} has been unlocked. You now have full access to the report.`,
      });
    }
  });

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const orderData = await createOrderMutation.mutateAsync({
        propertyId,
        reportType,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone
      });

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Get Razorpay public key
      const keysResponse = await fetch('/api/settings/api-keys');
      const keysData = await keysResponse.json();
      
      if (!keysData.razorpayKeyId) {
        throw new Error('Razorpay is not configured. Please contact support.');
      }

      // Initialize Razorpay payment
      const options = {
        key: keysData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OwnItRight',
        description: `${title} - ${propertyName}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              propertyId,
              reportType,
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone
            });
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if payment was deducted.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const hasAccess = accessData?.hasAccess || false;

  return (
    <Card className="relative overflow-hidden border-2 hover:border-blue-200 transition-all duration-300 group">
      {/* Urgency Badge */}
      <div className="absolute top-4 right-4 z-10">
        {hasAccess ? (
          <Badge className="bg-green-500 text-white">
            <Unlock className="h-3 w-3 mr-1" />
            Unlocked
          </Badge>
        ) : (
          <Badge className="bg-orange-500 text-white pulse">
            <Clock className="h-3 w-3 mr-1" />
            Limited Time
          </Badge>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold mb-1">{title}</CardTitle>
            <p className="text-sm font-medium text-blue-600 mb-2">{subtitle}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            <div className="mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full inline-block">
              <p className="text-xs font-medium text-red-700">{urgencyText}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Insights Preview */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Report Insights</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(sampleData).slice(0, 6).map(([key, value]) => (
              <div key={key} className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
                <div className="text-xs font-medium text-gray-600 mb-1">{key}</div>
                <div className="text-sm font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
          {!hasAccess && (
            <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-orange-400">
              <p className="text-xs text-orange-700 font-medium flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Preview only - Full report contains 25+ detailed insights
              </p>
            </div>
          )}
        </div>

        {/* Value Propositions */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
            Why This Report Matters
          </h4>
          <div className="space-y-2">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 font-medium">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features List */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Complete Analysis Includes</h4>
          <div className="grid grid-cols-1 gap-1">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 py-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Section */}
        <div className="pt-4 border-t">
          {!hasAccess ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">₹{price.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">One-time payment • Instant access</div>
                </div>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold px-6 group-hover:scale-105 transition-transform"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Get Report Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Unlock {title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">
                          Get instant access to the complete {title.toLowerCase()} for {propertyName}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({...prev, name: e.target.value}))}
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
                            placeholder="Enter your email"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="text-xl font-bold">₹{price.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Secure payment via Razorpay</div>
                        </div>
                        <Button 
                          onClick={handlePayment}
                          disabled={isProcessing || !customerInfo.name || !customerInfo.email}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {isProcessing ? "Processing..." : "Pay Now"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">💳 Secure payment • 📱 Instant download • 🔒 100% confidential</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download Full Report
              </Button>
              <p className="text-xs text-green-600">✅ Report unlocked and ready for download</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}