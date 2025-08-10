import { useParams, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Heart, Share2, Calendar, MessageCircle, Phone, Star, Award, Home, Building, CheckCircle, AlertTriangle, X, Users, Car, Building2, Shield, TreePine, Waves, Dumbbell, Wifi, ShoppingCart, Camera, Play, Download, Eye, Lock, CheckCircle2, XCircle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, BarChart3, Target, FileCheck, Clock, MapPin as MapPinVerified, UserCheck, ThumbsUp, Calculator, DollarSign, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/hooks/use-payment';
import { updateMetaTags, generatePropertySchema, generatePropertySlug, injectSchema } from '@/utils/seo';
import OrderFormDialog from '@/components/order-form-dialog';
import { ExpertCredentials } from '@/components/expert-credentials';
import { ExitIntentPopup } from '@/components/exit-intent-popup';
import { PropertyGallery } from '@/components/property/property-gallery';
import Header from '@/components/layout/header';

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
        additionalRequirements: orderData.additionalRequirements || ''
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
    // Pass property information to the consultation page
    navigate('/consultation', { 
      state: { 
        property: {
          id: property?.id,
          name: property?.name,
          area: property?.area,
          zone: property?.zone,
          developer: property?.developer,
          selectedConfig: selectedConfig
        }
      } 
    });
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
          <Button onClick={() => window.history.back()}>
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
      
      {/* Global Header */}
      <Header />
      
      {/* Property Actions Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </button>
          <div className="flex items-center space-x-3">
            <button onClick={toggleFavorite} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button onClick={handleShare} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="space-y-6 mb-8">
        {/* Property Gallery */}
        <div className="mb-6">
          <PropertyGallery
            images={property.images || []}
            videos={property.youtubeVideoUrl ? [property.youtubeVideoUrl] : []}
            propertyName={property.name}
            className="w-full"
          />
        </div>

        {/* Property Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${getStatusColor(property.status)}`}>
              {property.status.replace('-', ' ').toUpperCase()}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h1>
            <div className="flex items-center justify-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Zone</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{getPriceRange()}</div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b">
            <div>
              <div className="text-sm text-gray-600">Developer</div>
              <div className="font-medium">{property.developer}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Property Type</div>
              <div className="font-medium capitalize">{property.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Possession</div>
              <div className="font-medium">{property.possessionDate || 'TBA'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">RERA Status</div>
              <div className={`font-medium ${property.reraApproved ? 'text-emerald-600' : 'text-yellow-600'}`}>
                {property.reraApproved ? 'Approved' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="py-6 border-b">
            <h3 className="font-medium mb-3">Verification Status</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full border border-emerald-200">
                ✓ RERA Verified
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                ✓ Site Verified
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200">
                ✓ Price Verified
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border border-gray-200">
                ✓ Updated Today
              </span>
            </div>
          </div>

          {/* Property Tags */}
          <div className="py-6">
            <h3 className="font-medium mb-3">Property Features</h3>
            <div className="flex flex-wrap gap-2">
              {property.tags.slice(0, 6).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
          </div>
        </div>



        {/* Property Video Section */}
        {property.youtubeVideoUrl && (
          <div className="py-6 border-b">
            <h3 className="font-medium mb-3">Property Walkthrough</h3>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe 
                src={`https://www.youtube.com/embed/${property.youtubeVideoUrl.split('v=')[1]?.split('&')[0]}`}
                className="w-full h-full"
                allowFullScreen
                title="Property Walkthrough Video"
                />
              </div>
            </div>
          )}

        {/* Property Configurations */}
        <div className="py-6 border-b">
          <h3 className="font-medium mb-4">Available Configurations</h3>
          <div className="space-y-3">
            {property.configurations.map((config) => (
              <div 
                key={config.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedConfig?.id === config.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedConfig(config)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{config.configuration}</div>
                    <div className="text-sm text-gray-600">
                      {config.builtUpArea} sq ft • {config.availabilityStatus}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">
                      {formatPriceDisplay(config.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ₹{config.pricePerSqft}/sq ft
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Section */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="py-6 border-b">
            <h3 className="font-medium mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.slice(0, 12).map((amenity, index) => {
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
                    "Jogging Track": Users,
                    "Tennis Court": Users,
                    "Outdoor Tennis Courts": Users,
                    "Security": Shield,
                    "Reserved Parking": Car,
                    "Visitor Parking": Car,
                    "Flower Gardens": TreePine,
                    "Library": Building2,
                    "Business Centre": Building2,
                    "Recreational Pool": Waves,
                    "Rentable Community Space": Home,
                    "RO Water System": Waves,
                    "Multipurpose Courts": Users,
                    "Basketball Court": Users,
                    "Badminton Court": Users,
                    "Yoga Deck": Users,
                    "Meditation Area": TreePine,
                    "Kids Pool": Waves,
                    "Spa": Star,
                    "Sauna": Star,
                    "Steam Room": Star,
                    "Party Hall": Users,
                    "Banquet Hall": Users,
                    "Mini Theatre": Users,
                    "Game Room": Users,
                    "Indoor Games": Users,
                    "Outdoor Games": Users,
                    "Amphitheatre": Users,
                    "Jogging and Strolling Track": Users,
                  };
                  
                  return (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded border">
                      <span className="text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Reports and Action Buttons */}
        <div className="py-6 border-b">
          <h3 className="font-medium mb-4">Get Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setOrderFormType('civil-mep');
                setShowOrderForm(true);
              }}
              className="p-4 border border-emerald-500 bg-emerald-50 rounded-lg text-left hover:bg-emerald-100 transition-colors"
            >
              <div className="font-medium text-emerald-900">CIVIL+MEP Report</div>
              <div className="text-sm text-emerald-700">Engineering analysis & safety assessment</div>
              <div className="text-lg font-bold text-emerald-600 mt-2">₹1,999</div>
            </button>
            <button 
              onClick={() => {
                setOrderFormType('valuation');
                setShowOrderForm(true);
              }}
              className="p-4 border border-blue-500 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">Property Valuation Report</div>
              <div className="text-sm text-blue-700">Market analysis & price assessment</div>
              <div className="text-lg font-bold text-blue-600 mt-2">₹1,499</div>
            </button>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="py-6">
          <h3 className="font-medium mb-4">Contact Us</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors">
              Schedule Site Visit
            </button>
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Request Callback
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Order Form Dialog */}
      <OrderFormDialog
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        onSubmit={handleOrderSubmit}
        reportType={orderFormType}
        property={property}
      />
    </div>
  );
}
