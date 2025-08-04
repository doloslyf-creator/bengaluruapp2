import { useState } from "react";
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
import { Plus, Edit, Trash2, Eye, UserPlus, TrendingUp, BarChart3, FileText, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PropertyValuationReport, Property } from "@shared/schema";

export default function ValuationReportsPage() {
  const [selectedReport, setSelectedReport] = useState<PropertyValuationReport | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
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

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/valuation-reports", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports/stats"] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Valuation report created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create valuation report",
        variant: "destructive",
      });
    },
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

  const handleCreateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const reportData = {
      propertyId: formData.get("propertyId") as string,
      customerId: "placeholder-customer", // In real app, get from auth/selection
      reportTitle: formData.get("reportTitle") as string,
      createdBy: "admin", // In a real app, this would come from auth
      reportStatus: "draft" as const,
      // Basic property profile data
      unitType: formData.get("unitType") as string,
      configuration: formData.get("configuration") as string,
      // Market valuation - convert to string as per schema
      estimatedMarketValue: formData.get("estimatedMarketValue") as string,
      ratePerSqft: formData.get("ratePerSqft") as string,
      // Basic fields for initial creation
      buyerFit: formData.get("buyerFit") as string,
      valuationVerdict: formData.get("valuationVerdict") as string,
      recommendation: formData.get("recommendation") as string,
    };

    createReportMutation.mutate(reportData);
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 data-testid="page-title" className="text-3xl font-bold tracking-tight">Property Valuation Reports</h1>
            <p className="text-muted-foreground">
              Manage comprehensive property valuation reports for Bengaluru properties
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-report">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Valuation Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive property valuation report based on Bengaluru market analysis
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyId">Property</Label>
                    <Select name="propertyId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - {property.area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reportTitle">Report Title</Label>
                    <Input
                      name="reportTitle"
                      placeholder="Property Valuation Report - [Property Name]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitType">Unit Type</Label>
                    <Select name="unitType">
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="rowhouse">Rowhouse</SelectItem>
                        <SelectItem value="plot">Plot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="configuration">Configuration</Label>
                    <Input
                      name="configuration"
                      placeholder="e.g., 3BHK, 1550 sq.ft"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedMarketValue">Estimated Market Value (₹)</Label>
                    <Input
                      name="estimatedMarketValue"
                      type="number"
                      step="0.01"
                      placeholder="7500000.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ratePerSqft">Rate per Sq.ft (₹)</Label>
                    <Input
                      name="ratePerSqft"
                      type="number"
                      step="0.01"
                      placeholder="4800.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="buyerFit">Buyer Fit</Label>
                  <Select name="buyerFit">
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="end_use">End Use</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valuationVerdict">Valuation Verdict</Label>
                  <Textarea
                    name="valuationVerdict"
                    placeholder="Brief verdict on property valuation..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="recommendation">Recommendation</Label>
                  <Textarea
                    name="recommendation"
                    placeholder="Investment recommendation and key insights..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReportMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createReportMutation.isPending ? "Creating..." : "Create Report"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                <p className="text-xs text-muted-foreground">
                  Comprehensive valuation reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedReports}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completionRate}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressReports}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Report
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Title</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.reportTitle}
                      </TableCell>
                      <TableCell>{getPropertyName(report.propertyId)}</TableCell>
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
                            onClick={() => {
                              setSelectedReport(report);
                              setShowViewDialog(true);
                            }}
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
            )}
          </CardContent>
        </Card>



        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Valuation Report Details</DialogTitle>
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

                {/* Financial Details */}
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

                {/* Analysis */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Analysis & Recommendations</h3>
                  <div className="space-y-4">
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
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}