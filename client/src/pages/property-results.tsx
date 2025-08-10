import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, MapPin, Calendar, Phone, ArrowLeft, Star, Eye, Heart, Filter, X, SlidersHorizontal, IndianRupee, Building, Shield, FileCheck, Clock, BarChart3, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPriceDisplay } from "@/lib/utils";
import { generatePropertySlug } from "@/utils/seo";
import { type Property, type PropertyConfiguration } from "@shared/schema";
import { PropertyCardSkeleton } from "@/components/ui/skeleton";

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
        
        // Property type filter - only if specified and not "all"
        if (preferences.propertyType && preferences.propertyType !== "" && preferences.propertyType !== "all" && preferences.propertyType !== property.type) {
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
        if (preferences.propertyType && preferences.propertyType !== "" && preferences.propertyType !== "all" && preferences.propertyType === property.type) {
          score += 30;
        } else if (!preferences.propertyType || preferences.propertyType === "" || preferences.propertyType === "all") {
          score += 20; // Default score when no type preference or "all" selected
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
              const budgetMin = preferences.budgetRange?.[0] || 50; // Already in lakhs
              const budgetMax = preferences.budgetRange?.[1] || 500;
              
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
      <div className="min-h-screen bg-white">
        <Header />
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
                <div>
                  <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Results Skeleton */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/find-property')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
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
                {preferences.budgetRange && preferences.budgetRange.length === 2 && (
                  <Badge variant="secondary" className="text-xs">
                    ₹{preferences.budgetRange[0]}L - ₹{preferences.budgetRange[1]}L
                  </Badge>
                )}
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
                    {tag.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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

        {/* Results */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {matchingProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matching properties found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or budget range to see more options
              </p>
              <button 
                onClick={() => navigate('/find-property')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Refine Search
              </button>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {matchingProperties.map(property => {
                  const matchInfo = getMatchLabel(property.matchScore);
                  
                  return (
                    <div key={property.id} className="group cursor-pointer bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all duration-200">
                      <div onClick={() => handleViewProperty(property)} className="relative">
                        {/* Property Image */}
                        <div className="aspect-[4/3] bg-gray-50 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                          <div className="text-gray-300 text-center">
                            <div className="text-2xl mb-1">🏢</div>
                            <p className="text-xs text-gray-500">Property Image</p>
                          </div>
                          
                          {/* Match Badge - Top Left */}
                          <div className="absolute top-3 left-3 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                            {property.matchScore}% Match
                          </div>
                          
                          {/* Heart Button - Top Right */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(property.id);
                            }}
                            className="absolute top-3 right-3 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                favorites.has(property.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-400 hover:text-red-400'
                              }`} 
                            />
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          {/* Property Title */}
                          <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                            {property.name}
                          </h3>
                          
                          {/* Location */}
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            <span>{property.area}, {property.zone ? property.zone.charAt(0).toUpperCase() + property.zone.slice(1) : 'Unknown Zone'}</span>
                          </div>
                          
                          {/* Developer */}
                          <p className="text-xs text-gray-400 mb-3">By {property.developer}</p>
                          
                          {/* Price */}
                          <div className="text-lg font-medium text-emerald-600 mb-3">
                            {getPriceRange(property.configurations)}
                          </div>
                          
                          {/* Configurations */}
                          {property.configurations.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {property.configurations.slice(0, 3).map((config, index) => (
                                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                    {config.configuration}
                                  </span>
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {matchingProperties.map(property => {
                  const matchInfo = getMatchLabel(property.matchScore);
                  
                  return (
                    <div key={property.id} className="group cursor-pointer bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all duration-200">
                      <div onClick={() => handleViewProperty(property)} className="flex p-4 gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div className="text-gray-300 text-center">
                              <div className="text-2xl mb-1">🏢</div>
                            </div>
                            
                            {/* Heart Button - Overlay */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(property.id);
                              }}
                              className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <Heart 
                                className={`h-3 w-3 ${
                                  favorites.has(property.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-gray-400 hover:text-red-400'
                                }`} 
                              />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2 min-w-0">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                                {property.name}
                              </h3>
                              
                              <div className="flex items-center text-sm text-gray-500 mb-1">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400 shrink-0" />
                                <span className="truncate">{property.area}, {property.zone ? property.zone.charAt(0).toUpperCase() + property.zone.slice(1) : 'Unknown Zone'}</span>
                              </div>
                              
                              <p className="text-xs text-gray-400">By {property.developer}</p>
                            </div>
                            
                            <div className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full shrink-0">
                              {property.matchScore}% Match
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-lg font-medium text-emerald-600">
                            {getPriceRange(property.configurations)}
                          </div>
                          
                          {/* Configurations */}
                          {property.configurations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {property.configurations.slice(0, 3).map((config, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                  {config.configuration}
                                </span>
                              ))}
                              {property.configurations.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                  +{property.configurations.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>
    </TooltipProvider>
  );

  // Property Filters Component
  function PropertyFilters({ 
    preferences, 
    onUpdatePreferences,
    properties 
  }: {
    preferences: PropertyPreferences;
    onUpdatePreferences: (updates: Partial<PropertyPreferences>) => void;
    properties: Property[];
  }) {
    return (
      <div className="space-y-6 mt-6">
        {/* Budget Range */}
        <div>
          <h4 className="font-medium mb-3">Budget Range (₹L)</h4>
          <Slider
            value={preferences.budgetRange || [50, 500]}
            onValueChange={(value) => onUpdatePreferences({ budgetRange: value as [number, number] })}
            min={50}
            max={1000}
            step={25}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>₹{preferences.budgetRange?.[0] || 50}L</span>
            <span>₹{preferences.budgetRange?.[1] || 500}L</span>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h4 className="font-medium mb-3">Property Type</h4>
          <Select value={preferences.propertyType} onValueChange={(value) => onUpdatePreferences({ propertyType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* BHK Type */}
        <div>
          <h4 className="font-medium mb-3">Configuration</h4>
          <div className="grid grid-cols-2 gap-2">
            {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map(bhk => (
              <div key={bhk} className="flex items-center space-x-2">
                <Checkbox
                  id={bhk}
                  checked={preferences.bhkType.includes(bhk)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onUpdatePreferences({ 
                        bhkType: [...preferences.bhkType, bhk]
                      });
                    } else {
                      onUpdatePreferences({
                        bhkType: preferences.bhkType.filter(b => b !== bhk)
                      });
                    }
                  }}
                />
                <label htmlFor={bhk} className="text-sm">{bhk}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
