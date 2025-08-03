import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  Download, 
  Database, 
  FileText, 
  Settings, 
  Archive, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
  Cloud
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

interface BackupStatus {
  id: string;
  type: 'full' | 'database' | 'files' | 'config';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  size?: string;
  downloadUrl?: string;
  error?: string;
}

export default function BackupSystem() {
  const { toast } = useToast();
  const [selectedBackupType, setSelectedBackupType] = useState<string>('full');

  // Fetch backup history
  const { data: backupHistory = [], refetch } = useQuery<BackupStatus[]>({
    queryKey: ['/api/admin/backups'],
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch('/api/admin/backups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Backup Started",
        description: "Your backup has been initiated and is now processing.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to start backup process.",
        variant: "destructive",
      });
    },
  });

  // Download backup mutation
  const downloadBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await fetch(`/api/admin/backups/${backupId}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `backup-${backupId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your backup file is now downloading.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download backup file.",
        variant: "destructive",
      });
    },
  });

  const backupTypes = [
    {
      id: 'full',
      name: 'Full System Backup',
      description: 'Complete backup including database, files, and configurations',
      icon: Archive,
      estimatedTime: '15-30 minutes',
      size: 'Large (500MB - 2GB)'
    },
    {
      id: 'database',
      name: 'Database Only',
      description: 'All database tables, data, and structure',
      icon: Database,
      estimatedTime: '5-10 minutes',
      size: 'Medium (50-500MB)'
    },
    {
      id: 'files',
      name: 'Files & Media',
      description: 'All uploaded files, images, and documents',
      icon: FileText,
      estimatedTime: '10-20 minutes',
      size: 'Variable (100MB - 1GB)'
    },
    {
      id: 'config',
      name: 'Configuration',
      description: 'Settings, API keys, and system configuration',
      icon: Settings,
      estimatedTime: '1-2 minutes',
      size: 'Small (< 10MB)'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Backup System</h1>
          <p className="mt-2 text-gray-600">
            Create and manage system backups for data protection and recovery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Backup Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Create New Backup
                </CardTitle>
                <CardDescription>
                  Select the type of backup you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Backup Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backupTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                          selectedBackupType === type.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedBackupType(type.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start space-x-3">
                            <Icon className={`h-6 w-6 mt-1 ${
                              selectedBackupType === type.id ? 'text-primary' : 'text-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900">
                                {type.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {type.description}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500">
                                  ⏱️ {type.estimatedTime}
                                </span>
                                <span className="text-xs text-gray-500">
                                  💾 {type.size}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create Backup Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => createBackupMutation.mutate(selectedBackupType)}
                    disabled={createBackupMutation.isPending}
                    className="px-8"
                  >
                    {createBackupMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-2" />
                        Create Backup
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Database Size</span>
                    <span className="font-medium">~250 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Files & Media</span>
                    <span className="font-medium">~450 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Configuration</span>
                    <span className="font-medium">~5 MB</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Estimated</span>
                      <span>~705 MB</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Last Backup
                  </h4>
                  <p className="text-sm text-gray-600">
                    {backupHistory.length > 0 
                      ? new Date(backupHistory[0]?.createdAt).toLocaleDateString()
                      : 'No backups created yet'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Backup History */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Backup History
              </CardTitle>
              <CardDescription>
                View and download previous backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Backups Yet
                  </h3>
                  <p className="text-gray-600">
                    Create your first backup to see it here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backupHistory.map((backup: BackupStatus) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(backup.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {backup.type.charAt(0).toUpperCase() + backup.type.slice(1)} Backup
                            </h4>
                            {getStatusBadge(backup.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(backup.createdAt).toLocaleString()}
                          </p>
                          {backup.size && (
                            <p className="text-sm text-gray-500">
                              Size: {backup.size}
                            </p>
                          )}
                          {backup.error && (
                            <p className="text-sm text-red-600">
                              Error: {backup.error}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {backup.status === 'running' && (
                          <div className="w-32">
                            <Progress value={backup.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {backup.progress}% complete
                            </p>
                          </div>
                        )}
                        
                        {backup.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadBackupMutation.mutate(backup.id)}
                            disabled={downloadBackupMutation.isPending}
                          >
                            {downloadBackupMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}