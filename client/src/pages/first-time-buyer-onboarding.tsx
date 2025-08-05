import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  DollarSign,
  MapPin,
  Building,
  Heart,
  Shield,
  CheckCircle,
  Loader2,
  Info,
  Star,
  Calendar,
  User,
  Phone,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// First-time buyer onboarding schema based on enhanced lead schema
const onboardingSchema = z.object({
  // Personal Information
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  preferredContactTime: z.enum(["morning", "afternoon", "evening"]),
  
  // Buyer Profile
  buyingFor: z.enum(["self", "parents", "investment", "resale-flip"]),
  urgency: z.enum(["immediate", "3-6-months", "6-12-months", "exploratory"]),
  
  // Budget & Financing
  budgetMin: z.number().min(0.1, "Minimum budget should be at least 0.1 crores"),
  budgetMax: z.number().min(0.1, "Maximum budget should be at least 0.1 crores"),
  financing: z.enum(["own-funds", "bank-loan", "inheritance", "mixed"]),
  hasPreApproval: z.boolean().optional(),
  
  // Location Preferences
  preferredAreas: z.array(z.string()).min(1, "Please select at least one preferred area"),
  commuteRequirements: z.string().optional(),
  schoolWorkplaceConsiderations: z.string().optional(),
  
  // Property Preferences
  propertyType: z.enum(["villa", "apartment", "plot", "duplex"]),
  bhkPreference: z.enum(["1bhk", "2bhk", "3bhk", "4bhk", "5bhk+"]),
  floorPreference: z.string().optional(),
  gatedPreference: z.enum(["gated", "standalone", "no-preference"]),
  
  // Lifestyle Preferences
  amenitiesNeeded: z.array(z.string()),
  vastuFacingRequirements: z.string().optional(),
  seniorCitizenFriendly: z.boolean().optional(),
  petsChildrenConsideration: z.string().optional(),
  greenZonesPreference: z.boolean().optional(),
  
  // Support Needs
  wantsLegalSupport: z.boolean().optional(),
  interestedInReports: z.array(z.string()),
  
  // Additional Information
  specificRequirements: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Budget & Timeline", icon: DollarSign },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Property Type", icon: Building },
  { id: 5, title: "Lifestyle", icon: Heart },
  { id: 6, title: "Support", icon: Shield },
];

const BANGALORE_AREAS = [
  "Whitefield", "Electronic City", "Hebbal", "Marathahalli", "Koramangala",
  "Indiranagar", "Jayanagar", "BTM Layout", "HSR Layout", "Sarjapur Road",
  "Bannerghatta Road", "Kanakapura Road", "Tumkur Road", "Mysore Road",
  "Hosur Road", "Old Airport Road", "New Airport Road", "Varthur",
  "Bellandur", "Bommanahalli", "Rajajinagar", "Malleshwaram",
  "Basavanagudi", "JP Nagar", "Banashankari"
];

const AMENITIES_OPTIONS = [
  "Swimming Pool", "Gym/Fitness Center", "Children's Play Area", "Club House",
  "Landscaped Gardens", "Jogging Track", "Security 24/7", "Power Backup",
  "Car Parking", "Visitor Parking", "EV Charging Points", "Solar Power",
  "Rainwater Harvesting", "Waste Management", "Intercom Facility",
  "Wi-Fi Connectivity", "Community Hall", "Sports Courts", "Yoga/Meditation Area",
  "Senior Citizen Seating", "Dog Park", "Grocery Store", "Pharmacy", "ATM"
];

const REPORT_OPTIONS = [
  { value: "valuation", label: "Property Valuation Report", description: "Market value assessment" },
  { value: "civil-mep", label: "Civil & MEP Engineering Report", description: "Structural and systems analysis" },
  { value: "legal", label: "Legal Due Diligence Report", description: "Legal compliance verification" },
  { value: "infrastructure", label: "Infrastructure Analysis", description: "Area development prospects" }
];

