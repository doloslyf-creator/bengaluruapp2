import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  MapPin, 
  Home, 
  IndianRupee, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  Heart,
  Building2,
  Sparkles,
  Check,
  ArrowRight,
  Target,
  Zap,
  Star
} from "lucide-react";
import { type Property } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
      title: "Welcome to Your Dream Home Journey",
      subtitle: "Let's find the perfect property together",
      icon: <Heart className="h-8 w-8" />
    },
    {
      id: 1,
      title: "What type of home calls to you?",
      subtitle: "Every dream starts with a vision",
      icon: <Home className="h-8 w-8" />
    },
    {
      id: 2,
      title: "Which part of Bengaluru feels like home?",
      subtitle: "Location is everything",
      icon: <MapPin className="h-8 w-8" />
    },
    {
      id: 3,
      title: "How much space do you need?",
      subtitle: "Comfort is personal",
      icon: <Building2 className="h-8 w-8" />
    },
    {
      id: 4,
      title: "What's your investment range?",
      subtitle: "Let's make it work for you",
      icon: <IndianRupee className="h-8 w-8" />
    },
    {
      id: 5,
      title: "Any special touches you love?",
      subtitle: "The details that make it yours",
      icon: <Sparkles className="h-8 w-8" />
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
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Heart className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold text-gray-900">Hi there!</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                I know finding the right property can feel overwhelming. That's exactly why I'm here - 
                to make this journey personal, simple, and actually enjoyable for you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-purple-100"
              >
                <Target className="h-8 w-8 text-purple-500 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Search</h3>
                <p className="text-sm text-gray-600">We'll learn about your preferences to find properties that truly match what you're looking for.</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100"
              >
                <Zap className="h-8 w-8 text-blue-500 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">Our system analyzes your choices to suggest properties you might not have considered.</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-green-100"
              >
                <Star className="h-8 w-8 text-green-500 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
                <p className="text-sm text-gray-600">Every property comes with detailed insights, legal verification, and professional advice.</p>
              </motion.div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPropertyTypes.map((type, index) => (
                <motion.div
                  key={type.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    preferences.propertyType === type.value
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => handlePreferenceChange('propertyType', type.value)}
                >
                  <div className="flex items-center space-x-3">
                    <Home className={`h-6 w-6 ${preferences.propertyType === type.value ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${preferences.propertyType === type.value ? 'text-purple-900' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                    {preferences.propertyType === type.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Check className="h-5 w-5 text-purple-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayZones.map((zone, index) => (
                <motion.div
                  key={zone}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    preferences.zone === zone
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => handlePreferenceChange('zone', zone)}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-6 w-6 ${preferences.zone === zone ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${preferences.zone === zone ? 'text-blue-900' : 'text-gray-700'}`}>
                      {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
                    </span>
                    {preferences.zone === zone && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Check className="h-5 w-5 text-blue-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bhkOptions.map((bhk, index) => (
                <motion.div
                  key={bhk}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center ${
                    preferences.bhkType.includes(bhk)
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                  onClick={() => handleArrayToggle('bhkType', bhk)}
                >
                  <Building2 className={`h-6 w-6 mx-auto mb-2 ${preferences.bhkType.includes(bhk) ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${preferences.bhkType.includes(bhk) ? 'text-green-900' : 'text-gray-700'}`}>
                    {bhk}
                  </span>
                  {preferences.bhkType.includes(bhk) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2"
                    >
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">Select all that work for you</p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-orange-100">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}
                  </h3>
                  <p className="text-gray-600">Your comfortable investment range</p>
                </div>
                
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
                    <span>₹10L</span>
                    <span>₹5Cr</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't worry if you're not 100% sure - we can always adjust this later based on what we find
              </p>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities you'd love to have</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => (
                    <motion.div
                      key={amenity}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center text-sm ${
                        preferences.amenities.includes(amenity)
                          ? 'border-pink-500 bg-pink-50 text-pink-900'
                          : 'border-gray-200 bg-white hover:border-pink-300 text-gray-700'
                      }`}
                      onClick={() => handleArrayToggle('amenities', amenity)}
                    >
                      {amenity}
                      {preferences.amenities.includes(amenity) && (
                        <Check className="h-3 w-3 inline ml-1 text-pink-600" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tags.map((tag, index) => (
                      <motion.div
                        key={tag.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center text-sm ${
                          preferences.tags.includes(tag.value)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 bg-white hover:border-indigo-300 text-gray-700'
                        }`}
                        onClick={() => handleArrayToggle('tags', tag.value)}
                      >
                        {tag.label}
                        {preferences.tags.includes(tag.value) && (
                          <Check className="h-3 w-3 inline ml-1 text-indigo-600" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                These help us understand your lifestyle - select what matters most to you
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-200/30 rounded-full blur-xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/80 backdrop-blur border-b border-white/40"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
              >
                <Home className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OwnItRight</h1>
                <p className="text-xs text-gray-600">Find Your Dream Home</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white/60 backdrop-blur border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-200/60 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {steps[currentStep]?.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <motion.div 
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.1 }}
              >
                <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-white">
                  {steps[currentStep]?.icon}
                </div>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {steps[currentStep]?.title}
              </h2>
              <p className="text-lg text-gray-600">
                {steps[currentStep]?.subtitle}
              </p>
            </div>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
              <CardContent className="p-8">
                {renderStepContent()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="bg-white/80 backdrop-blur border-gray-300 hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Back to Home' : 'Previous'}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
              isStepValid()
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <span>Find My Dream Home</span>
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