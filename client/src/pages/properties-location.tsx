import { useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { updateMetaTags, generateBreadcrumbSchema, generateSlug, injectSchema } from '@/utils/seo';
import { MapPin, Building, TrendingUp, Star, ArrowRight } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  area: string;
  zone: string;
  type: string;
  images?: string[];
  overallScore?: number;
  configurations: Array<{
    price: number;
    configuration: string;
    availabilityStatus: string;
  }>;
}

export default function PropertiesLocation() {
  const params = useParams();
  const location = params.location?.replace('-', ' ') || '';
  
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Filter properties by location
  const locationProperties = properties.filter(property => 
    property.area.toLowerCase().includes(location.toLowerCase()) ||
    property.zone.toLowerCase().includes(location.toLowerCase())
  );

  useEffect(() => {
    const capitalizedLocation = location.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    updateMetaTags(
      `Properties in ${capitalizedLocation} - Best Real Estate Options | OwnItRight`,
      `Discover premium properties in ${capitalizedLocation}, Bangalore. Expert property advisory with valuations, CIVIL+MEP reports, and investment guidance. ${locationProperties.length} properties available.`,
      `${capitalizedLocation} properties, real estate ${capitalizedLocation}, property investment ${capitalizedLocation}, apartments ${capitalizedLocation}, villas ${capitalizedLocation}`,
      undefined,
      `${window.location.origin}/properties/${params.location}`
    );

    // Breadcrumb schema
    const breadcrumbs = [
      { name: 'Home', url: window.location.origin },
      { name: 'Properties', url: `${window.location.origin}/properties` },
      { name: `${capitalizedLocation} Properties`, url: window.location.href }
    ];
    injectSchema(generateBreadcrumbSchema(breadcrumbs), 'breadcrumb-schema');
  }, [location, params.location, locationProperties.length]);

  const getMinPrice = (property: Property) => {
    const prices = property.configurations.map(config => config.price);
    return Math.min(...prices);
  };

  const getMaxPrice = (property: Property) => {
    const prices = property.configurations.map(config => config.price);
    return Math.max(...prices);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const capitalizedLocation = location.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="py-20 text-center">
          <div className="animate-pulse">Loading properties...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumb */}
      <nav className="py-4 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/properties" className="text-blue-600 hover:text-blue-800">Properties</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{capitalizedLocation}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6">
            <MapPin className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700">{capitalizedLocation}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Properties in {capitalizedLocation}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover {locationProperties.length} premium properties in {capitalizedLocation} with expert advisory services and detailed analysis.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {locationProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-8">
                We don't have properties listed for {capitalizedLocation} yet. 
                Check back soon or explore other locations.
              </p>
              <Button asChild>
                <Link href="/properties">View All Properties</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {locationProperties.length} Properties Available
                </h2>
                <div className="flex items-center space-x-4">
                  <select className="border border-gray-300 rounded-lg px-4 py-2">
                    <option>Sort by Price</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {locationProperties.map((property) => (
                  <Card key={property.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <div className="relative">
                      {property.images?.[0] ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Building className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-900 border-0">
                          {property.type}
                        </Badge>
                      </div>
                      {property.overallScore && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-500 text-white border-0">
                            <Star className="h-3 w-3 mr-1" />
                            {property.overallScore}/10
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                        {property.name}
                      </CardTitle>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{property.area}, {property.zone}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatPrice(getMinPrice(property))} - {formatPrice(getMaxPrice(property))}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.configurations.length} configuration{property.configurations.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        
                        <Button asChild className="w-full">
                          <Link href={`/property/${property.id}/${generateSlug(property.name)}`}>
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Location Insights */}
              <div className="mt-16 bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Why Invest in {capitalizedLocation}?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Strategic Location</h4>
                    <p className="text-gray-600 text-sm">Excellent connectivity and infrastructure development</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Growth Potential</h4>
                    <p className="text-gray-600 text-sm">High appreciation potential with ongoing developments</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Quality Projects</h4>
                    <p className="text-gray-600 text-sm">Premium developments from reputed builders</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}