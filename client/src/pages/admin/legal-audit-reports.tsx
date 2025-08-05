import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Shield, TrendingUp, AlertTriangle, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdminLegalAuditReports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reports and stats
  const { data: reports = [], isLoading: isLoadingReports } = useQuery<any[]>({
    queryKey: ["/api/legal-audit-reports"],
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/legal-audit-reports-stats"],
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest("DELETE", `/api/legal-audit-reports/${reportId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-audit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-audit-reports-stats"] });
      toast({ title: "Legal Audit Report deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      "in-progress": { variant: "default" as const, label: "In Progress" },
      completed: { variant: "default" as const, label: "Completed" },
      approved: { variant: "default" as const, label: "Approved" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      low: { variant: "default" as const, label: "Low Risk", className: "bg-green-100 text-green-800" },
      medium: { variant: "secondary" as const, label: "Medium Risk", className: "bg-yellow-100 text-yellow-800" },
      high: { variant: "destructive" as const, label: "High Risk", className: "bg-orange-100 text-orange-800" },
      critical: { variant: "destructive" as const, label: "Critical Risk", className: "bg-red-100 text-red-800" },
    };
    
    const config = riskConfig[riskLevel as keyof typeof riskConfig] || riskConfig.medium;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoadingReports) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Legal Audit Reports</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive legal due diligence analysis for properties
            </p>
          </div>
          <Button onClick={() => setLocation("/admin-panel/legal-audit-reports/create")} data-testid="button-create-report">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.avgScore)}/100</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Audit Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Legal Audit Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first legal audit report to get started with property legal analysis.
                </p>
                <Button onClick={() => setLocation("/admin-panel/legal-audit-reports/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Report Title</th>
                      <th className="text-left p-4 font-medium">Property</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Risk Level</th>
                      <th className="text-left p-4 font-medium">Score</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{report.reportTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            Lawyer: {report.lawyerName}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{report.propertyId}</div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="p-4">
                          {getRiskBadge(report.riskLevel)}
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{report.overallScore || 0}/100</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{formatDate(report.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin-panel/legal-audit-reports/${report.id}`)}
                              data-testid={`button-view-${report.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin-panel/legal-audit-reports/${report.id}/edit`)}
                              data-testid={`button-edit-${report.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteReportMutation.mutate(report.id)}
                              disabled={deleteReportMutation.isPending}
                              data-testid={`button-delete-${report.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}