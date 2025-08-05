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
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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

  // Extract unique areas and developers for filters
  const areas = Array.from(new Set(properties.map((p: Property) => p.area).filter(Boolean)));
  const developers = Array.from(new Set(properties.map((p: Property) => p.developer).filter(Boolean)));

  // Auto-search functionality
  const triggerAutoSearch = () => {
    setHasSearched(true);
  };

  // Manual search handler
  const handleSearch = () => {
    setHasSearched(true);
  };

  // Filter properties based on search criteria
  const filteredProperties = hasSearched ? properties.filter((property: Property) => {
    const matchesSearch = !searchTerm || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                    const hasReport = (existingReports as CivilMepReport[]).some(
                      report => report.propertyId === property.id
                    );

                    return (
                      <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {property.name}
                              </h3>
                              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{property.area}</span>
                              </div>
                              {property.developer && (
                                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                                  <Building2 className="w-4 h-4 mr-1" />
                                  <span>{property.developer}</span>
                                </div>
                              )}
                              <div className="flex gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">
                                  {property.type}
                                </Badge>
                                {property.possessionDate && (
                                  <Badge variant="secondary" className="text-xs">
                                    Possession: {new Date(property.possessionDate).getFullYear()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Property Details Preview */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {property.configurations && property.configurations.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Configurations:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {property.configurations.slice(0, 3).map((config, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {config}
                                      </Badge>
                                    ))}
                                    {property.configurations.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{property.configurations.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {property.priceRange && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Price Range:</span>
                                  <p className="text-green-600 dark:text-green-400 font-semibold mt-1">
                                    ₹{property.priceRange}
                                  </p>
                                </div>
                              )}
                              
                              {property.totalUnits && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Units:</span>
                                  <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                    {property.totalUnits}
                                  </p>
                                </div>
                              )}
                              
                              {property.launchDate && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Launch Date:</span>
                                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {new Date(property.launchDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Amenities Preview */}
                            {property.amenities && property.amenities.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Key Amenities:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {property.amenities.slice(0, 4).map((amenity, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {property.amenities.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{property.amenities.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quality Indicators */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-2">
                              {property.reraApproved && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Shield className="w-3 h-3 mr-1" />
                                  RERA Approved
                                </Badge>
                              )}
                              {property.qualityScore && (
                                <Badge variant="outline" className="border-blue-200 text-blue-700">
                                  <Star className="w-3 h-3 mr-1" />
                                  Quality Score: {property.qualityScore}/10
                                </Badge>
                              )}
                            </div>
                            {property.distanceFromCenter && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {property.distanceFromCenter} from city center
                              </div>
                            )}
                          </div>

                          {hasReport ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-600">Report Available</span>
                                {getStatusBadge((existingReports as CivilMepReport[]).find(r => r.propertyId === property.id)?.status || 'pending')}
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Why ₹2,499 Section */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why We Charge ₹2,499 Per Report
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our transparent pricing covers the real costs of providing unbiased, professional engineering assessments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 border-2 border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                    Physical Site Inspection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our licensed civil and MEP engineers physically visit each property to conduct thorough on-site inspections. 
                    This includes travel costs, equipment, and professional time for comprehensive assessment.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Licensed engineer site visit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Professional testing equipment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Travel and logistics costs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6 border-2 border-green-100 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Shield className="w-6 h-6 text-green-600" />
                    Unbiased Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Unlike builder-sponsored reports, our fee structure ensures complete independence. 
                    We have no financial relationship with developers, guaranteeing honest, unbiased assessments.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>No builder influence or kickbacks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Independent professional assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Transparent reporting standards</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Beware of "Free" Reports
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Many builders offer "free" engineering reports that are often biased or incomplete. 
                    Our fee ensures you get an honest assessment that could save you lakhs in future repairs and help you make informed investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Real experiences from property buyers who trusted our engineering assessments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 relative">
                <CardContent>
                  <Quote className="w-8 h-8 text-blue-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    "The Civil+MEP report revealed major plumbing issues in a Whitefield property. 
                    The ₹2,499 saved me from a ₹3 lakh nightmare after possession. Worth every rupee!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Priya Sharma</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Software Engineer, Bangalore</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 relative">
                <CardContent>
                  <Quote className="w-8 h-8 text-blue-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    "Structural issues found in Sarjapur project helped me negotiate ₹8 lakh price reduction. 
                    The detailed MEP analysis was spot-on. Highly recommend!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Rajesh Kumar</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Investment Banker, Mumbai</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 relative">
                <CardContent>
                  <Quote className="w-8 h-8 text-blue-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    "Professional team, quick turnaround. The electrical safety issues they found were genuine concerns. 
                    This report gave me confidence in my Electronic City investment."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Anitha Reddy</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Marketing Head, Hyderabad</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't See Your Property Here?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              We can inspect any property in Bangalore. Request a custom Civil+MEP assessment 
              for your property and get the same professional analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-white">
                  <Phone className="w-5 h-5 mr-2" />
                  Request Custom Report
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="bg-blue-800 hover:bg-blue-900 text-white">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Contact Our Engineers
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              Same ₹2,499 pricing • 48-hour delivery • Professional inspection
            </p>
          </div>
        </div>
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
      
      <Footer />
    </>
  );
}