import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Home, IndianRupee, Filter, ChevronRight } from "lucide-react";
import { type Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OnboardingTooltip } from "@/components/onboarding/onboarding-tooltip";

interface PropertyPreferences {
  propertyType: string;
  zone: string;
  budgetRange: [number, number];
  bhkType: string[];
  amenities: string[];
  tags: string[];
}

export default function FindProperty() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Load cached preferences if returning from results page
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
      budgetRange: [50, 500], // in lakhs
      bhkType: [],
      amenities: [],
      tags: []
    };
  };

  const [preferences, setPreferences] = useState<PropertyPreferences>(getCachedPreferences());

  // Fetch properties to extract real options
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract real options from admin panel data
  const zones = Array.from(new Set(properties.map(p => p.zone).filter(Boolean))).sort();
  const propertyTypes = Array.from(new Set(properties.map(p => p.type).filter(Boolean))).map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));
  
  const allTags = Array.from(new Set(properties.flatMap(p => p.tags || []))).filter(Boolean).sort();
  const tags = allTags.map(tag => ({
    value: tag,
    label: tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  // Add some fallback options if no data is loaded yet
  const fallbackZones = ["north", "south", "east", "west", "central"];
  const fallbackPropertyTypes = [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "plot", label: "Plot" },
    { value: "commercial", label: "Commercial" }
  ];
  
  const displayZones = zones.length > 0 ? zones : (propertiesLoading ? [] : fallbackZones);
  const displayPropertyTypes = propertyTypes.length > 0 ? propertyTypes : (propertiesLoading ? [] : fallbackPropertyTypes);

  // Debug logging (can be removed in production)
  if (properties.length > 0) {
    console.log(`Properties loaded: ${properties.length}, Zones: [${zones.join(', ')}], Types: [${propertyTypes.map(t => t.value).join(', ')}]`);
  }

  // Static options that don't come from properties
  const bhkOptions = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"];
  const amenities = [
    "Swimming Pool", "Gym", "Parking", "Security", "Garden",
    "Clubhouse", "Children's Play Area", "Power Backup", "Lift"
  ];

  const handlePreferenceChange = (key: keyof PropertyPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayToggle = (key: keyof PropertyPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Cache preferences before navigating
      localStorage.setItem('propertyPreferences', JSON.stringify(preferences));
      navigate('/find-property/results', { state: { preferences } });
    }
  };

  const formatBudget = (value: number) => {
    if (value >= 100) {
      return `₹${value / 100} Cr`;
    }
    return `₹${value} L`;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-xl">
                  <Home className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold">PropertyFinder</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">
                  Step {currentStep} of 3
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  ← Back to Home
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-muted/50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-6">
              <div className="flex-1 bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                Find Your Dream Property
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4">
              Tell us what you're looking for
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Help us find the perfect property that matches your preferences and lifestyle
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-primary rounded-lg">
                  <Search className="h-5 w-5 text-primary-foreground" />
                </div>
                <span>Property Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Property Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Property Type</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-gray-400 cursor-help">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose the type of property you're interested in</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <OnboardingTooltip
                  stepId="property-type-select"
                  title="Choose Your Property Type"
                  description="Start by selecting the type of property you're looking for. This helps us match you with the most relevant options."
                  position="bottom"
                >
                  <Select 
                    value={preferences.propertyType} 
                    onValueChange={(value) => handlePreferenceChange('propertyType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayPropertyTypes.length > 0 ? displayPropertyTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      )) : (
                        <SelectItem value="loading" disabled>
                          {propertiesLoading ? "Loading property types..." : `No property types found (${properties.length} properties loaded)`}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </OnboardingTooltip>
              </div>

              {/* Zone */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Preferred Zone</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-gray-400 cursor-help">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the area of Bengaluru you prefer</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <OnboardingTooltip
                  stepId="zone-select"
                  title="Select Your Preferred Zone"
                  description="Choose the area in Bengaluru where you'd like to find properties. Different zones offer different amenities and connectivity."
                  position="bottom"
                >
                  <Select 
                    value={preferences.zone} 
                    onValueChange={(value) => handlePreferenceChange('zone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayZones.length > 0 ? displayZones.map(zone => (
                        <SelectItem key={zone} value={zone}>
                          {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
                        </SelectItem>
                      )) : (
                        <SelectItem value="loading" disabled>
                          {propertiesLoading ? "Loading zones..." : `No zones found (${properties.length} properties loaded)`}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </OnboardingTooltip>
              </div>

              {/* Budget Range */}
              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <IndianRupee className="h-4 w-4" />
                  <span>Budget Range</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-gray-400 cursor-help">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set your budget range in Indian Rupees</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <OnboardingTooltip
                  stepId="budget-slider"
                  title="Set Your Budget Range"
                  description="Use the slider to set your comfortable budget range. This helps us filter properties that match your financial preferences."
                  position="top"
                >
                  <div className="px-4">
                    <Slider
                      value={preferences.budgetRange}
                      onValueChange={(value) => handlePreferenceChange('budgetRange', value as [number, number])}
                      max={500}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{formatBudget(preferences.budgetRange[0])}</span>
                      <span>{formatBudget(preferences.budgetRange[1])}</span>
                    </div>
                  </div>
                </OnboardingTooltip>
              </div>

              {/* BHK Configuration */}
              <div className="space-y-4">
                <label className="text-sm font-semibold flex items-center space-x-3">
                  <div className="p-1 bg-muted rounded-md">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <span>BHK Configuration</span>
                </label>
                <OnboardingTooltip
                  stepId="bhk-selection"
                  title="Choose BHK Configuration"
                  description="Select the number of bedrooms you prefer. You can choose multiple options to see more variety."
                  position="bottom"
                >
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {bhkOptions.map(bhk => (
                      <label
                        key={bhk}
                        className={`
                          flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                          ${preferences.bhkType.includes(bhk) 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'bg-card border-border hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={preferences.bhkType.includes(bhk)}
                          onChange={() => handleArrayToggle('bhkType', bhk)}
                        />
                        <span className="text-sm font-semibold">{bhk}</span>
                      </label>
                    ))}
                  </div>
                </OnboardingTooltip>
              </div>

              {/* Special Features */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Special Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tags.length > 0 ? tags.map(tag => (
                    <div key={tag.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={tag.value}
                        checked={preferences.tags.includes(tag.value)}
                        onCheckedChange={() => handleArrayToggle('tags', tag.value)}
                      />
                      <label htmlFor={tag.value} className="text-sm cursor-pointer">
                        {tag.label}
                      </label>
                    </div>
                  )) : (
                    <div className="col-span-full text-sm text-muted-foreground">
                      {properties.length === 0 ? "Loading features..." : "No features available from your properties"}
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Preferred Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={amenity}
                        checked={preferences.amenities.includes(amenity)}
                        onCheckedChange={() => handleArrayToggle('amenities', amenity)}
                      />
                      <label htmlFor={amenity} className="text-sm cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-10">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <OnboardingTooltip
              stepId="find-button"
              title="Find Your Properties!"
              description="Click here to search for properties matching your preferences. We'll show you the best matches first."
              position="top"
            >
              <Button 
                onClick={handleNext}
                size="lg"
                disabled={!preferences.propertyType || !preferences.zone}
              >
                <span>Find Matching Properties</span>
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </OnboardingTooltip>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}