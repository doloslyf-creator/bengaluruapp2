import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Plus, Search, Filter, IndianRupee, 
  Calendar, Clock, CheckCircle, AlertCircle, 
  Building, MapPin, BarChart3, Settings, Eye, Briefcase
} from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
// Note: Using simple navigation structure instead of complex layout components

const CivilMepReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showViewReportDialog, setShowViewReportDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch properties (fallback to regular properties endpoint for now)
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      const allProperties = await response.json();
      
      // Add CIVIL+MEP report information to each property
      return allProperties.map((property: any) => ({
        ...property,
        hasCivilMepReport: property.hasCivilMepReport || false,
        civilMepReport: null,
        reportStats: {
          totalPayments: 0,
          totalRevenue: 0,
          pendingPayments: 0
        }
      }));
    }
  });

  // Fetch report statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/civil-mep-reports/stats"],
    queryFn: async () => {
      const response = await fetch("/api/civil-mep-reports/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  // Enable CIVIL+MEP report for property
  const enableReportMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/properties/${propertyId}/enable-civil-mep-report`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to enable report");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/with-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports/stats"] });
      toast({
        title: "Success",
        description: "CIVIL+MEP report enabled for property"
      });
      setShowEnableDialog(false);
      setSelectedProperty(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enable CIVIL+MEP report",
        variant: "destructive"
      });
    }
  });

  // Filter properties based on search term
  const filteredProperties = properties.filter((property: any) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.developer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'draft': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getReportStatusBadge = (property: any) => {
    if (!property.hasCivilMepReport) {
      return <Badge variant="outline" className="text-gray-600">Not Available</Badge>;
    }
    
    if (property.civilMepReport) {
      return <Badge className={getStatusColor(property.civilMepReport.civilMepReportStatus)}>
        {property.civilMepReport.civilMepReportStatus || 'Active'}
      </Badge>;
    }
    
    return <Badge className="bg-violet-100 text-violet-800">Enabled</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">PropertyPro Admin</h1>
          <nav className="flex space-x-4">
            <a href="/admin-panel" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/admin-panel/leads" className="text-gray-600 hover:text-gray-900">Leads</a>
            <a href="/admin-panel/blog" className="text-gray-600 hover:text-gray-900">Blog</a>
            <a href="/admin-panel/civil-mep-reports" className="text-violet-600 font-medium">CIVIL+MEP Reports</a>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="h-8 w-8 mr-3 text-violet-600" />
                CIVIL+MEP Reports
              </h1>
              <p className="text-gray-600 mt-2">
                Manage comprehensive property engineering analysis reports
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = '/admin-panel/create-civil-mep-report'}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create New Report
              </Button>
              <Button
                onClick={() => setShowEnableDialog(true)}
                variant="outline"
                className="border-violet-600 text-violet-600 hover:bg-violet-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enable for Property
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <FileText className="h-6 w-6 text-violet-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedReports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Properties</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, area, or developer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <Label>Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="enabled">Report Enabled</SelectItem>
                    <SelectItem value="active">Active Reports</SelectItem>
                    <SelectItem value="completed">Completed Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Properties ({filteredProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading properties...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="space-y-4">
                {filteredProperties.map((property: any) => (
                  <div key={property.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Bengaluru
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              by {property.developer} • {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            {getReportStatusBadge(property)}
                          </div>
                        </div>

                        {/* Report Stats */}
                        {property.reportStats && (
                          <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Payments</p>
                              <p className="font-semibold">{property.reportStats.totalPayments}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Revenue</p>
                              <p className="font-semibold">{formatPrice(property.reportStats.totalRevenue)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pending</p>
                              <p className="font-semibold text-yellow-600">{property.reportStats.pendingPayments}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex gap-2">
                        {property.hasCivilMepReport ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowViewReportDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowManageDialog(true);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowEnableDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Enable Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No properties match your search criteria." : "No properties available for CIVIL+MEP reports."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enable Report Dialog */}
        <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enable CIVIL+MEP Report</DialogTitle>
              <DialogDescription>
                {selectedProperty 
                  ? `Enable comprehensive engineering analysis report for ${selectedProperty.name}`
                  : "Select a property to enable CIVIL+MEP reporting"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!selectedProperty && (
                <div>
                  <Label>Select Property</Label>
                  <Select onValueChange={(value) => {
                    const property = properties.find((p: any) => p.id === value);
                    setSelectedProperty(property);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.filter((p: any) => !p.hasCivilMepReport).map((property: any) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} - {property.area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProperty && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedProperty.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedProperty.area}, {selectedProperty.zone} • by {selectedProperty.developer}
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>• Enable comprehensive CIVIL+MEP analysis</p>
                    <p>• Set report price: ₹2,999 (standard)</p>
                    <p>• Include payment and access management</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEnableDialog(false);
                    setSelectedProperty(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedProperty && enableReportMutation.mutate(selectedProperty.id)}
                  disabled={!selectedProperty || enableReportMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {enableReportMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enable Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Report Dialog */}
        <Dialog open={showViewReportDialog} onOpenChange={setShowViewReportDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-violet-600" />
                CIVIL+MEP Report - {selectedProperty?.name}
              </DialogTitle>
              <DialogDescription>
                Comprehensive engineering analysis report for {selectedProperty?.area}, {selectedProperty?.zone}
              </DialogDescription>
            </DialogHeader>

            {selectedProperty && (
              <div className="space-y-6">
                {/* Property Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Property Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Property Name:</span>
                        <p className="font-medium">{selectedProperty.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Developer:</span>
                        <p className="font-medium">{selectedProperty.developer}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <p className="font-medium">{selectedProperty.area}, {selectedProperty.zone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Property Type:</span>
                        <p className="font-medium capitalize">{selectedProperty.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Engineering Assessment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">8.5/10</div>
                        <div className="text-sm text-green-800">Structural Score</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">9.0/10</div>
                        <div className="text-sm text-blue-800">MEP Systems</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">8.7/10</div>
                        <div className="text-sm text-yellow-800">Overall Rating</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Foundation Quality</span>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Electrical Systems</span>
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Plumbing Infrastructure</span>
                        <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Fire Safety Compliance</span>
                        <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Findings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Key Findings & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-green-800">Strengths</h4>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          <li>• High-quality construction materials used throughout</li>
                          <li>• Excellent foundation design and execution</li>
                          <li>• Modern electrical infrastructure with proper earthing</li>
                          <li>• Adequate ventilation and natural lighting</li>
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-medium text-yellow-800">Areas for Improvement</h4>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          <li>• Minor waterproofing improvements needed in basement</li>
                          <li>• Upgrade to LED lighting for energy efficiency</li>
                          <li>• Install additional fire extinguishers on common floors</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-blue-800">Compliance Status</h4>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          <li>• Building meets all local municipal requirements</li>
                          <li>• Fire safety systems are up to code</li>
                          <li>• Environmental clearances are valid</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Actions */}
                <div className="flex gap-3 pt-4">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button variant="outline">
                    <Building className="h-4 w-4 mr-2" />
                    Send to Property Team
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Customer Orders
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manage Report Dialog */}
        <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-violet-600" />
                Manage Report - {selectedProperty?.name}
              </DialogTitle>
              <DialogDescription>
                Configure pricing, availability, and access settings for this property's CIVIL+MEP report
              </DialogDescription>
            </DialogHeader>

            {selectedProperty && (
              <div className="space-y-6">
                {/* Report Status & Pricing */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Report Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="report-price">Report Price (₹)</Label>
                        <Input 
                          id="report-price" 
                          type="number" 
                          defaultValue={selectedProperty.civilMepReportPrice || 2999}
                          placeholder="2999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="report-status">Report Status</Label>
                        <Select defaultValue="active">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="report-description">Report Description</Label>
                      <Textarea 
                        id="report-description"
                        placeholder="Comprehensive CIVIL+MEP engineering analysis..."
                        defaultValue="Comprehensive structural and MEP systems analysis including foundation assessment, electrical infrastructure review, plumbing systems evaluation, and compliance verification."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Analytics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Customer Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">12</div>
                        <div className="text-xs text-blue-800">Total Orders</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">₹35,988</div>
                        <div className="text-xs text-green-800">Revenue Generated</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">3</div>
                        <div className="text-xs text-yellow-800">Pending Payments</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: 1, customer: "Rajesh Kumar", email: "rajesh@email.com", amount: 2999, status: "Completed", date: "2025-01-28" },
                        { id: 2, customer: "Priya Sharma", email: "priya@email.com", amount: 2999, status: "Pending", date: "2025-01-27" },
                        { id: 3, customer: "Amit Patel", email: "amit@email.com", amount: 2999, status: "Completed", date: "2025-01-26" }
                      ].map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-gray-600">{order.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                            <Badge className={order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Order Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowManageDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CivilMepReports;