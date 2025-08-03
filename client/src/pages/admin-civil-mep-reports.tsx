import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/layout/admin-layout";
import { Plus, FileText, Search, Filter, Eye, Edit, Trash2, Download, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { CivilMepReport } from "@shared/schema";

export function AdminCivilMepReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<CivilMepReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Civil+MEP reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/civil-mep-reports"],
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/civil-mep-reports-stats"],
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/civil-mep-reports/${reportId}`, { 
        method: "DELETE" 
      });
      if (!response.ok) throw new Error('Failed to delete report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports-stats"] });
      toast({ title: "Report deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting report", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Filter reports based on search and status
  const filteredReports = (reports as CivilMepReport[]).filter((report: CivilMepReport) => {
    const matchesSearch = report.reportTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.engineerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.propertyId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, icon: Edit },
      "in-progress": { variant: "default" as const, icon: Clock },
      completed: { variant: "default" as const, icon: CheckCircle },
      approved: { variant: "default" as const, icon: CheckCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;
    
    return (
      <Badge variant={config?.variant || "outline"} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const getRecommendationBadge = (recommendation: string) => {
    const recConfig = {
      "highly-recommended": { variant: "default" as const, bg: "bg-green-100 text-green-800 border-green-200" },
      "recommended": { variant: "secondary" as const, bg: "bg-blue-100 text-blue-800 border-blue-200" },
      "conditional": { variant: "outline" as const, bg: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      "not-recommended": { variant: "destructive" as const, bg: "bg-red-100 text-red-800 border-red-200" }
    };
    const config = recConfig[recommendation as keyof typeof recConfig];
    
    return (
      <Badge className={config?.bg || "bg-gray-100 text-gray-800"}>
        {recommendation?.replace('-', ' ').toUpperCase() || 'PENDING'}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Civil+MEP Reports">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Civil+MEP Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive engineering assessments for properties
            </p>
          </div>
          <Button asChild data-testid="button-create-report">
            <Link href="/admin/civil-mep-reports/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-reports">
                  {(stats as any)?.totalReports || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-completed-reports">
                  {(stats as any)?.completedReports || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-progress-reports">
                  {(stats as any)?.inProgressReports || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-score">
                  {((stats as any)?.avgScore || 0).toFixed(1)}/10
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by report title, engineer name, or property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Reports ({filteredReports.length})</CardTitle>
            <CardDescription>
              Manage and track all Civil+MEP engineering reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No reports match your search criteria" 
                  : "No reports created yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Details</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report: CivilMepReport) => (
                      <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium" data-testid={`text-title-${report.id}`}>
                              {report.reportTitle}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Property ID: {report.propertyId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.engineerName}</div>
                            <div className="text-sm text-muted-foreground">
                              License: {report.engineerLicense}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg">
                            {report.overallScore || 0}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRecommendationBadge(report.investmentRecommendation || 'conditional')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Inspection: {new Date(report.inspectionDate).toLocaleDateString()}</div>
                            <div>Report: {new Date(report.reportDate).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportDialog(true);
                              }}
                              data-testid={`button-view-${report.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              data-testid={`button-edit-${report.id}`}
                            >
                              <Link href={`/admin/civil-mep-reports/${report.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteReportMutation.mutate(report.id)}
                              disabled={deleteReportMutation.isPending}
                              data-testid={`button-delete-${report.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Details Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReport?.reportTitle}</DialogTitle>
              <DialogDescription>
                Civil+MEP Engineering Report Details
              </DialogDescription>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-4">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="civil">Civil</TabsTrigger>
                    <TabsTrigger value="mep">MEP</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold">Report Information</h4>
                        <div className="text-sm space-y-1 mt-2">
                          <div>Property ID: {selectedReport.propertyId}</div>
                          <div>Engineer: {selectedReport.engineerName}</div>
                          <div>License: {selectedReport.engineerLicense}</div>
                          <div>Status: {getStatusBadge(selectedReport.status)}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Assessment</h4>
                        <div className="text-sm space-y-1 mt-2">
                          <div>Overall Score: {selectedReport.overallScore || 0}/10</div>
                          <div>Recommendation: {getRecommendationBadge(selectedReport.investmentRecommendation || 'conditional')}</div>
                          <div>Inspection Date: {new Date(selectedReport.inspectionDate).toLocaleDateString()}</div>
                          <div>Report Date: {new Date(selectedReport.reportDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="civil">
                    <div className="text-sm text-muted-foreground">
                      Civil engineering sections data (site information, foundation, superstructure, etc.)
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mep">
                    <div className="text-sm text-muted-foreground">
                      MEP systems data (mechanical, electrical, plumbing, fire safety, etc.)
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary">
                    <div className="space-y-4">
                      {selectedReport.executiveSummary && (
                        <div>
                          <h4 className="font-semibold">Executive Summary</h4>
                          <p className="text-sm mt-2">{selectedReport.executiveSummary}</p>
                        </div>
                      )}
                      {selectedReport.recommendations && (
                        <div>
                          <h4 className="font-semibold">Recommendations</h4>
                          <p className="text-sm mt-2">{selectedReport.recommendations}</p>
                        </div>
                      )}
                      {selectedReport.conclusions && (
                        <div>
                          <h4 className="font-semibold">Conclusions</h4>
                          <p className="text-sm mt-2">{selectedReport.conclusions}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    asChild
                    data-testid="button-edit-dialog"
                  >
                    <Link href={`/admin/civil-mep-reports/${selectedReport.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Report
                    </Link>
                  </Button>
                  <Button data-testid="button-download">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}