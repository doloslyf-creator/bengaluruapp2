import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye, UserPlus, Users, UserMinus, TrendingUp, BarChart3, FileText, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PropertyValuationReport, Property } from "@shared/schema";

export default function ValuationReportsPage() {
  const [selectedReport, setSelectedReport] = useState<PropertyValuationReport | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [reportCustomers, setReportCustomers] = useState<Record<string, any[]>>({});
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch valuation reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch customers for assignment
  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch assignments for selected report
  const { data: assignments = [] } = useQuery<any[]>({
    queryKey: ["/api/property-valuation-reports", selectedReportId, "assignments"],
    enabled: !!selectedReportId,
  });

  // Fetch customer assignments for each report
  useEffect(() => {
    if (reports.length > 0) {
      Promise.all(
        reports.map(async (report) => {
          try {
            const response = await fetch(`/api/property-valuation-reports/${report.id}/assignments`);
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

  // Fetch stats
  const { data: stats } = useQuery<{
    totalReports: number;
    completedReports: number;
    inProgressReports: number;
    averageEstimatedValue: number;
    completionRate: number;
  }>({
    queryKey: ["/api/valuation-reports/stats"],
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/valuation-reports/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports/stats"] });
      toast({
        title: "Success",
        description: "Valuation report deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete valuation report",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/valuation-reports/${id}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports/stats"] });
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update report status",
        variant: "destructive",
      });
    },
  });

  // Assign customer mutation
  const assignCustomerMutation = useMutation({
    mutationFn: async ({ reportId, customerId }: { reportId: string; customerId: string }) => {
      const response = await fetch(`/api/property-valuation-reports/${reportId}/assign-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          assignedBy: "admin",
          accessLevel: "view",
          notes: "Assigned via admin panel"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to assign customer");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-valuation-reports", selectedReportId, "assignments"] });
      toast({ title: "Customer assigned successfully" });
      setSelectedCustomerId("");
      setAssignmentDialogOpen(false);
      
      // Refresh the reportCustomers state
      if (selectedReportId) {
        fetch(`/api/property-valuation-reports/${selectedReportId}/assignments`)
          .then(res => res.json())
          .then(assignments => {
            setReportCustomers(prev => ({
              ...prev,
              [selectedReportId]: assignments
            }));
          })
          .catch(console.error);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning customer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove customer assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async ({ reportId, customerId }: { reportId: string; customerId: string }) => {
      const response = await fetch(`/api/property-valuation-reports/${reportId}/remove-customer/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to remove assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-valuation-reports", selectedReportId, "assignments"] });
      toast({ title: "Customer assignment removed successfully" });
      
      // Refresh the reportCustomers state
      if (selectedReportId) {
        fetch(`/api/property-valuation-reports/${selectedReportId}/assignments`)
          .then(res => res.json())
          .then(assignments => {
            setReportCustomers(prev => ({
              ...prev,
              [selectedReportId]: assignments
            }));
          })
          .catch(console.error);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error removing assignment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignCustomer = () => {
    if (!selectedReportId || !selectedCustomerId) {
      toast({
        title: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    assignCustomerMutation.mutate({
      reportId: selectedReportId,
      customerId: selectedCustomerId,
    });
  };

  const handleRemoveAssignment = (reportId: string, customerId: string) => {
    setSelectedReportId(reportId);
    removeAssignmentMutation.mutate({ reportId, customerId });
  };

  const handleViewReport = (report: PropertyValuationReport) => {
    setSelectedReport(report);
    setShowViewDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      delivered: { label: "Delivered", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p: Property) => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 data-testid="page-title" className="text-2xl font-bold tracking-tight truncate">Property Valuation Reports</h1>
            <p className="text-sm text-muted-foreground">
              Manage comprehensive property valuation reports for Bengaluru properties
            </p>
          </div>
          <Button 
            onClick={() => navigate("/admin-panel/valuation-reports/create")}
            data-testid="button-create-report"
            className="whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReports}</div>
                <p className="text-xs text-muted-foreground">
                  Comprehensive reports
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate">Completed</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedReports}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completionRate}% completion
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressReports}</div>
                <p className="text-xs text-muted-foreground">
                  Currently processing
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate">Avg. Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(stats.averageEstimatedValue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">
                  Average estimated value
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Valuation Reports</CardTitle>
            <CardDescription>
              Manage all property valuation reports and their statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading reports...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first property valuation report to get started.
                  </p>
                  <Button onClick={() => navigate('/admin-panel/valuation-reports/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Report Title</TableHead>
                      <TableHead className="min-w-[150px]">Property</TableHead>
                      <TableHead className="min-w-[140px]">Assigned To</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Est. Value</TableHead>
                      <TableHead className="min-w-[100px]">Created</TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {report.reportTitle}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{getPropertyName(report.propertyId)}</TableCell>
                      <TableCell className="max-w-[140px]">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-muted-foreground truncate">
                            {reportCustomers[report.id]?.length > 0 
                              ? `${reportCustomers[report.id].length} customer${reportCustomers[report.id].length > 1 ? 's' : ''}`
                              : "No assignments"
                            }
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReportId(report.id);
                              setAssignmentDialogOpen(true);
                            }}
                            data-testid={`button-assign-${report.id}`}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={report.reportStatus || "draft"}
                          onValueChange={(status) => 
                            updateStatusMutation.mutate({ id: report.id, status })
                          }
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {report.estimatedMarketValue ? 
                          `₹${(Number(report.estimatedMarketValue) / 100000).toFixed(1)}L` : 
                          "-"
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(report.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                            data-testid={`button-view-${report.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin-panel/valuation-reports/edit/${report.id}`)}
                            data-testid={`button-edit-${report.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this report?")) {
                                deleteReportMutation.mutate(report.id);
                              }
                            }}
                            data-testid={`button-delete-${report.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* View Report Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Property Valuation Report Details</DialogTitle>
              <DialogDescription>
                Comprehensive property valuation report information
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Report Title</Label>
                    <p className="text-sm text-muted-foreground">{selectedReport.reportTitle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Property</Label>
                    <p className="text-sm text-muted-foreground">{getPropertyName(selectedReport.propertyId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedReport.reportStatus || "draft")}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Created By</Label>
                    <p className="text-sm text-muted-foreground">{selectedReport.createdBy}</p>
                  </div>
                </div>

                {/* Property Profile */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Property Profile</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Unit Type</Label>
                      <p className="text-sm text-muted-foreground">{selectedReport.unitType || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Configuration</Label>
                      <p className="text-sm text-muted-foreground">{selectedReport.configuration || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Buyer Fit</Label>
                      <p className="text-sm text-muted-foreground">{selectedReport.buyerFit || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Analysis */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Financial Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Estimated Market Value</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.estimatedMarketValue ? 
                          `₹${Number(selectedReport.estimatedMarketValue).toLocaleString()}` : 
                          "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Rate per Sq.ft</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.ratePerSqft ? 
                          `₹${Number(selectedReport.ratePerSqft).toLocaleString()}` : 
                          "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Base Construction Cost</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.baseConstructionCost ? 
                          `₹${Number(selectedReport.baseConstructionCost).toLocaleString()}` : 
                          "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Finishing & Amenities Cost</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.finishingAmenitiesCost ? 
                          `₹${Number(selectedReport.finishingAmenitiesCost).toLocaleString()}` : 
                          "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Land Value</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.landValue ? 
                          `₹${Number(selectedReport.landValue).toLocaleString()}` : 
                          "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Overhead Costs</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.overheadCosts ? 
                          `₹${Number(selectedReport.overheadCosts).toLocaleString()}` : 
                          "Not specified"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location & Amenities */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Location & Amenities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Location Advantage</Label>
                      <p className="text-sm text-muted-foreground">{selectedReport.locationAdvantage || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Amenities</Label>
                      <p className="text-sm text-muted-foreground">{selectedReport.amenities || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Market Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Market Analysis</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedReport.marketAnalysis || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Risk Assessment</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedReport.riskAssessment || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Valuation Verdict</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedReport.valuationVerdict || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Recommendation</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedReport.recommendation || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Detailed Cost Breakdown</h3>
                  <div className="space-y-4">
                    {selectedReport.costBreakdown && (
                      <div>
                        <Label className="text-sm font-semibold">Cost Breakdown</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedReport.costBreakdown}
                        </p>
                      </div>
                    )}
                    {selectedReport.comparativeAnalysis && (
                      <div>
                        <Label className="text-sm font-semibold">Comparative Analysis</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedReport.comparativeAnalysis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Assignments */}
                {reportCustomers[selectedReport.id]?.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Customer Assignments</h3>
                    <div className="space-y-2">
                      {reportCustomers[selectedReport.id].map((assignment: any) => (
                        <div key={assignment.customerId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {assignment.customer?.name || assignment.customerId}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {assignment.accessLevel || 'view'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-sm font-semibold">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedReport.createdAt!).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedReport.updatedAt!).toLocaleString()}
                      </p>
                    </div>
                    {selectedReport.deliveredAt && (
                      <div>
                        <Label className="text-sm font-semibold">Delivered</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedReport.deliveredAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              {selectedReport && (
                <Button onClick={() => {
                  setShowViewDialog(false);
                  navigate(`/admin-panel/valuation-reports/edit/${selectedReport.id}`);
                }}>
                  Edit Report
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer Assignment Dialog */}
        <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Customer to Valuation Report</DialogTitle>
              <DialogDescription>
                Select a customer to assign to this property valuation report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer-select">Select Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Assignments */}
              {selectedReportId && reportCustomers[selectedReportId]?.length > 0 && (
                <div>
                  <Label>Current Assignments</Label>
                  <div className="mt-2 space-y-2">
                    {reportCustomers[selectedReportId].map((assignment: any) => (
                      <div key={assignment.customerId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {assignment.customer?.name || assignment.customerId}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {assignment.accessLevel || 'view'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(selectedReportId, assignment.customerId)}
                          disabled={removeAssignmentMutation.isPending}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignmentDialogOpen(false);
                    setSelectedCustomerId("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignCustomer}
                  disabled={!selectedCustomerId || assignCustomerMutation.isPending}
                >
                  {assignCustomerMutation.isPending ? "Assigning..." : "Assign Customer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}