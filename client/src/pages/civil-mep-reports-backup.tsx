import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Eye, Calendar, CheckCircle, Clock, AlertCircle, Building2, Wrench, Zap, MapPin, IndianRupee, ShoppingCart, User, X, Shield, Star, Quote, ArrowRight, ClipboardCheck, Users, Phone } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/use-payment";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderFormDialog from "@/components/order-form-dialog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { CivilMepReport, Property } from "@shared/schema";

export default function CivilMepReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [developerFilter, setDeveloperFilter] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { toast } = useToast();
  const { processPayment, isProcessing } = usePayment();
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
    setShowOrderForm(true);
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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Civil+MEP Engineering Assessment
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
                Professional structural and MEP system analysis for informed property investment decisions. 
                Get comprehensive engineering reports from licensed professionals for just ₹2,499.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span>Licensed Engineers</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>48-Hour Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <FileText className="w-4 h-4" />
                  <span>Detailed Reports</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <IndianRupee className="w-4 h-4" />
                  <span>₹2,499 Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Search Property</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Find your property in our database</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Order Report</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Fill details and make payment</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Site Inspection</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Licensed engineers visit and inspect</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Get Report</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Detailed analysis within 48 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Search by property name, area, or developer..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          triggerAutoSearch();
                        }}
                        className="w-full"
                        data-testid="input-search-properties"
                      />
                    </div>
                    <div>
                      <Select value={areaFilter} onValueChange={(value) => {
                        setAreaFilter(value);
                        triggerAutoSearch();
                      }}>
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
                      <Select value={developerFilter} onValueChange={(value) => {
                        setDeveloperFilter(value);
                        triggerAutoSearch();
                      }}>
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
                    <div>
                      <Button 
                        onClick={handleSearch} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid="button-search-properties"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search Properties
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by property name, area, or developer..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    triggerAutoSearch();
                  }}
                  className="w-full"
                  data-testid="input-search-properties"
                />
              </div>
              <div>
                <Select value={areaFilter} onValueChange={(value) => {
                  setAreaFilter(value);
                  triggerAutoSearch();
                }}>
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
                <Select value={developerFilter} onValueChange={(value) => {
                  setDeveloperFilter(value);
                  triggerAutoSearch();
                }}>
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
              <div>
                <Button 
                  onClick={handleSearch} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-search-properties"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {!hasSearched ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="w-20 h-20 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Properties for Civil+MEP Assessment
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Use the search filters above to find properties and order your comprehensive engineering assessment report. 
                Get detailed structural, mechanical, electrical, and plumbing analysis for just ₹2,499.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Licensed Engineers</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>48-Hour Delivery</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Detailed Analysis</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredProperties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                No properties match your current search criteria. Try adjusting your filters.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setAreaFilter("all");
                  setDeveloperFilter("all");
                  setHasSearched(false);
                }}
                data-testid="button-clear-filters"
              >
                Clear All Filters
              </Button>
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
                            onClick={() => handleBuyReport(property)}
                            data-testid={`button-buy-report-${property.id}`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Civil MEP Analysis Report
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

        {/* Value Proposition Sections */}
        {hasSearched && (
          <>
            {/* Why Civil+MEP Reports Section */}
            <div className="mt-16 py-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Why Civil+MEP Reports Are Essential for Property Buyers
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Don't let hidden structural or system issues turn your dream property into a costly nightmare. 
                    Our engineering assessments reveal what builders don't want you to know.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <CardTitle className="text-xl">Hidden Structural Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-center">
                        Identify foundation problems, wall cracks, roofing defects, and structural weaknesses 
                        that could cost lakhs in repairs later.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <CardTitle className="text-xl">Electrical Safety</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-center">
                        Detect faulty wiring, overloaded circuits, and fire hazards that pose serious 
                        safety risks to your family.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-xl">MEP System Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-center">
                        Evaluate HVAC, plumbing, and mechanical systems to ensure they meet standards 
                        and won't fail after possession.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IndianRupee className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-xl">Avoid Costly Repairs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-center">
                        Save 5-10 lakhs by identifying issues before purchase. Use our report to 
                        negotiate better prices or avoid problem properties entirely.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle className="text-xl">Quality Assurance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-center">
                        Verify that construction quality matches what was promised. Ensure your 
                        investment meets building codes and safety standards.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <CardTitle className="text-xl">Future-Proof Investment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-center">
                        Ensure your property will maintain its value and not become a liability. 
                        Get expert recommendations for long-term durability.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* What You Get Section */}
            <div className="mt-16 py-16">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    What's Included in Your ₹2,499 Assessment
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Comprehensive engineering evaluation by licensed professionals
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        Civil Engineering Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Foundation and structural integrity analysis</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Wall construction quality and load-bearing capacity</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Roofing and waterproofing evaluation</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Crack analysis and settlement assessment</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Building code compliance verification</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Wrench className="w-6 h-6 text-green-600" />
                        MEP Systems Evaluation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Electrical wiring and safety systems inspection</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Plumbing and water supply system analysis</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>HVAC and ventilation system assessment</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Fire safety and emergency systems review</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Energy efficiency and sustainability analysis</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl text-white text-center">
                  <h3 className="text-xl font-semibold mb-2">Expert Investment Recommendation</h3>
                  <p className="text-blue-100">
                    Get a clear BUY, HOLD, or AVOID recommendation based on our comprehensive engineering analysis, 
                    helping you make confident investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Form Dialog */}
      {selectedProperty && (
        <OrderFormDialog
          isOpen={showOrderForm}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedProperty(null);
          }}
          onSubmit={async (orderData) => {
            try {
              const response = await fetch("/api/orders/service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  serviceType: "civil-mep-assessment",
                  reportType: "civil-mep-report",
                  propertyId: selectedProperty.id,
                  customerName: orderData.customerName,
                  customerEmail: orderData.email,
                  customerPhone: orderData.phone,
                  customerAddress: orderData.address,
                  additionalRequirements: orderData.additionalRequirements,
                  amount: 2499
                }),
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create order");
              }
              
              const result = await response.json();
              
              // Process payment using Razorpay
              await processPayment({
                amount: 2499,
                orderId: result.orderId,
                customerName: orderData.customerName,
                customerEmail: orderData.email,
                customerPhone: orderData.phone,
                onSuccess: () => {
                  toast({
                    title: "Order created successfully!",
                    description: `Your Civil+MEP assessment order has been created. You'll receive the report within 48 hours.`,
                  });
                  queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports"] });
                  setShowOrderForm(false);
                  setSelectedProperty(null);
                },
                onError: (error: string) => {
                  toast({
                    title: "Payment Failed",
                    description: error,
                    variant: "destructive",
                  });
                }
              });
            } catch (error: any) {
              toast({
                title: "Error creating order",
                description: error.message,
                variant: "destructive",
              });
            }
          }}
          property={selectedProperty}
          reportType="civil-mep"
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}