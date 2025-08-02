import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, MapPin, Calendar, IndianRupee, Building, Users, 
  Star, Heart, Share2, Phone, MessageCircle, CheckCircle, 
  Info, Award, Shield, TrendingUp, Clock, Eye, Camera,
  Bed, Bath, Car, TreePine, Dumbbell, ShoppingCart, Wifi,
  Waves, Zap, Home, ExternalLink, Download, ChevronLeft, ChevronRight, Play, BarChart3,
  Target, CheckCircle2, AlertCircle, XCircle, TrendingUp as TrendingUpIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { formatPriceDisplay } from "@/lib/utils";
import { type Property, type PropertyConfiguration } from "@shared/schema";
import CivilMepSection from "@/components/property/civil-mep-section";
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

// Property Match Analysis Component
interface PropertyMatchAnalysisProps {
  property: PropertyWithConfigurations;
}

function PropertyMatchAnalysis({ property }: PropertyMatchAnalysisProps) {
  const [customerPreferences, setCustomerPreferences] = useState<any>(null);

  useEffect(() => {
    // Get customer search preferences from localStorage
    const searchPrefs = localStorage.getItem('searchPreferences');
    if (searchPrefs) {
      try {
        setCustomerPreferences(JSON.parse(searchPrefs));
      } catch (error) {
        console.error('Error parsing search preferences:', error);
      }
    }
  }, []);

  if (!customerPreferences) {
    return null; // Don't show if no search preferences found
  }

  // Calculate match score using weighted algorithm
  const calculateMatchScore = () => {
    let score = 0;
    const criteria = [];

    // Property Type Match (30% weight)
    if (customerPreferences.propertyType && customerPreferences.propertyType !== 'any') {
      if (property.type === customerPreferences.propertyType) {
        score += 30;
        criteria.push({ name: 'Property Type', status: 'perfect', points: 30, reason: `Exact match: ${property.type}` });
      } else {
        criteria.push({ name: 'Property Type', status: 'mismatch', points: 0, reason: `Looking for ${customerPreferences.propertyType}, found ${property.type}` });
      }
    }

    // Zone Match (25% weight)
    if (customerPreferences.zones && customerPreferences.zones.length > 0) {
      if (customerPreferences.zones.includes(property.zone)) {
        score += 25;
        criteria.push({ name: 'Location Zone', status: 'perfect', points: 25, reason: `Perfect zone match: ${property.zone}` });
      } else {
        criteria.push({ name: 'Location Zone', status: 'mismatch', points: 0, reason: `Preferred zones: ${customerPreferences.zones.join(', ')}, found: ${property.zone}` });
      }
    }

    // Budget Match (25% weight)
    if (customerPreferences.budgetRange) {
      const [minBudget, maxBudget] = customerPreferences.budgetRange;
      // Calculate price range from configurations
      const prices = property.configurations?.map((c: any) => c.price) || [];
      const propertyMinPrice = prices.length > 0 ? Math.min(...prices) / 100000 : 0; // Convert to lakhs
      const propertyMaxPrice = prices.length > 0 ? Math.max(...prices) / 100000 : 0;
      
      if (propertyMinPrice >= minBudget && propertyMaxPrice <= maxBudget) {
        score += 25;
        criteria.push({ name: 'Budget', status: 'perfect', points: 25, reason: `Within budget: ₹${minBudget}L - ₹${maxBudget}L` });
      } else if (propertyMinPrice <= maxBudget && propertyMaxPrice >= minBudget) {
        score += 15;
        criteria.push({ name: 'Budget', status: 'partial', points: 15, reason: `Partial overlap with budget: ₹${minBudget}L - ₹${maxBudget}L` });
      } else {
        criteria.push({ name: 'Budget', status: 'mismatch', points: 0, reason: `Budget ₹${minBudget}L - ₹${maxBudget}L vs Property ₹${propertyMinPrice}L - ₹${propertyMaxPrice}L` });
      }
    }

    // Tags/Features Match (15% weight)
    if (customerPreferences.tags && customerPreferences.tags.length > 0) {
      const propertyTags = property.tags || [];
      const matchingTags = customerPreferences.tags.filter((tag: string) => propertyTags.includes(tag));
      const tagScore = (matchingTags.length / customerPreferences.tags.length) * 15;
      score += tagScore;
      
      if (matchingTags.length > 0) {
        criteria.push({ 
          name: 'Features', 
          status: matchingTags.length === customerPreferences.tags.length ? 'perfect' : 'partial', 
          points: Math.round(tagScore), 
          reason: `${matchingTags.length}/${customerPreferences.tags.length} preferred features: ${matchingTags.join(', ')}` 
        });
      } else {
        criteria.push({ name: 'Features', status: 'mismatch', points: 0, reason: `None of your preferred features: ${customerPreferences.tags.join(', ')}` });
      }
    }

    // BHK Match (5% weight)
    if (customerPreferences.bhk && customerPreferences.bhk !== 'any') {
      // Check if any configuration matches the BHK preference
      const configurations = property.configurations || [];
      const hasMatchingBHK = configurations.some((config: any) => 
        config.configuration.toLowerCase().includes(customerPreferences.bhk.toLowerCase())
      );
      
      if (hasMatchingBHK) {
        score += 5;
        criteria.push({ name: 'Configuration', status: 'perfect', points: 5, reason: `${customerPreferences.bhk} configuration available` });
      } else {
        criteria.push({ name: 'Configuration', status: 'mismatch', points: 0, reason: `Looking for ${customerPreferences.bhk}, other configurations available` });
      }
    }

    return { score: Math.round(score), criteria };
  };

  const { score, criteria } = calculateMatchScore();

  // Determine match level and styling
  const getMatchLevel = (score: number) => {
    if (score >= 80) return { level: 'Great Match', bgColor: 'bg-green-50 border-green-200', textColor: 'text-green-800', iconColor: 'text-green-600' };
    if (score >= 60) return { level: 'Good Match', bgColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-800', iconColor: 'text-blue-600' };
    if (score >= 40) return { level: 'Fair Match', bgColor: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-800', iconColor: 'text-yellow-600' };
    return { level: 'Partial Match', bgColor: 'bg-orange-50 border-orange-200', textColor: 'text-orange-800', iconColor: 'text-orange-600' };
  };

  const matchInfo = getMatchLevel(score);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'perfect': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'mismatch': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card className={`border-2 ${matchInfo.bgColor} ${matchInfo.textColor}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-white`}>
                <Target className={`h-6 w-6 ${matchInfo.iconColor}`} />
              </div>
              <div>
                <CardTitle className={`text-xl ${matchInfo.textColor}`}>
                  {matchInfo.level} ({score}/100)
                </CardTitle>
                <p className="text-sm opacity-80 mt-1">
                  Based on your search preferences from {new Date(customerPreferences.timestamp || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${matchInfo.textColor}`}>{score}%</div>
              <Progress value={score} className="w-20 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-gray-700">Your Search Criteria:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {customerPreferences.propertyType && customerPreferences.propertyType !== 'any' && (
                <Badge variant="outline">Type: {customerPreferences.propertyType}</Badge>
              )}
              {customerPreferences.zones && customerPreferences.zones.length > 0 && (
                <Badge variant="outline">Zones: {customerPreferences.zones.join(', ')}</Badge>
              )}
              {customerPreferences.budgetRange && (
                <Badge variant="outline">Budget: ₹{customerPreferences.budgetRange[0]}L - ₹{customerPreferences.budgetRange[1]}L</Badge>
              )}
              {customerPreferences.bhk && customerPreferences.bhk !== 'any' && (
                <Badge variant="outline">Config: {customerPreferences.bhk}</Badge>
              )}
              {customerPreferences.tags && customerPreferences.tags.length > 0 && (
                <Badge variant="outline">Features: {customerPreferences.tags.length} selected</Badge>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-gray-700">Match Breakdown:</h4>
            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(criterion.status)}
                    <div>
                      <div className="font-medium text-gray-900">{criterion.name}</div>
                      <div className="text-sm text-gray-600">{criterion.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">+{criterion.points}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

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
        const currentPrices = property.configurations.map(c => c.price);
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

      {/* Property Match Analysis */}
      {property && <PropertyMatchAnalysis property={property} />}

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
                        <div className="text-primary font-bold">{formatPriceDisplay(config.price)}</div>
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

      {/* CIVIL+MEP Engineering Reports Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CivilMepSection property={property} />
      </section>
    </div>
  );
}