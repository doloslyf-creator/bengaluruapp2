import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Search,
  TrendingUp,
  Heart,
  ArrowLeft,
  Target,
  Clock,
  Shield,
  Calculator,
  Users,
  Briefcase,
  School
} from "lucide-react";
import { type Property } from "@shared/schema";
import Header from "@/components/layout/header";
import { DataTransparencyIndicator } from "@/components/data-transparency-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

type UserIntent = 'investment' | 'end-use' | '';

interface PropertyPreferences {
  intent: UserIntent;
  propertyType: string;
  cityId: string;
  zoneId: string;
  budgetRange: [number, number];
  bhkType: string[];
  // Investment-specific fields
  rentalYieldExpected?: number;
  investmentHorizon?: string;
  riskTolerance?: string;
  // End-use specific fields  
  familySize?: string;
  lifestyle?: string;
  commute?: string;
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
      intent: '',
      propertyType: "",
      cityId: "",
      zoneId: "",
      budgetRange: [50, 500], // in lakhs
      bhkType: []
    };
  };

  const [preferences, setPreferences] = useState<PropertyPreferences>(getCachedPreferences());

  // Check for search parameter from header search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      // If there's a search parameter, redirect directly to results
      const searchPreferences = {
        ...preferences,
        searchTerm: searchParam,
        intent: preferences.intent || 'end-use' // Default to end-use if no intent set
      };
      localStorage.setItem('propertyPreferences', JSON.stringify(searchPreferences));
      navigate('/property-results', { state: { preferences: searchPreferences } });
    }
  }, [navigate, preferences]);

  // Fetch properties to extract real options
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch cities and zones for dropdowns
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const response = await fetch("/api/cities");
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json();
    },
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["/api/zones/city", preferences.cityId],
    queryFn: async () => {
      if (!preferences.cityId) return [];
      const response = await fetch(`/api/zones/city/${preferences.cityId}`);
      if (!response.ok) throw new Error("Failed to fetch zones");
      return response.json();
    },
    enabled: !!preferences.cityId,
  });

  // Extract unique property types from database
  const displayPropertyTypes = [
    { value: "villa", label: "Villa" },
    { value: "apartment", label: "Apartment" },
    { value: "plot", label: "Plot/Land" }
  ];

  // Extract BHK options
  const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

  const handlePreferenceChange = (key: keyof PropertyPreferences, value: any) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };

    // When zone changes, also store the zone name for filtering
    if (key === 'zoneId' && value) {
      const selectedZone = zones.find(zone => zone.id === value);
      if (selectedZone) {
        newPreferences.zone = selectedZone.name;
      }
    }

    setPreferences(newPreferences);
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
    const hasIntent = preferences.intent !== "";
    const hasPropertyType = preferences.propertyType !== "";
    // Make city and zone optional for better user experience
    const hasBhkType = preferences.propertyType === "plot" || preferences.bhkType.length > 0 || !preferences.propertyType;

    return hasIntent && (hasPropertyType || !hasIntent) && hasBhkType;
  };

  const getIntentSpecificFields = () => {
    if (preferences.intent === 'investment') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-light text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
            Investment Preferences
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                Expected Rental Yield
              </Label>
              <Select 
                value={preferences.rentalYieldExpected?.toString()} 
                onValueChange={(value) => handlePreferenceChange('rentalYieldExpected', Number(value))}
              >
                <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                  <SelectValue placeholder="Select expected yield" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3% - 4%</SelectItem>
                  <SelectItem value="4">4% - 5%</SelectItem>
                  <SelectItem value="5">5% - 6%</SelectItem>
                  <SelectItem value="6">6%+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                Investment Horizon
              </Label>
              <Select 
                value={preferences.investmentHorizon} 
                onValueChange={(value) => handlePreferenceChange('investmentHorizon', value)}
              >
                <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                  <SelectValue placeholder="Investment timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">1-3 years (Short term)</SelectItem>
                  <SelectItem value="medium">3-7 years (Medium term)</SelectItem>
                  <SelectItem value="long">7+ years (Long term)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                Risk Tolerance
              </Label>
              <Select 
                value={preferences.riskTolerance} 
                onValueChange={(value) => handlePreferenceChange('riskTolerance', value)}
              >
                <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                  <SelectValue placeholder="Risk appetite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk (Established areas)</SelectItem>
                  <SelectItem value="medium">Medium Risk (Developing areas)</SelectItem>
                  <SelectItem value="high">High Risk (Emerging areas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    } else if (preferences.intent === 'end-use') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-light text-gray-900 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-emerald-600" />
            Personal Preferences
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                Family Size
              </Label>
              <Select 
                value={preferences.familySize} 
                onValueChange={(value) => handlePreferenceChange('familySize', value)}
              >
                <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                  <SelectValue placeholder="Family members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single/Couple</SelectItem>
                  <SelectItem value="small">Small family (3-4 members)</SelectItem>
                  <SelectItem value="large">Large family (5+ members)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                Lifestyle Priority
              </Label>
              <Select 
                value={preferences.lifestyle} 
                onValueChange={(value) => handlePreferenceChange('lifestyle', value)}
              >
                <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                  <SelectValue placeholder="What matters most?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peaceful">Peaceful & Quiet</SelectItem>
                  <SelectItem value="social">Social & Community</SelectItem>
                  <SelectItem value="convenient">Convenient & Central</SelectItem>
                  <SelectItem value="luxury">Luxury & Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                Commute Priority
              </Label>
              <Select 
                value={preferences.commute} 
                onValueChange={(value) => handlePreferenceChange('commute', value)}
              >
                <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                  <SelectValue placeholder="Work location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech-parks">IT Parks (Whitefield, Electronic City)</SelectItem>
                  <SelectItem value="city-center">City Center (MG Road, Brigade Road)</SelectItem>
                  <SelectItem value="airport">Airport Area</SelectItem>
                  <SelectItem value="flexible">Work from Home/Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Minimal Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-light text-gray-900 mb-4">
              Find Your Perfect Property
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tell us your purpose and preferences - we'll match you with properties 
              that fit your specific needs.
            </p>
          </div>

          {/* Minimal Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-12">
            <div className="text-center">
              <div className="text-2xl font-light text-emerald-600">{properties.length}+</div>
              <div className="text-sm text-gray-500 mt-1">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-emerald-600">Zero</div>
              <div className="text-sm text-gray-500 mt-1">Fees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-emerald-600">AI</div>
              <div className="text-sm text-gray-500 mt-1">Matching</div>
            </div>
          </div>

          {/* Minimal Transparency */}
          <div className="text-center">
            <DataTransparencyIndicator 
              variant="banner" 
              sources={["RERA Database Verified", "Site Visit Verified", "Updated Daily"]}
            />
          </div>
        </div>
      </section>

      {/* Minimal Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Minimal Progress */}
          <div className="mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <p className="text-center text-gray-500 text-sm">Step 1 of 2</p>
          </div>

          {/* Minimal Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12">
            <div className="space-y-10">
              {/* Minimal Intent Selection */}
              <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-lg font-light text-gray-900 mb-2">What's your purpose?</h2>
                    <p className="text-gray-500 text-sm">This helps us show you relevant information</p>
                  </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePreferenceChange('intent', 'investment')}
                    className={`p-6 rounded-xl border transition-colors text-left ${
                      preferences.intent === 'investment'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-medium text-gray-900">Investment</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Looking for rental income or capital appreciation
                    </p>
                    <div className="text-xs text-emerald-600">
                      ROI Analysis • Rental Yields • Market Trends
                    </div>
                  </button>

                  <button
                    onClick={() => handlePreferenceChange('intent', 'end-use')}
                    className={`p-6 rounded-xl border transition-colors text-left ${
                      preferences.intent === 'end-use'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-medium text-gray-900">Personal Home</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Looking for a home to live in with your family
                    </p>
                    <div className="text-xs text-emerald-600">
                      Lifestyle Fit • Amenities • Community
                    </div>
                  </button>
                </div>
              </div>

              {/* Minimal Property Basics */}
              {preferences.intent && (
                <div className="space-y-8 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <h2 className="text-lg font-light text-gray-900 mb-2">Property Basics</h2>
                    <p className="text-gray-500 text-sm">Tell us about your preferred type and location</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Property Type */}
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Property Type <span className="text-red-400">*</span>
                      </Label>
                      <Select 
                        value={preferences.propertyType} 
                        onValueChange={(value) => handlePreferenceChange('propertyType', value)}
                      >
                        <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {displayPropertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Selection */}
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        City <span className="text-red-400">*</span>
                      </Label>
                      <Select 
                        value={preferences.cityId} 
                        onValueChange={(value) => {
                          handlePreferenceChange('cityId', value);
                          handlePreferenceChange('zoneId', ''); // Reset zone when city changes
                        }}
                      >
                        <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city: any) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Zone Selection */}
                    <div>
                      <Label className="text-sm text-gray-700 mb-2 block">
                        Zone <span className="text-red-400">*</span>
                      </Label>
                      <Select 
                        value={preferences.zoneId} 
                        onValueChange={(value) => handlePreferenceChange('zoneId', value)}
                        disabled={!preferences.cityId}
                      >
                        <SelectTrigger className="h-11 border border-gray-200 focus:border-emerald-300">
                          <SelectValue placeholder={preferences.cityId ? "Select zone" : "Select city first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone: any) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              <span className="capitalize">{zone.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* BHK Configuration - Hidden for Plot */}
                  {preferences.propertyType && preferences.propertyType !== "plot" && (
                    <div>
                      <Label className="text-sm text-gray-700 mb-4 block">
                        Configuration <span className="text-red-400">*</span>
                      </Label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {bhkOptions.map((bhk) => (
                          <button
                            key={bhk}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              preferences.bhkType.includes(bhk)
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleArrayToggle('bhkType', bhk)}
                          >
                            <span className="text-sm">{bhk}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget Range */}
                  <div>
                    <Label className="text-sm text-gray-700 mb-4 block">
                      Budget Range
                    </Label>
                    <div className="px-4">
                      <Slider
                        value={preferences.budgetRange}
                        onValueChange={(value) => handlePreferenceChange('budgetRange', value)}
                        max={1000}
                        min={25}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>{formatBudget(preferences.budgetRange[0])}</span>
                        <span>{formatBudget(preferences.budgetRange[1])}</span>
                      </div>
                      <div className="text-center mt-4">
                        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                          <IndianRupee className="w-4 h-4" />
                          <span>{formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Intent-Specific Fields */}
              {preferences.intent && preferences.propertyType && (
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  {getIntentSpecificFields()}
                </div>
              )}

              {/* Minimal Search Button */}
              <div className="text-center pt-8">
                <button
                  onClick={handleSearch}
                  disabled={!isFormValid()}
                  className={`px-8 py-3 rounded-xl transition-colors ${
                    isFormValid()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Find Properties
                </button>

                {!isFormValid() && (
                  <p className="text-sm text-gray-500 mt-3">
                    Please complete all required fields
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