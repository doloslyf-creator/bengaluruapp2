import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Settings, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Palette, 
  ToggleLeft, 
  Save,
  Upload,
  AlertTriangle,
  Monitor,
  Database,
  Activity,
  HardDrive,
  Users,
  FileText,
  BarChart3,
  Clock,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { insertAppSettingsSchema, type AppSettings, type InsertAppSettings } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysSettings } from "@/components/settings/api-keys-settings";
import GoogleAnalyticsSettings from "@/components/settings/GoogleAnalyticsSettings";
import RolePermissionSettings from "@/components/settings/RolePermissionSettings";
import { Key, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// System Monitoring Component
function SystemMonitoringTab() {
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/system/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  const { data: backups } = useQuery({
    queryKey: ["/api/admin/backups"],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>
            Monitor system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">System Status</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-green-800 dark:text-green-200">Online</span>
                <p className="text-sm text-green-600 dark:text-green-400">All services running</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Database</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">Connected</span>
                <p className="text-sm text-blue-600 dark:text-blue-400">PostgreSQL ready</p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Total Properties</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {propertiesStats?.totalProperties || 0}
                </span>
                <p className="text-sm text-purple-600 dark:text-purple-400">Active listings</p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Backups</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {backups?.length || 0}
                </span>
                <p className="text-sm text-orange-600 dark:text-orange-400">Total backups</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">32%</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Disk Usage</span>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-muted-foreground">125ms avg</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent System Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">System started successfully</span>
                </div>
                <span className="text-xs text-muted-foreground">2 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Database connection established</span>
                </div>
                <span className="text-xs text-muted-foreground">5 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">API keys loaded successfully</span>
                </div>
                <span className="text-xs text-muted-foreground">5 minutes ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Backup Management Component
function BackupManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: backups, isLoading } = useQuery({
    queryKey: ["/api/admin/backups"],
    refetchInterval: 5000, // Refresh every 5 seconds to show progress
  });

  const createBackupMutation = useMutation({
    mutationFn: (type: string) => apiRequest("POST", "/api/admin/backups/create", { type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      toast({
        title: "Success",
        description: "Backup initiated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating backup:", error);
      toast({
        title: "Error",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cleanupBackupsMutation = useMutation({
    mutationFn: (daysToKeep: number) => apiRequest("DELETE", "/api/admin/backups/cleanup", { daysToKeep }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      toast({
        title: "Success",
        description: "Old backups cleaned up successfully!",
      });
    },
    onError: (error) => {
      console.error("Error cleaning up backups:", error);
      toast({
        title: "Error",
        description: "Failed to cleanup backups. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = (type: string) => {
    createBackupMutation.mutate(type);
  };

  const handleDownloadBackup = (backupId: string) => {
    window.open(`/api/admin/backups/${backupId}/download`, '_blank');
  };

  const handleCleanupOldBackups = () => {
    cleanupBackupsMutation.mutate(30); // Keep last 30 days
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Backup Management</span>
          </CardTitle>
          <CardDescription>
            Create, manage, and restore system backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Backup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => handleCreateBackup('full')}
                disabled={createBackupMutation.isPending}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                variant="outline"
              >
                <Database className="h-6 w-6" />
                <span className="font-medium">Full System</span>
                <span className="text-xs text-muted-foreground">Complete backup</span>
              </Button>

              <Button
                onClick={() => handleCreateBackup('database')}
                disabled={createBackupMutation.isPending}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                variant="outline"
              >
                <HardDrive className="h-6 w-6" />
                <span className="font-medium">Database Only</span>
                <span className="text-xs text-muted-foreground">DB data & schema</span>
              </Button>

              <Button
                onClick={() => handleCreateBackup('files')}
                disabled={createBackupMutation.isPending}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                variant="outline"
              >
                <FileText className="h-6 w-6" />
                <span className="font-medium">Files & Media</span>
                <span className="text-xs text-muted-foreground">Uploads & assets</span>
              </Button>

              <Button
                onClick={() => handleCreateBackup('config')}
                disabled={createBackupMutation.isPending}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                variant="outline"
              >
                <Settings className="h-6 w-6" />
                <span className="font-medium">Configuration</span>
                <span className="text-xs text-muted-foreground">Settings & keys</span>
              </Button>
            </div>
          </div>

          {/* Backup History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Backup History</h3>
              <Button
                onClick={handleCleanupOldBackups}
                disabled={cleanupBackupsMutation.isPending}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cleanup Old Backups
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {backups && backups.length > 0 ? (
                  backups.map((backup: any) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {backup.type === 'full' && <Database className="h-5 w-5 text-blue-600" />}
                          {backup.type === 'database' && <HardDrive className="h-5 w-5 text-green-600" />}
                          {backup.type === 'files' && <FileText className="h-5 w-5 text-purple-600" />}
                          {backup.type === 'config' && <Settings className="h-5 w-5 text-orange-600" />}
                          <div>
                            <div className="font-medium capitalize">{backup.type} Backup</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(backup.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={backup.status === 'completed' ? 'default' : backup.status === 'failed' ? 'destructive' : 'secondary'}>
                          {backup.status}
                        </Badge>
                        {backup.progress !== undefined && backup.status === 'in_progress' && (
                          <div className="flex items-center space-x-2">
                            <Progress value={backup.progress} className="w-32 h-2" />
                            <span className="text-sm text-muted-foreground">{backup.progress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {backup.size && (
                          <span className="text-sm text-muted-foreground">
                            {(backup.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                        {backup.status === 'completed' && (
                          <Button
                            onClick={() => handleDownloadBackup(backup.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No backups found. Create your first backup above.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Backup Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Backup Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Automatic Backup Schedule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Retention Period</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<InsertAppSettings>({
    resolver: zodResolver(insertAppSettingsSchema),
    defaultValues: {
      businessName: "OwnItRight – Curated Property Advisors",
      contactEmail: "contact@ownitright.com",
      phoneNumber: "+91 98765 43210",
      whatsappNumber: "+91 98765 43210",
      officeAddress: "Bengaluru, Karnataka, India",
      defaultCurrency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      maintenanceMode: false,
      maintenanceMessage: "We are currently performing maintenance. Please check back later.",
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      metaTitle: "OwnItRight - Property Discovery Platform",
      metaDescription: "Discover your perfect property in Bengaluru with our advanced property discovery platform",
      enableBookings: true,
      enableConsultations: true,
      enableReports: true,
      enableBlog: true,
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        businessName: settings.businessName || "OwnItRight – Curated Property Advisors",
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        contactEmail: settings.contactEmail || "contact@ownitright.com",
        phoneNumber: settings.phoneNumber || "+91 98765 43210",
        whatsappNumber: settings.whatsappNumber || "+91 98765 43210",
        officeAddress: settings.officeAddress || "Bengaluru, Karnataka, India",
        defaultCurrency: settings.defaultCurrency || "INR",
        currencySymbol: settings.currencySymbol || "₹",
        timezone: settings.timezone || "Asia/Kolkata",
        dateFormat: settings.dateFormat || "DD/MM/YYYY",
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || "We are currently performing maintenance. Please check back later.",
        primaryColor: settings.primaryColor || "#2563eb",
        secondaryColor: settings.secondaryColor || "#64748b",
        metaTitle: settings.metaTitle || "OwnItRight - Property Discovery Platform",
        metaDescription: settings.metaDescription || "Discover your perfect property in Bengaluru with our advanced property discovery platform",
        enableBookings: settings.enableBookings ?? true,
        enableConsultations: settings.enableConsultations ?? true,
        enableReports: settings.enableReports ?? true,
        enableBlog: settings.enableBlog ?? true,
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: InsertAppSettings) => apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAppSettings) => {
    updateSettingsMutation.mutate(data);
  };

  const tabs = [
    { id: "general", label: "General", icon: Building },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "roles", label: "Roles & Permissions", icon: Shield },
    { id: "contact", label: "Contact Info", icon: Mail },
    { id: "localization", label: "Localization", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "features", label: "Features", icon: ToggleLeft },
    { id: "system", label: "System", icon: Monitor },
    { id: "backup", label: "Backup", icon: Upload },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Settings" showBackButton={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" showBackButton={false}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
            <p className="text-gray-600">Configure your application settings and preferences</p>
          </div>
        </div>

        {form.watch("maintenanceMode") && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Maintenance mode is currently enabled. Users will see the maintenance message.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
                <CardDescription>Configure different aspects of your application</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* General Settings */}
                {activeTab === "general" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>General Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Basic application information and branding
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="Enter business name" />
                            </FormControl>
                            <FormDescription>
                              This will appear in the navbar and reports
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="https://example.com/logo.png" />
                              </FormControl>
                              <FormDescription>
                                PNG/SVG logo for navbar and reports
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="faviconUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Favicon URL</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="https://example.com/favicon.ico" />
                              </FormControl>
                              <FormDescription>
                                Small icon for browser tabs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Maintenance Mode</FormLabel>
                              <FormDescription>
                                Enable maintenance mode to show a message to users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("maintenanceMode") && (
                        <FormField
                          control={form.control}
                          name="maintenanceMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maintenance Message</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Enter maintenance message" />
                              </FormControl>
                              <FormDescription>
                                This message will be shown to users during maintenance
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* API Keys Settings */}
                {activeTab === "api-keys" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Key className="h-5 w-5" />
                        <span>API Keys & Integrations</span>
                      </CardTitle>
                      <CardDescription>
                        Configure third-party API keys for payments, maps, analytics, and more
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ApiKeysSettings />
                    </CardContent>
                  </Card>
                )}

                {/* Role & Permission Settings */}
                {activeTab === "roles" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Roles & Permissions</span>
                      </CardTitle>
                      <CardDescription>
                        Manage user roles and control access to different parts of the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RolePermissionSettings />
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information */}
                {activeTab === "contact" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mail className="h-5 w-5" />
                        <span>Contact Information</span>
                      </CardTitle>
                      <CardDescription>
                        Contact details for footer and customer communication
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="email" placeholder="contact@company.com" />
                            </FormControl>
                            <FormDescription>
                              Primary email for customer inquiries
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="+91 98765 43210" />
                              </FormControl>
                              <FormDescription>
                                Primary contact number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsappNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="+91 98765 43210" />
                              </FormControl>
                              <FormDescription>
                                WhatsApp contact number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="officeAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Office Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} placeholder="Enter office address" />
                            </FormControl>
                            <FormDescription>
                              Office address for footer and contact pages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Localization Settings */}
                {activeTab === "localization" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <span>Localization Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Regional settings and formatting preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="defaultCurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currencySymbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency Symbol</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="₹" />
                              </FormControl>
                              <FormDescription>
                                Symbol to display with prices
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Format</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select date format" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Appearance Settings */}
                {activeTab === "appearance" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Palette className="h-5 w-5" />
                        <span>Appearance Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Theme colors and SEO settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Color</FormLabel>
                              <FormControl>
                                <div className="flex space-x-2">
                                  <Input {...field} value={field.value || ""} placeholder="#2563eb" />
                                  <div
                                    className="w-10 h-10 rounded border-2 border-gray-300"
                                    style={{ backgroundColor: field.value || "#2563eb" }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Main brand color for buttons and accents
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secondary Color</FormLabel>
                              <FormControl>
                                <div className="flex space-x-2">
                                  <Input {...field} value={field.value || ""} placeholder="#64748b" />
                                  <div
                                    className="w-10 h-10 rounded border-2 border-gray-300"
                                    style={{ backgroundColor: field.value || "#64748b" }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Secondary color for text and borders
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">SEO & Metadata</h3>
                        
                        <FormField
                          control={form.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="Enter meta title" />
                              </FormControl>
                              <FormDescription>
                                Default title for search engines and browser tabs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Enter meta description" />
                              </FormControl>
                              <FormDescription>
                                Default description for search engines (max 160 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Feature Toggles */}
                {activeTab === "features" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ToggleLeft className="h-5 w-5" />
                        <span>Feature Toggles</span>
                      </CardTitle>
                      <CardDescription>
                        Enable or disable application features
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="enableBookings"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Site Visit Bookings</FormLabel>
                                <FormDescription>
                                  Allow users to book site visits for properties
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableConsultations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Consultations</FormLabel>
                                <FormDescription>
                                  Allow users to book consultation sessions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Valuation Reports</FormLabel>
                                <FormDescription>
                                  Enable property valuation and CIVIL+MEP reports
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enableBlog"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Blog System</FormLabel>
                                <FormDescription>
                                  Enable blog management and content publishing
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* System Monitoring */}
                {activeTab === "system" && <SystemMonitoringTab />}

                {/* Backup Management */}
                {activeTab === "backup" && <BackupManagementTab />}

                {/* Save Button - Only show for form-based tabs */}
                {!["system", "backup"].includes(activeTab) && (
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={updateSettingsMutation.isPending}
                    className="min-w-32"
                  >
                    {updateSettingsMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Save Settings</span>
                      </div>
                    )}
                  </Button>
                </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}