import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit, Eye, Search, Users, FileText, Calculator, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { useLocation } from "wouter";

interface Property {
  id: string;
  name: string;
  type: string;
  developer: string;
  zone: string;
  status: string;
}

interface ValuationReport {
  id: string;
  propertyId: string;
  propertyName?: string;
  reportVersion: string;
  generatedBy?: string;
  reportDate: string;
  marketAnalysis?: any;
  propertyAssessment?: any;
  costBreakdown?: any;
  financialAnalysis?: any;
  investmentRecommendation?: string;
  riskAssessment?: any;
  executiveSummary?: string;
  overallScore?: string;
  keyHighlights?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ValuationReportStats {
  totalReports: number;
  totalRevenue: number;
  pendingPayments: number;
}

// Create Report Form Component
function CreateReportForm({ properties, onCancel, onSuccess }: { 
  properties: Property[], 
  onCancel: () => void, 
  onSuccess: () => void 
}) {
  const [, setLocation] = useLocation();
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  const handleCreateReport = () => {
    if (!selectedPropertyId) {
      return;
    }
    
    // Navigate to create page with property ID
    setLocation(`/admin-panel/valuation-reports/create?propertyId=${selectedPropertyId}`);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Select Property</label>
        <select 
          className="w-full mt-1 p-2 border rounded"
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
        >
          <option value="">Choose a property...</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} - {property.developer} ({property.zone})
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCreateReport} disabled={!selectedPropertyId}>
          Create Report
        </Button>
      </div>
    </div>
  );
}

export default function ValuationReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ValuationReport | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: reports = [], isLoading } = useQuery<ValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: stats } = useQuery<ValuationReportStats>({
    queryKey: ["/api/valuation-reports/stats"],
  });

  const filteredReports = reports.filter(report =>
    report.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.generatedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecommendationBadge = (recommendation?: string) => {
    switch (recommendation) {
      case "excellent-buy":
        return <Badge className="bg-green-100 text-green-800">Excellent Buy</Badge>;
      case "good-buy":
        return <Badge className="bg-blue-100 text-blue-800">Good Buy</Badge>;
      case "hold":
        return <Badge className="bg-yellow-100 text-yellow-800">Hold</Badge>;
      case "avoid":
        return <Badge className="bg-red-100 text-red-800">Avoid</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Assessed</Badge>;
    }
  };

  return (
    <AdminLayout title="Property Valuation Reports">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Property Valuation Reports</h2>
              <p className="text-sm text-gray-600">Create and manage detailed property valuation reports</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports by property name or valuer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Valuation Reports</CardTitle>
              <CardDescription>
                All property valuation reports ({filteredReports.length} reports)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Calculator className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? "No reports match your search" : "No valuation reports have been created yet"}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Report
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Valuer</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.propertyName}</div>
                            <div className="text-sm text-gray-500">ID: {report.propertyId.slice(-8)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{report.generatedBy || "Not assigned"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">v{report.reportVersion}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="font-mono text-sm">
                              {report.overallScore ? `${report.overallScore}/10` : "N/A"}
                            </div>
                            {report.overallScore && (
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(parseFloat(report.overallScore) / 10) * 100}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getRecommendationBadge(report.investmentRecommendation)}</TableCell>
                        <TableCell>{getRiskBadge(report.riskAssessment?.overallRisk)}</TableCell>
                        <TableCell>{format(new Date(report.createdAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Valuation Report Details</DialogTitle>
                                  <DialogDescription>
                                    Property: {report.propertyName} | Version: {report.reportVersion}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedReport && (
                                  <div className="space-y-6">
                                    {/* Report Overview */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Report Information</h4>
                                        <div className="space-y-1 text-sm">
                                          <div>Generated by: {selectedReport.generatedBy || "Not assigned"}</div>
                                          <div>Report Date: {format(new Date(selectedReport.reportDate), "PPP")}</div>
                                          <div>Overall Score: {selectedReport.overallScore || "Not scored"}/10</div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Assessment</h4>
                                        <div className="space-y-1">
                                          {getRecommendationBadge(selectedReport.investmentRecommendation)}
                                          {getRiskBadge(selectedReport.riskAssessment?.overallRisk)}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Executive Summary */}
                                    {selectedReport.executiveSummary && (
                                      <div>
                                        <h4 className="font-medium mb-2">Executive Summary</h4>
                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                          {selectedReport.executiveSummary}
                                        </div>
                                      </div>
                                    )}

                                    {/* Key Highlights */}
                                    {selectedReport.keyHighlights && selectedReport.keyHighlights.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Key Highlights</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                          {selectedReport.keyHighlights.map((highlight, index) => (
                                            <li key={index}>{highlight}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Cost Breakdown */}
                                    {selectedReport.costBreakdown && (
                                      <div>
                                        <h4 className="font-medium mb-2">Cost Breakdown</h4>
                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>Total Estimated Cost: ₹{selectedReport.costBreakdown.totalEstimatedCost?.toLocaleString()}</div>
                                            <div>Land Value: ₹{selectedReport.costBreakdown.landValue?.toLocaleString()}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Financial Analysis */}
                                    {selectedReport.financialAnalysis && (
                                      <div>
                                        <h4 className="font-medium mb-2">Financial Analysis</h4>
                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>Current Valuation: ₹{selectedReport.financialAnalysis.currentValuation?.toLocaleString()}</div>
                                            <div>Rental Yield: {selectedReport.financialAnalysis.rentalYield}% per annum</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setLocation(`/admin-panel/valuation-reports/edit/${report.id}`)}
                              title="Edit Report"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Users className="h-4 w-4" />
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
        </main>

        {/* Create Report Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Valuation Report</DialogTitle>
              <DialogDescription>
                Select a property to create a comprehensive valuation report
              </DialogDescription>
            </DialogHeader>
            <CreateReportForm 
              properties={properties} 
              onCancel={() => setShowCreateDialog(false)}
              onSuccess={() => {
                setShowCreateDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}