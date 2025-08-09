import { useState } from "react";
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
  School,
  CheckCircle,
  Star
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
    const hasIntent = preferences.intent !== "";
    const hasPropertyType = preferences.propertyType !== "";
    const hasCity = preferences.cityId !== "";
    const hasZone = preferences.zoneId !== "";
    const hasBhkType = preferences.propertyType === "plot" || preferences.bhkType.length > 0;
    
    return hasIntent && hasPropertyType && hasCity && hasZone && hasBhkType;
  };

  const getIntentSpecificFields = () => {
    if (preferences.intent === 'investment') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-600 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Investment Preferences
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Expected Rental Yield
              </Label>
              <Select 
                value={preferences.rentalYieldExpected?.toString()} 
                onValueChange={(value) => handlePreferenceChange('rentalYieldExpected', Number(value))}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
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
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Investment Horizon
              </Label>
              <Select 
                value={preferences.investmentHorizon} 
                onValueChange={(value) => handlePreferenceChange('investmentHorizon', value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
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
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Risk Tolerance
              </Label>
              <Select 
                value={preferences.riskTolerance} 
                onValueChange={(value) => handlePreferenceChange('riskTolerance', value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
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
          <h3 className="text-lg font-semibold text-purple-600 flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Personal Preferences
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Family Size
              </Label>
              <Select 
                value={preferences.familySize} 
                onValueChange={(value) => handlePreferenceChange('familySize', value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
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
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Lifestyle Priority
              </Label>
              <Select 
                value={preferences.lifestyle} 
                onValueChange={(value) => handlePreferenceChange('lifestyle', value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
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
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Commute Priority
              </Label>
              <Select 
                value={preferences.commute} 
                onValueChange={(value) => handlePreferenceChange('commute', value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Enhanced Hero Header with Premium Design */}
      <section className="relative bg-gradient-to-br from-white via-blue-50 to-indigo-50 py-16 border-b overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-2/3 right-1/4 w-24 h-24 bg-indigo-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-purple-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="animate-fade-in mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <MapPin className="w-4 h-4 mr-2 animate-bounce" />
                <span className="font-semibold">AI-Powered Property Matching</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-tight animate-slide-up delay-100">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <span className="block text-orange-600 mt-2">
                Property Match
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium animate-slide-up delay-200 mb-12">
              Tell us your purpose and preferences - our AI will match you with properties 
              that fit your specific needs and show relevant insights.
            </p>

            {/* Enhanced Stats with Animations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              {[
                { number: `${properties.length}+`, label: "Verified Properties", color: "text-blue-600", bgColor: "bg-blue-50", icon: Building2 },
                { number: "Zero", label: "Broker Fees", color: "text-green-600", bgColor: "bg-green-50", icon: Shield },
                { number: "AI", label: "Intent-Based Matching", color: "text-purple-600", bgColor: "bg-purple-50", icon: Target }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`${stat.bgColor} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            
            {/* Enhanced Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-slate-600 animate-slide-up delay-500">
              {[
                { icon: CheckCircle, text: "RERA Verified", color: "text-green-600" },
                { icon: Shield, text: "Expert Analysis", color: "text-blue-600" },
                { icon: Star, text: "4.9/5 Rating", color: "text-yellow-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  <item.icon className={`w-4 h-4 mr-2 ${item.color}`} />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            
            {/* Enhanced Data Transparency Banner */}
            <div className="mt-12 animate-slide-up delay-600">
              <DataTransparencyIndicator 
                variant="banner" 
                sources={["RERA Database Verified", "Site Visit Verified", "Updated Daily"]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Progress & Form Container */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm font-medium text-gray-900">Intent & Preferences</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-gray-500">Smart Results</span>
              </div>
            </div>
            <p className="text-center text-gray-600">Tell us your purpose and get tailored property matches</p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <div className="space-y-10">
              {/* Step 1: Intent Selection */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your purpose?</h2>
                  <p className="text-gray-600">This helps us show you the most relevant property information</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePreferenceChange('intent', 'investment')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                      preferences.intent === 'investment'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment</h3>
                        <p className="text-sm text-gray-600">
                          Looking for rental income, capital appreciation, or portfolio expansion
                        </p>
                        <div className="mt-3 text-xs text-green-600 font-medium">
                          • ROI Analysis • Rental Yields • Market Trends • Exit Strategy
                        </div>
                      </div>
                    </div>
                    {preferences.intent === 'investment' && (
                      <div className="w-4 h-4 bg-green-500 rounded-full ml-auto mt-2" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePreferenceChange('intent', 'end-use')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                      preferences.intent === 'end-use'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Home</h3>
                        <p className="text-sm text-gray-600">
                          Looking for a home to live in with your family
                        </p>
                        <div className="mt-3 text-xs text-purple-600 font-medium">
                          • Lifestyle Fit • Amenities • Commute • Schools • Community
                        </div>
                      </div>
                    </div>
                    {preferences.intent === 'end-use' && (
                      <div className="w-4 h-4 bg-purple-500 rounded-full ml-auto mt-2" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Step 2: Property Basics - Only show after intent selection */}
              {preferences.intent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-8 border-t border-gray-100"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Basics</h2>
                    <p className="text-gray-600">Tell us about your preferred property type and location</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Property Type */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Property Type <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={preferences.propertyType} 
                        onValueChange={(value) => handlePreferenceChange('propertyType', value)}
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
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
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={preferences.cityId} 
                        onValueChange={(value) => {
                          handlePreferenceChange('cityId', value);
                          handlePreferenceChange('zoneId', ''); // Reset zone when city changes
                        }}
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
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
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Zone <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={preferences.zoneId} 
                        onValueChange={(value) => handlePreferenceChange('zoneId', value)}
                        disabled={!preferences.cityId}
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
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
                      <Label className="text-sm font-medium text-gray-700 mb-4 block">
                        Configuration <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {bhkOptions.map((bhk) => (
                          <button
                            key={bhk}
                            className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                              preferences.bhkType.includes(bhk)
                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleArrayToggle('bhkType', bhk)}
                          >
                            <span className="font-medium text-sm">{bhk}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget Range */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-4 block">
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
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{formatBudget(preferences.budgetRange[0])}</span>
                        <span>{formatBudget(preferences.budgetRange[1])}</span>
                      </div>
                      <div className="text-center mt-4">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                          <IndianRupee className="w-4 h-4" />
                          <span>{formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Intent-Specific Fields */}
              {preferences.intent && preferences.propertyType && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-8 border-t border-gray-100"
                >
                  {getIntentSpecificFields()}
                </motion.div>
              )}

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
                >
                  <Search className="h-5 w-5 mr-3" />
                  Find My Perfect Properties
                  <Target className="h-5 w-5 ml-3" />
                </Button>
                
                {!isFormValid() && (
                  <p className="text-sm text-red-500 mt-4">
                    Please complete all required fields to continue
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