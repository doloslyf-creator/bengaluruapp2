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
  }
];

export function ApiKeysSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingService, setTestingService] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useQuery<ApiKeysData>({
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
      return apiRequest("/api/settings/api-keys", {
        method: "PUT",
        body: JSON.stringify(data),
      });
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
      return apiRequest(`/api/settings/test-connection/${service}`, {
        method: "POST",
      });
    },
    onSuccess: (data: any, service: string) => {
      toast({
        title: "Connection Test Successful",
        description: `${service} is working correctly`,
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

  const onSubmit = (data: ApiKeysData) => {
    updateApiKeysMutation.mutate(data);
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

  const getStatusBadge = (sectionId: string, keys: any) => {
    const hasRequiredKeys = apiKeySections
      .find(s => s.id === sectionId)?.keys
      .filter(k => k.type !== "boolean")
      .some(k => keys && keys[k.name]);

    if (hasRequiredKeys) {
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
                      {getStatusBadge(section.id, apiKeys)}
                      {(section.id === "razorpay" || section.id === "surepass") && (
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
              disabled={updateApiKeysMutation.isPending}
            >
              {updateApiKeysMutation.isPending ? "Saving..." : "Save API Keys"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}