import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Zap, 
  Droplets, 
  Flame, 
  Clock, 
  IndianRupee,
  Eye,
  Download,
  Search,
  MapPin,
  ChevronRight,
  FileText,
  Star,
  TrendingUp
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
import type { Property } from "@shared/schema";

interface CivilMepRequest {
  propertyId: string;
  urgencyLevel: "standard" | "priority" | "urgent";
  specificConcerns: string[];
  additionalNotes?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  requestReason: string;
}

export default function CivilMepReports() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CivilMepRequest>({
    propertyId: "",
    urgencyLevel: "standard",
    specificConcerns: [],
    additionalNotes: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    requestReason: ""
  });

  const totalSteps = 4;

  // Fetch available properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const filteredProperties = properties.filter((property: Property) =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.developer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const problemAreas = [
    { id: "structural", label: "Structural Issues", icon: "🏗️", description: "Cracks, settlement, foundation problems" },
    { id: "electrical", label: "Electrical Safety", icon: "⚡", description: "Wiring, load capacity, fire hazards" },
    { id: "plumbing", label: "Water & Drainage", icon: "💧", description: "Leaks, pressure, drainage blockages" },
    { id: "fire-safety", label: "Fire Safety", icon: "🔥", description: "Exit routes, suppression systems" },
    { id: "ventilation", label: "HVAC & Ventilation", icon: "🌬️", description: "Air quality, cooling efficiency" },
    { id: "compliance", label: "Code Compliance", icon: "📋", description: "Building codes, safety standards" }
  ];

  const urgencyOptions = [
    { value: "standard", label: "Standard (5-7 days)", price: "₹15,000", description: "Routine inspection and analysis" },
    { value: "priority", label: "Priority (2-3 days)", price: "₹25,000", description: "Faster turnaround for urgent needs" },
    { value: "urgent", label: "Emergency (24-48 hours)", price: "₹45,000", description: "Critical safety concerns" }
  ];

  const reasonOptions = [
    "Before finalizing purchase",
    "Pre-possession inspection",
    "Safety concern reported",
    "Insurance requirement",
    "Legal compliance check",
    "Investment due diligence",
    "Other"
  ];

  const handleInputChange = (field: keyof CivilMepRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConcernToggle = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      specificConcerns: prev.specificConcerns.includes(concern)
        ? prev.specificConcerns.filter(c => c !== concern)
        : [...prev.specificConcerns, concern]
    }));
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setFormData(prev => ({ ...prev, propertyId: property.id }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.propertyId;
      case 1: return formData.specificConcerns.length > 0 && formData.requestReason;
      case 2: return formData.urgencyLevel;
      case 3: return formData.contactName && formData.contactPhone && formData.contactEmail;
      default: return true;
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

  const submitCivilMepRequest = useMutation({
    mutationFn: async (data: CivilMepRequest) => {
      return await apiRequest('/api/civil-mep-requests', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Request Submitted!",
        description: "I'll coordinate with our engineering team and get back to you soon.",
      });
      // Reset form
      setFormData({
        propertyId: "",
        urgencyLevel: "standard",
        specificConcerns: [],
        additionalNotes: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        requestReason: ""
      });
      setSelectedProperty(null);
      setCurrentStep(0);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
      console.error('Error submitting CIVIL+MEP request:', error);
    },
  });

  const handleSubmit = () => {
    submitCivilMepRequest.mutate(formData);
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1">Why This Matters</h3>
                  <p className="text-sm text-red-700">
                    70% of property buyers discover critical structural or safety issues AFTER purchase. 
                    Don't be part of this statistic - get professional engineering analysis before it's too late.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by property name, location, or developer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {propertiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading available properties...</p>
              </div>
            ) : (
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredProperties.map((property: Property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedProperty?.id === property.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                    }`}
                    onClick={() => handlePropertySelect(property)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{property.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {property.propertyType}
                          </span>
                          <span className="text-gray-600">By {property.developer}</span>
                          <span className="font-medium text-primary">
                            ₹{(property.price / 10000000).toFixed(1)}Cr
                          </span>
                        </div>
                      </div>
                      {selectedProperty?.id === property.id && (
                        <CheckCircle className="h-5 w-5 text-primary mt-1" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !propertiesLoading && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No properties found matching your search.</p>
              </div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">What Could Go Wrong?</h3>
                  <p className="text-sm text-amber-700">
                    Structural failures, electrical fires, water damage, non-compliance penalties - these aren't distant possibilities. 
                    They're real risks that cost property buyers lakhs in repairs and legal troubles.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">What specific areas concern you most?</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {problemAreas.map((area) => (
                  <motion.div
                    key={area.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.specificConcerns.includes(area.id)
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleConcernToggle(area.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{area.icon}</span>
                      <div className="flex-1">
                        <h4 className={`font-medium ${formData.specificConcerns.includes(area.id) ? 'text-red-800' : 'text-gray-900'}`}>
                          {area.label}
                        </h4>
                        <p className={`text-sm ${formData.specificConcerns.includes(area.id) ? 'text-red-700' : 'text-gray-600'}`}>
                          {area.description}
                        </p>
                      </div>
                      {formData.specificConcerns.includes(area.id) && (
                        <CheckCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you need this report now?
              </label>
              <Select
                value={formData.requestReason}
                onValueChange={(value) => handleInputChange('requestReason', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your situation" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((reason) => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional concerns or specific areas to focus on (Optional)
              </label>
              <Textarea
                placeholder="Tell me about any specific issues you've noticed or heard about..."
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800 mb-1">The Solution: Professional Analysis</h3>
                  <p className="text-sm text-green-700">
                    Our certified engineers will thoroughly inspect the property and give you a detailed report. 
                    You'll know exactly what you're buying - no surprises, no regrets.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-4">How quickly do you need this report?</h3>
              <div className="space-y-3">
                {urgencyOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.urgencyLevel === option.value
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                    }`}
                    onClick={() => handleInputChange('urgencyLevel', option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Clock className={`h-5 w-5 ${formData.urgencyLevel === option.value ? 'text-primary' : 'text-gray-400'}`} />
                          <div>
                            <h4 className={`font-medium ${formData.urgencyLevel === option.value ? 'text-primary' : 'text-gray-900'}`}>
                              {option.label}
                            </h4>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${formData.urgencyLevel === option.value ? 'text-primary' : 'text-gray-700'}`}>
                          {option.price}
                        </span>
                        {formData.urgencyLevel === option.value && (
                          <CheckCircle className="h-5 w-5 text-primary mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">What You'll Get:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Comprehensive structural analysis</li>
                <li>• Electrical safety assessment</li>
                <li>• Plumbing and drainage evaluation</li>
                <li>• Fire safety compliance check</li>
                <li>• Professional engineer's certificate</li>
                <li>• Detailed remediation recommendations</li>
              </ul>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Let's get this report started for you
              </h3>
              <p className="text-gray-600">
                I'll personally coordinate with our engineering team and keep you updated throughout the process
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

            {selectedProperty && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Report Summary:</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Property:</span> {selectedProperty.title}</div>
                  <div><span className="font-medium">Location:</span> {selectedProperty.location}</div>
                  <div><span className="font-medium">Focus Areas:</span> {formData.specificConcerns.map(c => problemAreas.find(p => p.id === c)?.label).join(', ')}</div>
                  <div><span className="font-medium">Urgency:</span> {urgencyOptions.find(u => u.value === formData.urgencyLevel)?.label}</div>
                  <div><span className="font-medium">Cost:</span> {urgencyOptions.find(u => u.value === formData.urgencyLevel)?.price}</div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Your peace of mind is guaranteed</p>
                  <p>Our certified engineers have over 15 years of experience. If any critical issue is missed in our report, we'll cover the repair costs up to ₹5 lakhs.</p>
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
      title: "Choose the property that needs inspection",
      subtitle: "Select from our verified property listings",
      icon: <Building2 className="h-6 w-6" />
    },
    {
      title: "Tell me what's worrying you",
      subtitle: "Identify potential problem areas that need focus",
      icon: <AlertTriangle className="h-6 w-6" />
    },
    {
      title: "How urgent is this?",
      subtitle: "Choose timeline and service level",
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: "Let's get you protected",
      subtitle: "Submit your request and get started",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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
              <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              CIVIL+MEP Engineering Report
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Don't gamble with your investment. Get a professional engineering analysis 
              before you buy. I've seen too many buyers regret not doing this step.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-red-200"
              >
                <XCircle className="h-6 w-6 text-red-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">70% Miss Critical Issues</h3>
                <p className="text-sm text-gray-600">Buyers discover structural problems after purchase</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-orange-200"
              >
                <IndianRupee className="h-6 w-6 text-orange-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">₹3-8L Average Repair</h3>
                <p className="text-sm text-gray-600">Cost to fix undiscovered structural issues</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-green-200"
              >
                <Shield className="h-6 w-6 text-green-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">100% Peace of Mind</h3>
                <p className="text-sm text-gray-600">Know exactly what you're buying</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <>
          {/* Progress Bar */}
          <div className="bg-white/60 backdrop-blur border-b">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">Step {currentStep + 1} of {totalSteps}</span>
                <div className="flex-1 bg-gray-200/60 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-red-600 to-orange-600 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${getStepProgress()}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm text-gray-500">{steps[currentStep]?.subtitle}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className={`${showForm ? 'max-w-3xl' : 'max-w-6xl'} mx-auto px-4 py-6`}>
        {!showForm ? (
          /* Problem vs Solution Section */
          <div className="space-y-12">
            {/* Why This Matters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-4xl mx-auto">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-red-800 mb-3">The Hidden Dangers in Your Dream Property</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-red-700">
                      <div className="space-y-2">
                        <p className="font-medium">🚨 What 70% of buyers discover too late:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Structural cracks in foundation</li>
                          <li>• Electrical wiring fire hazards</li>
                          <li>• Water seepage and drainage issues</li>
                          <li>• Non-compliant building codes</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">💰 The real cost of ignorance:</p>
                        <ul className="text-sm space-y-1">
                          <li>• ₹3-8 lakhs in emergency repairs</li>
                          <li>• Legal penalties for code violations</li>
                          <li>• Insurance claim rejections</li>
                          <li>• Decreased property value</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-4xl mx-auto">
                <div className="flex items-start space-x-4">
                  <Shield className="h-8 w-8 text-green-600 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-green-800 mb-3">The Solution: Professional Engineering Analysis</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-green-700">
                      <div className="space-y-2">
                        <p className="font-medium">✅ What our certified engineers check:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Complete structural integrity assessment</li>
                          <li>• Electrical safety and load capacity</li>
                          <li>• Plumbing and drainage evaluation</li>
                          <li>• Fire safety compliance verification</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">🛡️ Your protection guarantee:</p>
                        <ul className="text-sm space-y-1">
                          <li>• ₹5 lakh repair cost coverage</li>
                          <li>• 15+ years engineering experience</li>
                          <li>• Professional engineer certification</li>
                          <li>• Detailed remediation recommendations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-block"
              >
                <Button
                  onClick={() => setLocation("/civil-mep-reports/form")}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Get My Engineering Report Now
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>

              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our verified property listings and get a comprehensive engineering analysis 
                that could save you lakhs in future repair costs.
              </p>
            </motion.div>
          </div>
        ) : (
          /* Form Section */
          <>
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
                    <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white">
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
                onClick={currentStep === 0 ? () => setShowForm(false) : handleBack}
                className="bg-white/80 backdrop-blur"
              >
                {currentStep === 0 ? 'Back to Overview' : 'Previous'}
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!isStepValid() || submitCivilMepRequest.isPending}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isStepValid() && !submitCivilMepRequest.isPending
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitCivilMepRequest.isPending ? (
                  'Submitting...'
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <span>Get My Engineering Report</span>
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
          </>
        )}
      </main>

      {/* Trust Section */}
      <div className="bg-white/80 backdrop-blur border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Trust Our Engineering Reports?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our certified engineers have prevented thousands of buyers from making costly mistakes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">15+ Years Experience</h3>
              <p className="text-sm text-gray-600">Certified structural engineers with extensive field experience</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">₹5L Guarantee</h3>
              <p className="text-sm text-gray-600">We cover repair costs if we miss any critical structural issue</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">2000+ Reports</h3>
              <p className="text-sm text-gray-600">Successfully prevented costly property investment mistakes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}