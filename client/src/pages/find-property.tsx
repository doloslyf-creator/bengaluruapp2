import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Star, 
  ChevronLeft, 
  ArrowRight, 
  Check, 
  Heart, 
  Target, 
  Zap, 
  Sparkles 
} from "lucide-react";
import { type Property } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('enter');
  const totalSteps = 6;
  
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
    if (currentStep < totalSteps - 1) {
      setAnimationPhase('exit');
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setAnimationPhase('enter');
      }, 300);
    } else {
      // Cache preferences before navigating
      localStorage.setItem('propertyPreferences', JSON.stringify(preferences));
      navigate('/find-property/results', { state: { preferences } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setAnimationPhase('exit');
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimationPhase('enter');
      }, 300);
    } else {
      navigate('/');
    }
  };

  const formatBudget = (value: number) => {
    if (value >= 100) {
      return `₹${value / 100} Cr`;
    }
    return `₹${value} L`;
  };

  const getStepProgress = () => ((currentStep + 1) / totalSteps) * 100;

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return preferences.propertyType !== "";
      case 2: return preferences.zone !== "";
      case 3: return preferences.bhkType.length > 0;
      case 4: return preferences.budgetRange[0] > 0;
      case 5: return preferences.amenities.length > 0 || preferences.tags.length > 0;
      default: return true;
    }
  };

  const steps = [
    {
      id: 0,
      title: "Hi there! I'm Priti from OwnItRight",
      subtitle: "I'm here to help you find your perfect home",
      icon: <Heart className="h-6 w-6" />
    },
    {
      id: 1,
      title: "What type of home are you dreaming of?",
      subtitle: "I want to understand your vision",
      icon: <Home className="h-6 w-6" />
    },
    {
      id: 2,
      title: "Which part of Bengaluru calls to you?",
      subtitle: "I know the city well - let me guide you",
      icon: <MapPin className="h-6 w-6" />
    },
    {
      id: 3,
      title: "How much space would make you happy?",
      subtitle: "I'll help you find the right fit",
      icon: <Building2 className="h-6 w-6" />
    },
    {
      id: 4,
      title: "What's your comfortable investment range?",
      subtitle: "I'll work within your budget",
      icon: <IndianRupee className="h-6 w-6" />
    },
    {
      id: 5,
      title: "Any special touches that matter to you?",
      subtitle: "I want to know what makes you smile",
      icon: <Sparkles className="h-6 w-6" />
    }
  ];

  // Step content components
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="space-y-3">
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                I know finding the right property can feel overwhelming. That's exactly why I'm here - 
                to make this journey personal, simple, and actually enjoyable for you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border"
              >
                <Target className="h-6 w-6 text-primary mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">Personalized Search</h3>
                <p className="text-sm text-gray-600">I'll learn about your preferences to find properties that truly match what you're looking for</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border"
              >
                <Zap className="h-6 w-6 text-primary mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">I'll analyze your choices to suggest properties you might not have considered</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border"
              >
                <Star className="h-6 w-6 text-primary mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">Expert Guidance</h3>
                <p className="text-sm text-gray-600">Every property comes with my detailed insights, legal verification, and professional advice</p>
              </motion.div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {displayPropertyTypes.map((type, index) => (
              <motion.div
                key={type.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  preferences.propertyType === type.value
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() => handlePreferenceChange('propertyType', type.value)}
              >
                <div className="flex items-center space-x-3">
                  <Home className={`h-5 w-5 ${preferences.propertyType === type.value ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`font-medium ${preferences.propertyType === type.value ? 'text-primary' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                  {preferences.propertyType === type.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {displayZones.map((zone, index) => (
              <motion.div
                key={zone}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  preferences.zone === zone
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() => handlePreferenceChange('zone', zone)}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-5 w-5 ${preferences.zone === zone ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`font-medium ${preferences.zone === zone ? 'text-primary' : 'text-gray-700'}`}>
                    {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
                  </span>
                  {preferences.zone === zone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bhkOptions.map((bhk, index) => (
                <motion.div
                  key={bhk}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-all duration-200 ${
                    preferences.bhkType.includes(bhk)
                      ? 'border-primary bg-primary/10 text-primary shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                  }`}
                  onClick={() => handleArrayToggle('bhkType', bhk)}
                >
                  <Building2 className={`h-5 w-5 mx-auto mb-1 ${preferences.bhkType.includes(bhk) ? 'text-primary' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">{bhk}</span>
                  {preferences.bhkType.includes(bhk) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1"
                    >
                      <Check className="h-3 w-3 text-primary mx-auto" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">Select all that work for you - I'll find options in each</p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/60 backdrop-blur rounded-lg p-6 border">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}
                  </h3>
                  <p className="text-gray-600 text-sm">Your comfortable investment range</p>
                </div>
                
                <div className="px-3">
                  <Slider
                    value={preferences.budgetRange}
                    onValueChange={(value) => handlePreferenceChange('budgetRange', value as [number, number])}
                    max={500}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>₹10L</span>
                    <span>₹5Cr</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't worry if you're not 100% sure - I can always adjust this later based on what I find for you
              </p>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Amenities you'd love to have</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((amenity, index) => (
                  <motion.div
                    key={amenity}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-sm text-center transition-all duration-200 ${
                      preferences.amenities.includes(amenity)
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                    onClick={() => handleArrayToggle('amenities', amenity)}
                  >
                    {amenity}
                    {preferences.amenities.includes(amenity) && (
                      <Check className="h-3 w-3 inline ml-1 text-primary" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Special features that matter</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tags.map((tag, index) => (
                    <motion.div
                      key={tag.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer text-sm text-center transition-all duration-200 ${
                        preferences.tags.includes(tag.value)
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 bg-white hover:border-primary/50'
                      }`}
                      onClick={() => handleArrayToggle('tags', tag.value)}
                    >
                      {tag.label}
                      {preferences.tags.includes(tag.value) && (
                        <Check className="h-3 w-3 inline ml-1 text-primary" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                These help me understand your lifestyle - select what makes you smile
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Property Finder</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-primary font-medium">{steps[currentStep]?.subtitle}</span>
            </div>
            <div className="text-sm text-gray-500 bg-white/60 px-3 py-1 rounded-full">
              {currentStep + 1} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200/60 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="text-center mb-6">
              <motion.div 
                className="flex justify-center mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-white">
                  {steps[currentStep]?.icon}
                </div>
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {steps[currentStep]?.title}
              </h2>
            </div>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="bg-white/80 backdrop-blur"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Back to Home' : 'Previous'}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              isStepValid()
                ? 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <span>Find My Perfect Home</span>
                <Sparkles className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}