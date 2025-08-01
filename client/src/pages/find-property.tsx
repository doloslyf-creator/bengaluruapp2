import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Home, IndianRupee, Filter, ChevronRight } from "lucide-react";
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
  const [preferences, setPreferences] = useState<PropertyPreferences>({
    propertyType: "",
    zone: "",
    budgetRange: [50, 500], // in lakhs
    bhkType: [],
    amenities: [],
    tags: []
  });

  const zones = [
    "north", "south", "east", "west", "central"
  ];

  const propertyTypes = [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "plot", label: "Plot" },
    { value: "commercial", label: "Commercial" }
  ];

  const bhkOptions = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"];

  const amenities = [
    "Swimming Pool", "Gym", "Parking", "Security", "Garden",
    "Clubhouse", "Children's Play Area", "Power Backup", "Lift"
  ];

  const tags = [
    { value: "rera-approved", label: "RERA Approved" },
    { value: "gated-community", label: "Gated Community" },
    { value: "premium", label: "Premium" },
    { value: "eco-friendly", label: "Eco Friendly" },
    { value: "metro-connectivity", label: "Metro Connectivity" },
    { value: "it-hub-proximity", label: "IT Hub Proximity" },
    { value: "golf-course", label: "Golf Course View" }
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
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">PropertyFinder</h1>
              </div>
              <div className="text-sm text-gray-600">
                Step {currentStep} of 3
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Find Your Dream Property
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tell us what you're looking for
            </h2>
            <p className="text-lg text-gray-600">
              Help us find the perfect property that matches your preferences
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <span>Property Preferences</span>
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
                    {propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
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
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>
                        {zone.charAt(0).toUpperCase() + zone.slice(1)} Bengaluru
                      </SelectItem>
                    ))}
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
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  BHK Configuration
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {bhkOptions.map(bhk => (
                    <div key={bhk} className="flex items-center space-x-2">
                      <Checkbox 
                        id={bhk}
                        checked={preferences.bhkType.includes(bhk)}
                        onCheckedChange={() => handleArrayToggle('bhkType', bhk)}
                      />
                      <label htmlFor={bhk} className="text-sm text-gray-700 cursor-pointer">
                        {bhk}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Special Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tags.map(tag => (
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
                  ))}
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
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button 
              onClick={handleNext}
              className="flex items-center space-x-2"
              disabled={!preferences.propertyType || !preferences.zone}
            >
              <span>Find Matching Properties</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}