import { UserDashboardHeader } from "@/components/layout/UserDashboardHeader";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Settings, Mail, Smartphone, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  id?: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  propertyUpdates: boolean;
  reportNotifications: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  leadNotifications: boolean;
  systemNotifications: boolean;
  promotionalNotifications: boolean;
  digestFrequency: "immediate" | "daily" | "weekly" | "never";
  quietHoursStart: string;
  quietHoursEnd: string;
}

export default function UserNotifications() {
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user ID - in real app, get from auth context
  const userId = "user@example.com";

  // Fetch notification preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: [`/api/notification-preferences/${userId}`],
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return await apiRequest(`/api/notification-preferences/${userId}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notification-preferences/${userId}`] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserDashboardHeader 
        title="Notifications"
        breadcrumbs={[
          { label: "Dashboard", href: "/user-dashboard" },
          { label: "Notifications", href: "/user-notifications" }
        ]}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "notifications"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "notifications" ? (
          <NotificationCenter userId={userId} userType="user" />
        ) : (
          <div className="space-y-6">
            {/* Notification Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notification Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.emailNotifications ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.pushNotifications ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange("pushNotifications", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label className="text-base font-medium">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important notifications via SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.smsNotifications ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "propertyUpdates", label: "Property Updates", description: "New properties, price changes, and availability updates" },
                  { key: "reportNotifications", label: "Report Notifications", description: "Property valuation reports, legal tracker updates, and CIVIL+MEP reports" },
                  { key: "bookingNotifications", label: "Booking Notifications", description: "Site visit confirmations, rescheduling, and reminders" },
                  { key: "paymentNotifications", label: "Payment Notifications", description: "Payment confirmations, receipts, and payment reminders" },
                  { key: "leadNotifications", label: "Lead Updates", description: "Follow-up reminders and lead status updates" },
                  { key: "systemNotifications", label: "System Notifications", description: "Platform updates, maintenance, and important announcements" },
                  { key: "promotionalNotifications", label: "Promotional Content", description: "Special offers, new features, and marketing content" },
                ].map((category) => (
                  <div key={category.key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">{category.label}</Label>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Switch
                      checked={preferences?.[category.key as keyof NotificationPreferences] ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange(category.key as keyof NotificationPreferences, checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Frequency Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Frequency Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-2 block">Email Digest Frequency</Label>
                  <Select
                    value={preferences?.digestFrequency ?? "immediate"}
                    onValueChange={(value) => handlePreferenceChange("digestFrequency", value)}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    How often you want to receive email notifications
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium mb-2 block">Quiet Hours Start</Label>
                    <Select
                      value={preferences?.quietHoursStart ?? "22:00"}
                      onValueChange={(value) => handlePreferenceChange("quietHoursStart", value)}
                      disabled={updatePreferencesMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">Quiet Hours End</Label>
                    <Select
                      value={preferences?.quietHoursEnd ?? "08:00"}
                      onValueChange={(value) => handlePreferenceChange("quietHoursEnd", value)}
                      disabled={updatePreferencesMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  No notifications will be sent during quiet hours (except urgent notifications)
                </p>
              </CardContent>
            </Card>

            {/* Test Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Send yourself a test notification to verify your settings are working correctly.
                </p>
                <Button
                  onClick={() => {
                    // Send test notification
                    apiRequest("/api/notifications/test", {
                      method: "POST",
                      body: { userId, type: "info" },
                    });
                    toast({
                      title: "Test Notification Sent",
                      description: "Check your notification center and email for the test message.",
                    });
                  }}
                  variant="outline"
                >
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}