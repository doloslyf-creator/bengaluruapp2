import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Building2, 
  Scale, 
  User, 
  ChevronRight, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Search,
  MapPin,
  Clock
} from "lucide-react";
import Header from "@/components/layout/header";
import { apiRequest } from "@/lib/queryClient";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: string;
  bhkType: string;
  area: number;
  description: string;
  images: string[];
  amenities: string[];
  builder: string;
  projectName: string;
  reraNumber: string;
  readyToMove: boolean;
  legallyVerified: boolean;
  featured: boolean;
  createdAt: string;
}

interface LegalDueDiligenceRequest {
  propertyId: string;
  urgencyLevel: "standard" | "expedited" | "priority";
  specificConcerns: string[];
  additionalNotes: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  requestReason: string;
  buyerType: "individual" | "nri" | "company";
}

export default function LegalDueDiligenceForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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

  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"]
  });

  const filteredProperties = properties.filter((property: any) => 
    property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.developer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submitLegalDueDiligenceRequest = useMutation({
    mutationFn: async (requestData: LegalDueDiligenceRequest) => {
      // Calculate amount based on buyer type and urgency
      let baseAmount = 4999; // Individual residential
      if (requestData.buyerType === "company") baseAmount = 7999; // Commercial
      if (requestData.buyerType === "nri") baseAmount = 9999; // Premium NRI

      // Add urgency surcharge
      if (requestData.urgencyLevel === "expedited") baseAmount += 1500;
      if (requestData.urgencyLevel === "priority") baseAmount += 3000;

      // Create service order via new API
      return await apiRequest({
        url: "/api/orders/service",
        method: "POST",
        body: JSON.stringify({
          serviceType: 'legal-due-diligence',
          customerName: requestData.contactName,
          customerEmail: requestData.contactEmail,
          customerPhone: requestData.contactPhone,
          propertyId: requestData.propertyId,
          propertyName: selectedProperty?.name || 'Selected Property',
          amount: baseAmount,
          requirements: `Buyer Type: ${requestData.buyerType}, Urgency: ${requestData.urgencyLevel}, Reason: ${requestData.requestReason}, Concerns: ${requestData.specificConcerns.join(', ')}, Notes: ${requestData.additionalNotes || 'None'}`
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Legal Verification Request Submitted!",
        description: "Our legal team will begin your 12-step verification process within 24 hours.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-due-diligence-requests"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
      console.error("Error submitting request:", error);
    }
  });

  const totalSteps = 4;

  const getStepProgress = () => {
    return ((currentStep + 1) / totalSteps) * 100;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      submitLegalDueDiligenceRequest.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation("/legal-due-diligence");
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return selectedProperty !== null;
      case 1:
        return formData.specificConcerns.length > 0;
      case 2:
        return formData.urgencyLevel && formData.buyerType && formData.requestReason.trim().length > 0;
      case 3:
        return formData.contactName && formData.contactPhone && formData.contactEmail;
      default:
        return false;
    }
  };

  const legalConcerns = [
    "Title deed verification",
    "Encumbrance certificate check",
    "Court case search",
    "Property tax verification",
    "RERA compliance check",
    "Building approvals",
    "NOC verifications",
    "Mortgage clearance",
    "Ownership disputes",
    "Construction violations",
    "Environmental clearances",
    "Other legal issues"
  ];

  const handleConcernToggle = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      specificConcerns: prev.specificConcerns.includes(concern)
        ? prev.specificConcerns.filter(c => c !== concern)
        : [...prev.specificConcerns, concern]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose the property for legal verification
              </h3>
              <p className="text-gray-600">
                Select from our verified property listings to get comprehensive legal due diligence
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by property name, location, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {isLoadingProperties ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading properties...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No properties found matching your search.</p>
                  </div>
                ) : (
                  filteredProperties.map((property: Property) => (
                    <motion.div
                      key={property.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedProperty?.id === property.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                      }`}
                      onClick={() => {
                        setSelectedProperty(property);
                        setFormData(prev => ({ ...prev, propertyId: property.id }));
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{property.name}</h4>
                            {property.legallyVerified && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.address}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-medium">{property.type}</span>
                            <span>{property.developer}</span>
                            <span className="font-medium text-green-600">{property.status}</span>
                          </div>
                        </div>
                        {selectedProperty?.id === property.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tell me your legal concerns
              </h3>
              <p className="text-gray-600">
                Select the specific legal areas that need verification for this property
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {legalConcerns.map((concern) => (
                <motion.div
                  key={concern}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.specificConcerns.includes(concern)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => handleConcernToggle(concern)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.specificConcerns.includes(concern)
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}>
                      {formData.specificConcerns.includes(concern) && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{concern}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">12-Step Legal Verification Process</p>
                  <p>Our comprehensive verification covers all selected areas plus mandatory checks for complete legal clearance.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How urgent is this verification?
              </h3>
              <p className="text-gray-600">
                Choose timeline and tell us about your specific requirements
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Timeline</Label>
                <div className="grid gap-3">
                  {[
                    { value: "standard", label: "Standard (10-15 days)", desc: "Complete verification process", price: "₹25,000" },
                    { value: "expedited", label: "Expedited (5-7 days)", desc: "Priority processing (+₹10,000)", price: "₹35,000" },
                    { value: "priority", label: "Priority (2-3 days)", desc: "Emergency verification (+₹20,000)", price: "₹45,000" }
                  ].map((option) => (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.urgencyLevel === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: option.value as any }))}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{option.label}</h4>
                            <p className="text-sm text-gray-600">{option.desc}</p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600">{option.price}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Buyer Type</Label>
                <div className="grid gap-3">
                  {[
                    { value: "individual", label: "Individual Buyer", desc: "Personal property purchase" },
                    { value: "nri", label: "NRI Buyer", desc: "Non-resident Indian purchase" },
                    { value: "company", label: "Company/Business", desc: "Corporate property purchase" }
                  ].map((option) => (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.buyerType === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, buyerType: option.value as any }))}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">{option.label}</h4>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="requestReason" className="text-sm font-medium text-gray-700">
                  Why do you need legal verification? *
                </Label>
                <Textarea
                  id="requestReason"
                  placeholder="e.g., Planning to purchase this property and want to ensure clear legal title..."
                  value={formData.requestReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestReason: e.target.value }))}
                  className="mt-2 min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">
                  Additional notes or specific concerns (optional)
                </Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any specific legal concerns or requirements..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  className="mt-2 min-h-[80px] border-2 border-gray-200 rounded-xl focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Let's get you legally protected
              </h3>
              <p className="text-gray-600">
                Provide your contact details so our legal team can begin verification
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="contactName"
                  placeholder="Enter your full name"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="mt-2 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="Enter your phone number"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="mt-2 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="mt-2 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Your ₹10 Lakh Legal Protection Guarantee</p>
                  <p>Complete legal verification with financial protection against any missed legal issues or disputes.</p>
                </div>
              </div>
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" style={{ paddingTop: '100px' }}>
      <Header />
      
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
            onClick={handleBack}
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
      </main>
    </div>
  );
}