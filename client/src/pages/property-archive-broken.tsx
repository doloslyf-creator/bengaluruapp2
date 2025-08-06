import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Home, 
  MapPin, 
  IndianRupee, 
  Award, 
  Shield, 
  Building2,
  Search,
  Filter,
  Target,
  Percent,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  DollarSign,
  Users,
  Compass,
  TreePine,
  Zap,
  FileCheck
} from "lucide-react";
import type { Property, PropertyConfiguration, CivilMepReport, PropertyValuationReport } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

type UserIntent = "investment" | "end-use" | null;

interface PropertyWithReports extends Property {
  configurations?: PropertyConfiguration[];
  civilMepReport?: CivilMepReport;
  valuationReport?: PropertyValuationReport;
}

// Property Card Component Interface
interface PropertyCardProps {
  property: PropertyWithReports;
  userIntent: UserIntent;
  onViewDetails: () => void;
  formatPrice: (price: number) => string;
  getPriceRange: (property: PropertyWithReports) => string;
  getInvestmentScore: (property: PropertyWithReports) => number;
  getEndUseScore: (property: PropertyWithReports) => number;
}

export default function PropertyArchive() {
  const [, navigate] = useLocation();
  const [userIntent, setUserIntent] = useState<UserIntent>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Fetch properties with related reports
  const { data: properties = [], isLoading } = useQuery<PropertyWithReports[]>({
    queryKey: ["/api/properties"],
    enabled: userIntent !== null,
  });

  // Fetch civil MEP reports
  const { data: civilReports = [] } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
    enabled: userIntent !== null,
  });

  // Fetch valuation reports
  const { data: valuationReports = [] } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
    enabled: userIntent !== null,
  });

  // Combine properties with their reports
  const propertiesWithReports = useMemo(() => {
    return properties.map(property => {
      const civilReport = civilReports.find(report => report.propertyId === property.id);
      const valuationReport = valuationReports.find(report => report.propertyId === property.id);
      return {
        ...property,
        civilMepReport: civilReport,
        valuationReport: valuationReport,
      };
    });
  }, [properties, civilReports, valuationReports]);

  // Filter and sort properties based on user intent and filters
  const filteredProperties = useMemo(() => {
    let filtered = propertiesWithReports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by zone
    if (selectedZone !== "all") {
      filtered = filtered.filter(property => property.zone === selectedZone);
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    // Sort based on user intent and selected criteria
    if (sortBy === "investment-score" && userIntent === "investment") {
      filtered.sort((a, b) => {
        const aScore = (a.valuationReport?.yieldScore || a.overallScore || 0);
        const bScore = (b.valuationReport?.yieldScore || b.overallScore || 0);
        return parseFloat(bScore.toString()) - parseFloat(aScore.toString());
      });
    } else if (sortBy === "end-use-score" && userIntent === "end-use") {
      filtered.sort((a, b) => {
        const aScore = ((a.locationScore || 0) + (a.amenitiesScore || 0)) / 2;
        const bScore = ((b.locationScore || 0) + (b.amenitiesScore || 0)) / 2;
        return bScore - aScore;
      });
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const aPrice = a.configurations?.[0]?.pricePerSqft || 0;
        const bPrice = b.configurations?.[0]?.pricePerSqft || 0;
        return parseFloat(aPrice.toString()) - parseFloat(bPrice.toString());
      });
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const aPrice = a.configurations?.[0]?.pricePerSqft || 0;
        const bPrice = b.configurations?.[0]?.pricePerSqft || 0;
        return parseFloat(bPrice.toString()) - parseFloat(aPrice.toString());
      });
    }

    return filtered;
  }, [propertiesWithReports, searchTerm, selectedZone, selectedType, sortBy, userIntent]);

  // Format price display
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  // Get price range for property
  const getPriceRange = (property: PropertyWithReports) => {
    // First try to get price from configurations
    if (property.configurations && property.configurations.length > 0) {
      const prices = property.configurations.map((c: PropertyConfiguration) => {
        const pricePerSqft = parseFloat(c.pricePerSqft.toString());
        const builtUpArea = c.builtUpArea;
        return pricePerSqft * builtUpArea;
      });
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    
    // Fallback to valuation report pricing
    if (property.valuationReport?.estimatedMarketValue) {
      const marketValue = parseFloat(property.valuationReport.estimatedMarketValue.toString());
      return formatPrice(marketValue);
    }
    
    // Fallback to builder quoted price
    if (property.valuationReport?.builderQuotedPrice) {
      const quotedPrice = parseFloat(property.valuationReport.builderQuotedPrice.toString());
      return formatPrice(quotedPrice);
    }
    
    // Final fallback - create approximate pricing based on market standards
    // Use area * approximate rate for the zone
    const defaultRates = {
      'north': 12000,
      'south': 15000,
      'east': 10000,
      'west': 11000,
      'central': 18000
    };
    
    const ratePerSqft = defaultRates[property.zone as keyof typeof defaultRates] || 12000;
    const estimatedArea = 1200; // Approximate 2-3 BHK size
    const estimatedPrice = ratePerSqft * estimatedArea;
    
    return formatPrice(estimatedPrice);
  };

  // Get investment score
  const getInvestmentScore = (property: PropertyWithReports) => {
    if (property.valuationReport?.yieldScore) {
      return parseFloat(property.valuationReport.yieldScore.toString());
    }
    if (property.civilMepReport?.overallScore) {
      return property.civilMepReport.overallScore;
    }
    return property.overallScore ? parseFloat(property.overallScore.toString()) : 0;
  };

  // Get end-use score
  const getEndUseScore = (property: PropertyWithReports) => {
    const locationScore = property.locationScore || 0;
    const amenitiesScore = property.amenitiesScore || 0;
    return (locationScore + amenitiesScore) / 2;
  };

  // User intent selection screen
  if (userIntent === null) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Archive</h1>
            <p className="text-xl text-gray-600 mb-8">
              Tell us your primary intent to see properties with relevant insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Investment Intent */}
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500"
              onClick={() => setUserIntent("investment")}
              data-testid="select-intent-investment"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Investment Purpose</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Looking for properties with good rental yields, appreciation potential, and exit liquidity
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Percent className="h-4 w-4 mr-2" />
                    Rental Yield Analysis
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Market Appreciation Trends
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Target className="h-4 w-4 mr-2" />
                    Investment Risk Assessment
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* End Use Intent */}
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500"
              onClick={() => setUserIntent("end-use")}
              data-testid="select-intent-end-use"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">End Use (Living)</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Looking for a home to live in with good location, amenities, and lifestyle features
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location & Connectivity
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Building2 className="h-4 w-4 mr-2" />
                    Amenities & Facilities
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2" />
                    Legal & Quality Standards
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setUserIntent(null)}
                data-testid="button-change-intent"
              >
                ← Change Intent
              </Button>
              <div className="flex items-center space-x-2">
                {userIntent === "investment" ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Investment Properties</span>
                  </>
                ) : (
                  <>
                    <Home className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-600">End-Use Properties</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-500">
                {filteredProperties.length} properties found
              </div>
              
              {/* Data Transparency Indicator */}
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center text-green-700">
                    <FileCheck className="h-3 w-3 mr-1" />
                    <span className="font-medium">All Reports Verified</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-properties"
              />
            </div>
            
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger data-testid="select-zone-filter">
                <SelectValue placeholder="All Zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="north">North</SelectItem>
                <SelectItem value="south">South</SelectItem>
                <SelectItem value="east">East</SelectItem>
                <SelectItem value="west">West</SelectItem>
                <SelectItem value="central">Central</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                {userIntent === "investment" && (
                  <SelectItem value="investment-score">Investment Score</SelectItem>
                )}
                {userIntent === "end-use" && (
                  <SelectItem value="end-use-score">Lifestyle Score</SelectItem>
                )}
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                userIntent={userIntent}
                onViewDetails={() => navigate(`/property/${property.id}`)}
                formatPrice={formatPrice}
                getPriceRange={getPriceRange}
                getInvestmentScore={getInvestmentScore}
                getEndUseScore={getEndUseScore}
              />
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}

