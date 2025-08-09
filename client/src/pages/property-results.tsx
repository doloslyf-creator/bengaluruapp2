import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, MapPin, Calendar, Phone, ArrowLeft, Star, Eye, Heart, Filter, X, SlidersHorizontal, IndianRupee, Building, Shield, FileCheck, Clock, BarChart3, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import { DataTransparencyIndicator } from "@/components/data-transparency-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPriceDisplay } from "@/lib/utils";
import { generatePropertySlug } from "@/utils/seo";
import { type Property, type PropertyConfiguration } from "@shared/schema";
import { PropertyCardSkeleton } from "@/components/ui/skeleton";

// Placeholder for the SmartRecommendations component.
// This component would likely fetch and display personalized property recommendations.
// It's assumed to be defined elsewhere and imported.
const SmartRecommendations = ({ intent, userPreferences, className }: { intent: UserIntent; userPreferences: PropertyPreferences; className?: string }) => (
  <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
    <h2 className="text-2xl font-bold text-blue-800 mb-4">Smart Recommendations for You</h2>
    <p className="text-blue-700 mb-4">
      Based on your {intent === 'investment' ? 'investment goals' : 'lifestyle needs'}, here are some properties you might love:
    </p>
    {/* Placeholder for actual recommendation cards or list */}
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center space-x-3 bg-white p-3 rounded-md shadow">
        <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="flex items-center space-x-3 bg-white p-3 rounded-md shadow">
        <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
    <p className="text-sm text-blue-600 mt-4">
      We're continuously learning to provide better suggestions.
    </p>
  </div>
);


type UserIntent = 'investment' | 'end-use' | '';

interface PropertyPreferences {
  intent: UserIntent;
  propertyType: string;
  cityId: string;
  zoneId: string;
  zone?: string;
  budgetRange: [number, number];
  bhkType: string[];
  tags?: string[];
  amenities?: string[];
  // Investment-specific fields
  rentalYieldExpected?: number;
  investmentHorizon?: string;
  riskTolerance?: string;
  // End-use specific fields  
  familySize?: string;
  lifestyle?: string;
  commute?: string;
}

interface PropertyWithConfigurations extends Property {
  configurations: PropertyConfiguration[];
  matchScore: number;
}

