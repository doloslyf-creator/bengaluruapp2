import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Home, IndianRupee, Filter, ChevronRight, Sparkles, Target, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";
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
import { BorderBeam } from "@/components/magicui/border-beam";
import GradualSpacing from "@/components/magicui/gradual-spacing";
import ShineBorder from "@/components/magicui/shine-border";

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Animated Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative bg-card/80 backdrop-blur-xl shadow-xl border-b sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-4"
              >
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <BorderBeam size={50} duration={12} delay={0} />
                </div>
                <div>
                  <GradualSpacing 
                    text="Find My Property"
                    className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                    duration={0.3}
                    delayMultiple={0.08}
                  />
                  <p className="text-muted-foreground mt-1">Discover your dream home with AI-powered matching</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center space-x-4"
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
                  <Target className="h-4 w-4 mr-2" />
                  Smart Search
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="px-6 py-2 hover:scale-105 transition-transform"
                >
                  ← Back to Home
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Animated Progress Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-8">
              <div className="flex-1 relative">
                <div className="bg-muted rounded-full h-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                    transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-primary to-primary/80 h-4 rounded-full shadow-lg"
                  />
                </div>
                <div className="absolute top-6 left-0 flex justify-between w-full">
                  {["Property Type", "Location & Budget", "Perfect Match"].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
                      className={`text-sm font-medium ${
                        index < currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-primary">AI-Powered Search</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="relative inline-block">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Tell us what you're looking for
              </h2>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 1 }}
                className="h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full mx-auto"
              />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
              Help us find the perfect property that matches your preferences and lifestyle. 
              Our AI will analyze thousands of properties to bring you the best matches.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <ShineBorder
              className="relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-0 shadow-2xl"
              color={["#a855f7", "#3b82f6", "#06b6d4"]}
              borderRadius={20}
              borderWidth={2}
              duration={12}
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-8">
                  <CardTitle className="flex items-center space-x-4 text-2xl">
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ delay: 1.5, duration: 1 }}
                      className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg"
                    >
                      <Search className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Property Preferences
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      <Heart className="h-4 w-4 mr-1" />
                      AI-Powered
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-10">
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

                  {/* Find Properties Button */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                    className="pt-8 border-t"
                  >
                    <OnboardingTooltip
                      stepId="find-button"
                      title="Find Your Perfect Properties"
                      description="Ready to discover your dream property? Click here to see properties that match your preferences!"
                      position="top"
                    >
                      <Button 
                        onClick={handleNext}
                        size="lg"
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        disabled={!preferences.propertyType || !preferences.zone}
                      >
                        <motion.div
                          initial={{ x: -100 }}
                          animate={{ x: 0 }}
                          transition={{ delay: 2.2, duration: 0.5 }}
                          className="flex items-center"
                        >
                          <Search className="mr-2 h-5 w-5" />
                          Find My Dream Properties
                          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      </Button>
                    </OnboardingTooltip>
                  </motion.div>
                </CardContent>
              </Card>
            </ShineBorder>
          </motion.div>
        </main>
      </div>
    </TooltipProvider>
  );
}