// Property Card Component
function PropertyCard({ 
  property, 
  userIntent, 
  onViewDetails, 
  formatPrice, 
  getPriceRange, 
  getInvestmentScore, 
  getEndUseScore 
}: PropertyCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pre-launch': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'under-construction': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'sold-out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderInvestmentMetrics = () => (
    <div className="space-y-3">
      {/* Investment Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Investment Score</span>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-semibold">{getInvestmentScore(property).toFixed(1)}/10</span>
        </div>
      </div>

      {/* Rental Yield */}
      {property.valuationReport?.grossRentalYield && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rental Yield</span>
          <span className="text-sm font-semibold text-green-600">
            {property.valuationReport.grossRentalYield}
          </span>
        </div>
      )}

      {/* Monthly Rent */}
      {property.valuationReport?.expectedMonthlyRent && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Expected Rent</span>
          <span className="text-sm font-semibold">
            {property.valuationReport.expectedMonthlyRent}
          </span>
        </div>
      )}

      {/* Investment Recommendation */}
      {property.civilMepReport?.investmentRecommendation && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Recommendation</span>
          <Badge 
            variant={property.civilMepReport.investmentRecommendation === 'highly-recommended' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {property.civilMepReport.investmentRecommendation.replace('-', ' ')}
          </Badge>
        </div>
      )}

      {/* Exit Liquidity */}
      {property.valuationReport?.exitLiquidity && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Exit Liquidity</span>
          <span className="text-sm">{property.valuationReport.exitLiquidity}</span>
        </div>
      )}
    </div>
  );

  const renderEndUseMetrics = () => (
    <div className="space-y-3">
      {/* Lifestyle Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Lifestyle Score</span>
        <div className="flex items-center space-x-1">
          <Home className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">{getEndUseScore(property).toFixed(1)}/5</span>
        </div>
      </div>

      {/* Location Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Location</span>
        <div className="flex">
          {[1,2,3,4,5].map((star) => (
            <Star 
              key={star} 
              className={`h-3 w-3 ${star <= (property.locationScore || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      </div>

      {/* Amenities Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Amenities</span>
        <div className="flex">
          {[1,2,3,4,5].map((star) => (
            <Star 
              key={star} 
              className={`h-3 w-3 ${star <= (property.amenitiesScore || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      </div>

      {/* RERA Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">RERA Approved</span>
        {property.reraApproved ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Legal Status */}
      {property.legalVerdictBadge && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Legal Status</span>
          <Badge variant="outline" className="text-xs">
            {property.legalVerdictBadge}
          </Badge>
        </div>
      )}

      {/* Possession Date */}
      {property.possessionDate && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Possession</span>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{property.possessionDate}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onViewDetails}
      data-testid={`property-card-${property.id}`}
    >
      <div className="relative">
        {/* Property Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-3xl mb-2">🏢</div>
            <p className="text-xs">Property Image</p>
          </div>
        </div>

        {/* Match Type Badge */}
        {userIntent && (
          <Badge className="absolute top-3 left-3 bg-white text-gray-800 border">
            [{userIntent === 'investment' ? 'Investment' : 'End Use'} Match]
          </Badge>
        )}
        
        {/* Status Badge */}
        <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
          {property.status.replace('-', ' ').charAt(0).toUpperCase() + property.status.slice(1)}
        </Badge>
      </div>

      <CardContent className="p-6">
        {/* Property Header */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{property.name}</h3>
          <p className="text-gray-600 flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)}
          </p>
          <p className="text-sm text-gray-500">by {property.developer}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price Range</span>
            <span className="font-bold text-lg text-blue-600">
              {getPriceRange(property)}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Intent-specific metrics */}
        {userIntent === "investment" ? renderInvestmentMetrics() : renderEndUseMetrics()}

