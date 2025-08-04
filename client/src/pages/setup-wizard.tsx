import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Database, Key, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "validate",
      title: "Validate Credentials",
      description: "Testing connection to your Supabase project",
      status: 'pending'
    },
    {
      id: "schema",
      title: "Create Database Schema",
      description: "Setting up tables and relationships",
      status: 'pending'
    },
    {
      id: "seed",
      title: "Initialize Data",
      description: "Adding default configurations and sample data",
      status: 'pending'
    },
    {
      id: "configure",
      title: "Save Configuration",
      description: "Storing credentials securely",
      status: 'pending'
    }
  ]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const { toast } = useToast();

  const setupMutation = useMutation({
    mutationFn: async (credentials: { supabaseUrl: string; supabaseKey: string }) => {
      return await apiRequest("POST", "/api/setup/initialize", credentials);
    },
    onSuccess: (data) => {
      setIsSetupComplete(true);
      toast({
        title: "Setup Complete!",
        description: "Your OwnItRight platform is ready to use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      });
    },
  });

  const updateStepStatus = (stepId: string, status: SetupStep['status'], message?: string) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const handleSetup = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Missing Information",
        description: "Please provide both Supabase URL and API key",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(1);
    
    // Start setup process with real-time updates
    const eventSource = new EventSource(`/api/setup/progress?url=${encodeURIComponent(supabaseUrl)}&key=${encodeURIComponent(supabaseKey)}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'step_start') {
        updateStepStatus(data.step, 'running');
      } else if (data.type === 'step_complete') {
        updateStepStatus(data.step, 'completed', data.message);
      } else if (data.type === 'step_error') {
        updateStepStatus(data.step, 'error', data.message);
      } else if (data.type === 'complete') {
        setIsSetupComplete(true);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setupMutation.mutate({ supabaseUrl, supabaseKey });
    };
  };

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getProgressValue = () => {
    const completedSteps = setupSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / setupSteps.length) * 100;
  };

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Setup Complete!</CardTitle>
            <CardDescription>
              Your OwnItRight platform is now ready to use with your Supabase backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = "/admin-panel"}
              className="w-full"
              data-testid="button-go-to-admin"
            >
              Go to Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">Welcome to OwnItRight</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your property management platform with your Supabase backend
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  You'll need your Supabase project URL and service role key. Find these in your Supabase project settings under "API".
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supabaseUrl">Supabase Project URL *</Label>
                  <Input
                    id="supabaseUrl"
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    data-testid="input-supabase-url"
                  />
                </div>
                
                <div>
                  <Label htmlFor="supabaseKey">Service Role Key *</Label>
                  <Input
                    id="supabaseKey"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    data-testid="input-supabase-key"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSetup}
                className="w-full"
                disabled={!supabaseUrl || !supabaseKey || setupMutation.isPending}
                data-testid="button-start-setup"
              >
                {setupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Setup...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Start Setup
                  </>
                )}
              </Button>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Progress</span>
                  <span>{Math.round(getProgressValue())}%</span>
                </div>
                <Progress value={getProgressValue()} className="w-full" />
              </div>
              
              <div className="space-y-3">
                {setupSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    {getStepIcon(step.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.message && (
                        <p className={`text-xs mt-1 ${
                          step.status === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}