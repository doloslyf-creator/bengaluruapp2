import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/layout/admin-layout";
import { Save, ArrowLeft, Plus, Trash2, FileText, Wrench, Zap, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { insertCivilMepReportSchema } from "@shared/schema";

// Form schema for validation - using string dates for form input
const formSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  reportTitle: z.string().min(1, "Report title is required"),
  engineerName: z.string().min(1, "Engineer name is required"),
  engineerLicense: z.string().min(1, "Engineer license is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  reportDate: z.string().min(1, "Report date is required"),
  status: z.enum(["draft", "in-progress", "completed", "approved"]).default("draft"),
  overallScore: z.number().min(0).max(10).default(0),
  executiveSummary: z.string().default(""),
  recommendations: z.string().default(""),
  conclusions: z.string().default(""),
  investmentRecommendation: z.enum(["highly-recommended", "recommended", "conditional", "not-recommended"]).default("conditional"),
  // JSON fields
  siteInformation: z.any().default({}),
  foundationDetails: z.any().default({}),
  superstructureDetails: z.any().default({}),
  wallsFinishes: z.any().default({}),
  roofingDetails: z.any().default({}),
  doorsWindows: z.any().default({}),
  flooringDetails: z.any().default({}),
  staircasesElevators: z.any().default({}),
  externalWorks: z.any().default({}),
  mechanicalSystems: z.any().default({}),
  electricalSystems: z.any().default({}),
  plumbingSystems: z.any().default({}),
  fireSafetySystems: z.any().default({}),
  bmsAutomation: z.any().default({}),
  greenSustainability: z.any().default({}),
  documentation: z.any().default({}),
});

type FormData = z.infer<typeof formSchema>;

export function AdminCivilMepReportsCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      reportTitle: "",
      engineerName: "",
      engineerLicense: "",
      inspectionDate: "",
      reportDate: "",
      status: "draft",
      overallScore: 0,
      executiveSummary: "",
      recommendations: "",
      conclusions: "",
      investmentRecommendation: "conditional",
      // Initialize JSON fields as empty objects
      siteInformation: {},
      foundationDetails: {},
      superstructureDetails: {},
      wallsFinishes: {},
      roofingDetails: {},
      doorsWindows: {},
      flooringDetails: {},
      staircasesElevators: {},
      externalWorks: {},
      mechanicalSystems: {},
      electricalSystems: {},
      plumbingSystems: {},
      fireSafetySystems: {},
      bmsAutomation: {},
      greenSustainability: {},
      documentation: {},
    },
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/civil-mep-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create report");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports-stats"] });
      toast({ title: "Civil+MEP Report created successfully" });
      setLocation("/admin-panel/civil-mep-reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Convert date strings to Date objects
    const submitData = {
      ...data,
      inspectionDate: new Date(data.inspectionDate),
      reportDate: new Date(data.reportDate),
    };
    createReportMutation.mutate(submitData);
  };

  return (
    <AdminLayout title="Create Civil+MEP Report" showBackButton backUrl="/admin-panel/civil-mep-reports">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                New Civil+MEP Engineering Report
              </CardTitle>
              <CardDescription>
                Create a comprehensive engineering assessment report for a property
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Main Form Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="civil">Civil Engineering</TabsTrigger>
              <TabsTrigger value="mep">MEP Systems</TabsTrigger>
              <TabsTrigger value="summary">Summary & Assessment</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                  <CardDescription>
                    Basic information about the report and property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property">
                                <SelectValue placeholder="Select a property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(properties as any[]).map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.title} - {property.location}
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
                      name="reportTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Civil+MEP Assessment - Property Name"
                              {...field}
                              data-testid="input-report-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engineerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engineer Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full name of the inspecting engineer"
                              {...field}
                              data-testid="input-engineer-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engineerLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engineer License</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Professional license number"
                              {...field}
                              data-testid="input-engineer-license"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inspectionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspection Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-inspection-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reportDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-report-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overallScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Score (0-10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={field.value || 0}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-overall-score"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Civil Engineering Tab */}
            <TabsContent value="civil" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Civil Engineering Sections
                  </CardTitle>
                  <CardDescription>
                    Detailed assessment of structural and civil elements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Civil Engineering Sections</p>
                    <p className="text-sm">
                      Site Information, Foundation, Superstructure, Walls & Finishes,
                      Roofing, Doors & Windows, Flooring, Staircases & Elevators, External Works
                    </p>
                    <p className="text-xs mt-4 text-yellow-600">
                      Detailed form sections will be implemented based on the JSON schema structure
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MEP Systems Tab */}
            <TabsContent value="mep" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    MEP Systems
                  </CardTitle>
                  <CardDescription>
                    Mechanical, Electrical, and Plumbing systems assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">MEP Systems Assessment</p>
                    <p className="text-sm">
                      Mechanical, Electrical, Plumbing, Fire Safety, BMS & Automation, Green & Sustainability
                    </p>
                    <p className="text-xs mt-4 text-yellow-600">
                      Detailed form sections will be implemented based on the JSON schema structure
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary & Assessment Tab */}
            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary & Assessment</CardTitle>
                  <CardDescription>
                    Final assessment, recommendations, and conclusions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="executiveSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Executive Summary</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a comprehensive executive summary of the assessment..."
                            className="min-h-[100px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            data-testid="textarea-executive-summary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recommendations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List specific recommendations for the property..."
                            className="min-h-[100px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            data-testid="textarea-recommendations"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conclusions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conclusions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Final conclusions based on the assessment..."
                            className="min-h-[100px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                            data-testid="textarea-conclusions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="investmentRecommendation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Recommendation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "conditional"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-investment-recommendation">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                            <SelectItem value="conditional">Conditional</SelectItem>
                            <SelectItem value="not-recommended">Not Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button variant="outline" asChild data-testid="button-cancel">
                  <Link href="/admin-panel/civil-mep-reports">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createReportMutation.isPending}
                    data-testid="button-create-report"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createReportMutation.isPending ? "Creating..." : "Create Report"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </AdminLayout>
  );
}