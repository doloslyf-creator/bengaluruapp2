import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Calculator, 
  MapPin, 
  Home, 
  IndianRupee, 
  Clock, 
  Check, 
  ChevronRight,
  Star,
  Shield,
  Award,
  Download,
  Eye
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ValuationRequest {
  propertyType: string;
  location: string;
  area: number;
  age: number;
  bedrooms: string;
  amenities: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  additionalInfo?: string;
}

export default function PropertyValuation() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ValuationRequest>({
    propertyType: "",
    location: "",
    area: 0,
    age: 0,
    bedrooms: "",
    amenities: [],
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    additionalInfo: ""
  });

  const totalSteps = 3;

  const propertyTypes = [
    "Apartment/Flat",
    "Independent House",
    "Villa",
    "Penthouse",
    "Studio Apartment",
    "Duplex",
    "Plot/Land"
  ];

  const bedroomOptions = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"];

  const amenitiesList = [
    "Swimming Pool", "Gym", "Parking", "Security", "Garden",
    "Power Backup", "Lift", "Clubhouse", "Children's Play Area",
    "Balcony", "Terrace", "Store Room", "Servant Room"
  ];

  const handleInputChange = (field: keyof ValuationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.propertyType && formData.location && formData.area > 0 && formData.bedrooms;
      case 1:
        return formData.age >= 0;
      case 2:
        return formData.contactName && formData.contactPhone && formData.contactEmail;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitValuationRequest = useMutation({
    mutationFn: async (data: ValuationRequest) => {
      return await apiRequest('/api/valuation-requests', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted Successfully!",
        description: "Priti will prepare your detailed valuation report within 24-48 hours.",
      });
      // Reset form
      setFormData({
        propertyType: "",
        location: "",
        area: 0,
        age: 0,
        bedrooms: "",
        amenities: [],
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        additionalInfo: ""
      });
      setCurrentStep(0);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
      console.error('Error submitting valuation request:', error);
    },
  });

  const handleSubmit = () => {
    submitValuationRequest.mutate(formData);
  };

  const getStepProgress = () => ((currentStep + 1) / totalSteps) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleInputChange('propertyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <Select
                  value={formData.bedrooms}
                  onValueChange={(value) => handleInputChange('bedrooms', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Area/Locality in Bengaluru)
              </label>
              <Input
                placeholder="e.g., Whitefield, Koramangala, HSR Layout"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Built-up Area (sq ft)
              </label>
              <Input
                type="number"
                placeholder="Enter area in square feet"
                value={formData.area || ''}
                onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Age (years)
              </label>
              <Input
                type="number"
                placeholder="Enter property age in years"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenitiesList.map((amenity) => (
                  <motion.div
                    key={amenity}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-sm text-center transition-all duration-200 ${
                      formData.amenities.includes(amenity)
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {amenity}
                    {formData.amenities.includes(amenity) && (
                      <Check className="h-3 w-3 inline ml-1 text-primary" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <Textarea
                placeholder="Any additional details about your property..."
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                rows={3}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Almost there! Let me know how to reach you
              </h3>
              <p className="text-gray-600">
                I'll personally review your property details and send you a comprehensive valuation report
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Your information is secure</p>
                  <p>I use your details only to prepare and deliver your valuation report. No spam, no sharing with third parties.</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const steps = [
    {
      title: "Tell me about your property",
      subtitle: "I need these basics to start the valuation",
      icon: <Home className="h-6 w-6" />
    },
    {
      title: "Property details and features",
      subtitle: "These details help me give you accurate pricing",
      icon: <Calculator className="h-6 w-6" />
    },
    {
      title: "How can I reach you?",
      subtitle: "I'll send your detailed report here",
      icon: <FileText className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-white">
                <Calculator className="h-8 w-8" />
              </div>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Property Valuation Report
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Hi! I'm Priti, and I'll personally prepare a comprehensive valuation report for your property. 
              Get accurate market pricing, detailed analysis, and professional insights.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border"
              >
                <Award className="h-6 w-6 text-primary mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">Expert Analysis</h3>
                <p className="text-sm text-gray-600">Detailed market research and comparable property analysis</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border"
              >
                <Clock className="h-6 w-6 text-primary mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">Quick Turnaround</h3>
                <p className="text-sm text-gray-600">Receive your comprehensive report within 24-48 hours</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border"
              >
                <Shield className="h-6 w-6 text-primary mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">Accurate Pricing</h3>
                <p className="text-sm text-gray-600">RERA-compliant valuation with legal documentation support</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 font-medium">Step {currentStep + 1} of {totalSteps}</span>
            <div className="flex-1 bg-gray-200/60 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm text-gray-500">{steps[currentStep]?.subtitle}</span>
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
            disabled={currentStep === 0}
            className="bg-white/80 backdrop-blur"
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid() || submitValuationRequest.isPending}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              isStepValid() && !submitValuationRequest.isPending
                ? 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitValuationRequest.isPending ? (
              'Submitting...'
            ) : currentStep === totalSteps - 1 ? (
              <>
                <span>Get My Valuation Report</span>
                <FileText className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </main>

      {/* Sample Report Preview Section */}
      <div className="bg-white/80 backdrop-blur border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Receive</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive, professional valuation report with detailed market analysis and pricing insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Market Valuation</h3>
              <p className="text-sm text-gray-600">Current market price range based on recent sales</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Location Analysis</h3>
              <p className="text-sm text-gray-600">Neighborhood insights and price trends</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Comparable Sales</h3>
              <p className="text-sm text-gray-600">Similar properties sold in your area recently</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Professional Report</h3>
              <p className="text-sm text-gray-600">Detailed PDF report for your records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}