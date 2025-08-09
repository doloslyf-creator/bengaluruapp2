
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  Users,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

interface NurturingStats {
  todayNurtured: number;
  weeklyNurtured: number;
  activeRules: number;
  lastRunTime: string;
}

export default function LeadNurturingAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  // Fetch nurturing statistics
  const { data: stats, isLoading: statsLoading } = useQuery<NurturingStats>({
    queryKey: ["/api/nurturing/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch lead statistics for context
  const { data: leadStats } = useQuery({
    queryKey: ["/api/leads/stats"],
  });

  // Manual nurturing cycle trigger
  const runNurturingMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/nurturing/run"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead nurturing cycle completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nurturing/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsRunning(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to run nurturing cycle.",
        variant: "destructive",
      });
      setIsRunning(false);
    },
  });

  // Price alert trigger
  const triggerPriceAlertMutation = useMutation({
    mutationFn: (data: { propertyId: string; oldPrice: number; newPrice: number }) =>
      apiRequest("POST", "/api/nurturing/trigger/price-alert", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Price alerts sent to interested customers!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to trigger price alerts.",
        variant: "destructive",
      });
    },
  });

  const handleRunNurturing = () => {
    setIsRunning(true);
    runNurturingMutation.mutate();
  };

  const nurturingRules = [
    {
      id: "immediate_followup",
      name: "Immediate Follow-up",
      description: "Contact new leads within 15 minutes",
      status: "active",
      triggered: 12,
      success: 8
    },
    {
      id: "24_hour_followup", 
      name: "24-Hour Follow-up",
      description: "Follow up if no response in 24 hours",
      status: "active",
      triggered: 8,
      success: 5
    },
    {
      id: "weekly_nurture",
      name: "Weekly Nurture",
      description: "Weekly check-in for warm leads",
      status: "active",
      triggered: 24,
      success: 15
    },
    {
      id: "property_price_alert",
      name: "Property Price Change Alert",
      description: "Notify when interested property price changes",
      status: "active",
      triggered: 3,
      success: 3
    },
    {
      id: "site_visit_reminder",
      name: "Site Visit Reminder", 
      description: "Remind about scheduled site visits",
      status: "active",
      triggered: 6,
      success: 6
    },
    {
      id: "cold_lead_reactivation",
      name: "Cold Lead Reactivation",
      description: "Try to reactivate cold leads after 30 days",
      status: "active",
      triggered: 4,
      success: 1
    }
  ];

  return (
    <AdminLayout title="Lead Nurturing Automation" showBackButton={false}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Nurturing Automation</h1>
              <p className="text-gray-600">Automated follow-ups and customer engagement</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleRunNurturing}
              disabled={runNurturingMutation.isPending || isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Running..." : "Run Cycle Now"}
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Rules
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Lead nurturing automation is active. Last cycle: {stats?.lastRunTime ? new Date(stats.lastRunTime).toLocaleString() : 'Never'}
          </AlertDescription>
        </Alert>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Nurturing</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.todayNurtured || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">Automated messages sent</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.weeklyNurtured || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">Last 7 days</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeRules || 6}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">Automation rules</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">Response rate</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Nurturing Rules</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Nurturing Rules</CardTitle>
                <CardDescription>
                  Automated rules that trigger based on lead behavior and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nurturingRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            rule.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <h4 className="font-medium">{rule.name}</h4>
                            <p className="text-sm text-gray-600">{rule.description}</p>
                          </div>
                        </div>
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Triggered Today:</span>
                          <span className="ml-1 font-medium">{rule.triggered}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Successful:</span>
                          <span className="ml-1 font-medium text-green-600">{rule.success}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <span className="ml-1 font-medium">
                            {rule.triggered > 0 ? Math.round((rule.success / rule.triggered) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Progress 
                          value={rule.triggered > 0 ? (rule.success / rule.triggered) * 100 : 0} 
                          className="flex-1 mr-4" 
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Nurturing automation effectiveness over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Message Delivery Rate</span>
                      <span className="text-sm font-bold">95.2%</span>
                    </div>
                    <Progress value={95.2} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Rate</span>
                      <span className="text-sm font-bold">78.4%</span>
                    </div>
                    <Progress value={78.4} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Lead Conversion Rate</span>
                      <span className="text-sm font-bold">23.1%</span>
                    </div>
                    <Progress value={23.1} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm font-bold">4.6/5.0</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Rules</CardTitle>
                  <CardDescription>
                    Rules with highest conversion rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Site Visit Reminder</p>
                        <p className="text-sm text-gray-600">100% success rate</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Property Price Alert</p>
                        <p className="text-sm text-gray-600">100% response rate</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">High</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">Immediate Follow-up</p>
                        <p className="text-sm text-gray-600">67% success rate</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Good</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automation Schedule</CardTitle>
                <CardDescription>
                  Configure when nurturing cycles run automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Every 15 minutes</span>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Business hours only</span>
                        <Badge variant="secondary">9 AM - 7 PM</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Weekend mode</span>
                        <Badge variant="outline">Reduced frequency</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Next Scheduled Runs</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Immediate follow-ups: Every 15 min</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>24-hour follow-ups: Every hour</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Weekly nurture: Daily at 10 AM</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Reactivation: Weekly on Monday</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button className="mr-2">Update Schedule</Button>
                  <Button variant="outline">View Logs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
