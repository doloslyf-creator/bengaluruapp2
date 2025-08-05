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

interface PropertyReportCardProps {
  property: Property;
  onOrderReport: (property: Property, reportType: "valuation" | "civil-mep") => void;
}

function PropertyReportCard({ property, onOrderReport }: PropertyReportCardProps) {
  const [activeReport, setActiveReport] = useState<"valuation" | "civil-mep">("valuation");

  const valuationData = {
    marketValue: "₹19,580,000",
    locationPremium: "+15% vs Area Avg",
    investmentGrade: "A- Excellent",
    rentalYield: "3.8% annually",
    appreciation: "55-70%",
    constructionQuality: "Premium Grade",
    connectivityScore: "8.5/10",
    socialInfrastructure: "Excellent",
    liquidityFactor: "High Demand Area",
    riskAssessment: "Low Risk"
  };

  const civilMepData = {
    structuralGrade: "Grade A",
    foundationQuality: "Excellent",
    electricalSystems: "BIS Compliant",
    plumbingQuality: "Premium Grade",
    fireDetection: "Installed",
    ventilationScore: "9.2/10",
    buildingMaterials: "High Quality",
    safetyCompliance: "100% Compliant",
    structuralIntegrity: "Certified",
    overallRating: "Premium"
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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

      <CardContent className="p-0">
        {/* Property Info Header */}
        <div className="p-6 pb-4">
          <div className="space-y-3">
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
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="border-t border-gray-200">
          <Tabs value={activeReport} onValueChange={(value) => setActiveReport(value as "valuation" | "civil-mep")}>
            <TabsList className="w-full grid grid-cols-2 h-12 bg-gray-50 rounded-none">
              <TabsTrigger 
                value="valuation" 
                className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Property Valuation Report
              </TabsTrigger>
              <TabsTrigger 
                value="civil-mep"
                className="text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Civil MEP Analysis
              </TabsTrigger>
            </TabsList>

            {/* Valuation Report Content */}
            <TabsContent value="valuation" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-600">Property Valuation Report</h4>
                <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Value</span>
                    <span className="font-semibold">{valuationData.marketValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location Premium</span>
                    <span className="font-semibold text-green-600">{valuationData.locationPremium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Grade</span>
                    <span className="font-semibold text-blue-600">{valuationData.investmentGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Yield</span>
                    <span className="font-semibold text-green-600">{valuationData.rentalYield}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appreciation (5yr)</span>
                    <span className="font-semibold text-green-600">{valuationData.appreciation}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Construction Quality</span>
                    <span className="font-semibold text-green-600">{valuationData.constructionQuality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connectivity Score</span>
                    <span className="font-semibold">{valuationData.connectivityScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Social Infrastructure</span>
                    <span className="font-semibold text-green-600">{valuationData.socialInfrastructure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liquidity Factor</span>
                    <span className="font-semibold">{valuationData.liquidityFactor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Assessment</span>
                    <span className="font-semibold text-green-600">{valuationData.riskAssessment}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-700 text-sm font-medium">
                  Professional valuation prevents overpaying by 10-15% on average
                </p>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                onClick={() => onOrderReport(property, "valuation")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Get Full Valuation Report - ₹2,499
              </Button>
            </TabsContent>

            {/* Civil MEP Content */}
            <TabsContent value="civil-mep" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-purple-600">Civil MEP Analysis</h4>
                <Badge className="bg-green-100 text-green-800 text-xs">Certified</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Structural Grade</span>
                    <span className="font-semibold text-green-600">{civilMepData.structuralGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Foundation Quality</span>
                    <span className="font-semibold text-green-600">{civilMepData.foundationQuality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electrical Systems</span>
                    <span className="font-semibold text-blue-600">{civilMepData.electricalSystems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plumbing Quality</span>
                    <span className="font-semibold text-green-600">{civilMepData.plumbingQuality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fire Detection</span>
                    <span className="font-semibold text-green-600">{civilMepData.fireDetection}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ventilation Score</span>
                    <span className="font-semibold">{civilMepData.ventilationScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Building Materials</span>
                    <span className="font-semibold text-green-600">{civilMepData.buildingMaterials}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safety Compliance</span>
                    <span className="font-semibold text-green-600">{civilMepData.safetyCompliance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Structural Integrity</span>
                    <span className="font-semibold text-blue-600">{civilMepData.structuralIntegrity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Rating</span>
                    <span className="font-semibold text-green-600">{civilMepData.overallRating}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-purple-700 text-sm font-medium">
                  Engineering analysis prevents costly structural issues post-purchase
                </p>
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
                onClick={() => onOrderReport(property, "civil-mep")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Get Full Civil MEP Report - ₹2,499
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PropertyReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<"valuation" | "civil-mep">("valuation");
  const [hasSearched, setHasSearched] = useState(false);
  
  const { toast } = useToast();
  const { processPayment } = usePayment();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties) || !hasSearched) return [];
    
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
  }, [properties, searchQuery, selectedLocation, hasSearched]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    
    const locationSet = new Set<string>();
    properties.forEach((p: Property) => {
      if (p.location) locationSet.add(p.location);
    });
    return Array.from(locationSet).sort();
  }, [properties]);

  // Sample properties for display before search
  const sampleProperties: Property[] = [
    {
      id: "sample-1",
      name: "Prestige Lakeside Habitat",
      developer: "Prestige Group",
      location: "Varthur",
      locality: "Whitefield",
      priceRange: "₹1.2 - 2.1 Cr",
      configurations: ["2 BHK", "3 BHK", "4 BHK"],
      images: [],
      amenities: ["Swimming Pool", "Gym", "Clubhouse"],
      reraRegistered: true,
      qualityScore: 8.5,
      possessionDate: "Dec 2025",
      totalUnits: 800,
      availableUnits: 150
    },
    {
      id: "sample-2",
      name: "Brigade Cornerstone Utopia",
      developer: "Brigade Group",
      location: "Electronic City",
      locality: "Phase 1",
      priceRange: "₹85 L - 1.5 Cr",
      configurations: ["1 BHK", "2 BHK", "3 BHK"],
      images: [],
      amenities: ["Garden", "Parking", "Security"],
      reraRegistered: true,
      qualityScore: 9.2,
      possessionDate: "Mar 2026",
      totalUnits: 1200,
      availableUnits: 320
    }
  ];

  const handleSearch = () => {
    setHasSearched(true);
  };

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 0) {
                    setHasSearched(true);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 h-12"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search Properties
            </Button>
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
          
          {hasSearched && filteredProperties.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredProperties.length} properties
            </div>
          )}
          
          {!hasSearched && (
            <div className="mt-4 text-sm text-gray-600">
              Enter property name or developer to search. Sample properties shown below.
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hasSearched ? (
            // Show sample properties before search
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {sampleProperties.map((property: Property) => (
                <PropertyReportCard 
                  key={property.id} 
                  property={property} 
                  onOrderReport={handleViewReports}
                />
              ))}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
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
              <p className="text-gray-600">Try adjusting your search criteria or browse our sample properties above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredProperties.map((property: Property) => (
                <PropertyReportCard 
                  key={property.id} 
                  property={property} 
                  onOrderReport={handleViewReports}
                />
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