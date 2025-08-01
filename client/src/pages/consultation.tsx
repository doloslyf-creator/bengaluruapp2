import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, User, Mail, MessageCircle, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"),
  email: z.string().email("Please enter a valid email address"),
  consultationType: z.enum(["financing", "legal", "property-advice", "investment"]),
  preferredContactTime: z.string().min(1, "Please select preferred contact time"),
  urgency: z.enum(["immediate", "within-24hrs", "within-week", "flexible"]),
  questions: z.string().min(10, "Please provide more details about your query"),
  agreeToTerms: z.boolean().refine(val => val === true, "Please agree to terms and conditions"),
});

type ConsultationForm = z.infer<typeof consultationSchema>;

export default function Consultation() {
  const [, navigate] = useLocation();
  const [consultationComplete, setConsultationComplete] = useState(false);
  const [consultationId, setConsultationId] = useState("");
  const { toast } = useToast();

  // Get property from navigation state
  const location = useLocation()[0];
  const property = (history.state?.property || {}) as any;
  const preferences = (history.state?.preferences || {}) as any;

  const form = useForm<ConsultationForm>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultationType: "property-advice",
      urgency: "within-24hrs",
      agreeToTerms: false,
    },
  });

  const consultationMutation = useMutation({
    mutationFn: async (data: ConsultationForm) => {
      const consultationData = {
        ...data,
        propertyId: property?.id || null,
        propertyName: property?.name || "General Consultation",
        status: "pending",
        requestedAt: new Date().toISOString(),
      };
      
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultationData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create consultation");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setConsultationId(data.consultationId || `CR${Date.now()}`);
      setConsultationComplete(true);
      toast({
        title: "Consultation Requested!",
        description: "Our expert will contact you soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: "There was an error submitting your consultation request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ConsultationForm) => {
    consultationMutation.mutate(data);
  };

  const consultationTypes = [
    { value: "financing", label: "Home Loan & Financing", description: "Get help with loans, EMI calculations, and financial planning" },
    { value: "legal", label: "Legal Documentation", description: "Assistance with property papers, RERA compliance, and legal verification" },
    { value: "property-advice", label: "Property Advisory", description: "Expert advice on property selection, market trends, and investment potential" },
    { value: "investment", label: "Investment Guidance", description: "ROI analysis, rental potential, and property investment strategies" },
  ];

  const contactTimes = [
    { value: "morning", label: "Morning (9 AM - 12 PM)" },
    { value: "afternoon", label: "Afternoon (12 PM - 4 PM)" },
    { value: "evening", label: "Evening (4 PM - 8 PM)" },
    { value: "anytime", label: "Anytime" },
  ];

  const urgencyOptions = [
    { value: "immediate", label: "Immediate (Within 2 hours)", icon: "🔴" },
    { value: "within-24hrs", label: "Within 24 hours", icon: "🟡" },
    { value: "within-week", label: "Within a week", icon: "🟢" },
    { value: "flexible", label: "Flexible timing", icon: "🔵" },
  ];

  if (consultationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-800 bg-clip-text text-transparent">Consultation Requested!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2">Your Request ID</p>
              <p className="text-lg font-mono font-bold text-blue-800">{consultationId}</p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Type:</strong> {consultationTypes.find(t => t.value === form.getValues('consultationType'))?.label}</p>
              <p><strong>Contact:</strong> {form.getValues('phone')}</p>
              <p><strong>Urgency:</strong> {urgencyOptions.find(u => u.value === form.getValues('urgency'))?.label}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="text-green-800 font-medium mb-2">What happens next?</p>
              <ul className="text-green-700 space-y-1 text-left">
                <li>• Our property expert will review your request</li>
                <li>• You'll receive a call within your preferred timeframe</li>
                <li>• Get personalized advice for your property needs</li>
                <li>• Receive detailed consultation report via email</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/find-property')}
                className="flex-1"
              >
                Find More Properties
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/find-property/results')}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-800 bg-clip-text text-transparent">Expert Consultation</h1>
                <p className="text-sm text-slate-600">Get personalized property advice from our experts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details (if available) */}
          {property?.id && (
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Property Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl mb-1">🏢</div>
                      <p className="text-xs">Property Image</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">{property.name}</h3>
                    <p className="text-sm text-gray-600">{property.area}, {property.zone}</p>
                  </div>

                  <div className="text-xs text-gray-500">
                    Our expert will provide advice specific to this property and your requirements.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Consultation Form */}
          <div className={property?.id ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>Request Expert Consultation</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Fill out the form below and our property experts will contact you with personalized advice.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Full Name</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your full name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>Phone Number</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="9876543210" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>Email Address</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="your@email.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Consultation Type */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Consultation Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="consultationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What type of consultation do you need?</FormLabel>
                            <div className="space-y-3">
                              {consultationTypes.map(type => (
                                <div key={type.value} className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    id={type.value}
                                    name="consultationType"
                                    value={type.value}
                                    checked={field.value === type.value}
                                    onChange={() => field.onChange(type.value)}
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                  />
                                  <label htmlFor={type.value} className="flex-1 cursor-pointer">
                                    <div className="font-medium text-gray-900">{type.label}</div>
                                    <div className="text-sm text-gray-600">{type.description}</div>
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Timing and Urgency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferredContactTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Preferred Contact Time</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preferred time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contactTimes.map(time => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How urgent is your query?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {urgencyOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <span className="flex items-center space-x-2">
                                      <span>{option.icon}</span>
                                      <span>{option.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Questions */}
                    <FormField
                      control={form.control}
                      name="questions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What specific questions or concerns do you have?</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Please provide details about your property requirements, budget, timeline, or any specific questions you have..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Terms and Conditions */}
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I agree to the terms and conditions and privacy policy. I consent to being contacted by property experts for consultation purposes.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/find-property/results')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={consultationMutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{consultationMutation.isPending ? "Submitting..." : "Request Consultation"}</span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}