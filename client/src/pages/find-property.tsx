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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-800 bg-clip-text text-transparent">PropertyFinder</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1">
                  Step {currentStep} of 3
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-200 transition-all duration-200"
                >
                  ← Back to Home
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-6">
              <div className="flex-1 bg-slate-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                Find Your Dream Property
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-4">
              Tell us what you're looking for
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Help us find the perfect property that matches your preferences and lifestyle
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent font-bold">Property Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Property Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
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
              </div>

              {/* Zone */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
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
              </div>

              {/* Budget Range */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
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
                <div className="px-4">
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
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center space-x-3">
                  <div className="p-1 bg-blue-100 rounded-md">
                    <Home className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>BHK Configuration</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {bhkOptions.map(bhk => (
                    <label
                      key={bhk}
                      className={`
                        flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105
                        ${preferences.bhkType.includes(bhk) 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
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
              </div>

              {/* Special Features */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
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
                      <label htmlFor={tag.value} className="text-sm text-gray-700 cursor-pointer">
                        {tag.label}
                      </label>
                    </div>
                  )) : (
                    <div className="col-span-full text-sm text-gray-500">
                      {properties.length === 0 ? "Loading features..." : "No features available from your properties"}
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
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
                      <label htmlFor={amenity} className="text-sm text-gray-700 cursor-pointer">
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
              className="border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all duration-200"
            >
              Back to Home
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-3"
              disabled={!preferences.propertyType || !preferences.zone}
            >
              <span className="font-semibold">Find Matching Properties</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}