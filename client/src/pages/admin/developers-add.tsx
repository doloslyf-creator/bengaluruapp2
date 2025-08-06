import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Building2, Save, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";

const developerSchema = z.object({
  // Core Builder Information
  name: z.string().min(1, "Company name is required"),
  legalEntity: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  website: z.string().optional(),
  headquarters: z.string().optional(),
  establishedYear: z.string().optional(),
  promoters: z.array(z.string()).default([]),
  
  // Track Record
  totalProjects: z.number().default(0),
  activeProjects: z.number().default(0),
  completedProjects: z.number().default(0),
  operatingCities: z.array(z.string()).default([]),
  totalUnitsDelivered: z.number().default(0),
  
  // Delivery Track Record
  onTimeDeliveryPercent: z.number().optional(),
  avgDeliveryDelay: z.number().default(0),
  complaintsHistory: z.string().optional(),
  
  // Company Type & Market Positioning
  companyType: z.enum(["public", "private", "partnership", "llp"]).default("private"),
  stockTicker: z.string().optional(),
  marketSegment: z.enum(["affordable", "mid-range", "luxury", "ultra-luxury"]).default("mid-range"),
  constructionModel: z.enum(["in-house", "contracting", "hybrid"]).default("contracting"),
  fundingStatus: z.enum(["bootstrap", "pe-backed", "listed", "debt-ridden", "government-backed"]).default("bootstrap"),
  auditHistory: z.string().optional(),
  
  // Quality & Construction Practices
  civilQualityRating: z.number().min(1).max(5).default(3),
  constructionModel2: z.enum(["in-house", "outsourced", "hybrid"]).default("outsourced"),
  commonIssues: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  technologiesUsed: z.array(z.string()).default([]),
  
  // Legal & Regulatory
  legalRedFlags: z.string().optional(),
  litigationsSummary: z.string().optional(),
  
  // Reputation & Reviews
  averageRating: z.number().default(0),
  popularFor: z.string().optional(),
  
  // Specialization
  specialization: z.enum(["residential", "commercial", "mixed-use", "affordable-housing", "luxury-housing", "plotted-development"]).default("residential"),
  
  // SEO Fields
  builderSlug: z.string().optional(),
  seoMetaTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type DeveloperFormData = z.infer<typeof developerSchema>;

export default function DevelopersAdd() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<DeveloperFormData>({
    resolver: zodResolver(developerSchema),
    defaultValues: {
      name: "",
      legalEntity: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      headquarters: "",
      establishedYear: "",
      promoters: [],
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      operatingCities: [],
      totalUnitsDelivered: 0,
      onTimeDeliveryPercent: 0,
      avgDeliveryDelay: 0,
      complaintsHistory: "",
      companyType: "private",
      stockTicker: "",
      marketSegment: "mid-range",
      constructionModel: "contracting",
      fundingStatus: "bootstrap",
      auditHistory: "",
      civilQualityRating: 3,
      constructionModel2: "outsourced",
      commonIssues: [],
      certifications: [],
      technologiesUsed: [],
      legalRedFlags: "",
      litigationsSummary: "",
      averageRating: 0,
      popularFor: "",
      specialization: "residential",
      builderSlug: "",
      seoMetaTitle: "",
      seoDescription: "",
    },
  });

  const createDeveloperMutation = useMutation({
    mutationFn: async (data: DeveloperFormData) => {
      return apiRequest("POST", "/api/developers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({
        title: "Developer created",
        description: "Developer has been successfully created.",
      });
      setLocation("/admin-panel/developers/view");
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create developer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeveloperFormData) => {
    createDeveloperMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        {/* Breadcrumb Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/admin-panel/developers">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Developers
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                <span>Developers</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">Add Developer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Register New Developer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="track-record">Track Record</TabsTrigger>
                        <TabsTrigger value="positioning">Positioning</TabsTrigger>
                        <TabsTrigger value="quality">Quality</TabsTrigger>
                        <TabsTrigger value="legal">Legal</TabsTrigger>
                        <TabsTrigger value="seo">SEO & Media</TabsTrigger>
                      </TabsList>

                      {/* Basic Information Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <h3 className="text-lg font-medium">🧱 Core Builder Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Builder Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Prestige Group, Brigade" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="legalEntity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Legal Entity</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Prestige Estates Projects Ltd" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="headquarters"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Headquarters</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Bangalore, Karnataka" {...field} />
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
                                <FormLabel>Contact Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+91 9876543210" {...field} />
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
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="contact@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="establishedYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Founded Year</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 50 }, (_, i) => 2024 - i).map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="specialization"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specialization</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="residential">Residential</SelectItem>
                                      <SelectItem value="commercial">Commercial</SelectItem>
                                      <SelectItem value="mixed-use">Mixed-use</SelectItem>
                                      <SelectItem value="affordable-housing">Affordable Housing</SelectItem>
                                      <SelectItem value="luxury-housing">Luxury Housing</SelectItem>
                                      <SelectItem value="plotted-development">Plotted Development</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Office Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Complete office address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of the company, expertise, notable projects..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Track Record Tab */}
                      <TabsContent value="track-record" className="space-y-4">
                        <h3 className="text-lg font-medium">🔢 Track Record</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="totalProjects"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Projects</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 50"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="activeProjects"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Active Projects</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 8"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="completedProjects"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Completed Projects</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 42"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="totalUnitsDelivered"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Units Delivered</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 5000"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="onTimeDeliveryPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>On-Time Delivery %</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 85"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="complaintsHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complaints History</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Summary of customer complaints or disputes..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Positioning Tab */}
                      <TabsContent value="positioning" className="space-y-4">
                        <h3 className="text-lg font-medium">🏢 Market Positioning</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="companyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Type</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="public">Public Listed</SelectItem>
                                      <SelectItem value="private">Private Limited</SelectItem>
                                      <SelectItem value="partnership">Partnership</SelectItem>
                                      <SelectItem value="llp">LLP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="marketSegment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Market Segment</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select segment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="affordable">Affordable</SelectItem>
                                      <SelectItem value="mid-range">Mid-range</SelectItem>
                                      <SelectItem value="luxury">Luxury</SelectItem>
                                      <SelectItem value="ultra-luxury">Ultra-luxury</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="constructionModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Construction Model</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="in-house">In-house</SelectItem>
                                      <SelectItem value="contracting">Contracting</SelectItem>
                                      <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="fundingStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Funding Status</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bootstrap">Bootstrap</SelectItem>
                                      <SelectItem value="pe-backed">PE Backed</SelectItem>
                                      <SelectItem value="listed">Listed</SelectItem>
                                      <SelectItem value="debt-ridden">Debt Ridden</SelectItem>
                                      <SelectItem value="government-backed">Government Backed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="stockTicker"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Ticker (if listed)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., NSE: PRESTIGE" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Quality Tab */}
                      <TabsContent value="quality" className="space-y-4">
                        <h3 className="text-lg font-medium">🧱 Quality & Construction</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="civilQualityRating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Civil Quality Rating (1-5)</FormLabel>
                                <FormControl>
                                  <Select value={field.value?.toString()} onValueChange={(val) => field.onChange(Number(val))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 - Poor</SelectItem>
                                      <SelectItem value="2">2 - Below Average</SelectItem>
                                      <SelectItem value="3">3 - Average</SelectItem>
                                      <SelectItem value="4">4 - Good</SelectItem>
                                      <SelectItem value="5">5 - Excellent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="constructionModel2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>MEP/Interiors Model</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="in-house">In-house</SelectItem>
                                      <SelectItem value="outsourced">Outsourced</SelectItem>
                                      <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="popularFor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Popular For</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Great clubhouse but slow possession" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Legal Tab */}
                      <TabsContent value="legal" className="space-y-4">
                        <h3 className="text-lg font-medium">📜 Legal & Regulatory</h3>
                        
                        <FormField
                          control={form.control}
                          name="legalRedFlags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Legal Red Flags</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Known disputes, NGT issues, A-Khata problems..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="litigationsSummary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Litigations Summary</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="High-profile legal cases summary..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* SEO & Media Tab */}
                      <TabsContent value="seo" className="space-y-4">
                        <h3 className="text-lg font-medium">🔗 SEO & Media</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="builderSlug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Builder Slug</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., prestige-group" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="averageRating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Average Rating (out of 5)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="e.g., 4.2"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="seoMetaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SEO Meta Title</FormLabel>
                              <FormControl>
                                <Input placeholder="SEO optimized title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="seoDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SEO Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="140-160 character SEO description..."
                                  rows={2}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <Link href="/admin-panel/developers">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                      <Button 
                        type="submit" 
                        disabled={createDeveloperMutation.isPending}
                        className="min-w-32"
                      >
                        {createDeveloperMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Save className="h-4 w-4" />
                            <span>Create Developer</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}