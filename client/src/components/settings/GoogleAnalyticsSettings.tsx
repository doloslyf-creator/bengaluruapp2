import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Save,
  RefreshCw,
  Eye,
  Activity,
  Calendar,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Google Analytics Configuration Schema
const gaConfigSchema = z.object({
  measurementId: z.string().min(1, "Measurement ID is required").regex(/^G-[A-Z0-9]+$/, "Invalid GA4 Measurement ID format"),
  trackingEnabled: z.boolean().default(true),
  trackPageViews: z.boolean().default(true),
  trackEvents: z.boolean().default(true),
  trackEcommerce: z.boolean().default(true),
  trackFormSubmissions: z.boolean().default(true),
  trackScrollDepth: z.boolean().default(false),
  trackFileDownloads: z.boolean().default(true),
  trackOutboundLinks: z.boolean().default(true),
  anonymizeIp: z.boolean().default(true),
  cookieConsent: z.boolean().default(true),
  dataRetentionMonths: z.number().min(1).max(50).default(26),
  customDimensions: z.array(z.object({
    index: z.number(),
    name: z.string(),
    scope: z.enum(["hit", "session", "user", "product"])
  })).optional(),
});

type GAConfig = z.infer<typeof gaConfigSchema>;

interface AnalyticsData {
  totalUsers: number;
  newUsers: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number; }>;
  deviceBreakdown: Array<{ device: string; users: number; }>;
  trafficSources: Array<{ source: string; users: number; }>;
  conversionEvents: Array<{ event: string; count: number; }>;
}

export default function GoogleAnalyticsSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("configuration");
  const [testingConnection, setTestingConnection] = useState(false);

  // Fetch current GA configuration
  const { data: gaConfig, isLoading: configLoading } = useQuery<GAConfig>({
    queryKey: ["/api/settings/google-analytics"],
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard-data"],
    enabled: gaConfig?.trackingEnabled && gaConfig?.measurementId,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const form = useForm<GAConfig>({
    resolver: zodResolver(gaConfigSchema),
    defaultValues: {
      measurementId: "",
      trackingEnabled: true,
      trackPageViews: true,
      trackEvents: true,
      trackEcommerce: true,
      trackFormSubmissions: true,
      trackScrollDepth: false,
      trackFileDownloads: true,
      trackOutboundLinks: true,
      anonymizeIp: true,
      cookieConsent: true,
      dataRetentionMonths: 26,
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (gaConfig) {
      form.reset(gaConfig);
    }
  }, [gaConfig, form]);

  // Save GA configuration
  const saveConfigMutation = useMutation({
    mutationFn: (data: GAConfig) => apiRequest("POST", "/api/settings/google-analytics", data),
    onSuccess: () => {
      toast({
        title: "Google Analytics Configuration Saved",
        description: "Your tracking settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/google-analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Saving Configuration",
        description: error.message || "Failed to save Google Analytics settings.",
        variant: "destructive",
      });
    },
  });

  // Test GA connection
  const testConnectionMutation = useMutation({
    mutationFn: (measurementId: string) => apiRequest("POST", "/api/analytics/test-connection", { measurementId }),
    onSuccess: (data: any) => {
      toast({
        title: "Connection Test Successful",
        description: `Connected to GA4 property: ${data.propertyName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Unable to connect to Google Analytics.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GAConfig) => {
    saveConfigMutation.mutate(data);
  };

  const handleTestConnection = async () => {
    const measurementId = form.getValues("measurementId");
    if (!measurementId) {
      toast({
        title: "Measurement ID Required",
        description: "Please enter a valid GA4 Measurement ID first.",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    try {
      await testConnectionMutation.mutateAsync(measurementId);
    } finally {
      setTestingConnection(false);
    }
  };

  if (configLoading) {
    return <div className="flex justify-center p-8">Loading Google Analytics settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Google Analytics Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure Google Analytics 4 tracking and view your website analytics data.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="dashboard" disabled={!gaConfig?.trackingEnabled}>
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="events">Event Tracking</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Basic Configuration</span>
              </CardTitle>
              <CardDescription>
                Set up your Google Analytics 4 property connection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="measurementId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GA4 Measurement ID</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="G-XXXXXXXXXX" 
                                {...field}
                                data-testid="input-ga-measurement-id"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTestConnection}
                                disabled={testingConnection}
                                data-testid="button-test-ga-connection"
                              >
                                {testingConnection ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Activity className="h-4 w-4" />
                                )}
                                Test
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Your Google Analytics 4 Measurement ID (starts with G-)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trackingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Tracking</FormLabel>
                            <FormDescription>
                              Turn on/off Google Analytics tracking globally
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-tracking-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dataRetentionMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Retention Period</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-data-retention">
                              <SelectValue placeholder="Select retention period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2">2 months</SelectItem>
                            <SelectItem value="14">14 months</SelectItem>
                            <SelectItem value="26">26 months</SelectItem>
                            <SelectItem value="38">38 months</SelectItem>
                            <SelectItem value="50">50 months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How long to retain user data in Google Analytics
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={saveConfigMutation.isPending}
                      data-testid="button-save-ga-config"
                    >
                      {saveConfigMutation.isPending ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Configuration
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {analyticsLoading ? (
            <div className="flex justify-center p-8">Loading analytics data...</div>
          ) : analyticsData ? (
            <>
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-muted-foreground">Page Views</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <MousePointer className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-muted-foreground">Sessions</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{analyticsData.sessions.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-muted-foreground">Avg. Session</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">
                        {Math.floor(analyticsData.avgSessionDuration / 60)}m {analyticsData.avgSessionDuration % 60}s
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Pages and Device Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.topPages.map((page, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm truncate flex-1">{page.page}</span>
                          <Badge variant="secondary">{page.views.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.deviceBreakdown.map((device, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {device.device === 'mobile' ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Monitor className="h-4 w-4" />
                            )}
                            <span className="text-sm capitalize">{device.device}</span>
                          </div>
                          <Badge variant="outline">{device.users.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                No analytics data available. Make sure Google Analytics is properly configured and has been collecting data.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Tracking Configuration</CardTitle>
              <CardDescription>
                Configure which user interactions to track automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-4">
                  {[
                    { name: "trackPageViews", label: "Page Views", description: "Track when users visit pages" },
                    { name: "trackEvents", label: "Custom Events", description: "Track button clicks and form submissions" },
                    { name: "trackEcommerce", label: "E-commerce Events", description: "Track purchases and booking completions" },
                    { name: "trackFormSubmissions", label: "Form Submissions", description: "Track lead forms and contact forms" },
                    { name: "trackScrollDepth", label: "Scroll Depth", description: "Track how far users scroll on pages" },
                    { name: "trackFileDownloads", label: "File Downloads", description: "Track PDF and document downloads" },
                    { name: "trackOutboundLinks", label: "Outbound Links", description: "Track clicks to external websites" },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof GAConfig}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">{item.label}</FormLabel>
                            <FormDescription>{item.description}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                              data-testid={`switch-${item.name}`}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Compliance Settings</CardTitle>
              <CardDescription>
                Configure privacy settings to comply with GDPR and other regulations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="anonymizeIp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Anonymize IP Addresses</FormLabel>
                          <FormDescription>
                            Anonymize user IP addresses for privacy compliance
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-anonymize-ip"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookieConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Cookie Consent Banner</FormLabel>
                          <FormDescription>
                            Show cookie consent banner before tracking
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-cookie-consent"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}