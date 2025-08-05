import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Eye, Calendar, CheckCircle, Clock, AlertCircle, Building2, Wrench, Zap, MapPin, IndianRupee, ShoppingCart, User } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { CivilMepReport, Property } from "@shared/schema";

export default function CivilMepReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [developerFilter, setDeveloperFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for which users can buy civil+MEP reports
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch existing Civil+MEP reports to show which properties already have reports
  const { data: existingReports = [] } = useQuery({
    queryKey: ["/api/civil-mep-reports"],
  });

  // Create a mutation for ordering civil+MEP reports
  const orderReportMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch("/api/orders/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "civil-mep-assessment",
          reportType: "civil-mep-report",
          propertyId,
          customerName: "Guest User", // In a real app, this would come from auth
          customerEmail: "guest@example.com",
          customerPhone: "+91-0000000000",
          amount: 2499
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports"] });
      toast({
        title: "Order created successfully!",
        description: `Your Civil+MEP assessment order (ID: ${data.orderId}) has been created. You'll receive the report within 48 hours.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get unique areas and developers for filters
  const areas = Array.from(new Set((properties as Property[]).map(p => p.area).filter(Boolean)));
  const developers = Array.from(new Set((properties as Property[]).map(p => p.developer).filter(Boolean)));

  // Check if a property already has a completed/approved report
  const hasExistingReport = (propertyId: string) => {
    return (existingReports as CivilMepReport[]).some(
      report => report.propertyId === propertyId && 
      (report.status === "completed" || report.status === "approved")
    );
  };

  // Trigger search functionality
  const handleSearch = () => {
    setHasSearched(true);
  };

  // Auto-search when filters change (but only if user has searched before)
  const triggerAutoSearch = () => {
    if (hasSearched) {
      // Auto-search triggered by filter changes
    } else if (searchTerm || areaFilter !== "all" || developerFilter !== "all") {
      setHasSearched(true);
    }
  };

  // Filter properties based on search, area, and developer
  const filteredProperties = hasSearched ? (properties as Property[]).filter((property: Property) => {
    const matchesSearch = !searchTerm || 
                         property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.developer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === "all" || property.area === areaFilter;
    const matchesDeveloper = developerFilter === "all" || property.developer === developerFilter;
    return matchesSearch && matchesArea && matchesDeveloper;
  }) : [];

  // Handle property selection for payment
  const handleBuyReport = (property: Property) => {
    setSelectedProperty(property);
    setShowPaymentDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, icon: CheckCircle, color: "bg-blue-100 text-blue-800 border-blue-200" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;
    
    return (
      <Badge className={config?.color || "bg-gray-100 text-gray-800"}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const getRecommendationBadge = (recommendation: string) => {
    const recConfig = {
      "highly-recommended": { bg: "bg-green-100 text-green-800 border-green-200" },
      "recommended": { bg: "bg-blue-100 text-blue-800 border-blue-200" },
      "conditional": { bg: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      "not-recommended": { bg: "bg-red-100 text-red-800 border-red-200" }
    };
    const config = recConfig[recommendation as keyof typeof recConfig];
    
    return (
      <Badge className={config?.bg || "bg-gray-100 text-gray-800"}>
        {recommendation?.replace('-', ' ').toUpperCase() || 'PENDING'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <Wrench className="w-6 h-6 text-green-600" />
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Civil + MEP Engineering Reports
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive structural, mechanical, electrical, and plumbing assessments for informed property investment decisions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Properties for Civil+MEP Assessment
            </CardTitle>
            <CardDescription>
              Search properties by name, area, or developer to order your engineering assessment report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by property name, area, or developer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  data-testid="input-search-properties"
                />
              </div>
              <div>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger data-testid="select-area-filter">
                    <SelectValue placeholder="Filter by area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={developerFilter} onValueChange={setDeveloperFilter}>
                  <SelectTrigger data-testid="select-developer-filter">
                    <SelectValue placeholder="Filter by developer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Developers</SelectItem>
                    {developers.map(developer => (
                      <SelectItem key={developer} value={developer}>{developer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || areaFilter !== "all" || developerFilter !== "all"
                  ? "No properties match your current search criteria."
                  : "No properties are currently available for assessment."
                }
              </p>
              {(searchTerm || areaFilter !== "all" || developerFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setAreaFilter("all");
                    setDeveloperFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: Property) => {
              const hasReport = hasExistingReport(property.id);
              return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {property.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4" />
                          {property.area}
                        </CardDescription>
                      </div>
                      {hasReport && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Report Available
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Developer:</span>
                        <span className="text-gray-900 dark:text-white">{property.developer || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="text-gray-900 dark:text-white">{property.type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-gray-900 dark:text-white">{property.status || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      {hasReport ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              <CheckCircle className="w-5 h-5 inline mr-1" />
                              Report Ready
                            </span>
                          </div>
                          <Link to={`/civil-mep-report/${(existingReports as CivilMepReport[]).find(r => r.propertyId === property.id)?.id}`}>
                            <Button className="w-full" data-testid={`button-view-report-${property.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Report
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">
                              <IndianRupee className="w-5 h-5 inline mr-1" />
                              ₹2,499
                            </span>
                            <Badge variant="outline">48hr delivery</Badge>
                          </div>
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => orderReportMutation.mutate(property.id)}
                            disabled={orderReportMutation.isPending}
                            data-testid={`button-buy-report-${property.id}`}
                          >
                            {orderReportMutation.isPending ? (
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 mr-2" />
                            )}
                            {orderReportMutation.isPending ? "Processing..." : "Order Assessment"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Civil Engineering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Comprehensive structural assessments including foundation, superstructure, walls, roofing, and overall building integrity evaluation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-green-600" />
                Mechanical Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Detailed analysis of HVAC systems, ventilation, fire safety systems, and building management automation for optimal performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Electrical & Plumbing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Complete evaluation of electrical installations, power distribution, plumbing systems, and water management infrastructure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}