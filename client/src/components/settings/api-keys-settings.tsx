import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Map, 
  BarChart3, 
  MessageSquare, 
  Mail, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  TestTube
} from "lucide-react";

const apiKeysSchema = z.object({
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  razorpayTestMode: z.boolean().default(true),
  googleMapsApiKey: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  sendgridApiKey: z.string().optional(),
  sendgridFromEmail: z.string().optional(),
  surepassApiKey: z.string().optional(),
  interaktApiKey: z.string().optional(),
  interaktBaseUrl: z.string().optional(),
});

type ApiKeysData = z.infer<typeof apiKeysSchema>;

interface ApiKeySection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  keys: Array<{
    name: string;
    label: string;
    type: "text" | "password" | "boolean";
    placeholder?: string;
    description?: string;
  }>;
}

const apiKeySections: ApiKeySection[] = [
  {
    id: "razorpay",
    title: "Razorpay Payment Gateway",
    description: "Payment processing for services and reports",
    icon: CreditCard,
    color: "blue",
    keys: [
      {
        name: "razorpayKeyId",
        label: "Key ID",
        type: "text",
        placeholder: "rzp_test_1234567890",
        description: "Your Razorpay Key ID from the dashboard"
      },
      {
        name: "razorpayKeySecret",
        label: "Key Secret",
        type: "password",
        placeholder: "••••••••••••••••",
        description: "Your Razorpay Key Secret (keep this secure)"
      },
      {
        name: "razorpayTestMode",
        label: "Test Mode",
        type: "boolean",
        description: "Enable test mode for development"
      }
    ]
  },
  {
    id: "google-maps",
    title: "Google Maps API",
    description: "Location services and map integration",
    icon: Map,
    color: "green",
    keys: [
      {
        name: "googleMapsApiKey",
        label: "API Key",
        type: "password",
        placeholder: "AIzaSy...",
        description: "Google Maps JavaScript API key"
      }
    ]
  },
  {
    id: "google-analytics",
    title: "Google Analytics 4",
    description: "Website analytics and user tracking",
    icon: BarChart3,
    color: "orange",
    keys: [
      {
        name: "googleAnalyticsId",
        label: "Measurement ID",
        type: "text",
        placeholder: "G-XXXXXXXXXX",
        description: "Your GA4 Measurement ID"
      }
    ]
  },
  {
    id: "twilio",
    title: "Twilio SMS Service",
    description: "SMS notifications and customer communication",
    icon: MessageSquare,
    color: "red",
    keys: [
      {
        name: "twilioAccountSid",
        label: "Account SID",
        type: "text",
        placeholder: "AC...",
        description: "Your Twilio Account SID"
      },
      {
        name: "twilioAuthToken",
        label: "Auth Token",
        type: "password",
        placeholder: "••••••••••••••••",
        description: "Your Twilio Auth Token"
      },
      {
        name: "twilioPhoneNumber",
        label: "Phone Number",
        type: "text",
        placeholder: "+1234567890",
        description: "Your Twilio phone number"
      }
    ]
  },
  {
    id: "sendgrid",
    title: "SendGrid Email Service",
    description: "Email delivery and marketing automation",
    icon: Mail,
    color: "blue",
    keys: [
      {
        name: "sendgridApiKey",
        label: "API Key",
        type: "password",
        placeholder: "SG...",
        description: "Your SendGrid API key"
      },
      {
        name: "sendgridFromEmail",
        label: "From Email",
        type: "text",
        placeholder: "noreply@ownitright.com",
        description: "Default sender email address"
      }
    ]
  },
  {
    id: "surepass",
    title: "Surepass RERA Verification",
    description: "RERA compliance and property verification",
    icon: Shield,
    color: "purple",
    keys: [
      {
        name: "surepassApiKey",
        label: "API Key",
        type: "password",
        placeholder: "••••••••••••••••",
        description: "Your Surepass API key for RERA verification"
      }
    ]
  },
  {
    id: "interakt",
    title: "Interakt WhatsApp API",
    description: "WhatsApp notifications for booking confirmations",
    icon: MessageSquare,
    color: "green",
    keys: [
      {
        name: "interaktApiKey",
        label: "API Key",
        type: "password",
        placeholder: "••••••••••••••••",
        description: "Your Interakt API key for WhatsApp messaging"
      },
      {
        name: "interaktBaseUrl",
        label: "Base URL",
        type: "text",
        placeholder: "https://api.interakt.ai",
        description: "Interakt API base URL (optional - defaults to https://api.interakt.ai)"
      }
    ]
  }
];

