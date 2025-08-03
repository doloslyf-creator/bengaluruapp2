import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock,
  CheckCircle,
  Heart,
  Star,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Shield,
  Home,
  Headphones
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  inquiry: string;
  message: string;
}

export default function Contact() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
    inquiry: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          source: 'Contact Page',
          stage: 'inquiry'
        }),
      });

      if (response.ok) {
        navigate('/contact/thank-you');
      } else {
        console.error('Failed to submit contact form');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return form.name && form.phone && form.email && form.inquiry;
  };

  const inquiryTypes = [
    { value: "property-search", label: "🏠 I want to find my dream home", description: "Get personalized property recommendations" },
    { value: "property-advice", label: "🔍 I need advice on a specific property", description: "Expert evaluation and guidance" },
    { value: "valuation", label: "💰 I want property valuation services", description: "Professional market assessment" },
    { value: "legal-help", label: "⚖️ I need legal due diligence support", description: "Complete legal verification" },
    { value: "civil-report", label: "🏗️ I want CIVIL+MEP reports", description: "Technical engineering analysis" },
    { value: "consultation", label: "💬 I want to schedule a consultation", description: "One-on-one expert discussion" },
    { value: "other", label: "✨ Something else", description: "Tell us what you need" }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 98765 43210",
      description: "Speak directly with our property experts",
      action: "Call Now",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+91 98765 43210", 
      description: "Quick responses on your favorite app",
      action: "Chat Now",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "hello@ownitright.com",
      description: "Detailed inquiries and documentation",
      action: "Send Email",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-white">
                <Heart className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Let's Talk About Your Dream Home
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every great property journey starts with a conversation. Whether you're just browsing or ready to buy, 
              Priti and Zaki are here to guide you with genuine care and expert insights.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <span>Start a Conversation</span>
                </CardTitle>
                <p className="text-gray-600">
                  Tell us what you're looking for and we'll get back to you within 2 hours during business days.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Rajesh Kumar"
                        required
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="e.g., +91 98765 43210"
                        required
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="e.g., rajesh@example.com"
                      required
                      data-testid="input-email"
                    />
                  </div>

                  {/* What are you looking for? */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What can we help you with? *
                    </label>
                    <div className="space-y-2">
                      {inquiryTypes.map((type) => (
                        <motion.div
                          key={type.value}
                          whileHover={{ scale: 1.01 }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            form.inquiry === type.value
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 bg-white hover:border-primary/50'
                          }`}
                          onClick={() => handleInputChange('inquiry', type.value)}
                          data-testid={`select-inquiry-${type.value}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{type.label}</div>
                              <div className="text-sm text-gray-600">{type.description}</div>
                            </div>
                            {form.inquiry === type.value && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us more (Optional)
                    </label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Share any specific requirements, questions, or details that would help us assist you better..."
                      rows={4}
                      data-testid="textarea-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${
                      isFormValid() && !isSubmitting
                        ? 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    data-testid="button-submit-contact"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Start My Property Journey</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Methods & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Quick Contact Methods */}
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>Prefer to Talk?</span>
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Sometimes a quick conversation is worth a thousand messages.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${method.color}`}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-6 w-6" />
                      <div className="flex-1">
                        <div className="font-semibold">{method.title}</div>
                        <div className="text-sm font-medium">{method.value}</div>
                        <div className="text-xs opacity-80">{method.description}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {method.action}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>What Happens Next?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Quick Response</div>
                      <div className="text-sm text-gray-600">We'll reach out within 2 hours during business days</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Personal Consultation</div>
                      <div className="text-sm text-gray-600">Free 15-minute call to understand your needs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Tailored Recommendations</div>
                      <div className="text-sm text-gray-600">Customized property suggestions based on your conversation</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Your Privacy is Protected</h3>
                    <p className="text-sm text-gray-600">
                      We never share your information with builders or developers. 
                      Your trust is the foundation of our buyer-first approach.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      GDPR Compliant
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Secure Communication
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Info */}
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Visit Our Office</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      123 Brigade Road, MG Road Area<br />
                      Bangalore, Karnataka 560025
                    </p>
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>Mon-Sat: 9:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>Sunday: By Appointment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}