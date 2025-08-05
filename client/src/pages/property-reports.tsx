import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OrderFormDialog from "@/components/order-form-dialog";
import { usePayment } from "@/hooks/use-payment";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  Building2, 
  Star,
  CheckCircle,
  X,
  Users,
  Award,
  FileText,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  developer: string;
  location: string;
  locality: string;
  priceRange: string;
  configurations: string[];
  images: string[];
  amenities: string[];
  reraRegistered: boolean;
  qualityScore: number;
  possessionDate: string;
  totalUnits: number;
  availableUnits: number;
}

export default function PropertyReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<"valuation" | "civil-mep">("valuation");
  
  const { toast } = useToast();
  const { processPayment } = usePayment();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    
    let filtered = properties.filter((property: Property) => {
      const matchesSearch = 
        property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.developer?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = selectedLocation === "all" || 
        property.location?.toLowerCase().includes(selectedLocation.toLowerCase());
      
      return matchesSearch && matchesLocation;
    });

    // Sort by location alphabetically
    return filtered.sort((a: Property, b: Property) => 
      (a.location || "").localeCompare(b.location || "")
    );
  }, [properties, searchQuery, selectedLocation]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    
    const locationSet = new Set<string>();
    properties.forEach((p: Property) => {
      if (p.location) locationSet.add(p.location);
    });
    return Array.from(locationSet).sort();
  }, [properties]);

  const handleViewReports = (property: Property, reportType: "valuation" | "civil-mep") => {
    setSelectedProperty(property);
    setSelectedReportType(reportType);
    setShowOrderForm(true);
  };

  const handleOrderReport = async (orderData: any) => {
    if (!selectedProperty) return;

    try {
      const response = await fetch("/api/orders/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: selectedReportType === "valuation" ? "property-valuation" : "civil-mep-assessment",
          reportType: selectedReportType === "valuation" ? "valuation-report" : "civil-mep-report",
          propertyId: selectedProperty.id,
          customerName: orderData.customerName,
          customerEmail: orderData.email,
          customerPhone: orderData.phone,
          customerAddress: orderData.address,
          additionalRequirements: orderData.additionalRequirements,
          amount: 2499
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      
      const result = await response.json();
      
      // Process payment using Razorpay
      processPayment({
        amount: 2499,
        orderId: result.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.email,
        customerPhone: orderData.phone,
        onSuccess: () => {
          toast({
            title: "Order created successfully!",
            description: `Your ${selectedReportType === "valuation" ? "Property Valuation" : "Civil+MEP"} report order has been created. You'll receive the report within 48 hours.`,
          });
          setShowOrderForm(false);
          setSelectedProperty(null);
        },
        onError: (error: string) => {
          toast({
            title: "Payment Failed",
            description: error,
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "Error creating order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Property Reports Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Professional Property Valuation & Civil+MEP Engineering Reports
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-lg">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span>Independent & Unbiased</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span>Engineer Certified</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span>48-Hour Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by property name or developer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredProperties.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredProperties.length} properties
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property: Property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Property Image */}
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-white/80" />
                      </div>
                    )}
                    
                    {/* Quality Score Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-900 font-semibold">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {property.qualityScore}/10
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Property Name & Developer */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.name}
                        </h3>
                        <p className="text-sm text-gray-600">by {property.developer}</p>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.locality}, {property.location}
                      </div>

                      {/* Price Range */}
                      <div className="text-lg font-bold text-green-600">
                        {property.priceRange}
                      </div>

                      {/* Configurations */}
                      <div className="flex flex-wrap gap-1">
                        {property.configurations?.slice(0, 3).map((config, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {config}
                          </Badge>
                        ))}
                        {property.configurations?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.configurations.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* RERA Status */}
                      {property.reraRegistered && (
                        <div className="flex items-center">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            RERA Registered
                          </Badge>
                        </div>
                      )}

                      {/* Report Buttons */}
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleViewReports(property, "valuation")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Property Valuation Report - ₹2,499
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                          onClick={() => handleViewReports(property, "civil-mep")}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Civil+MEP Analysis - ₹2,499
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Our Reports Are Paid Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Our Reports Are Paid
            </h2>
            <p className="text-lg text-gray-600">
              Professional, unbiased reporting requires investment in expertise and independence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-blue-100">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Unbiased Analysis</h3>
                <p className="text-gray-600">
                  Our paid model ensures complete independence from builders and developers. 
                  No conflicts of interest, no hidden agendas - just honest, professional assessment.
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border-2 border-green-100">
              <div className="text-center">
                <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Professional Expertise</h3>
                <p className="text-gray-600">
                  Our fees cover the cost of certified engineers, market research, 
                  legal verification, and comprehensive analysis that takes hours of expert work.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Reports vs Others Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Reports vs Others
            </h2>
            <p className="text-lg text-gray-600">
              See the difference professional, paid reports make
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Free Reports Elsewhere */}
            <Card className="p-6 border-2 border-red-200">
              <div className="text-center mb-6">
                <X className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-red-800">Free Reports Elsewhere</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Often sponsored by builders</span>
                </div>
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Generic template reports</span>
                </div>
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Hide critical structural issues</span>
                </div>
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">No professional liability</span>
                </div>
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basic market data only</span>
                </div>
                <div className="flex items-start">
                  <X className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">No legal verification</span>
                </div>
              </div>
            </Card>

            {/* Our Professional Reports */}
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="text-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-green-800">Our Professional Reports</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Completely independent analysis</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Property-specific detailed reports</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Comprehensive structural assessment</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Certified engineer validation</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Real-time market analysis</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Complete legal due diligence</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Real feedback from property buyers who made informed decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The Civil+MEP report saved me from a costly mistake. Found major structural issues 
                that the builder's 'free' report completely missed. Worth every rupee!"
              </p>
              <div className="text-sm">
                <p className="font-semibold">Rajesh Kumar</p>
                <p className="text-gray-500">Bangalore • Saved ₹25 lakhs</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Property valuation report was spot-on. Helped me negotiate ₹15 lakhs off the asking price. 
                The market analysis was incredibly detailed."
              </p>
              <div className="text-sm">
                <p className="font-semibold">Priya Sharma</p>
                <p className="text-gray-500">Chennai • Saved ₹15 lakhs</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Finally, an unbiased report! No hidden agenda, just facts. The legal verification 
                caught issues that could have been problematic later."
              </p>
              <div className="text-sm">
                <p className="font-semibold">Amit Patel</p>
                <p className="text-gray-500">Mumbai • Avoided legal issues</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Order Form Dialog */}
      <OrderFormDialog
        isOpen={showOrderForm}
        onClose={() => {
          setShowOrderForm(false);
          setSelectedProperty(null);
        }}
        onSubmit={handleOrderReport}
        property={{
          id: selectedProperty?.id || "",
          name: selectedProperty?.name || "",
          area: selectedProperty?.locality || "",
          zone: selectedProperty?.location || "",
          developer: selectedProperty?.developer || "",
          type: "Residential"
        }}
        reportType={selectedReportType}
      />
    </div>
  );
}