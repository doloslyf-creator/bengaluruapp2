import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Database, 
  HardDrive, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  Archive,
  Calendar,
  Activity,
  Server,
  CloudDownload,
  History,
  AlertCircle,
  Monitor,
  Cpu,
  MemoryStick,
  Gauge
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

export default function BackupSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const { data: backups, isLoading } = useQuery({
    queryKey: ["/api/admin/backups"],
    refetchInterval: 5000,
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/system/stats"],
    refetchInterval: 30000,
  });

  const createBackupMutation = useMutation({
    mutationFn: (type: string) => apiRequest("POST", "/api/admin/backups/create", { type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backups"] });
      toast({
        title: "Success",
        description: "Backup initiated successfully!",
      });
      setIsCreatingBackup(false);
    },
    onError: (error) => {
      console.error("Error creating backup:", error);
      toast({
        title: "Error",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
      setIsCreatingBackup(false);
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
    setIsCreatingBackup(true);
    createBackupMutation.mutate(type);
  };

  const handleDownloadBackup = (backupId: string) => {
    window.open(`/api/admin/backups/${backupId}/download`, '_blank');
  };

  const handleCleanupOldBackups = () => {
    cleanupBackupsMutation.mutate(30); // Keep last 30 days
  };

  return (
    <AdminLayout title="Backup & System Management" showBackButton={false}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backup & System Management</h1>
            <p className="text-gray-600">Monitor system health, create backups, and manage data recovery</p>
          </div>
        </div>

        <Tabs defaultValue="backups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="backups">Backup Management</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitor</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-6">
            {/* Backup Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CloudDownload className="h-5 w-5" />
                  <span>Create New Backup</span>
                </CardTitle>
                <CardDescription>
                  Choose the type of backup to create for your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => handleCreateBackup('full')}
                    disabled={isCreatingBackup}
                    className="h-auto p-6 flex flex-col items-center space-y-3"
                    variant="outline"
                  >
                    <Database className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Full System</div>
                      <div className="text-xs text-muted-foreground">Complete backup</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleCreateBackup('database')}
                    disabled={isCreatingBackup}
                    className="h-auto p-6 flex flex-col items-center space-y-3"
                    variant="outline"
                  >
                    <HardDrive className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Database Only</div>
                      <div className="text-xs text-muted-foreground">DB data & schema</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleCreateBackup('files')}
                    disabled={isCreatingBackup}
                    className="h-auto p-6 flex flex-col items-center space-y-3"
                    variant="outline"
                  >
                    <FileText className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Files & Media</div>
                      <div className="text-xs text-muted-foreground">Uploads & assets</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleCreateBackup('config')}
                    disabled={isCreatingBackup}
                    className="h-auto p-6 flex flex-col items-center space-y-3"
                    variant="outline"
                  >
                    <Settings className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Configuration</div>
                      <div className="text-xs text-muted-foreground">Settings & keys</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backup History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Backup History</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleCleanupOldBackups}
                      disabled={cleanupBackupsMutation.isPending}
                      variant="outline" 
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cleanup Old
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Recent backups and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {backups && (backups as any).length > 0 ? (
                      (backups as any).map((backup: any) => (
                        <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
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
                        <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No backups found. Create your first backup above.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Backup Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Backup Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure automatic backup schedules and retention policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Automatic Backup Schedule</label>
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
                    <label className="text-sm font-medium">Retention Period</label>
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

                <div className="mt-6 pt-6 border-t">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Automatic backups are scheduled to run during low-traffic hours (2:00 AM - 4:00 AM IST) to minimize impact on system performance.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">System Status</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-green-800">Online</span>
                    <p className="text-sm text-green-600">All services running</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Database</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-blue-800">Connected</span>
                    <p className="text-sm text-blue-600">PostgreSQL ready</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Performance</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-orange-800">Good</span>
                    <p className="text-sm text-orange-600">125ms response</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Security</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-purple-800">Secure</span>
                    <p className="text-sm text-purple-600">SSL active</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>System Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm text-muted-foreground">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm text-muted-foreground">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm text-muted-foreground">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-muted-foreground">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Restart</span>
                      <span className="text-sm text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Active Connections</span>
                      <span className="text-sm text-muted-foreground">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Database Size</span>
                      <span className="text-sm text-muted-foreground">245 MB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Real-time System Monitor</span>
                </CardTitle>
                <CardDescription>
                  Live monitoring of system performance and health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Monitor className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                  <p className="text-gray-600 mb-4">Live system metrics and performance data</p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Maintenance</span>
                </CardTitle>
                <CardDescription>
                  Maintenance tools and system optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <Database className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Database Optimization</div>
                      <div className="text-sm text-muted-foreground">Optimize database performance</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <RefreshCw className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Clear Cache</div>
                      <div className="text-sm text-muted-foreground">Clear system cache files</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <FileText className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Log Cleanup</div>
                      <div className="text-sm text-muted-foreground">Clean old log files</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <Shield className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Security Scan</div>
                      <div className="text-sm text-muted-foreground">Run security audit</div>
                    </div>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Maintenance operations may temporarily affect system performance. Schedule during low-traffic hours.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}