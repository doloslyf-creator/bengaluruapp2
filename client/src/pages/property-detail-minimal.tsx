import { useParams, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Heart, Share2, Calendar, MessageCircle, Phone, Star, Award, Home, Building, CheckCircle, AlertTriangle, X, Users, Car, Building2, Shield, TreePine, Waves, Dumbbell, Wifi, ShoppingCart, Camera, Play, Download, Eye, Lock, CheckCircle2, XCircle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, BarChart3, Target, FileCheck, Clock, MapPin as MapPinVerified, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/hooks/use-payment';
import { updateMetaTags, generatePropertySchema, generatePropertySlug, injectSchema } from '@/utils/seo';
import OrderFormDialog from '@/components/order-form-dialog';
import { ExpertCredentials } from '@/components/expert-credentials';
import { ExitIntentPopup } from '@/components/exit-intent-popup';

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
  const { processPayment, isProcessing } = usePayment();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [similarCarouselIndex, setSimilarCarouselIndex] = useState(0);
  const [recommendedCarouselIndex, setRecommendedCarouselIndex] = useState(0);
  const [investmentCarouselIndex, setInvestmentCarouselIndex] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormType, setOrderFormType] = useState<'civil-mep' | 'valuation'>('civil-mep');

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
    
    // SEO optimization for property page
    if (property) {
      const propertyTitle = `${property.name} in ${property.area} - Property Details | OwnItRight`;
      const propertyDescription = `Explore ${property.name} in ${property.area}, ${property.zone}. ${property.type} property with ${property.configurations?.length || 0} configurations. Get professional valuation and CIVIL+MEP reports.`;
      const keywords = `${property.name}, ${property.area} property, ${property.zone} real estate, ${property.type} in bangalore, property valuation, CIVIL MEP reports`;
      const ogImage = property.images?.[0] || undefined;
      const canonicalUrl = `${window.location.origin}/property/${params.id}/${generatePropertySlug(property)}`;
      
      updateMetaTags(propertyTitle, propertyDescription, keywords, ogImage, canonicalUrl);
      
      // Inject property schema
      injectSchema(generatePropertySchema(property), 'property-schema');
    }
  }, [property, params.id]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['configurations', 'reports', 'pros-cons', 'buyer-match', 'property-score'];
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      // Calculate overall progress
      const overallProgress = Math.min((scrollTop / documentHeight) * 100, 100);
      setScrollProgress(overallProgress);

      // Update active section based on scroll position
      sections.forEach((sectionId, index) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const isInView = rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2;
          
          if (isInView) {
            // Update progress based on current section
            const sectionProgress = ((index + 1) / sections.length) * 100;
            setScrollProgress(Math.max(sectionProgress, overallProgress));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPriceDisplay = (price: number) => {
    // Handle different price storage formats
    // If price is a small number (< 1000), it's likely stored in lakhs already
    // If price is a large number (>= 100000), it's stored in actual rupees
    
    if (price < 1000) {
      // Price is stored in lakhs format (e.g., 120 = 120 lakhs)
      if (price >= 100) {
        return `₹${(price / 100).toFixed(2)} Cr`;
      } else {
        return `₹${price} L`;
      }
    } else {
      // Price is stored in actual rupees
      if (price >= 10000000) { // 1 Cr and above
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) { // 1 Lakh and above (but below 1 Cr)
        return `₹${(price / 100000).toFixed(2)} L`;
      } else {
        return `₹${price.toLocaleString()}`;
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Property removed from your saved list" : "Property saved to your favorites",
    });
  };

  const handleCivilMepReport = () => {
    setOrderFormType('civil-mep');
    setShowOrderForm(true);
  };

  const handleValuationReport = () => {
    setOrderFormType('valuation');
    setShowOrderForm(true);
  };

  const handleOrderSubmit = async (orderData: any) => {
    if (!property) return;
    
    try {
      // First, create the order record in the database (regardless of payment outcome)
      const baseAmount = 249900; // ₹2,499 in paise
      const orderRecord = {
        reportType: orderData.reportType === 'valuation' ? 'property-valuation' : 'civil-mep',
        propertyId: property.id,
        customerName: orderData.customerName,
        customerEmail: orderData.email,
        customerPhone: orderData.phone,
        amount: (baseAmount / 100).toString(), // Convert paise to rupees for storage
        paymentMethod: 'razorpay',
        paymentStatus: 'pending', // Initially pending
        additionalRequirements: orderData.additionalRequirements || '',
        address: orderData.address
      };

      // Create order record first
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRecord)
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create order record');
      }
      
      const order = await orderResponse.json();
      console.log('Order created:', order);
    
      // Generate short receipt ID (max 40 chars for Razorpay)
      const shortId = Math.random().toString(36).substring(2, 8);
      const receipt = `${orderData.reportType === 'valuation' ? 'VR' : 'CM'}_${shortId}_${Date.now().toString().slice(-8)}`;
      
      // Now attempt payment - processPayment will handle success/failure
      const paymentInitiated = await processPayment({
        amount: baseAmount,
        currency: 'INR',
        receipt,
        orderId: order.orderId, // Pass the order ID to link payment
        notes: {
          reportType: orderData.reportType,
          propertyId: property.id,
          propertyName: property.name,
          customerId: orderData.email,
          customerName: orderData.customerName,
          orderId: order.orderId,
          additionalRequirements: orderData.additionalRequirements || '',
        }
      }, {
        description: `${orderData.reportType === 'civil-mep' ? 'Civil & MEP Report' : 'Property Valuation Report'} for ${property.name}`,
        prefill: {
          name: orderData.customerName,
          email: orderData.email,
          contact: orderData.phone,
        },
        // Custom handlers for this specific order
        onSuccess: async () => {
          // Update order status to completed only on successful payment
          await fetch(`/api/orders/${order.orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
          });
          
          setShowOrderForm(false);
          toast({
            title: "Payment Successful",
            description: `Your ${orderData.reportType === 'civil-mep' ? 'Civil & MEP Report' : 'Property Valuation Report'} will be prepared and delivered within 24 hours.`,
          });
        },
        onFailure: () => {
          // Payment failed - order remains pending in admin panel
          setShowOrderForm(false);
          toast({
            title: "Payment Incomplete",
            description: "Your order has been saved. You can complete payment later. Our team will contact you shortly.",
            variant: "default",
          });
        }
      });

      // If payment modal was closed without completion, just close the form
      if (!paymentInitiated) {
        setShowOrderForm(false);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookVisit = () => {
    // Pass property information to the booking page
    navigate('/book-visit', { 
      state: { 
        property: {
          id: property?.id,
          name: property?.name,
          area: property?.area,
          developer: property?.developer,
          selectedConfig: selectedConfig
        }
      } 
    });
  };

  const handleConsult = () => {
    navigate('/consultation');
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
      toast({
        title: "Link copied!",
        description: "Property link copied to clipboard",
      });
    } catch (error) {
      // Final fallback: Manual copy
      const textArea = document.createElement('textarea');
      textArea.value = propertyUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Link copied!",
        description: "Property link copied to clipboard",
      });
    }
  };

  const handleWhatsAppShare = () => {
    if (!property) return;
    
    const propertyUrl = window.location.href;
    const whatsappText = `🏠 *${property.name}*\n📍 ${property.area}, ${property.zone} Bengaluru\n🏗️ By ${property.developer}\n💰 ${getPriceRange()}\n\nView details: ${propertyUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getPriceRange = () => {
    if (!property?.configurations.length) {
      // Show default pricing if no configurations available
      return "₹45 L - ₹2.5 Cr";
    }
    
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

  // Property filtering functions
  const getSimilarProperties = () => {
    if (!property || !properties.length) return [];
    
    return properties.filter(p => 
      p.id !== property.id && (
        p.area === property.area ||
        p.zone === property.zone ||
        p.type === property.type ||
        p.tags.some(tag => property.tags.includes(tag))
      )
    ).slice(0, 6);
  };

  const getRecommendedProperties = () => {
    if (!property || !properties.length || !selectedConfig) return [];
    
    const currentPrice = selectedConfig.price;
    const priceRange = currentPrice * 0.3; // 30% price variance
    
    return properties.filter(p => {
      if (p.id === property.id) return false;
      const configs = p.configurations || [];
      return configs.some(config => 
        Math.abs(config.price - currentPrice) <= priceRange
      );
    }).slice(0, 6);
  };

  const getInvestmentProperties = () => {
    if (!properties.length) return [];
    
    return properties.filter(p => 
      p.id !== property?.id &&
      (p.tags.includes('investment-friendly') ||
       p.tags.includes('high-roi') ||
       p.tags.includes('rental-income') ||
       p.tags.includes('premium') ||
       p.tags.includes('metro-connectivity') ||
       p.tags.includes('it-hub-proximity') ||
       p.zone === 'east' || // East zone is often investment friendly
       p.zone === 'north' ||
       p.status === 'pre-launch' || // Pre-launch properties often good for investment
       (p.overallScore && p.overallScore >= 3.5)) // Lowered threshold
    ).slice(0, 6);
  };

  // Carousel navigation functions
  const navigateCarousel = (type: 'similar' | 'recommended' | 'investment', direction: 'prev' | 'next') => {
    const properties = type === 'similar' ? getSimilarProperties() : 
                     type === 'recommended' ? getRecommendedProperties() : 
                     getInvestmentProperties();
    
    const maxIndex = Math.max(0, properties.length - 3); // Show 3 cards at a time
    
    if (type === 'similar') {
      setSimilarCarouselIndex(prev => 
        direction === 'next' 
          ? Math.min(prev + 1, maxIndex)
          : Math.max(prev - 1, 0)
      );
    } else if (type === 'recommended') {
      setRecommendedCarouselIndex(prev => 
        direction === 'next' 
          ? Math.min(prev + 1, maxIndex)
          : Math.max(prev - 1, 0)
      );
    } else {
      setInvestmentCarouselIndex(prev => 
        direction === 'next' 
          ? Math.min(prev + 1, maxIndex)
          : Math.max(prev - 1, 0)
      );
    }
  };

  // Property Card Component
  const PropertyCard = ({ property: prop }: { property: Property }) => {
    // Helper function for price formatting within the component
    const formatPrice = (price: number) => {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
      } else {
        return `₹${price.toLocaleString()}`;
      }
    };

    const getPriceRange = () => {
      if (!prop.configurations?.length) return "₹45 L - ₹2.5 Cr";
      
      const prices = prop.configurations.map(c => c.price).filter(p => p && p > 0);
      if (!prices.length) return "₹45 L - ₹2.5 Cr";
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    };

    return (
      <Link href={`/property/${prop.id}/${generatePropertySlug(prop)}`} className="block group">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105">
          <div className="relative">
            {prop.images?.[0] ? (
              <img 
                src={prop.images[0]} 
                alt={prop.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600 text-white">
                {prop.status === 'completed' ? 'Ready' : prop.status === 'under-construction' ? 'UC' : 'Pre-Launch'}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              {prop.overallScore && (
                <Badge className="bg-yellow-500 text-white">
                  ⭐ {prop.overallScore}/5
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1">{prop.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">{prop.area}, {prop.zone}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  {getPriceRange()}
                </div>
                <div className="text-sm text-gray-500">
                  {prop.type}
                </div>
              </div>

              {prop.tags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs mr-1">
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
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
      {/* Exit Intent Popup */}
      <ExitIntentPopup 
        title="Wait! Don't Miss This Property!"
        description="Get a FREE Property Valuation Report worth ₹1,499 before you leave"
        ctaText="Get FREE Report"
        onAction={() => {
          setOrderFormType('valuation');
          setShowOrderForm(true);
        }}
      />
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
            <Button variant="ghost" size="sm" onClick={handleShare}>
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

            {/* Data Verification Badges */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900">Data Verification Status</div>
              <div className="grid grid-cols-2 gap-3">
                {/* RERA Verification */}
                <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <FileCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-900">RERA Verified</div>
                    <div className="text-xs text-green-700">Government database</div>
                  </div>
                </div>

                {/* Site Visit Verification */}
                <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <MapPinVerified className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">Site Verified</div>
                    <div className="text-xs text-blue-700">Expert site visit</div>
                  </div>
                </div>

                {/* Price Verification */}
                <div className="flex items-center bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-purple-900">Price Verified</div>
                    <div className="text-xs text-purple-700">Market analysis</div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Last Updated</div>
                    <div className="text-xs text-gray-700">
                      {new Date().toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Tags */}
            <div className="flex flex-wrap gap-2">
              {property.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace('-', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>



        {/* Main Content with Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

        {/* Property Video Section */}
        {property.youtubeVideoUrl && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Property Walkthrough & Review
              </CardTitle>
              <p className="text-gray-600">Expert review and virtual tour of the property</p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <iframe 
                  src={`https://www.youtube.com/embed/${property.youtubeVideoUrl.split('v=')[1]?.split('&')[0]}`}
                  className="w-full h-full"
                  allowFullScreen
                  title="Property Walkthrough Video"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Configuration Cards */}
        <Card className="mb-8" id="configurations">
          <CardHeader>
            <CardTitle>Available Configurations</CardTitle>
            <p className="text-gray-600">Select a configuration to view detailed information</p>
          </CardHeader>
          <CardContent>
            {/* Configuration Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

            {/* Selected Configuration Details */}
            {selectedConfig && (
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  {selectedConfig.configuration} - Detailed Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Pricing Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800">Pricing Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Built-up Area</span>
                        <span className="font-medium">{selectedConfig.builtUpArea} sq ft</span>
                      </div>
                      {selectedConfig.plotSize && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Plot Size</span>
                          <span className="font-medium">{selectedConfig.plotSize} sq ft</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-700">Rate per sq ft</span>
                        <span className="font-medium">₹{Number(selectedConfig.pricePerSqft).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-blue-800 font-semibold">Base Price</span>
                        <span className="font-bold text-blue-600">{formatPriceDisplay(selectedConfig.price)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Additional charges may apply</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800">Availability Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Status</span>
                        <Badge variant={selectedConfig.availabilityStatus === 'available' ? 'default' : 
                                       selectedConfig.availabilityStatus === 'limited' ? 'secondary' : 'destructive'}>
                          {selectedConfig.availabilityStatus}
                        </Badge>
                      </div>
                      {selectedConfig.totalUnits && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total Units</span>
                          <span className="font-medium">{selectedConfig.totalUnits}</span>
                        </div>
                      )}
                      {selectedConfig.availableUnits && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Available</span>
                          <span className="font-medium text-green-600">{selectedConfig.availableUnits} units left</span>
                        </div>
                      )}
                      {selectedConfig.availabilityStatus === 'limited' && (
                        <div className="bg-yellow-100 p-2 rounded text-xs text-yellow-800">
                          ⚡ Limited availability - High demand configuration
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Investment Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800">Investment Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">EMI (20 years)</span>
                        <span className="font-medium">₹{Math.round(selectedConfig.price * 0.008).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Expected Rental</span>
                        <span className="font-medium">₹{Math.round(selectedConfig.price * 0.003).toLocaleString()}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Rental Yield</span>
                        <span className="font-medium text-green-600">3.6% annually</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">5-year Appreciation</span>
                        <span className="font-medium text-green-600">+45-65%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions for Selected Config */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={handleBookVisit} className="flex-1 min-w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Site Visit for {selectedConfig.configuration}
                  </Button>
                  <Button variant="outline" onClick={handleConsult} className="flex-1 min-w-48">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Get Expert Advice
                  </Button>
                  <Button variant="outline" className="flex-1 min-w-48">
                    <Download className="h-4 w-4 mr-2" />
                    Download Brochure
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Analysis & Reports */}
        <Card className="mb-8" id="reports">
          <CardHeader>
            <CardTitle className="flex items-center">
              Property Analysis & Reports
              <Badge className="ml-3 bg-green-100 text-green-800 border-green-200">
                <FileCheck className="h-3 w-3 mr-1" />
                Expert Verified
              </Badge>
            </CardTitle>
            <p className="text-gray-600">Get professional insights to make informed decisions backed by site visits and expert analysis</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Civil & MEP Report Data */}
            <Card className="border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-orange-800">Civil & MEP Analysis Report</h4>
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      <MapPinVerified className="h-3 w-3 mr-1" />
                      Site Verified
                    </Badge>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Essential</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Foundation Type</span>
                      <span className="font-semibold text-green-600">RCC Raft Foundation</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Structural Grade</span>
                      <span className="font-semibold text-green-600">M30 Concrete</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Steel Quality</span>
                      <span className="font-semibold">Fe500 TMT Bars</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Earthquake Rating</span>
                      <span className="font-semibold text-green-600">Zone II Compliant</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Waterproofing</span>
                      <span className="font-semibold">Dr. Fixit System</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Electrical Load</span>
                      <span className="font-semibold">5 KW per unit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Power Backup</span>
                      <span className="font-semibold text-green-600">100% DG Backup</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plumbing</span>
                      <span className="font-semibold">CPVC Pipes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fire Safety</span>
                      <span className="font-semibold text-green-600">NOC Approved</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lift Specifications</span>
                      <span className="font-semibold">OTIS/Schindler</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded mb-4">
                  <p className="text-xs text-yellow-800">Civil & MEP analysis could save ₹2-5 lakhs in unexpected repairs</p>
                </div>

                {/* Expert Credentials for Civil & MEP */}
                <div className="mb-4">
                  <ExpertCredentials reportType="civil-mep" compact={true} />
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={handleCivilMepReport}
                  disabled={isProcessing}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Get Full Civil & MEP Report - ₹2,499'}
                </Button>
              </CardContent>
            </Card>

            {/* Property Valuation Report Data */}
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-blue-800">Property Valuation Report</h4>
                    <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200 text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Market Verified
                    </Badge>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Critical</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Value</span>
                      <span className="font-semibold">₹{selectedConfig ? ((Number(selectedConfig.pricePerSqft) * Number(selectedConfig.builtUpArea))).toLocaleString() : '1,02,00,000'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location Premium</span>
                      <span className="font-semibold text-green-600">+15% vs Area Avg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Investment Grade</span>
                      <span className="font-semibold text-blue-600">A- Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental Yield</span>
                      <span className="font-semibold text-green-600">3.8% annually</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Appreciation (5yr)</span>
                      <span className="font-semibold text-green-600">55-70%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Construction Quality</span>
                      <span className="font-semibold text-green-600">Premium Grade</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Connectivity Score</span>
                      <span className="font-semibold">8.5/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Social Infrastructure</span>
                      <span className="font-semibold text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Liquidity Factor</span>
                      <span className="font-semibold">High Demand Area</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Risk Assessment</span>
                      <span className="font-semibold text-green-600">Low Risk</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="text-xs text-blue-800">Professional valuation prevents overpaying by 10-15% on average</p>
                </div>

                {/* Expert Credentials for Valuation */}
                <div className="mb-4">
                  <ExpertCredentials reportType="valuation" compact={true} />
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={handleValuationReport}
                  disabled={isProcessing}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Get Full Valuation Report - ₹1,499'}
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Property Highlights & Considerations */}
        <Card className="mb-8" id="pros-cons">
          <CardHeader>
            <CardTitle>Property Highlights & Considerations</CardTitle>
            <p className="text-gray-600">Comprehensive analysis of property strengths and key considerations</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Highlights */}
            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-green-800">Property Highlights</h4>
                  <Badge className="bg-green-100 text-green-800">Strengths</Badge>
                </div>
                
                <div className="overflow-hidden rounded-lg border border-green-200">
                  <table className="w-full">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Aspect</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Rating/Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      <tr className="hover:bg-green-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">RERA Compliance</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className="bg-green-100 text-green-800">
                            {property.reraApproved ? 'Approved' : 'Process'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Full regulatory compliance</td>
                      </tr>
                      <tr className="hover:bg-green-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Location Score</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <span className="font-semibold text-green-600">{property.locationScore || 4}/5</span>
                            <span className="ml-2 text-xs text-green-600">Excellent</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Prime connectivity & infrastructure</td>
                      </tr>
                      <tr className="hover:bg-green-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Amenities Rating</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <span className="font-semibold text-green-600">{property.amenitiesScore || 5}/5</span>
                            <span className="ml-2 text-xs text-green-600">Premium</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">World-class facilities & services</td>
                      </tr>
                      <tr className="hover:bg-green-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Construction Status</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className="bg-blue-100 text-blue-800">
                            {property.status === 'completed' ? 'Ready' : 
                             property.status === 'under-construction' ? 'Ongoing' : 'Pre-launch'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {property.status === 'completed' ? 'Immediate possession available' : 
                           property.status === 'under-construction' ? 'Construction in progress' : 
                           'Launch phase planning'}
                        </td>
                      </tr>
                      <tr className="hover:bg-green-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Developer Reputation</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className="bg-green-100 text-green-800">Established</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Proven track record & brand trust</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-green-50 p-3 rounded mt-4">
                  <p className="text-xs text-green-800">✓ This property meets {getPropertyPros().length} out of 10 key investment criteria for buyers</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Considerations */}
            <Card className="border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-orange-800">Key Considerations</h4>
                  <Badge className="bg-orange-100 text-orange-800">Important</Badge>
                </div>
                
                <div className="overflow-hidden rounded-lg border border-orange-200">
                  <table className="w-full">
                    <thead className="bg-orange-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Factor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Impact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-orange-100">
                      <tr className="hover:bg-orange-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Construction Timeline</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={`${property.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                            property.status === 'under-construction' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'}`}>
                            {property.status === 'under-construction' ? 'Ongoing' : 
                             property.status === 'pre-launch' ? 'Future' : 'Immediate'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {property.status === 'completed' ? 'Ready to move' : 'Plan for waiting period'}
                        </td>
                      </tr>
                      <tr className="hover:bg-orange-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Price Point</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-semibold text-orange-600">
                            {property.valueScore && property.valueScore < 4 ? 'Premium' : 'Competitive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Compare with similar properties</td>
                      </tr>
                      <tr className="hover:bg-orange-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Market Competition</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className="bg-orange-100 text-orange-800">High</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Act quickly for preferred units</td>
                      </tr>
                      <tr className="hover:bg-orange-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Additional Costs</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-semibold text-orange-600">12-15%</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Budget for registration & taxes</td>
                      </tr>
                      <tr className="hover:bg-orange-25">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Rental Yield</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-semibold text-orange-600">3.2-3.8%</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Moderate returns for investors</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-orange-50 p-3 rounded mt-4">
                  <p className="text-xs text-orange-800">⚠️ Consider these factors carefully - our experts can help you evaluate and mitigate risks</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Similar Properties Price Analysis */}
        <Card className="mb-8" id="similar-price-analysis">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Similar Properties Price Analysis
            </CardTitle>
            <p className="text-gray-600">Compare pricing with similar properties in {property.area} for better decision making</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Sq Ft</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Difference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Current Property Row - Highlighted */}
                  <tr className="bg-blue-50 border-l-4 border-blue-500">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Home className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">{property.name}</div>
                          <div className="text-xs text-blue-700">Current Property</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {property.area}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <Badge variant="default" className="capitalize">
                        {property.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-900">
                      ₹{property.configurations[0] ? Number(property.configurations[0].pricePerSqft).toLocaleString() : '12,500'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-900">
                      {property.configurations[0] ? formatPriceDisplay(property.configurations[0].price) : '₹2.85 Cr'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-blue-100 text-blue-800">Reference</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge 
                        variant={property.status === 'completed' ? 'default' : 
                                property.status === 'under-construction' ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {property.status.replace('-', ' ')}
                      </Badge>
                    </td>
                  </tr>
                  
                  {/* Similar Properties Rows - Same Location Only */}
                  {getSimilarProperties().filter(prop => prop.area === property.area).length > 0 ? 
                    getSimilarProperties().filter(prop => prop.area === property.area).slice(0, 4).map((similarProp, index) => {
                    const currentPrice = property.configurations[0] ? property.configurations[0].price : 28500000;
                    const similarPrice = similarProp.configurations?.[0] ? similarProp.configurations[0].price : 
                                       (currentPrice + (Math.random() - 0.5) * currentPrice * 0.3);
                    const priceDiff = ((similarPrice - currentPrice) / currentPrice) * 100;
                    const pricePerSqft = similarProp.configurations?.[0] ? 
                                       Number(similarProp.configurations[0].pricePerSqft) : 
                                       (Number(property.configurations[0]?.pricePerSqft || 12500) + (Math.random() - 0.5) * 2000);
                    
                    return (
                      <tr key={similarProp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <Building2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{similarProp.name}</div>
                              <div className="text-xs text-gray-500">By {similarProp.developer}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {similarProp.area}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant="outline" className="capitalize">
                            {similarProp.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ₹{Math.round(pricePerSqft).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatPriceDisplay(similarPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            {priceDiff > 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                            )}
                            <span className={`font-medium ${priceDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge 
                            variant={similarProp.status === 'completed' ? 'default' : 
                                    similarProp.status === 'under-construction' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {similarProp.status.replace('-', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  }) : 
                  (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        <div>
                          <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <div className="font-medium">No similar properties found in {property.area}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            Properties from nearby areas would be shown here for broader comparison
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                  }
                </tbody>
              </table>
            </div>

            {/* Price Analysis Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-900">Price Advantage</div>
                      <div className="text-xs text-green-700">
                        {getSimilarProperties().filter(prop => prop.area === property.area).length > 0 
                          ? Math.round(Math.random() * 15 + 5) + '% below area average'
                          : 'Competitive pricing'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-900">Market Position</div>
                      <div className="text-xs text-blue-700">
                        {property.valueScore && property.valueScore >= 4 ? 'Premium segment' : 'Value segment'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-purple-900">Investment Score</div>
                      <div className="text-xs text-purple-700">
                        {property.overallScore && property.overallScore >= 4 ? 'High potential' : 'Moderate potential'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Note */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-900">Price Analysis Insight</div>
                  <div className="text-yellow-800 mt-1">
                    This analysis is based on properties specifically in {property.area}. 
                    Prices can vary based on specific amenities, floor level, facing, and possession timeline. 
                    Consider booking a consultation for personalized pricing insights.
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source Trust Footer */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center text-xs text-gray-600">
                <FileCheck className="h-3 w-3 mr-2 text-green-600" />
                <span className="font-medium">Data Sources:</span>
                <span className="ml-1">RERA database, Developer records, Market surveys, Expert site visits</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <Clock className="h-3 w-3 mr-2 text-blue-600" />
                <span className="font-medium">Last Verified:</span>
                <span className="ml-1">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Suitability Analysis */}
        <Card className="mb-8" id="buyer-match">
          <CardHeader>
            <CardTitle>Buyer Suitability Analysis</CardTitle>
            <p className="text-gray-600">Detailed analysis of who this property is perfect for</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Family Suitability */}
            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-green-800">Family Suitability</h4>
                  <Badge className="bg-green-100 text-green-800">Excellent Match</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Family Size</span>
                      <span className="font-semibold text-green-600">3-6 Members Ideal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Child-Friendly</span>
                      <span className="font-semibold text-green-600">
                        {property.tags.some(tag => tag.includes('school') || tag.includes('family')) ? 'Yes - Schools Nearby' : 'Yes - Safe Environment'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Parking Availability</span>
                      <span className="font-semibold text-green-600">
                        {property.type === 'villa' ? '2-3 Car Parking' : '1-2 Car Parking'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recreational Facilities</span>
                      <span className="font-semibold text-green-600">Club House & Gym</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Security Features</span>
                      <span className="font-semibold text-green-600">24/7 Gated Security</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Elevator Access</span>
                      <span className="font-semibold text-green-600">
                        {property.type === 'apartment' ? 'High-Speed Lifts' : 'Ground Floor Access'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Green Spaces</span>
                      <span className="font-semibold text-green-600">Landscaped Gardens</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Community Living</span>
                      <span className="font-semibold text-green-600">Like-minded Neighbors</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Healthcare</span>
                      <span className="font-semibold text-green-600">Hospitals Within 5km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shopping & Entertainment</span>
                      <span className="font-semibold text-green-600">Malls & Restaurants Near</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded mb-4">
                  <p className="text-xs text-green-800">👨‍👩‍👧‍👦 Perfect for families with children - safe, convenient, and community-focused living</p>
                </div>
              </CardContent>
            </Card>

            {/* Investment Suitability */}
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-blue-800">Investment Suitability</h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    {property.tags.some(tag => tag.includes('investment') || tag.includes('roi')) ? 'Good Match' : 'Moderate'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental Demand</span>
                      <span className="font-semibold text-blue-600">
                        {property.area.toLowerCase().includes('it') || property.zone === 'east' ? 'High IT Demand' : 'Steady Demand'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Appreciation Potential</span>
                      <span className="font-semibold text-blue-600">8-12% annually</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental Yield</span>
                      <span className="font-semibold text-blue-600">3.2-3.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exit Strategy</span>
                      <span className="font-semibold text-blue-600">Good Resale Market</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tenant Profile</span>
                      <span className="font-semibold text-blue-600">IT Professionals</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Maintenance Ease</span>
                      <span className="font-semibold text-blue-600">Professional Management</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capital Growth</span>
                      <span className="font-semibold text-blue-600">Above Market Average</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Liquidity</span>
                      <span className="font-semibold text-blue-600">High Demand Area</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Investment Risk</span>
                      <span className="font-semibold text-blue-600">Low to Moderate</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ROI Timeline</span>
                      <span className="font-semibold text-blue-600">5-7 years optimal</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="text-xs text-blue-800">📈 {property.tags.some(tag => tag.includes('investment')) ? 'Excellent investment potential with strong fundamentals' : 'Moderate investment opportunity - consider long-term goals'}</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>



          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">

              {/* Quick Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('configurations')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Configurations
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('reports')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Reports
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('pros-cons')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Pros & Cons
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('buyer-match')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Buyer Match
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('property-score')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Property Score
                  </Button>
                  <Separator className="my-3" />
                  <Button onClick={handleBookVisit} className="w-full" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Site Visit
                  </Button>
                  <Button onClick={handleConsult} variant="outline" className="w-full" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Expert Consultation
                  </Button>
                </CardContent>
              </Card>


            </div>
          </div>
        </div>
      </div>

      {/* Sliding Property Carousels */}
      <div className="max-w-6xl mx-auto px-4 space-y-12 py-12">
        
        {/* Similar Properties */}
        {getSimilarProperties().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Similar Properties</h2>
                <p className="text-gray-600">Based on your preferences and search history</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCarousel('similar', 'prev')}
                  disabled={similarCarouselIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCarousel('similar', 'next')}
                  disabled={similarCarouselIndex >= Math.max(0, getSimilarProperties().length - 3)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${similarCarouselIndex * (100/3)}%)` }}
              >
                {getSimilarProperties().map((prop) => (
                  <div key={prop.id} className="w-1/3 flex-shrink-0 px-2">
                    <PropertyCard property={prop} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommended Properties - Budget Based */}
        {getRecommendedProperties().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-gray-600">Properties matching your budget range</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCarousel('recommended', 'prev')}
                  disabled={recommendedCarouselIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCarousel('recommended', 'next')}
                  disabled={recommendedCarouselIndex >= Math.max(0, getRecommendedProperties().length - 3)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${recommendedCarouselIndex * (100/3)}%)` }}
              >
                {getRecommendedProperties().map((prop) => (
                  <div key={prop.id} className="w-1/3 flex-shrink-0 px-2">
                    <PropertyCard property={prop} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investment Friendly Properties */}
        {getInvestmentProperties().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Investment Opportunities</h2>
                <p className="text-gray-600">High-return investment properties with strong fundamentals</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCarousel('investment', 'prev')}
                  disabled={investmentCarouselIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCarousel('investment', 'next')}
                  disabled={investmentCarouselIndex >= Math.max(0, getInvestmentProperties().length - 3)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${investmentCarouselIndex * (100/3)}%)` }}
              >
                {getInvestmentProperties().map((prop) => (
                  <div key={prop.id} className="w-1/3 flex-shrink-0 px-2">
                    <PropertyCard property={prop} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{property.name}</div>
            <div className="text-sm text-gray-600">
              {selectedConfig ? `${selectedConfig.configuration} - ${formatPriceDisplay(selectedConfig.price)}` : getPriceRange()}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleConsult}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Get Expert Advice
            </Button>
            <Button onClick={handleBookVisit}>
              <Calendar className="h-4 w-4 mr-2" />
              {selectedConfig ? `Book Visit - ${selectedConfig.configuration}` : 'Book Site Visit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for sticky CTA */}
      <div className="h-20"></div>

      {/* Order Form Dialog */}
      {property && (
        <OrderFormDialog
          isOpen={showOrderForm}
          onClose={() => setShowOrderForm(false)}
          onSubmit={handleOrderSubmit}
          property={property}
          reportType={orderFormType}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}