export default function FirstTimeBuyerOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      preferredContactTime: "evening",
      buyingFor: "self",
      urgency: "3-6-months",
      financing: "bank-loan",
      hasPreApproval: false,
      budgetMin: 1,
      budgetMax: 2,
      propertyType: "apartment",
      bhkPreference: "2bhk",
      gatedPreference: "gated",
      preferredAreas: [],
      amenitiesNeeded: [],
      seniorCitizenFriendly: false,
      greenZonesPreference: false,
      wantsLegalSupport: false,
      interestedInReports: [],
      commuteRequirements: "",
      schoolWorkplaceConsiderations: "",
      floorPreference: "",
      vastuFacingRequirements: "",
      petsChildrenConsideration: "",
      specificRequirements: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const leadData = {
        source: "property-inquiry" as const,
        leadType: "warm" as const,
        priority: "high" as const,
        buyerPersona: "first-time-buyer" as const,
        propertyName: `First-time buyer lead from ${data.customerName}`,
        ...data,
        budgetMin: Math.round(Number(data.budgetMin) * 100), // Convert crores to lakhs for storage
        budgetMax: Math.round(Number(data.budgetMax) * 100), // Convert crores to lakhs for storage
      };
      
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create lead");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Welcome to OwnItRight!",
        description: `Your profile has been created successfully. Lead ID: ${data.leadId || 'Generated'}`,
      });
      setLocation("/find-property");
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact our support team.",
        variant: "destructive",
      });
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: OnboardingFormData) => {
    createLeadMutation.mutate(data);
  };

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 1:
        return ["customerName", "phone", "email", "preferredContactTime"];
      case 2:
        return ["budgetMin", "budgetMax", "financing", "buyingFor", "urgency"];
      case 3:
        return ["preferredAreas"];
      case 4:
        return ["propertyType", "bhkPreference", "gatedPreference"];
      case 5:
        return ["amenitiesNeeded"];
      case 6:
        return ["interestedInReports"];
      default:
        return [];
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
              <p className="text-gray-600">We'll help you find the perfect property based on your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+91 98765 43210" 
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredContactTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                        <SelectItem value="evening">Evening (6 PM - 9 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget & Timeline</h2>
              <p className="text-gray-600">Help us understand your budget and timeline</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Budget (in Crores) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        placeholder="1.5" 
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">For budgets below 1 Cr, use decimals (e.g., 0.8 for 80 Lakhs)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Budget (in Crores) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        placeholder="2.5" 
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">For budgets below 1 Cr, use decimals (e.g., 0.9 for 90 Lakhs)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How will you finance this purchase?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank-loan">Bank Loan</SelectItem>
                        <SelectItem value="own-funds">Own Funds</SelectItem>
                        <SelectItem value="inheritance">Inheritance</SelectItem>
                        <SelectItem value="mixed">Mixed (Loan + Own Funds)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyingFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who are you buying for?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="self">Self/Family</SelectItem>
                        <SelectItem value="parents">Parents</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="resale-flip">Resale/Flip</SelectItem>
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>When are you planning to buy?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="immediate" id="immediate" />
                          <label htmlFor="immediate" className="text-sm">Immediate</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3-6-months" id="3-6-months" />
                          <label htmlFor="3-6-months" className="text-sm">3-6 Months</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="6-12-months" id="6-12-months" />
                          <label htmlFor="6-12-months" className="text-sm">6-12 Months</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="exploratory" id="exploratory" />
                          <label htmlFor="exploratory" className="text-sm">Just Exploring</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasPreApproval"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasPreApproval"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label htmlFor="hasPreApproval" className="text-sm">
                        I have a pre-approved home loan
                      </label>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Preferences</h2>
              <p className="text-gray-600">Where would you like to live in Bangalore?</p>
            </div>

            <FormField
              control={form.control}
              name="preferredAreas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Areas * (Select multiple)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {BANGALORE_AREAS.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={field.value?.includes(area)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, area]);
                            } else {
                              field.onChange(field.value?.filter(item => item !== area));
                            }
                          }}
                        />
                        <label htmlFor={area} className="text-sm">{area}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="commuteRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commute Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Near Whitefield for work, metro connectivity preferred"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schoolWorkplaceConsiderations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School/Workplace Considerations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Near good schools, IT parks, hospitals"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Preferences</h2>
              <p className="text-gray-600">What type of property are you looking for?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apartment" id="apartment" />
                          <label htmlFor="apartment">Apartment</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="villa" id="villa" />
                          <label htmlFor="villa">Villa</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="duplex" id="duplex" />
                          <label htmlFor="duplex">Duplex</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="plot" id="plot" />
                          <label htmlFor="plot">Plot</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bhkPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BHK Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1bhk">1 BHK</SelectItem>
                        <SelectItem value="2bhk">2 BHK</SelectItem>
                        <SelectItem value="3bhk">3 BHK</SelectItem>
                        <SelectItem value="4bhk">4 BHK</SelectItem>
                        <SelectItem value="5bhk+">5+ BHK</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gatedPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gated">Gated Community</SelectItem>
                        <SelectItem value="standalone">Standalone Building</SelectItem>
                        <SelectItem value="no-preference">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floorPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Preference</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Ground floor, Top floor, Mid floors" 
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Preferences</h2>
              <p className="text-gray-600">What amenities and features are important to you?</p>
            </div>

            <FormField
              control={form.control}
              name="amenitiesNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Important Amenities (Select multiple)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {AMENITIES_OPTIONS.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={field.value?.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, amenity]);
                            } else {
                              field.onChange(field.value?.filter(item => item !== amenity));
                            }
                          }}
                        />
                        <label htmlFor={amenity} className="text-sm">{amenity}</label>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vastuFacingRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vastu/Facing Requirements</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., East facing, North facing" 
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="petsChildrenConsideration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pets/Children Considerations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Pet-friendly, child-safe balconies, play areas"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="seniorCitizenFriendly"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seniorCitizenFriendly"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label htmlFor="seniorCitizenFriendly" className="text-sm">
                        Senior citizen friendly features needed
                      </label>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="greenZonesPreference"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="greenZonesPreference"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label htmlFor="greenZonesPreference" className="text-sm">
                        Prefer properties near green zones/parks
                      </label>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Support & Services</h2>
              <p className="text-gray-600">How can we help you through your property buying journey?</p>
            </div>

            <FormField
              control={form.control}
              name="interestedInReports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Reports of Interest</FormLabel>
                  <div className="space-y-4 mt-3">
                    {REPORT_OPTIONS.map((report) => (
                      <Card key={report.value} className="border-2 hover:border-blue-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={report.value}
                              checked={field.value?.includes(report.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, report.value]);
                                } else {
                                  field.onChange(field.value?.filter(item => item !== report.value));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label htmlFor={report.value} className="font-medium cursor-pointer">
                                {report.label}
                              </label>
                              <p className="text-sm text-gray-600">{report.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wantsLegalSupport"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wantsLegalSupport"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="wantsLegalSupport" className="text-sm">
                      I'm interested in legal support and documentation assistance
                    </label>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specificRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any Specific Requirements or Questions?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about any specific needs, concerns, or questions you have..."
                      rows={4}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Home
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold">First-Time Buyer Onboarding</h1>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Step {currentStep} of {STEPS.length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep === STEPS.length ? (
                    <Button
                      type="submit"
                      disabled={createLeadMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createLeadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Complete Onboarding
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Need Help?</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Our property experts are here to help you find the perfect home. You can always update your preferences later.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">Contact Our Team</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}