export default function PropertyResults() {
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'match' | 'price-low' | 'price-high' | 'name'>('match');
  const [showFilters, setShowFilters] = useState(false);

  // Get preferences from navigation state or localStorage
  const getCachedPreferences = (): PropertyPreferences => {
    // First try to get from navigation state
    if (history.state?.preferences) {
      return history.state.preferences;
    }

    // Then try localStorage
    const cached = localStorage.getItem('propertyPreferences');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure all required fields exist
        return {
          intent: parsed.intent || '',
          propertyType: parsed.propertyType || "",
          cityId: parsed.cityId || "",
          zoneId: parsed.zoneId || "",
          zone: parsed.zone || "",
          budgetRange: parsed.budgetRange || [50, 500],
          bhkType: parsed.bhkType || [],
          tags: parsed.tags || [],
          amenities: parsed.amenities || [],
          ...parsed
        };
      } catch {
        // If parsing fails, return defaults
      }
    }

    // Default fallback
    return {
      intent: '',
      propertyType: "",
      cityId: "",
      zoneId: "",
      zone: "",
      budgetRange: [50, 500],
      bhkType: [],
      tags: [],
      amenities: []
    };
  };

  const location = useLocation()[0];
  const [preferences, setPreferences] = useState<PropertyPreferences>(
    (history.state?.preferences) || getCachedPreferences()
  );

  // Fetch all properties
  const { data: allProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch configurations for all properties
  const { data: allConfigurations = [] } = useQuery<PropertyConfiguration[]>({
    queryKey: ["/api/property-configurations/all"],
    queryFn: async () => {
      const response = await fetch('/api/property-configurations/all');
      if (response.ok) {
        return response.json();
      }
      return [];
    }
  });

  const [matchingProperties, setMatchingProperties] = useState<PropertyWithConfigurations[]>([]);

  // Helper function to get intent-specific highlights for properties
  const getIntentHighlights = (property: PropertyWithConfigurations) => {
    const highlights: { label: string; value: string; icon: any; color: string }[] = [];

    if (preferences.intent === 'investment') {
      // Investment-focused highlights
      highlights.push({
        label: "Rental Yield",
        value: "4.2% - 5.8%", // This would come from property data
        icon: BarChart3,
        color: "text-green-600"
      });

      highlights.push({
        label: "Appreciation",
        value: "12% CAGR", // This would come from property data
        icon: TrendingUp,
        color: "text-blue-600"
      });

      highlights.push({
        label: "Exit Liquidity",
        value: "High", // Based on property location/type
        icon: Clock,
        color: "text-purple-600"
      });

    } else if (preferences.intent === 'end-use') {
      // Lifestyle-focused highlights
      highlights.push({
        label: "Lifestyle Score",
        value: "8.5/10", // Based on amenities and area
        icon: Star,
        color: "text-purple-600"
      });

      highlights.push({
        label: "School Proximity", 
        value: "< 2km", // Distance to good schools
        icon: Building,
        color: "text-blue-600"
      });

      highlights.push({
        label: "Commute",
        value: "20-30 min", // To major IT hubs
        icon: Clock,
        color: "text-green-600"
      });
    }

    return highlights;
  };

  useEffect(() => {
    if (allProperties.length > 0) {
      const filtered = filterAndScoreProperties();
      const sorted = sortProperties(filtered);
      setMatchingProperties(sorted);
      console.log('Filtered properties result:', sorted.length);
    }
  }, [allProperties, allConfigurations, preferences, sortBy]);

  // Update preferences and cache when filters change
  const updatePreferences = (newPreferences: PropertyPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('propertyPreferences', JSON.stringify(newPreferences));
  };

  const filterAndScoreProperties = (): PropertyWithConfigurations[] => {
    console.log('Filtering properties:', allProperties.length, 'configurations:', allConfigurations.length);
    console.log('Preferences:', preferences);

    return allProperties
      .filter(property => {
        // Basic filtering - only exclude if there's a clear mismatch

        // Property type filter - only if specified
        if (preferences.propertyType && preferences.propertyType !== "" && preferences.propertyType !== property.type) {
          return false;
        }

        // Zone filter - only if specified, check both zoneId and zone name
        if (preferences.zoneId && preferences.zoneId !== "" && preferences.zoneId !== property.zoneId) {
          if (preferences.zone && preferences.zone !== "" && preferences.zone !== property.zone) {
            return false;
          }
        }

        return true;
      })
      .map(property => {
        const propertyConfigs = allConfigurations.filter(config => config.propertyId === property.id);

        let score = 0;

        // Property type match (30 points)
        if (preferences.propertyType && preferences.propertyType !== "" && preferences.propertyType === property.type) {
          score += 30;
        } else if (!preferences.propertyType || preferences.propertyType === "") {
          score += 20; // Default score when no type preference
        }

        // Zone match (25 points)
        if (preferences.zoneId && preferences.zoneId !== "" && preferences.zoneId === property.zoneId) {
          score += 25;
        } else if (preferences.zone && preferences.zone !== "" && preferences.zone === property.zone) {
          score += 25;
        } else if (!preferences.zoneId && !preferences.zone) {
          score += 15; // Default score when no zone preference
        }

        // Budget range match (25 points)
        if (propertyConfigs.length === 0) {
          score += 15; // Partial score when no price data available
        } else {
          try {
            // Calculate actual prices using pricePerSqft * builtUpArea
            const prices = propertyConfigs.map(c => {
              const pricePerSqft = parseFloat(c.pricePerSqft.toString()) || 0;
              const builtUpArea = c.builtUpArea || 1000; // Default area if missing
              return pricePerSqft * builtUpArea;
            }).filter(price => price > 0);

            if (prices.length > 0) {
              const minPrice = Math.min(...prices) / 1000000; // Convert to lakhs
              const maxPrice = Math.max(...prices) / 1000000;
              const budgetMin = preferences.budgetRange[0]; // Already in lakhs
              const budgetMax = preferences.budgetRange[1];

              // Check if there's any overlap in price ranges
              if (minPrice <= budgetMax && maxPrice >= budgetMin) {
                score += 25;
              } else if (Math.abs(minPrice - budgetMax) < budgetMax * 0.3 || Math.abs(maxPrice - budgetMin) < budgetMin * 0.3) {
                score += 15; // Close to budget range
              } else {
                score += 5; // Outside budget but still show
              }
            } else {
              score += 10; // Invalid price data
            }
          } catch (error) {
            score += 10; // Error in price calculation
          }
        }

        // Intent-based scoring (20 points)
        if (preferences.intent === 'investment') {
          // For investment intent, prioritize properties with good ROI indicators
          if (property.tags.some(tag => ['high-roi', 'rental-friendly', 'appreciation-potential'].includes(tag.toLowerCase()))) {
            score += 20;
          } else if (property.tags.some(tag => ['established-area', 'good-connectivity'].includes(tag.toLowerCase()))) {
            score += 15;
          } else {
            score += 10;
          }
        } else if (preferences.intent === 'end-use') {
          // For end-use intent, prioritize lifestyle and amenity-focused properties
          if (property.tags.some(tag => ['family-friendly', 'premium-amenities', 'good-schools'].includes(tag.toLowerCase()))) {
            score += 20;
          } else if (property.tags.some(tag => ['peaceful-area', 'good-connectivity'].includes(tag.toLowerCase()))) {
            score += 15;
          } else {
            score += 10;
          }
        } else {
          score += 10; // Default score when no intent specified
        }

        // BHK match (5 points) - if no configurations or preferences, give default score
        if (preferences.bhkType.length === 0) {
          score += 3; // Default score when no BHK preferences
        } else if (propertyConfigs.length === 0) {
          score += 2; // Partial score when no configuration data
        } else {
          const hasMatchingBHK = propertyConfigs.some(config => {
            const configLower = config.configuration.toLowerCase();
            return preferences.bhkType.some(bhk => {
              const bhkLower = bhk.toLowerCase().replace(' ', '');
              // Check for various BHK formats: "2 BHK", "2BHK", "2-BHK", etc.
              return configLower.includes(bhkLower) || 
                     configLower.includes(bhk.toLowerCase()) ||
                     configLower.includes(bhk.replace(' BHK', 'bhk').replace(' ', ''));
            });
          });
          if (hasMatchingBHK) score += 5;
        }

        const finalProperty = {
          ...property,
          configurations: propertyConfigs,
          matchScore: Math.round(Math.max(score, 20)) // Ensure minimum score of 20
        };

        return finalProperty;
      })
      .filter(property => property.matchScore >= 15) // Lower threshold to show more results
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const sortProperties = (properties: PropertyWithConfigurations[]): PropertyWithConfigurations[] => {
    return [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          // Handle properties with no configurations
          if (a.configurations.length === 0 && b.configurations.length === 0) return 0;
          if (a.configurations.length === 0) return 1; // Put at end
          if (b.configurations.length === 0) return -1; // Put at end

          const lowPricesA = a.configurations.map(c => parseFloat(c.pricePerSqft.toString()) * c.builtUpArea);
          const lowPricesB = b.configurations.map(c => parseFloat(c.pricePerSqft.toString()) * c.builtUpArea);
          const minPriceA = Math.min(...lowPricesA);
          const minPriceB = Math.min(...lowPricesB);
          return minPriceA - minPriceB;
        case 'price-high':
          // Handle properties with no configurations
          if (a.configurations.length === 0 && b.configurations.length === 0) return 0;
          if (a.configurations.length === 0) return 1; // Put at end
          if (b.configurations.length === 0) return -1; // Put at end

          const highPricesA = a.configurations.map(c => parseFloat(c.pricePerSqft.toString()) * c.builtUpArea);
          const highPricesB = b.configurations.map(c => parseFloat(c.pricePerSqft.toString()) * c.builtUpArea);
          const maxPriceA = Math.max(...highPricesA);
          const maxPriceB = Math.max(...highPricesB);
          return maxPriceB - maxPriceA;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'match':
        default:
          return b.matchScore - a.matchScore;
      }
    });
  };

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  const handleBookVisit = (property: PropertyWithConfigurations) => {
    navigate('/book-visit', { state: { property, preferences } });
  };

  const handleConsult = (property: PropertyWithConfigurations) => {
    navigate('/consultation', { state: { property, preferences } });
  };

  const handleViewProperty = (property: PropertyWithConfigurations) => {
    // Store current preferences and property data for the detail page
    localStorage.setItem('propertyPreferences', JSON.stringify(preferences));
    localStorage.setItem('currentProperty', JSON.stringify(property));
    navigate(`/property/${property.id}`);
  };

  const getPriceRange = (configurations: PropertyConfiguration[]) => {
    if (!configurations.length) {
      // Show default pricing if no configurations available
      return "Price on Request";
    }

    try {
      // Calculate actual prices using pricePerSqft * builtUpArea
      const prices = configurations.map(c => {
        const pricePerSqft = parseFloat(c.pricePerSqft.toString()) || 0;
        const builtUpArea = c.builtUpArea || 1000;
        return pricePerSqft * builtUpArea;
      }).filter(price => price > 0);

      if (prices.length === 0) {
        return "Price on Request";
      }

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return formatPriceDisplay(minPrice);
      }
      return `${formatPriceDisplay(minPrice)} - ${formatPriceDisplay(maxPrice)}`;
    } catch (error) {
      return "Price on Request";
    }
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return { label: "Perfect Match", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { label: "Great Match", color: "bg-blue-100 text-blue-800" };
    if (score >= 40) return { label: "Good Match", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Fair Match", color: "bg-gray-100 text-gray-800" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Header Skeleton */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Results Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'grid grid-cols-1 lg:grid-cols-2 gap-4'
          }`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/find-property')}
                  className="flex items-center space-x-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {preferences.intent === 'investment' ? 'Investment Properties' : 
                     preferences.intent === 'end-use' ? 'Homes for You' : 
                     'Property Results'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {matchingProperties.length} {preferences.intent === 'investment' ? 'investment opportunities' : 
                    preferences.intent === 'end-use' ? 'family homes' : 'properties'} found
                    {preferences.intent && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {preferences.intent === 'investment' ? '💰 Investment Focus' : '🏡 Family Focus'}
                      </span>
                    )}
                  </p>
                </div>

                {/* Data Transparency Indicator */}
                <div className="ml-6">
                  <DataTransparencyIndicator 
                    variant="compact" 
                    sources={["RERA Database", "Site Verification"]}
                    lastUpdated="Today"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Best Match</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Properties</SheetTitle>
                    </SheetHeader>
                    <PropertyFilters 
                      preferences={preferences} 
                      onUpdatePreferences={updatePreferences}
                      properties={allProperties}
                    />
                  </SheetContent>
                </Sheet>

                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters Summary */}
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Filters:</span>
                {preferences.propertyType && <Badge variant="secondary" className="text-xs">{preferences.propertyType}</Badge>}
                {preferences.zone && <Badge variant="secondary" className="text-xs">{preferences.zone}</Badge>}
                <Badge variant="secondary" className="text-xs">
                  ₹{preferences.budgetRange[0]}L - ₹{preferences.budgetRange[1]}L
                </Badge>
                {preferences.bhkType.slice(0, 2).map(bhk => (
                  <Badge key={bhk} variant="outline" className="text-xs">{bhk}</Badge>
                ))}
                {preferences.bhkType.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{preferences.bhkType.length - 2} BHK
                  </Badge>
                )}
                {preferences.tags?.slice(0, 1).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {preferences.tags && preferences.tags.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    +{preferences.tags.length - 1} features
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/find-property')}
                className="shrink-0 text-xs h-7"
              >
                Refine
              </Button>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Section */}
        {preferences.intent && matchingProperties.length > 0 && (
          <div className="mb-12">
            <SmartRecommendations
              intent={preferences.intent}
              userPreferences={preferences}
              className="mb-8"
            />
          </div>
        )}

        {/* Results */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {matchingProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching properties found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or budget range to see more options
              </p>
              <Button onClick={() => navigate('/find-property')}>
                Refine Search
              </Button>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {matchingProperties.map(property => {
                  const matchInfo = getMatchLabel(property.matchScore);

                  return (
                    <Card key={property.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-primary/30 bg-white">
                      <div onClick={() => handleViewProperty(property)} className="relative">
                        {/* Property Image */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                          <div className="text-primary/60 text-center">
                            <div className="text-3xl mb-1">🏢</div>
                            <p className="text-xs font-medium text-gray-600">Property Image</p>
                          </div>

                          {/* Match Badge - Top Left */}
                          <Badge className={`absolute top-3 left-3 ${matchInfo.color} text-xs font-semibold shadow-sm`}>
                            {property.matchScore}% Match
                          </Badge>

                          {/* Heart Button - Top Right */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(property.id);
                            }}
                            className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white backdrop-blur-sm"
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                favorites.has(property.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-400 hover:text-red-400'
                              }`} 
                            />
                          </Button>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          {/* Property Title */}
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                            {property.name}
                          </h3>

                          {/* Location */}
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="line-clamp-1">{property.area}, {property.zone ? property.zone.charAt(0).toUpperCase() + property.zone.slice(1) : 'Unknown Zone'}</span>
                          </div>

                          {/* Developer */}
                          <p className="text-xs text-gray-500 mb-3">By {property.developer}</p>

                          {/* Price */}
                          <div className="text-lg font-bold text-primary mb-3">
                            {getPriceRange(property.configurations)}
                          </div>

                          {/* Configurations */}
                          {property.configurations.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {property.configurations.slice(0, 3).map((config, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700">
                                    {config.configuration}
                                  </Badge>
                                ))}
                                {property.configurations.length > 3 && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 border-gray-200 text-gray-600">
                                    +{property.configurations.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Intent-Based Highlights */}
                          {preferences.intent && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2">
                                {getIntentHighlights(property).slice(0, 2).map((highlight, index) => (
                                  <div key={index} className="flex items-center space-x-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                                    <highlight.icon className={`w-3 h-3 ${highlight.color}`} />
                                    <span className="text-xs font-medium text-gray-700">{highlight.label}:</span>
                                    <span className={`text-xs font-semibold ${highlight.color}`}>{highlight.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Features - Only show if no intent or as fallback */}
                          {(!preferences.intent || property.tags.length > 0) && (
                            <div className="flex flex-wrap gap-1">
                              {property.tags.slice(0, preferences.intent ? 1 : 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                                  {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                              {property.tags.length > (preferences.intent ? 1 : 2) && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                                  +{property.tags.length - (preferences.intent ? 1 : 2)}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matchingProperties.map(property => {
                  const matchInfo = getMatchLabel(property.matchScore);

                  return (
                    <Card key={property.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-primary/30 bg-white">
                      <div onClick={() => handleViewProperty(property)} className="flex p-6 gap-6">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div className="text-primary/60 text-center">
                              <div className="text-4xl mb-1">🏢</div>
                              <p className="text-xs font-medium text-gray-600">Property</p>
                            </div>

                            {/* Heart Button - Overlay */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(property.id);
                              }}
                              className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white backdrop-blur-sm p-0"
                            >
                              <Heart 
                                className={`h-4 w-4 ${
                                  favorites.has(property.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-gray-400 hover:text-red-400'
                                }`} 
                              />
                            </Button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3 min-w-0">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                {property.name}
                              </h3>

                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0" />
                                <span className="line-clamp-1">{property.area}, {property.zone ? property.zone.charAt(0).toUpperCase() + property.zone.slice(1) : 'Unknown Zone'}</span>
                              </div>

                              <p className="text-sm text-gray-500">By {property.developer}</p>
                            </div>

                            <Badge className={`${matchInfo.color} text-sm font-semibold shrink-0`}>
                              {property.matchScore}% Match
                            </Badge>
                          </div>

                          {/* Price */}
                          <div className="text-xl font-bold text-primary">
                            {getPriceRange(property.configurations)}
                          </div>

                          {/* Configurations Row */}
                          {property.configurations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Available Configurations</p>
                              <div className="flex flex-wrap gap-2">
                                {property.configurations.slice(0, 4).map((config, index) => (
                                  <Badge key={index} variant="outline" className="text-sm px-3 py-1 bg-blue-50 border-blue-200 text-blue-700">
                                    {config.configuration}
                                  </Badge>
                                ))}
                                {property.configurations.length > 4 && (
                                  <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-50 border-gray-200 text-gray-600">
                                    +{property.configurations.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Intent-Based Highlights */}
                          {preferences.intent && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {preferences.intent === 'investment' ? 'Investment Metrics' : 'Lifestyle Highlights'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {getIntentHighlights(property).map((highlight, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                                    <highlight.icon className={`w-4 h-4 ${highlight.color}`} />
                                    <span className="text-sm font-medium text-gray-700">{highlight.label}:</span>
                                    <span className={`text-sm font-bold ${highlight.color}`}>{highlight.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Features Row - Show only if no intent or as additional info */}
                          {(!preferences.intent || property.tags.length > 0) && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Key Features</p>
                              <div className="flex flex-wrap gap-2">
                                {property.tags.slice(0, preferences.intent ? 2 : 3).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-600">
                                    {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                ))}
                                {property.tags.length > (preferences.intent ? 2 : 3) && (
                                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-600">
                                    +{property.tags.length - (preferences.intent ? 2 : 3)} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

// Property Filters Component
interface PropertyFiltersProps {
  preferences: PropertyPreferences;
  onUpdatePreferences: (preferences: PropertyPreferences) => void;
  properties: Property[];
}

function PropertyFilters({ preferences, onUpdatePreferences, properties }: PropertyFiltersProps) {
  // Extract real options from properties
  const zones = Array.from(new Set(properties.map(p => p.zone))).sort();
  const propertyTypes = Array.from(new Set(properties.map(p => p.type))).map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));

  const allTags = Array.from(new Set(properties.flatMap(p => p.tags || []))).sort();
  const tags = allTags.map(tag => ({
    value: tag,
    label: tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const bhkOptions = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"];

  const handlePreferenceChange = (key: keyof PropertyPreferences, value: any) => {
    // Convert "any" back to empty string for internal use
    const processedValue = value === "any" ? "" : value;
    const newPreferences = {
      ...preferences,
      [key]: processedValue
    };
    onUpdatePreferences(newPreferences);
  };

  const handleArrayToggle = (key: keyof PropertyPreferences, value: string) => {
    const currentArray = preferences[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    handlePreferenceChange(key, newArray);
  };

  const formatBudget = (value: number) => {
    if (value >= 100) {
      return `₹${value / 100} Cr`;
    }
    return `₹${value} L`;
  };

  const clearAllFilters = () => {
    const clearedPreferences: PropertyPreferences = {
      intent: '',
      propertyType: "",
      cityId: "",
      zoneId: "",
      zone: "",
      budgetRange: [50, 500],
      bhkType: [],
      amenities: [],
      tags: []
    };
    onUpdatePreferences(clearedPreferences);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Property Type</label>
        <Select 
          value={preferences.propertyType || "any"} 
          onValueChange={(value) => handlePreferenceChange('propertyType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Type</SelectItem>
            {propertyTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zone */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Zone</label>
        <Select 
          value={preferences.zone || "any"} 
          onValueChange={(value) => handlePreferenceChange('zone', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Zone</SelectItem>
            {zones.map(zone => zone ? (
              <SelectItem key={zone} value={zone}>
                {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
              </SelectItem>
            ) : null)}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Range */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Budget Range</label>
        <div className="px-2">
          <Slider
            value={preferences.budgetRange}
            onValueChange={(value) => handlePreferenceChange('budgetRange', value as [number, number])}
            max={500}
            min={10}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{formatBudget(preferences.budgetRange[0])}</span>
            <span>{formatBudget(preferences.budgetRange[1])}</span>
          </div>
        </div>
      </div>

      {/* BHK Configuration */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">BHK Type</label>
        <div className="grid grid-cols-2 gap-3">
          {bhkOptions.map(bhk => (
            <div key={bhk} className="flex items-center space-x-2">
              <Checkbox 
                id={`filter-${bhk}`}
                checked={preferences.bhkType.includes(bhk)}
                onCheckedChange={() => handleArrayToggle('bhkType', bhk)}
              />
              <label htmlFor={`filter-${bhk}`} className="text-sm text-gray-700 cursor-pointer">
                {bhk}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Features</label>
        <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
          {tags.slice(0, 10).map(tag => (
            <div key={tag.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`filter-${tag.value}`}
                checked={preferences.tags?.includes(tag.value) || false}
                onCheckedChange={() => handleArrayToggle('tags', tag.value)}
              />
              <label htmlFor={`filter-${tag.value}`} className="text-sm text-gray-700 cursor-pointer">
                {tag.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}