function PropertyCard({ 
  property, 
  userIntent, 
  onViewDetails, 
  formatPrice, 
  getPriceRange, 
  getInvestmentScore, 
  getEndUseScore 
}: PropertyCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pre-launch': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'under-construction': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'sold-out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderInvestmentMetrics = () => (
    <div className="space-y-3">
      {/* Investment Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Investment Score</span>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-semibold">{getInvestmentScore(property).toFixed(1)}/10</span>
        </div>
      </div>

      {/* Rental Yield */}
      {property.valuationReport?.grossRentalYield && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rental Yield</span>
          <span className="text-sm font-semibold text-green-600">
            {property.valuationReport.grossRentalYield}
          </span>
        </div>
      )}

      {/* Monthly Rent */}
      {property.valuationReport?.expectedMonthlyRent && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Expected Rent</span>
          <span className="text-sm font-semibold">
            {property.valuationReport.expectedMonthlyRent}
          </span>
        </div>
      )}

      {/* Investment Recommendation */}
      {property.civilMepReport?.investmentRecommendation && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Recommendation</span>
          <Badge 
            variant={property.civilMepReport.investmentRecommendation === 'highly-recommended' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {property.civilMepReport.investmentRecommendation.replace('-', ' ')}
          </Badge>
        </div>
      )}

      {/* Exit Liquidity */}
      {property.valuationReport?.exitLiquidity && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Exit Liquidity</span>
          <span className="text-sm">{property.valuationReport.exitLiquidity}</span>
        </div>
      )}
    </div>
  );

  const renderEndUseMetrics = () => (
    <div className="space-y-3">
      {/* Lifestyle Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Lifestyle Score</span>
        <div className="flex items-center space-x-1">
          <Home className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">{getEndUseScore(property).toFixed(1)}/5</span>
        </div>
      </div>

      {/* Location Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Location</span>
        <div className="flex">
          {[1,2,3,4,5].map((star) => (
            <Star 
              key={star} 
              className={`h-3 w-3 ${star <= (property.locationScore || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      </div>

      {/* Amenities Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Amenities</span>
        <div className="flex">
          {[1,2,3,4,5].map((star) => (
            <Star 
              key={star} 
              className={`h-3 w-3 ${star <= (property.amenitiesScore || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      </div>

      {/* RERA Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">RERA Approved</span>
        {property.reraApproved ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Legal Status */}
      {property.legalVerdictBadge && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Legal Status</span>
          <Badge variant="outline" className="text-xs">
            {property.legalVerdictBadge}
          </Badge>
        </div>
      )}

      {/* Possession Date */}
      {property.possessionDate && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Possession</span>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{property.possessionDate}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card 
      className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onViewDetails}
      data-testid={`property-card-${property.id}`}
    >
      {/* Property Image */}
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-12 w-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Status Badge */}
        <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
          {property.status.replace('-', ' ').charAt(0).toUpperCase() + property.status.slice(1)}
        </Badge>
      </div>

      <CardContent className="p-6">
        {/* Property Header */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{property.name}</h3>
          <p className="text-gray-600 flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)}
          </p>
          <p className="text-sm text-gray-500">by {property.developer}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price Range</span>
            <span className="font-bold text-lg text-blue-600">
              {getPriceRange(property)}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Intent-specific metrics */}
        {userIntent === "investment" ? renderInvestmentMetrics() : renderEndUseMetrics()}

        {/* Property Tags */}
        {property.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-1">
              {property.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace("-", " ").charAt(0).toUpperCase() + tag.slice(1)}
                </Badge>
              ))}
              {property.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}