import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            <Button
              onClick={() => setShowEnableDialog(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Enable for Property
            </Button>
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
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                            <Button variant="outline" size="sm">
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
      </div>
    </div>
  );
};

export default CivilMepReports;