import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  ChevronRight,
  CheckCircle,
  Home,
  IndianRupee,
  Calendar,
  Users,
  Building,
  Heart,
  Star,
  Clock,
  Search,
  Shield
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredContact: string;
  // Home buying journey preferences
  lookingFor: string;
  budget: string;
  timeline: string;
  locations: string[];
  propertyType: string;
  bhkPreference: string;
  specialRequirements: string[];
  currentStage: string;
  hasCurrentProperty: boolean;
}

export default function Contact() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
    message: "",
    preferredContact: "",
    lookingFor: "",
    budget: "",
    timeline: "",
    locations: [],
    propertyType: "",
    bhkPreference: "",
    specialRequirements: [],
    currentStage: "",
    hasCurrentProperty: false
  });

  const steps = [
    { title: "Let's Connect", subtitle: "Your contact information" },
    { title: "Your Home Dreams", subtitle: "What you're looking for" },
    { title: "Budget & Timeline", subtitle: "Your investment plans" },
    { title: "Preferences & Needs", subtitle: "Perfect home details" },
    { title: "Your Journey Begins", subtitle: "Personalized next steps" }
  ];

  const locations = [
    "Whitefield", "Electronic City", "Sarjapur", "HSR Layout", "Koramangala",
    "Indiranagar", "Jayanagar", "Banashankari", "Rajajinagar", "Yelahanka",
    "Hebbal", "Marathahalli", "Bellandur", "BTM Layout", "JP Nagar"
  ];

  const specialRequirements = [
    "Pet-friendly", "Wheelchair accessible", "Swimming pool", "Gym facilities",
    "Children's play area", "24/7 security", "Power backup", "Parking space",
    "Near metro station", "Good schools nearby", "Hospital proximity", "Shopping centers"
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationToggle = (location: string) => {
    setForm(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const handleRequirementToggle = (requirement: string) => {
    setForm(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(requirement)
        ? prev.specialRequirements.filter(r => r !== requirement)
        : [...prev.specialRequirements, requirement]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hi! I'm Priti</h2>
              <p className="text-gray-600">Your dedicated property advisor. Let's start your home buying journey together.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How would you prefer I contact you?</label>
              <Select value={form.preferredContact} onValueChange={(value) => setForm(prev => ({ ...prev, preferredContact: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your preferred contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="any">Any method is fine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tell me a bit about what you're looking for</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="I'm looking for a 2BHK apartment in Whitefield with good connectivity..."
                rows={3}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's Your Dream Home?</h2>
              <p className="text-gray-600">Help me understand what you're looking for so I can find the perfect match.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I'm looking for *</label>
              <Select value={form.lookingFor} onValueChange={(value) => setForm(prev => ({ ...prev, lookingFor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="What type of property interests you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready-to-move">Ready to move homes</SelectItem>
                  <SelectItem value="under-construction">Under construction projects</SelectItem>
                  <SelectItem value="both">Both options (I'm flexible)</SelectItem>
                  <SelectItem value="investment">Investment properties</SelectItem>
                  <SelectItem value="commercial">Commercial properties</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Apartment", "Villa", "Duplex", "Penthouse"].map((type) => (
                  <Button
                    key={type}
                    variant={form.propertyType === type ? "default" : "outline"}
                    onClick={() => setForm(prev => ({ ...prev, propertyType: type }))}
                    className="h-auto py-3"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BHK Preference *</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK", "Flexible"].map((bhk) => (
                  <Button
                    key={bhk}
                    variant={form.bhkPreference === bhk ? "default" : "outline"}
                    onClick={() => setForm(prev => ({ ...prev, bhkPreference: bhk }))}
                    className="h-auto py-3 text-sm"
                  >
                    {bhk}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage *</label>
              <Select value={form.currentStage} onValueChange={(value) => setForm(prev => ({ ...prev, currentStage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Where are you in your home buying journey?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="just-started">Just started looking</SelectItem>
                  <SelectItem value="researching">Actively researching</SelectItem>
                  <SelectItem value="ready-to-buy">Ready to buy (have finances sorted)</SelectItem>
                  <SelectItem value="need-to-sell">Need to sell current property first</SelectItem>
                  <SelectItem value="loan-process">In loan approval process</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCurrentProperty"
                checked={form.hasCurrentProperty}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, hasCurrentProperty: !!checked }))}
              />
              <label htmlFor="hasCurrentProperty" className="text-sm text-gray-700">
                I currently own a property that I may sell/exchange
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Investment Plans</h2>
              <p className="text-gray-600">This helps me recommend properties that fit your financial comfort zone.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range *</label>
              <Select value={form.budget} onValueChange={(value) => setForm(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="What's your comfortable budget range?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-50l">Under ₹50 Lakhs</SelectItem>
                  <SelectItem value="50l-75l">₹50L - ₹75L</SelectItem>
                  <SelectItem value="75l-1cr">₹75L - ₹1 Cr</SelectItem>
                  <SelectItem value="1cr-1.5cr">₹1 Cr - ₹1.5 Cr</SelectItem>
                  <SelectItem value="1.5cr-2cr">₹1.5 Cr - ₹2 Cr</SelectItem>
                  <SelectItem value="2cr-3cr">₹2 Cr - ₹3 Cr</SelectItem>
                  <SelectItem value="above-3cr">Above ₹3 Cr</SelectItem>
                  <SelectItem value="flexible">I'm flexible (show me options)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline *</label>
              <Select value={form.timeline} onValueChange={(value) => setForm(prev => ({ ...prev, timeline: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="When are you planning to buy?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (within 1 month)</SelectItem>
                  <SelectItem value="1-3months">1-3 months</SelectItem>
                  <SelectItem value="3-6months">3-6 months</SelectItem>
                  <SelectItem value="6-12months">6-12 months</SelectItem>
                  <SelectItem value="beyond-year">Beyond a year</SelectItem>
                  <SelectItem value="just-exploring">Just exploring options</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Priti's Promise</h3>
                  <p className="text-sm text-blue-800">
                    I'll only show you properties that genuinely fit your budget and needs. 
                    No pressure, no hidden costs - just honest advice to help you find your perfect home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfect Home Details</h2>
              <p className="text-gray-600">Let's get specific about your ideal home and neighborhood.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Locations (Select multiple) *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={location}
                      checked={form.locations.includes(location)}
                      onCheckedChange={() => handleLocationToggle(location)}
                    />
                    <label htmlFor={location} className="text-sm text-gray-700 cursor-pointer">
                      {location}
                    </label>
                  </div>
                ))}
              </div>
              {form.locations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Selected locations:</p>
                  <div className="flex flex-wrap gap-1">
                    {form.locations.map((location) => (
                      <Badge key={location} variant="secondary" className="text-xs">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Special Requirements (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {specialRequirements.map((requirement) => (
                  <div key={requirement} className="flex items-center space-x-2">
                    <Checkbox
                      id={requirement}
                      checked={form.specialRequirements.includes(requirement)}
                      onCheckedChange={() => handleRequirementToggle(requirement)}
                    />
                    <label htmlFor={requirement} className="text-sm text-gray-700 cursor-pointer">
                      {requirement}
                    </label>
                  </div>
                ))}
              </div>
              {form.specialRequirements.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Selected requirements:</p>
                  <div className="flex flex-wrap gap-1">
                    {form.specialRequirements.map((req) => (
                      <Badge key={req} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfect! Your Journey Begins Now</h2>
              <p className="text-gray-600">Based on your preferences, here's how I'll help you find your dream home.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Search className="h-5 w-5 text-blue-600 mr-2" />
                    Personalized Property Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    I'll curate properties that match your exact requirements in {form.locations.slice(0, 2).join(", ")}
                    {form.locations.length > 2 ? " and other selected areas" : ""}.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    Site Visits Arranged
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    I'll coordinate property visits at your convenience and accompany you to ensure you see the best options.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                    Complete Legal Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Professional legal verification, documentation review, and RERA compliance check for your chosen property.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <IndianRupee className="h-5 w-5 text-orange-600 mr-2" />
                    Financing Assistance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Help with loan processing, negotiations, and ensuring you get the best deal within your {form.budget} budget.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">What Happens Next?</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>I'll call you within 2 hours to discuss your requirements</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span>Share 3-5 handpicked properties matching your criteria</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span>Schedule site visits and guide you through the entire process</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50" style={{ paddingTop: '100px' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/95 backdrop-blur border-b border-blue-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Start Your Home Buying Journey</h1>
            <p className="text-gray-600">Let Priti help you find your perfect home with personalized guidance every step of the way</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white/60 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{steps[currentStep]?.subtitle}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <span>Previous</span>
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg flex items-center space-x-2"
                  disabled={
                    (currentStep === 0 && (!form.name || !form.phone || !form.email)) ||
                    (currentStep === 1 && (!form.lookingFor || !form.propertyType || !form.bhkPreference || !form.currentStage)) ||
                    (currentStep === 2 && (!form.budget || !form.timeline)) ||
                    (currentStep === 3 && form.locations.length === 0)
                  }
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setLocation("/properties")}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Start Property Search</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {currentStep === 0 && (
          <Card className="mt-6 border-0 shadow-sm bg-white/80">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Me</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Phone className="h-8 w-8 text-green-600" />
                  <span className="font-medium text-gray-900">Call Directly</span>
                  <span className="text-sm text-gray-600">+91 98765 43210</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                  <span className="font-medium text-gray-900">WhatsApp</span>
                  <span className="text-sm text-gray-600">Quick responses</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Mail className="h-8 w-8 text-purple-600" />
                  <span className="font-medium text-gray-900">Email</span>
                  <span className="text-sm text-gray-600">priti@ownitright.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}