import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Search,
  Sparkles,
  Filter,
  Heart,
  ArrowLeft
} from "lucide-react";
import { type Property } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface PropertyPreferences {
  propertyType: string;
  zone: string;
  budgetRange: [number, number];
  bhkType: string[];
  amenities: string[];
  tags: string[];
  lifestyle: string;
  timeline: string;
}

export default function FindProperty() {
  const [, navigate] = useLocation();
  
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
      tags: [],
      lifestyle: "",
      timeline: ""
    };
  };

  const [preferences, setPreferences] = useState<PropertyPreferences>(getCachedPreferences());

  // Fetch properties to extract real options
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract real options from properties data  
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

  // Display options with fallbacks
  const displayZones = zones.length > 0 ? zones : ["north", "south", "east", "west", "central"];
  const displayPropertyTypes = propertyTypes.length > 0 ? propertyTypes : [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "plot", label: "Plot" }
  ];

  // Static options
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

  const handleSearch = () => {
    // Cache preferences before navigating
    localStorage.setItem('propertyPreferences', JSON.stringify(preferences));
    navigate('/property-results', { state: { preferences } });
  };

  const formatBudget = (value: number) => {
    if (value >= 100) {
      return `₹${value / 100} Cr`;
    }
    return `₹${value} L`;
  };

  const isFormValid = () => {
    const hasPropertyType = preferences.propertyType !== "";
    const hasZone = preferences.zone !== "";
    const hasBhkType = preferences.propertyType === "plot" || preferences.bhkType.length > 0;
    
    return hasPropertyType && hasZone && hasBhkType;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Integrated Header */}
      <section className="bg-white py-16 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find Your Perfect Property
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Answer a few questions about your preferences and we'll match you with properties 
              that fit your lifestyle and budget. Our AI-powered matching saves you time and effort.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{properties.length}+</div>
              <div className="text-sm text-gray-600 mt-1">Verified Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Zero</div>
              <div className="text-sm text-gray-600 mt-1">Broker Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">AI</div>
              <div className="text-sm text-gray-600 mt-1">Powered Matching</div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress & Form Container */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm font-medium text-gray-900">Preferences</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-gray-500">Results</span>
              </div>
            </div>
            <p className="text-center text-gray-600">Tell us what you're looking for</p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <div className="space-y-10">
              {/* Step 1: Property Type & Location */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What are you looking for?</h2>
                  <p className="text-gray-600">Choose your property type and preferred area</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Property Type */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3">
                      {displayPropertyTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handlePreferenceChange('propertyType', type.value)}
                          data-testid={`select-property-type-${type.value}`}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            preferences.propertyType === type.value
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Home className="w-5 h-5" />
                              <span className="font-medium text-lg">{type.label}</span>
                            </div>
                            {preferences.propertyType === type.value && (
                              <div className="w-3 h-3 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Zone */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Preferred Zone <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3">
                      {displayZones.map((zone) => (
                        <button
                          key={zone}
                          onClick={() => handlePreferenceChange('zone', zone)}
                          data-testid={`select-zone-${zone}`}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            preferences.zone === zone
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5" />
                              <span className="font-medium text-lg capitalize">{zone} Bengaluru</span>
                            </div>
                            {preferences.zone === zone && (
                              <div className="w-3 h-3 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Configuration & Budget */}
              <div className="space-y-6 pt-8 border-t border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration & Budget</h2>
                  <p className="text-gray-600">Select your preferred configuration and budget range</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* BHK Configuration - Hidden for Plot */}
                  {preferences.propertyType !== "plot" && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Configuration <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {bhkOptions.map((bhk) => (
                          <button
                            key={bhk}
                            className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                              preferences.bhkType.includes(bhk)
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleArrayToggle('bhkType', bhk)}
                            data-testid={`select-bhk-${bhk.toLowerCase().replace('+', 'plus')}`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">{bhk}</span>
                            </div>
                            {preferences.bhkType.includes(bhk) && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">Select all that work for you</p>
                    </div>
                  )}

                  {/* Budget Range */}
                  <div className={preferences.propertyType === "plot" ? "md:col-span-2" : ""}>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Budget Range
                    </label>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="mb-6 relative">
                        <Slider
                          value={preferences.budgetRange}
                          onValueChange={(value) => handlePreferenceChange('budgetRange', value)}
                          max={1000}
                          min={20}
                          step={10}
                          className="w-full [&>span:first-child]:h-6 [&>span:first-child]:w-6 [&>span:first-child]:border-4 [&>span:first-child]:border-white [&>span:first-child]:bg-blue-600 [&>span:first-child]:shadow-lg [&>span:last-child]:h-6 [&>span:last-child]:w-6 [&>span:last-child]:border-4 [&>span:last-child]:border-white [&>span:last-child]:bg-blue-600 [&>span:last-child]:shadow-lg"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-4">
                        <span>{formatBudget(preferences.budgetRange[0])}</span>
                        <span>{formatBudget(preferences.budgetRange[1])}</span>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                          <IndianRupee className="w-4 h-4" />
                          <span>{formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Optional Preferences */}
              <div className="space-y-6 pt-8 border-t border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Preferences</h2>
                  <p className="text-gray-600">Tell us about amenities and features you'd love to have (optional)</p>
                </div>
                
                <div className="space-y-6">
                  {/* Amenities */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Preferred Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {amenities.map((amenity) => (
                        <button
                          key={amenity}
                          onClick={() => handleArrayToggle('amenities', amenity)}
                          data-testid={`select-amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                            preferences.amenities.includes(amenity)
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium text-sm">{amenity}</span>
                          </div>
                          {preferences.amenities.includes(amenity) && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto mt-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Features */}
                  {tags.length > 0 && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Special Features
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {tags.slice(0, 9).map((tag) => (
                          <button
                            key={tag.value}
                            onClick={() => handleArrayToggle('tags', tag.value)}
                            data-testid={`select-tag-${tag.value}`}
                            className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                              preferences.tags.includes(tag.value)
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <Filter className="w-4 h-4" />
                              <span className="font-medium text-sm">{tag.label}</span>
                            </div>
                            {preferences.tags.includes(tag.value) && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center pt-8">
                <Button
                  onClick={handleSearch}
                  disabled={!isFormValid()}
                  className={`px-12 py-4 text-lg font-semibold rounded-2xl transition-all duration-200 ${
                    isFormValid()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  data-testid="button-search-properties"
                >
                  <Search className="h-5 w-5 mr-3" />
                  Find My Perfect Properties
                  <Sparkles className="h-5 w-5 ml-3" />
                </Button>
                
                {!isFormValid() && (
                  <p className="text-sm text-red-500 mt-4">
                    {preferences.propertyType === "plot" 
                      ? "Please select property type and zone to continue"
                      : "Please select property type, zone, and at least one configuration to continue"
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}