export function ApiKeysSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingService, setTestingService] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // State for save button

  const { data: apiKeys, isLoading, refetch } = useQuery<ApiKeysData>({
    queryKey: ["/api/settings/api-keys"],
  });

  const form = useForm<ApiKeysData>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: apiKeys || {
      razorpayTestMode: true,
    },
    values: apiKeys, // This ensures form updates when data loads
  });

  const updateApiKeysMutation = useMutation({
    mutationFn: async (data: ApiKeysData) => {
      // Use the existing `onSubmit` logic here as it's already refactored
      // to handle API calls and toast messages.
      // The original onSubmit function is being replaced by the one in <changes>.
      // Therefore, we need to redefine the mutationFn to call that new onSubmit logic.
      // However, since we are directly replacing the onSubmit function, we can call it here.
      // The provided <changes> snippet replaces the onSubmit function entirely.
      // So, the mutationFn should not be defined separately but rather the onSubmit should be used directly.
      // For the purpose of this merge, we will assume the onSubmit function is the primary handler.
      
      // The following line is a placeholder to satisfy the mutation structure, 
      // but the actual logic will be in the onSubmit function which is being replaced.
      return apiRequest("PUT", "/api/settings/api-keys", data); 
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API keys updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api-keys"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API keys",
        variant: "destructive",
      });
    },
  });


  const testConnectionMutation = useMutation({
    mutationFn: async (service: string) => {
      if (service === "interakt") {
        return apiRequest("POST", "/api/test-whatsapp");
      }
      return apiRequest("POST", `/api/settings/test-connection/${service}`);
    },
    onSuccess: (data: any, service: string) => {
      toast({
        title: "Connection Test Successful",
        description: service === "interakt" ? "WhatsApp notification sent successfully" : `${service} is working correctly`,
      });
    },
    onError: (error: any, service: string) => {
      toast({
        title: "Connection Test Failed",
        description: `${service}: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setTestingService(null);
    }
  });

  // This onSubmit function replaces the original one.
  const onSubmit = async (data: ApiKeysData) => {
    try {
      setIsSaving(true);

      // Validate required fields if any are being set
      const requiredPairs = [
        ['razorpayKeyId', 'razorpayKeySecret'],
        ['twilioAccountSid', 'twilioAuthToken'],
      ];

      for (const [key1, key2] of requiredPairs) {
        if ((data[key1] && !data[key2]) || (!data[key1] && data[key2])) {
          throw new Error(`Both ${key1} and ${key2} are required when setting up this service.`);
        }
      }

      // Only send non-empty values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
      );

      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update API keys');
      }

      toast({
        title: "API Keys Updated",
        description: "Your API keys have been saved successfully.",
      });

      // Refresh the data
      await refetch();
    } catch (error) {
      console.error('Error updating API keys:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const testConnection = (service: string) => {
    setTestingService(service);
    testConnectionMutation.mutate(service);
  };

  const getStatusBadge = (sectionId: string, keys: ApiKeysData) => {
    const section = apiKeySections.find(s => s.id === sectionId);
    if (!section) return null;

    const hasConfiguredKeys = section.keys.some(k => {
      if (k.type === "boolean") {
        return keys && keys[k.name] !== undefined;
      }
      return keys && keys[k.name] && (keys[k.name] as string).trim() !== "";
    });

    if (hasConfiguredKeys) {
      return <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Configured
      </Badge>;
    }

    return <Badge variant="outline" className="text-gray-500">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Not Configured
    </Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          API keys are stored securely and encrypted. Only provide keys from official sources and never share them publicly.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {apiKeySections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 text-${section.color}-600`} />
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(section.id, apiKeys!)}
                      {(section.id === "razorpay" || section.id === "surepass" || section.id === "interakt") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(section.id)}
                          disabled={testingService === section.id}
                        >
                          <TestTube className="h-4 w-4 mr-1" />
                          {testingService === section.id ? "Testing..." : "Test"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.keys.map((key) => (
                    <FormField
                      key={key.name}
                      control={form.control}
                      name={key.name as keyof ApiKeysData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{key.label}</FormLabel>
                          <FormControl>
                            {key.type === "boolean" ? (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.value as boolean || false}
                                  onCheckedChange={field.onChange}
                                />
                                <Label htmlFor={key.name}>{key.description}</Label>
                              </div>
                            ) : (
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={key.type === "password" && !showPasswords[key.name] ? "password" : "text"}
                                  placeholder={key.placeholder}
                                  value={(field.value as string) || ""}
                                />
                                {key.type === "password" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => togglePasswordVisibility(key.name)}
                                  >
                                    {showPasswords[key.name] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </FormControl>
                          {key.description && key.type !== "boolean" && (
                            <FormDescription>{key.description}</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSaving} // Use isSaving state for the submit button
            >
              {isSaving ? "Saving..." : "Save API Keys"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}