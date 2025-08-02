import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, MapPin, Calendar, Phone, ArrowLeft, Star, Eye, Heart, Filter, X, SlidersHorizontal, IndianRupee, Building, Shield } from "lucide-react";
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
import { type Property, type PropertyConfiguration } from "@shared/schema";
import { PropertyCardSkeleton } from "@/components/ui/skeleton";

interface PropertyPreferences {
  propertyType: string;
  zone: string;
  budgetRange: [number, number];
  bhkType: string[];
  amenities: string[];
  tags: string[];
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
    const cached = localStorage.getItem('propertyPreferences');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // If parsing fails, return defaults
      }
    }
    return {
      propertyType: "",
      zone: "",
      budgetRange: [50, 500],
      bhkType: [],
      amenities: [],
      tags: []
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
        // STRICT filtering: If property type is selected, only show matching properties
        if (preferences.propertyType && preferences.propertyType !== property.type) {
          return false;
        }
        return true;
      })
      .map(property => {
        const propertyConfigs = allConfigurations.filter(config => config.propertyId === property.id);
        
        let score = 0;
        
        // Property type match (30 points) - since we've pre-filtered, always give full score
        if (preferences.propertyType && preferences.propertyType === property.type) {
          score += 30;
        } else if (!preferences.propertyType) {
          score += 15; // Default score when no type preference
        }
        
        // Zone match (25 points) - if no preference set, give partial score
        if (!preferences.zone || preferences.zone === property.zone) {
          score += preferences.zone ? 25 : 12;
        }
        
        // Budget range match (25 points) - if no configurations, give default score
        if (propertyConfigs.length === 0) {
          score += 20; // Default score when no price data available
        } else {
          // Calculate actual prices using pricePerSqft * builtUpArea
          const prices = propertyConfigs.map(c => {
            const pricePerSqft = parseFloat(c.pricePerSqft.toString());
            const builtUpArea = c.builtUpArea;
            return pricePerSqft * builtUpArea;
          });
          const minPrice = Math.min(...prices) / 10000000; // Convert to crores
          const maxPrice = Math.max(...prices) / 10000000;
          const budgetMin = preferences.budgetRange[0] / 100; // Convert from lakhs to crores
          const budgetMax = preferences.budgetRange[1] / 100;
          
          if (minPrice <= budgetMax && maxPrice >= budgetMin) {
            score += 25;
          }
        }
        
        // Tags match (15 points) - if no preferences, give default score
        if (preferences.tags.length === 0) {
          score += 10; // Default score when no tag preferences
        } else {
          const matchingTags = property.tags.filter(tag => preferences.tags.includes(tag));
          score += (matchingTags.length / preferences.tags.length) * 15;
        }
        
        // BHK match (5 points) - if no configurations or preferences, give default score
        if (preferences.bhkType.length === 0) {
          score += 3; // Default score when no BHK preferences
        } else if (propertyConfigs.length === 0) {
          score += 2; // Partial score when no configuration data
        } else {
          const hasMatchingBHK = propertyConfigs.some(config => 
            preferences.bhkType.some(bhk => config.configuration.includes(bhk))
          );
          if (hasMatchingBHK) score += 5;
        }

        const finalProperty = {
          ...property,
          configurations: propertyConfigs,
          matchScore: Math.round(score)
        };
        
        return finalProperty;
      })
      .filter(property => property.matchScore > 10) // Lower threshold to show more results
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
    navigate(`/property/${property.id}`);
  };

  const getPriceRange = (configurations: PropertyConfiguration[]) => {
    if (!configurations.length) return "Price on request";
    
    // Calculate actual prices using pricePerSqft * builtUpArea
    const prices = configurations.map(c => {
      const pricePerSqft = parseFloat(c.pricePerSqft.toString());
      const builtUpArea = c.builtUpArea;
      return pricePerSqft * builtUpArea;
    });
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPriceDisplay(minPrice);
    }
    return `${formatPriceDisplay(minPrice)} - ${formatPriceDisplay(maxPrice)}`;
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/find-property')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Property Results</h1>
                  <p className="text-sm text-gray-600">
                    Found {matchingProperties.length} properties matching your preferences
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
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {preferences.propertyType && <Badge variant="secondary">{preferences.propertyType}</Badge>}
                {preferences.zone && <Badge variant="secondary">{preferences.zone} Bengaluru</Badge>}
                <Badge variant="secondary">
                  ₹{preferences.budgetRange[0]}L - ₹{preferences.budgetRange[1]}L
                </Badge>
                {preferences.bhkType.map(bhk => (
                  <Badge key={bhk} variant="outline">{bhk}</Badge>
                ))}
                {preferences.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {preferences.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{preferences.tags.length - 2} more
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/find-property')}
                className="shrink-0"
              >
                Refine Search
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {matchingProperties.map(property => {
                const matchInfo = getMatchLabel(property.matchScore);
                
                return (
                  <Card key={property.id} className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
                    <div onClick={() => handleViewProperty(property)}>
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                {property.name}
                              </CardTitle>
                              <Badge className={matchInfo.color + " text-xs font-semibold ml-3"}>
                                ({matchInfo.label})
                              </Badge>
                            </div>
                            <div className="flex items-center mb-2">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              <span className="text-xs text-gray-600 mr-2">{property.matchScore}% Match</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">Match percentage based on your preferences:<br/>
                                  • Property type match (30 points)<br/>
                                  • Zone preference (25 points)<br/>
                                  • Budget range (25 points)<br/>
                                  • Tags & amenities (15 points)<br/>
                                  • Configuration match (5 points)</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Bengaluru
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              By {property.developer}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(property.id);
                            }}
                            className="absolute top-4 right-4"
                          >
                            <Heart 
                              className={`h-5 w-5 ${
                                favorites.has(property.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-400 hover:text-red-400'
                              }`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Property Image Placeholder */}
                          <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/15 rounded-xl flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden border border-primary/10">
                            <div className="text-primary/60 text-center">
                              <div className="text-4xl mb-2">🏢</div>
                              <p className="text-sm font-medium">Property Image</p>
                            </div>
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Price Section - Clean */}
                          <div className="text-xl font-bold text-primary mb-3">
                            {getPriceRange(property.configurations)}
                          </div>
                          
                          {/* Configuration Types */}
                          {property.configurations.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-600 mb-2 font-medium">Available Configurations</p>
                              <div className="flex flex-wrap gap-2">
                                {property.configurations.slice(0, 4).map((config, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-white border-primary/30 text-gray-700 hover:bg-primary/5">
                                    {config.configuration}
                                  </Badge>
                                ))}
                                {property.configurations.length > 4 && (
                                  <Badge variant="outline" className="text-xs bg-white border-primary/30 text-gray-700">
                                    +{property.configurations.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}



                          {/* Key Tags */}
                          {property.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {property.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                                  {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                              {property.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                  +{property.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                    

                  </Card>
                );
              })}
            </div>
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
      propertyType: "",
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
            {zones.map(zone => (
              <SelectItem key={zone} value={zone}>
                {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
              </SelectItem>
            ))}
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
                checked={preferences.tags.includes(tag.value)}
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