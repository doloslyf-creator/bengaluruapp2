import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Building, 
  RefreshCw,
  Search,
  TrendingUp,
  FileCheck
} from "lucide-react";

interface ReraData {
  id: string;
  reraId: string;
  projectName: string;
  promoterName: string;
  location: string;
  district: string;
  projectType: string;
  projectStatus: string;
  complianceStatus: string;
  verificationStatus: string;
  registrationDate?: string;
  completionDate?: string;
  lastVerifiedAt?: string;
  propertyId?: string;
}

interface ReraStatusSummary {
  total: number;
  verified: number;
  pending: number;
  failed: number;
  outdated: number;
  byComplianceStatus: {
    active: number;
    nonCompliant: number;
    suspended: number;
    cancelled: number;
  };
  byProjectStatus: {
    underConstruction: number;
    completed: number;
    delayed: number;
    cancelled: number;
    approved: number;
  };
}

export default function ReraManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyReraId, setVerifyReraId] = useState("");
  const [bulkReraIds, setBulkReraIds] = useState("");
  const [showAutoSyncDialog, setShowAutoSyncDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch RERA data
  const { data: reraData = [], isLoading } = useQuery<ReraData[]>({
    queryKey: ["/api/rera-data"],
  });

  // Fetch RERA status summary
  const { data: statusSummary } = useQuery<ReraStatusSummary>({
    queryKey: ["/api/rera-data/status-summary"],
  });

  // Single RERA verification
  const verifyMutation = useMutation({
    mutationFn: async ({ reraId, propertyId }: { reraId: string; propertyId?: string }) => {
      return apiRequest(`/api/rera-data/verify`, {
        method: "POST",
        body: JSON.stringify({ reraId, propertyId }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "RERA Verified Successfully",
        description: `RERA project ${data.data.projectName} has been verified and synced.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rera-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rera-data/status-summary"] });
      setVerifyReraId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk RERA verification
  const bulkVerifyMutation = useMutation({
    mutationFn: async (reraIds: string[]) => {
      return apiRequest(`/api/rera-data/bulk-verify`, {
        method: "POST",
        body: JSON.stringify({ reraIds }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Verification Completed",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rera-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rera-data/status-summary"] });
      setBulkReraIds("");
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-sync mutation
  const autoSyncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/rera-data/auto-sync`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Auto-Sync Completed",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rera-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rera-data/status-summary"] });
      setShowAutoSyncDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Auto-Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!verifyReraId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a RERA ID to verify",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({ reraId: verifyReraId.trim() });
  };

  const handleBulkVerify = () => {
    const ids = bulkReraIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    if (ids.length === 0) {
      toast({
        title: "Error",
        description: "Please enter RERA IDs to verify (one per line)",
        variant: "destructive",
      });
      return;
    }
    
    bulkVerifyMutation.mutate(ids);
  };

  const getStatusBadge = (status: string, type: 'verification' | 'compliance' | 'project') => {
    const config = {
      verification: {
        verified: { color: "bg-green-100 text-green-800", icon: CheckCircle },
        pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        failed: { color: "bg-red-100 text-red-800", icon: XCircle },
        outdated: { color: "bg-gray-100 text-gray-800", icon: AlertTriangle },
      },
      compliance: {
        active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
        'non-compliant': { color: "bg-red-100 text-red-800", icon: XCircle },
        suspended: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
        cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
      },
      project: {
        'under-construction': { color: "bg-blue-100 text-blue-800", icon: Building },
        completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
        delayed: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
        approved: { color: "bg-green-100 text-green-800", icon: FileCheck },
      },
    };

    const statusConfig = config[type][status as keyof typeof config[typeof type]];
    const Icon = statusConfig?.icon || AlertTriangle;
    
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const filteredData = reraData.filter(item =>
    item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reraId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.promoterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="RERA Data Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RERA Data Management</h1>
          <p className="text-muted-foreground">
            Manage and verify RERA project data integration
          </p>
        </div>
        <Button 
          onClick={() => setShowAutoSyncDialog(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Auto-Sync Properties
        </Button>
      </div>

      {/* Status Summary Cards */}
      {statusSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.total}</div>
              <p className="text-xs text-muted-foreground">
                {statusSummary.verified} verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.byComplianceStatus.active}</div>
              <p className="text-xs text-muted-foreground">
                RERA compliant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Construction</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.byProjectStatus.underConstruction}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusSummary.total > 0 
                  ? Math.round((statusSummary.verified / statusSummary.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage RERA Data</TabsTrigger>
          <TabsTrigger value="verify">Verify New RERA</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RERA Project Data</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by project name, RERA ID, promoter, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RERA ID</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Promoter</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Project Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Last Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading RERA data...
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No RERA data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.reraId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.projectName}
                          </TableCell>
                          <TableCell>{item.promoterName}</TableCell>
                          <TableCell>{item.location}, {item.district}</TableCell>
                          <TableCell>
                            {getStatusBadge(item.projectStatus, 'project')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.complianceStatus, 'compliance')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.verificationStatus, 'verification')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.lastVerifiedAt 
                              ? new Date(item.lastVerifiedAt).toLocaleDateString()
                              : 'Never'
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verify Single RERA Project</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter a RERA ID to fetch and verify project data from the official database
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter RERA ID (e.g., PRM/KA/RERA/1251/446/AG/200622/001931)"
                  value={verifyReraId}
                  onChange={(e) => setVerifyReraId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleVerify}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This will fetch real-time data from Karnataka RERA database using Surepass API
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk RERA Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter multiple RERA IDs (one per line) for bulk verification
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Enter RERA IDs, one per line&#10;PRM/KA/RERA/1251/446/AG/200622/001931&#10;PRM/KA/RERA/1251/446/AG/200622/001932"
                value={bulkReraIds}
                onChange={(e) => setBulkReraIds(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button 
                onClick={handleBulkVerify}
                disabled={bulkVerifyMutation.isPending}
                className="w-full"
              >
                {bulkVerifyMutation.isPending ? "Processing..." : "Bulk Verify"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Rate-limited processing with 1-second delay between requests to respect API limits
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auto-sync Confirmation Dialog */}
      <AlertDialog open={showAutoSyncDialog} onOpenChange={setShowAutoSyncDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auto-Sync RERA Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will automatically sync RERA data for all properties that have RERA numbers 
              but haven't been verified yet. This process may take several minutes depending on 
              the number of properties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => autoSyncMutation.mutate()}
              disabled={autoSyncMutation.isPending}
            >
              {autoSyncMutation.isPending ? "Processing..." : "Start Auto-Sync"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}