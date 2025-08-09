import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, Share2, Calendar, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  configurations: {
    id: string;
    configuration: string;
    price: number;
  }[];
}

export default function PropertyDetailMinimal() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  const getPriceRange = () => {
    if (!property?.configurations?.length) return 'Price on Request';
    const prices = property.configurations.map(c => c.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) {
      return `₹${min} L`;
    }
    return `₹${min}L - ₹${max}L`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pre-launch': return 'bg-blue-100 text-blue-800';
      case 'under-construction': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'sold-out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Property removed from your favorites" : "Property added to your favorites",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.name,
        text: `Check out this property: ${property?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to clipboard",
      });
    }
  };

  const handleBookVisit = () => {
    toast({
      title: "Visit booking",
      description: "Booking functionality coming soon!",
    });
  };

  const handleConsult = () => {
    toast({
      title: "Expert consultation",
      description: "Consultation booking coming soon!",
    });
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
      <Header />
      
      {/* Property Actions Bar */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()} className="text-gray-600">
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

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Developer</div>
                <div className="font-medium">{property.developer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Property Type</div>
                <div className="font-medium capitalize">{property.type}</div>
              </div>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Property Images Coming Soon</p>
          </div>
        </div>

        {/* Configurations */}
        {property.configurations && property.configurations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.configurations.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{config.configuration}</h3>
                    <p className="text-blue-600 font-bold">₹{config.price} L</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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