import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, List, MapPin, Calendar, Phone, ArrowLeft, Star, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPriceDisplay } from "@/lib/utils";
import { type Property, type PropertyConfiguration } from "@shared/schema";

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
  
  // Get preferences from navigation state
  const location = useLocation()[0];
  const preferences = (history.state?.preferences || {}) as PropertyPreferences;

  // Fetch all properties
  const { data: allProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch configurations for all properties
  const { data: allConfigurations = [] } = useQuery<PropertyConfiguration[]>({
    queryKey: ["/api/property-configurations"],
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
    if (allProperties.length && allConfigurations.length) {
      const filtered = filterAndScoreProperties();
      setMatchingProperties(filtered);
    }
  }, [allProperties, allConfigurations, preferences]);

  const filterAndScoreProperties = (): PropertyWithConfigurations[] => {
    return allProperties
      .map(property => {
        const propertyConfigs = allConfigurations.filter(config => config.propertyId === property.id);
        
        let score = 0;
        
        // Property type match (30 points)
        if (property.type === preferences.propertyType) score += 30;
        
        // Zone match (25 points)
        if (property.zone === preferences.zone) score += 25;
        
        // Budget range match (25 points)
        const prices = propertyConfigs.map(c => c.price);
        const minPrice = Math.min(...prices) / 10000000; // Convert to crores
        const maxPrice = Math.max(...prices) / 10000000;
        const budgetMin = preferences.budgetRange[0] / 100; // Convert from lakhs to crores
        const budgetMax = preferences.budgetRange[1] / 100;
        
        if (minPrice <= budgetMax && maxPrice >= budgetMin) {
          score += 25;
        }
        
        // Tags match (15 points)
        const matchingTags = property.tags.filter(tag => preferences.tags.includes(tag));
        score += (matchingTags.length / Math.max(preferences.tags.length, 1)) * 15;
        
        // BHK match (5 points)
        const hasMatchingBHK = propertyConfigs.some(config => 
          preferences.bhkType.some(bhk => config.configuration.includes(bhk))
        );
        if (hasMatchingBHK) score += 5;

        return {
          ...property,
          configurations: propertyConfigs,
          matchScore: Math.round(score)
        };
      })
      .filter(property => property.matchScore > 20) // Only show properties with decent match
      .sort((a, b) => b.matchScore - a.matchScore);
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

  const getPriceRange = (configurations: PropertyConfiguration[]) => {
    if (!configurations.length) return "Price on request";
    const prices = configurations.map(c => c.price);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Finding your perfect property...</p>
        </div>
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filters:</span>
              <Badge variant="secondary">{preferences.propertyType}</Badge>
              <Badge variant="secondary">{preferences.zone} Bengaluru</Badge>
              <Badge variant="secondary">
                ₹{preferences.budgetRange[0]}L - ₹{preferences.budgetRange[1]}L
              </Badge>
              {preferences.bhkType.map(bhk => (
                <Badge key={bhk} variant="outline">{bhk}</Badge>
              ))}
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
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{property.name}</CardTitle>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={matchInfo.color}>
                            {matchInfo.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(property.id)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                favorites.has(property.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-400'
                              }`} 
                            />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Property Image Placeholder */}
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-gray-400 text-center">
                            <div className="text-2xl mb-1">🏢</div>
                            <p className="text-xs">Property Image</p>
                          </div>
                        </div>

                        {/* Price and Configuration */}
                        <div className="space-y-2">
                          <div className="text-lg font-semibold text-primary">
                            {getPriceRange(property.configurations)}
                          </div>
                          
                          {property.configurations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {property.configurations.slice(0, 3).map((config, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {config.configuration}
                                </Badge>
                              ))}
                              {property.configurations.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{property.configurations.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {property.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>

                        {/* Match Score */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">{property.matchScore}% Match</span>
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-gray-400 cursor-help">ⓘ</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Match percentage based on your preferences</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBookVisit(property)}
                            className="flex-1 flex items-center justify-center space-x-1"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>Book Visit</span>
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleConsult(property)}
                            className="flex-1 flex items-center justify-center space-x-1"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Consult</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
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