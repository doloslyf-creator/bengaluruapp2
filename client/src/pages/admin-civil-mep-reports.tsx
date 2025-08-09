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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AdminLayout from "@/components/layout/admin-layout";
import { Plus, FileText, Search, Filter, Eye, Edit, Trash2, Download, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle, Users, UserCheck, X } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { CivilMepReport } from "@shared/schema";

export function AdminCivilMepReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<CivilMepReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [reportCustomers, setReportCustomers] = useState<Record<string, any[]>>({});
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

  // Fetch customers for assignment
  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch customer assignments for each report
  useEffect(() => {
    if (reports.length > 0) {
      Promise.all(
        reports.map(async (report) => {
          try {
            const response = await fetch(`/api/civil-mep-reports/${report.id}/assignments`);
            if (response.ok) {
              const assignments = await response.json();
              return { reportId: report.id, assignments };
            }
            return { reportId: report.id, assignments: [] };
          } catch (error) {
            console.error(`Error fetching customers for report ${report.id}:`, error);
            return { reportId: report.id, assignments: [] };
          }
        })
      ).then((results) => {
        const customersByReport: Record<string, any[]> = {};
        results.forEach(({ reportId, assignments }) => {
          customersByReport[reportId] = assignments;
        });
        setReportCustomers(customersByReport);
      });
    }
  }, [reports]);

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
    <AdminLayout>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight truncate">Civil+MEP Reports</h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive engineering assessments for properties
            </p>
          </div>
          <Button asChild data-testid="button-create-report" className="whitespace-nowrap shrink-0">
            <Link href="/admin-panel/civil-mep-reports/create">
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
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Report Details</TableHead>
                      <TableHead className="min-w-[120px]">Engineer</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[80px]">Score</TableHead>
                      <TableHead className="min-w-[120px]">Recommendation</TableHead>
                      <TableHead className="min-w-[100px]">Assigned Customers</TableHead>
                      <TableHead className="min-w-[100px]">Dates</TableHead>
                      <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report: CivilMepReport) => (
                      <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                        <TableCell className="max-w-[200px]">
                          <div>
                            <div className="font-medium truncate" data-testid={`text-title-${report.id}`}>
                              {report.reportTitle}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              Property ID: {report.propertyId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <div>
                            <div className="font-medium truncate">{report.engineerName}</div>
                            <div className="text-sm text-muted-foreground truncate">
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
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {reportCustomers[report.id]?.length || 0}
                            </span>
                            {reportCustomers[report.id]?.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                assigned
                              </div>
                            )}
                          </div>
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
                                setSelectedReportId(report.id);
                                setShowAssignDialog(true);
                              }}
                              title="Assign Customers"
                              data-testid={`button-assign-${report.id}`}
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              data-testid={`button-view-${report.id}`}
                            >
                              <Link href={`/civil-mep-report/${report.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
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

        {/* Customer Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Customers to Civil+MEP Report</DialogTitle>
              <DialogDescription>
                Select customers to assign to this Civil+MEP report
              </DialogDescription>
            </DialogHeader>
            <CivilMepCustomerAssignmentDialog
              reportId={selectedReportId}
              customers={customers}
              onAssignmentChange={() => {
                // Refresh the customer assignments
                if (reports.length > 0) {
                  Promise.all(
                    reports.map(async (report) => {
                      try {
                        const response = await fetch(`/api/civil-mep-reports/${report.id}/assignments`);
                        if (response.ok) {
                          const assignments = await response.json();
                          return { reportId: report.id, assignments };
                        }
                        return { reportId: report.id, assignments: [] };
                      } catch (error) {
                        console.error(`Error fetching customers for report ${report.id}:`, error);
                        return { reportId: report.id, assignments: [] };
                      }
                    })
                  ).then((results) => {
                    const customersByReport: Record<string, any[]> = {};
                    results.forEach(({ reportId, assignments }) => {
                      customersByReport[reportId] = assignments;
                    });
                    setReportCustomers(customersByReport);
                  });
                }
              }}
              onClose={() => setShowAssignDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// Customer Assignment Dialog Component for Civil+MEP Reports
function CivilMepCustomerAssignmentDialog({ 
  reportId, 
  customers, 
  onAssignmentChange, 
  onClose 
}: {
  reportId: string;
  customers: any[];
  onAssignmentChange: () => void;
  onClose: () => void;
}) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [assignedCustomers, setAssignedCustomers] = useState<any[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [accessLevel, setAccessLevel] = useState("view");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Fetch current assignments when dialog opens
  useEffect(() => {
    if (reportId) {
      setIsLoadingAssignments(true);
      fetch(`/api/civil-mep-reports/${reportId}/assignments`)
        .then(response => response.json())
        .then(assignments => {
          setAssignedCustomers(assignments);
          setIsLoadingAssignments(false);
        })
        .catch(error => {
          console.error('Error fetching assignments:', error);
          setIsLoadingAssignments(false);
        });
    }
  }, [reportId]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  // Get customers that are not yet assigned
  const availableCustomers = filteredCustomers.filter(customer => 
    !assignedCustomers.some(assignment => assignment.customerId === customer.id)
  );

  // Handle customer selection
  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle assignment submission
  const handleAssign = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No customers selected",
        description: "Please select at least one customer to assign.",
        variant: "destructive",
      });
      return;
    }

    try {
      const assignmentPromises = selectedCustomers.map(customerId =>
        fetch(`/api/civil-mep-reports/${reportId}/assign-customer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            assignedBy: 'admin@ownit.com',
            accessLevel,
            notes
          }),
        })
      );

      const responses = await Promise.all(assignmentPromises);
      const successCount = responses.filter(r => r.ok).length;
      const failedCount = responses.length - successCount;

      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Successfully assigned ${successCount} customer(s) to the report.${failedCount > 0 ? ` ${failedCount} assignment(s) failed.` : ''}`,
        });
        setSelectedCustomers([]);
        setNotes("");
        onAssignmentChange();
        onClose();
      } else {
        throw new Error('All assignments failed');
      }
    } catch (error) {
      console.error('Error assigning customers:', error);
      toast({
        title: "Error",
        description: "Failed to assign customers to the report.",
        variant: "destructive",
      });
    }
  };

  // Handle assignment removal
  const handleRemoveAssignment = async (customerId: string) => {
    try {
      const response = await fetch(`/api/civil-mep-reports/${reportId}/remove-customer/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer assignment removed successfully.",
        });
        setAssignedCustomers(prev => 
          prev.filter(assignment => assignment.customerId !== customerId)
        );
        onAssignmentChange();
      } else {
        throw new Error('Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove customer assignment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Currently Assigned Customers */}
      {isLoadingAssignments ? (
        <div className="text-center py-4">Loading current assignments...</div>
      ) : assignedCustomers.length > 0 ? (
        <div>
          <h4 className="font-semibold mb-3">Currently Assigned Customers ({assignedCustomers.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {assignedCustomers.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{assignment.customer?.name}</div>
                  <div className="text-sm text-muted-foreground">{assignment.customer?.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {assignment.accessLevel}
                    </Badge>
                    {assignment.notes && (
                      <span className="text-xs text-muted-foreground">
                        {assignment.notes.length > 30 ? `${assignment.notes.substring(0, 30)}...` : assignment.notes}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAssignment(assignment.customerId)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No customers currently assigned to this report
        </div>
      )}

      {/* Assignment Form */}
      <div className="border-t pt-6">
        <h4 className="font-semibold mb-3">Assign New Customers</h4>
        
        {/* Search customers */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer-search">Search Customers</Label>
            <Input
              id="customer-search"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Access Level & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="access-level">Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">View & Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignment-notes">Notes (Optional)</Label>
              <Input
                id="assignment-notes"
                placeholder="Assignment notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <Label>Available Customers ({availableCustomers.length})</Label>
            <div className="border rounded-lg max-h-60 overflow-y-auto mt-2">
              {availableCustomers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? "No customers match your search" : "All customers are already assigned"}
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {availableCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleCustomerToggle(customer.id)}
                    >
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleCustomerToggle(customer.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                        {customer.phone && (
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={selectedCustomers.length === 0}
            >
              Assign {selectedCustomers.length > 0 && `(${selectedCustomers.length})`} Customer{selectedCustomers.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}