import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Scale, 
  FileText, 
  Clock, 
  IndianRupee,
  Eye,
  Download,
  Search,
  MapPin,
  ChevronRight,
  Star,
  TrendingUp,
  Gavel,
  UserCheck,
  BookOpen
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

interface LegalDueDiligenceRequest {
  propertyId: string;
  urgencyLevel: "standard" | "priority" | "urgent";
  specificConcerns: string[];
  additionalNotes?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  requestReason: string;
  buyerType: "individual" | "nri" | "company";
}

export default function LegalDueDiligence() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<LegalDueDiligenceRequest>({
    propertyId: "",
    urgencyLevel: "standard",
    specificConcerns: [],
    additionalNotes: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    requestReason: "",
    buyerType: "individual"
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

  const legalConcerns = [
    { id: "title-issues", label: "Title Verification", icon: "📋", description: "Clear ownership, encumbrance checks" },
    { id: "rera-compliance", label: "RERA Compliance", icon: "🏛️", description: "Registration and approvals verification" },
    { id: "approvals", label: "Building Approvals", icon: "✅", description: "Municipal permissions and NOCs" },
    { id: "litigation", label: "Litigation Check", icon: "⚖️", description: "Pending legal disputes or cases" },
    { id: "tax-compliance", label: "Tax Compliance", icon: "💰", description: "Property tax clearances and dues" },
    { id: "land-conversion", label: "Land Conversion", icon: "🗺️", description: "Agricultural to residential conversion" }
  ];

  const urgencyOptions = [
    { value: "standard", label: "Standard (7-10 days)", price: "₹25,000", description: "Complete 12-step legal verification" },
    { value: "priority", label: "Priority (3-5 days)", price: "₹45,000", description: "Expedited processing with priority handling" },
    { value: "urgent", label: "Emergency (24-48 hours)", price: "₹75,000", description: "Critical legal clearance needed urgently" }
  ];

  const reasonOptions = [
    "Final purchase decision pending",
    "Bank loan documentation required",
    "Legal disputes suspected",
    "RERA compliance verification",
    "Investment due diligence",
    "NRI purchase compliance",
    "Corporate acquisition",
    "Other"
  ];

  const buyerTypeOptions = [
    { value: "individual", label: "Individual Buyer", description: "Personal property purchase" },
    { value: "nri", label: "NRI Buyer", description: "Non-resident Indian purchase" },
    { value: "company", label: "Corporate Buyer", description: "Company/business purchase" }
  ];

  const handleInputChange = (field: keyof LegalDueDiligenceRequest, value: any) => {
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
      case 1: return formData.specificConcerns.length > 0 && formData.requestReason && formData.buyerType;
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

  const submitLegalDueDiligenceRequest = useMutation({
    mutationFn: async (data: LegalDueDiligenceRequest) => {
      return await apiRequest('/api/legal-due-diligence-requests', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Legal Due Diligence Request Submitted!",
        description: "I'll coordinate with our legal team and get your verification started immediately.",
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
        requestReason: "",
        buyerType: "individual"
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
      console.error('Error submitting legal due diligence request:', error);
    },
  });

  const handleSubmit = () => {
    submitLegalDueDiligenceRequest.mutate(formData);
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
                  <h3 className="font-medium text-red-800 mb-1">Legal Risks Are Real</h3>
                  <p className="text-sm text-red-700">
                    85% of property disputes arise from incomplete legal verification. Title issues, pending litigation, 
                    and compliance failures can cost you crores and years of legal battles.
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
                <Gavel className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">What Could Go Wrong?</h3>
                  <p className="text-sm text-amber-700">
                    Forged documents, pending court cases, tax dues, illegal constructions - any of these can 
                    make your dream property a legal nightmare. Don't discover these after you've paid.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">What specific legal areas concern you most?</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {legalConcerns.map((concern) => (
                  <motion.div
                    key={concern.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.specificConcerns.includes(concern.id)
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleConcernToggle(concern.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{concern.icon}</span>
                      <div className="flex-1">
                        <h4 className={`font-medium ${formData.specificConcerns.includes(concern.id) ? 'text-red-800' : 'text-gray-900'}`}>
                          {concern.label}
                        </h4>
                        <p className={`text-sm ${formData.specificConcerns.includes(concern.id) ? 'text-red-700' : 'text-gray-600'}`}>
                          {concern.description}
                        </p>
                      </div>
                      {formData.specificConcerns.includes(concern.id) && (
                        <CheckCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you need legal verification now?
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
                  Type of buyer
                </label>
                <Select
                  value={formData.buyerType}
                  onValueChange={(value) => handleInputChange('buyerType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select buyer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyerTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional legal concerns or specific requirements (Optional)
              </label>
              <Textarea
                placeholder="Tell me about any specific legal issues you've heard about or requirements you have..."
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
                  <h3 className="font-medium text-green-800 mb-1">The Solution: Complete Legal Protection</h3>
                  <p className="text-sm text-green-700">
                    Our experienced legal team will conduct a thorough 12-step verification process. 
                    You'll get a detailed legal clearance report with actionable recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-4">How quickly do you need legal clearance?</h3>
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
              <h4 className="font-medium text-blue-800 mb-2">12-Step Legal Verification Includes:</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div>
                  <li>• Property title verification</li>
                  <li>• Encumbrance certificate check</li>
                  <li>• RERA compliance verification</li>
                  <li>• Building approval validation</li>
                  <li>• Occupancy certificate check</li>
                  <li>• NOC verifications</li>
                </div>
                <div>
                  <li>• Tax payment verification</li>
                  <li>• Developer authorization check</li>
                  <li>• Environmental clearances</li>
                  <li>• Litigation search</li>
                  <li>• Professional legal opinion</li>
                  <li>• Final comprehensive report</li>
                </div>
              </div>
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
                Let's get your legal verification started
              </h3>
              <p className="text-gray-600">
                I'll personally coordinate with our legal team and keep you updated throughout the verification process
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
                <h4 className="font-medium text-gray-900 mb-2">Legal Verification Summary:</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Property:</span> {selectedProperty.title}</div>
                  <div><span className="font-medium">Location:</span> {selectedProperty.location}</div>
                  <div><span className="font-medium">Focus Areas:</span> {formData.specificConcerns.map(c => legalConcerns.find(l => l.id === c)?.label).join(', ')}</div>
                  <div><span className="font-medium">Buyer Type:</span> {buyerTypeOptions.find(b => b.value === formData.buyerType)?.label}</div>
                  <div><span className="font-medium">Urgency:</span> {urgencyOptions.find(u => u.value === formData.urgencyLevel)?.label}</div>
                  <div><span className="font-medium">Cost:</span> {urgencyOptions.find(u => u.value === formData.urgencyLevel)?.price}</div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Legal Protection Guarantee</p>
                  <p>If our verification misses any legal issue that surfaces within 2 years of purchase, we'll cover your legal costs up to ₹10 lakhs.</p>
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
      title: "Choose the property for legal verification",
      subtitle: "Select from our verified property listings",
      icon: <Building2 className="h-6 w-6" />
    },
    {
      title: "Tell me your legal concerns",
      subtitle: "Identify specific legal areas that need verification",
      icon: <Scale className="h-6 w-6" />
    },
    {
      title: "How urgent is this verification?",
      subtitle: "Choose timeline and service level",
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: "Let's get you legally protected",
      subtitle: "Submit your request and get started",
      icon: <Shield className="h-6 w-6" />
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
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                <Scale className="h-8 w-8" />
              </div>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Legal Due Diligence
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Don't let legal issues turn your property investment into a costly mistake. 
              Get complete legal verification before you buy.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-red-200"
              >
                <XCircle className="h-6 w-6 text-red-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">85% Face Legal Issues</h3>
                <p className="text-sm text-gray-600">Property buyers discover legal problems after purchase</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-orange-200"
              >
                <IndianRupee className="h-6 w-6 text-orange-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">₹5-50L Legal Costs</h3>
                <p className="text-sm text-gray-600">Average cost to resolve property legal disputes</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-green-200"
              >
                <Shield className="h-6 w-6 text-green-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">100% Legal Clarity</h3>
                <p className="text-sm text-gray-600">Complete verification before you invest</p>
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
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
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
            {/* Why Legal Verification Matters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-4xl mx-auto">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-red-800 mb-3">The Legal Nightmares That Await Unprepared Buyers</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-red-700">
                      <div className="space-y-2">
                        <p className="font-medium">⚠️ What 85% of buyers face:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Clear title disputes and ownership conflicts</li>
                          <li>• Pending litigation and court cases</li>
                          <li>• Illegal constructions and violations</li>
                          <li>• Encumbrance and financial liens</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">💸 The devastating costs:</p>
                        <ul className="text-sm space-y-1">
                          <li>• ₹5-50 lakhs in legal proceedings</li>
                          <li>• Years of court battles and stress</li>
                          <li>• Complete loss of investment</li>
                          <li>• Family disputes and emotional trauma</li>
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
                    <h2 className="text-2xl font-bold text-green-800 mb-3">The Solution: 12-Step Legal Verification Process</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-green-700">
                      <div className="space-y-2">
                        <p className="font-medium">✅ Our comprehensive verification:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Title deed verification and chain analysis</li>
                          <li>• Encumbrance certificate check (30 years)</li>
                          <li>• Court case and litigation search</li>
                          <li>• Property tax and compliance verification</li>
                          <li>• RERA and approval status check</li>
                          <li>• Building plan approvals and NOCs</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">🛡️ Your ₹10 lakh protection:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Legal protection guarantee coverage</li>
                          <li>• Expert legal opinion and recommendations</li>
                          <li>• Risk assessment and mitigation plan</li>
                          <li>• Clear property status certification</li>
                          <li>• Priority legal support post-purchase</li>
                          <li>• Complete peace of mind assurance</li>
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
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Get Legal Verification Now
                  <Scale className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>

              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our verified property listings and get complete legal clearance 
                that protects your investment with our ₹10 lakh guarantee.
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
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
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
                disabled={!isStepValid() || submitLegalDueDiligenceRequest.isPending}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isStepValid() && !submitLegalDueDiligenceRequest.isPending
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitLegalDueDiligenceRequest.isPending ? (
                  'Submitting...'
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <span>Get Legal Verification</span>
                    <Scale className="h-4 w-4 ml-2" />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Trust Our Legal Verification?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our experienced legal team has prevented thousands of buyers from costly legal disputes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">20+ Years Experience</h3>
              <p className="text-sm text-gray-600">Expert property lawyers with extensive real estate experience</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">₹10L Legal Guarantee</h3>
              <p className="text-sm text-gray-600">We cover legal costs if we miss any verifiable legal issue</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">5000+ Verifications</h3>
              <p className="text-sm text-gray-600">Successfully prevented costly legal disputes and litigation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}