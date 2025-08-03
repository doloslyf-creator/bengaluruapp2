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
    navigate('/find-property/results', { state: { preferences } });
  };

  const formatBudget = (value: number) => {
    if (value >= 100) {
      return `₹${value / 100} Cr`;
    }
    return `₹${value} L`;
  };

  const isFormValid = () => {
    return preferences.propertyType !== "" && preferences.zone !== "" && preferences.bhkType.length > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-white">
                <Heart className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Your Perfect Home
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tell me what you're looking for and I'll find properties that match your dreams. 
              Everything in one place - no more clicking through endless steps!
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6"
        >
          {/* Essential Preferences - Row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property Type */}
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Home className="h-5 w-5 text-primary" />
                  <span>Property Type</span>
                  <span className="text-red-500 text-sm">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {displayPropertyTypes.map((type) => (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        preferences.propertyType === type.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-white hover:border-primary/50'
                      }`}
                      onClick={() => handlePreferenceChange('propertyType', type.value)}
                      data-testid={`select-property-type-${type.value}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.label}</span>
                        {preferences.propertyType === type.value && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Zone */}
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Preferred Zone</span>
                  <span className="text-red-500 text-sm">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {displayZones.map((zone) => (
                    <motion.div
                      key={zone}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        preferences.zone === zone
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-white hover:border-primary/50'
                      }`}
                      onClick={() => handlePreferenceChange('zone', zone)}
                      data-testid={`select-zone-${zone}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{zone} Bengaluru</span>
                        {preferences.zone === zone && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BHK Configuration and Budget - Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* BHK Type */}
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Configuration</span>
                  <span className="text-red-500 text-sm">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {bhkOptions.map((bhk) => (
                    <motion.div
                      key={bhk}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all duration-200 ${
                        preferences.bhkType.includes(bhk)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-white hover:border-primary/50'
                      }`}
                      onClick={() => handleArrayToggle('bhkType', bhk)}
                      data-testid={`select-bhk-${bhk}`}
                    >
                      <span className="font-medium text-sm">{bhk}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Select all that work for you</p>
              </CardContent>
            </Card>

            {/* Budget Range */}
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <span>Budget Range</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900 mb-1">
                      {formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}
                    </div>
                    <p className="text-sm text-gray-600">Your comfortable investment range</p>
                  </div>
                  
                  <div className="px-2">
                    <Slider
                      value={preferences.budgetRange}
                      onValueChange={(value) => handlePreferenceChange('budgetRange', value as [number, number])}
                      max={500}
                      min={10}
                      step={10}
                      className="w-full"
                      data-testid="slider-budget-range"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹10L</span>
                      <span>₹5Cr</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optional Preferences - Row 3 */}
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Amenities & Features</span>
                <span className="text-sm text-gray-500 font-normal">(Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Amenities */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Amenities you'd love to have
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenities.map((amenity) => (
                      <motion.div
                        key={amenity}
                        whileHover={{ scale: 1.02 }}
                        className={`p-2 rounded-lg border cursor-pointer text-xs text-center transition-all duration-200 ${
                          preferences.amenities.includes(amenity)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 bg-white hover:border-primary/50'
                        }`}
                        onClick={() => handleArrayToggle('amenities', amenity)}
                        data-testid={`select-amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {amenity}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Special Features */}
                {tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Special features that matter
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tags.map((tag) => (
                        <motion.div
                          key={tag.value}
                          whileHover={{ scale: 1.02 }}
                          className={`p-2 rounded-lg border cursor-pointer text-xs text-center transition-all duration-200 ${
                            preferences.tags.includes(tag.value)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 bg-white hover:border-primary/50'
                          }`}
                          onClick={() => handleArrayToggle('tags', tag.value)}
                          data-testid={`select-tag-${tag.value}`}
                        >
                          {tag.label}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Button */}
          <div className="text-center">
            <Button
              onClick={handleSearch}
              disabled={!isFormValid()}
              size="lg"
              className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${
                isFormValid()
                  ? 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              data-testid="button-search-properties"
            >
              <Search className="h-5 w-5 mr-2" />
              Find My Perfect Home
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>
            
            {!isFormValid() && (
              <p className="text-sm text-red-500 mt-2">
                Please select property type, zone, and at least one configuration to continue
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}