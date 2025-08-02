import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft,
  Check,
  ArrowRight
} from "lucide-react";
import { type Property } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
      subtitle: "Let's find the perfect property together"
    },
    {
      id: 1,
      title: "What type of home calls to you?",
      subtitle: "Every dream starts with a vision"
    },
    {
      id: 2,
      title: "Which part of Bengaluru feels like home?",
      subtitle: "Location is everything"
    },
    {
      id: 3,
      title: "How much space do you need?",
      subtitle: "Comfort is personal"
    },
    {
      id: 4,
      title: "What's your investment range?",
      subtitle: "Let's make it work for you"
    },
    {
      id: 5,
      title: "Any special touches you love?",
      subtitle: "The details that make it yours"
    }
  ];

  // Step content components
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              I know finding the right property can feel overwhelming. That's exactly why I'm here - 
              to make this journey personal and simple for you.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">Personalized Search</h3>
                <p className="text-sm text-gray-600">Find properties that truly match what you're looking for</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">Discover properties you might not have considered</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">Expert Guidance</h3>
                <p className="text-sm text-gray-600">Legal verification and professional advice included</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            {displayPropertyTypes.map((type) => (
              <div
                key={type.value}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  preferences.propertyType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => handlePreferenceChange('propertyType', type.value)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{type.label}</span>
                  {preferences.propertyType === type.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            {displayZones.map((zone) => (
              <div
                key={zone}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  preferences.zone === zone
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => handlePreferenceChange('zone', zone)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
                  </span>
                  {preferences.zone === zone && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {bhkOptions.map((bhk) => (
                <div
                  key={bhk}
                  className={`p-3 border rounded cursor-pointer text-center transition-colors ${
                    preferences.bhkType.includes(bhk)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => handleArrayToggle('bhkType', bhk)}
                >
                  <span className="font-medium">{bhk}</span>
                  {preferences.bhkType.includes(bhk) && (
                    <Check className="h-3 w-3 inline ml-1" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">Select all that work for you</p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-xl font-semibold text-gray-900">
                {formatBudget(preferences.budgetRange[0])} - {formatBudget(preferences.budgetRange[1])}
              </div>
              <p className="text-sm text-gray-600">Your budget range</p>
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
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>₹10L</span>
                <span>₹5Cr</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              We can always adjust this later based on what we find
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Amenities you'd love</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className={`p-2 border rounded cursor-pointer text-sm text-center transition-colors ${
                      preferences.amenities.includes(amenity)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => handleArrayToggle('amenities', amenity)}
                  >
                    {amenity}
                    {preferences.amenities.includes(amenity) && (
                      <Check className="h-3 w-3 inline ml-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Special features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.value}
                      className={`p-2 border rounded cursor-pointer text-sm text-center transition-colors ${
                        preferences.tags.includes(tag.value)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => handleArrayToggle('tags', tag.value)}
                    >
                      {tag.label}
                      {preferences.tags.includes(tag.value) && (
                        <Check className="h-3 w-3 inline ml-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 text-center">
              Select what matters most to you
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Simple Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Find Your Home</h1>
              <p className="text-sm text-gray-600">{steps[currentStep]?.subtitle}</p>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep + 1}/{totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div key={currentStep} className="mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[currentStep]?.title}
            </h2>
          </div>

          <div className="bg-white rounded-lg border p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 0 ? 'Home' : 'Back'}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {currentStep === totalSteps - 1 ? 'Find Properties' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}