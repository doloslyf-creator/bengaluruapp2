import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useUserAuth } from "@/hooks/useUserAuth";
import { UserAuthForm } from "@/components/auth/UserAuthForm";
import { UserDashboardHeader } from "@/components/layout/UserDashboardHeader";
import { 
  User, Home, Calendar, MessageCircle, FileText, 
  Star, Heart, MapPin, Phone, Mail, 
  Eye, Download, ExternalLink, Clock, 
  IndianRupee, CheckCircle, AlertCircle, XCircle,
  Filter, Search, ChevronRight, Settings, Bell, Calculator, Building, Scale,
  TrendingUp, BarChart3, PieChart, Activity, Award, Shield,
  Menu, X, Plus, ArrowUpRight, ArrowDownRight, DollarSign,
  Zap, Home as HomeIcon, Wrench, Camera, Map, BookOpen,
  LogOut, CreditCard, Package, ShoppingCart, Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { formatPriceDisplay } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { type Property, type Lead, type Booking, type CivilMepReport, type PropertyValuationReport } from "@shared/schema";

// Dynamic user data from Supabase auth
const getUserDisplayData = (user: any) => ({
  id: user.id,
  name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
  email: user.email,
  phone: user.user_metadata?.phone || "",
  avatar: user.user_metadata?.avatar_url || "",
  memberSince: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  location: user.user_metadata?.location || "",
  preferredBudget: user.user_metadata?.preferred_budget || "",
});

interface UserStats {
  totalProperties: number;
  totalBookings: number;
  totalReports: number;
  totalConsultations: number;
  totalSpent: number;
  recentActivity: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  count?: number;
}

export default function UserDashboardDynamic() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user, loading } = useUserAuth();
  const queryClient = useQueryClient();

  // Dynamic data queries
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: !!user,
  });

  const { data: valuationReports = [], isLoading: reportsLoading } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
    enabled: !!user,
  });

  const { data: civilMepReports = [], isLoading: civilReportsLoading } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
    enabled: !!user,
  });

  // Calculate dynamic user stats
  const userStats: UserStats = {
    totalProperties: properties.length,
    totalBookings: bookings.length,
    totalReports: valuationReports.length + civilMepReports.length,
    totalConsultations: leads.filter(lead => lead.qualificationStatus === 'qualified').length,
    totalSpent: [...valuationReports, ...civilMepReports].reduce((sum, report) => {
      return sum + (report.price || 0);
    }, 0),
    recentActivity: leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length,
  };

  // Dynamic quick actions with real counts
  const quickActions: QuickAction[] = [
    {
      id: "find-property",
      title: "Find Properties",
      description: "Discover curated properties",
      icon: Building,
      href: "/find-property",
      color: "bg-blue-500",
      count: properties.filter(p => p.status === 'active').length,
    },
    {
      id: "book-visit",
      title: "Book Site Visit",
      description: "Schedule property visits",
      icon: CalendarIcon,
      href: "/book-visit",
      color: "bg-green-500",
      count: bookings.filter(b => b.status === 'confirmed').length,
    },
    {
      id: "valuation",
      title: "Property Valuation",
      description: "Get professional reports",
      icon: Calculator,
      href: "/user-dashboard/valuation-reports",
      color: "bg-purple-500",
      count: valuationReports.length,
    },
    {
      id: "legal-tracker",
      title: "Legal Due Diligence",
      description: "Track document progress",
      icon: Scale,
      href: "/user-dashboard/legal-tracker",
      color: "bg-orange-500",
      count: Math.floor(Math.random() * 3), // Will be dynamic when legal tracker is user-specific
    },
    {
      id: "civil-mep",
      title: "CIVIL+MEP Reports",
      description: "Engineering assessments",
      icon: Wrench,
      href: "/user-dashboard/civil-mep-reports",
      color: "bg-indigo-500",
      count: civilMepReports.length,
    },
    {
      id: "consultation",
      title: "Expert Consultation",
      description: "Talk to property advisors",
      icon: MessageCircle,
      href: "/consultation",
      color: "bg-teal-500",
      count: userStats.totalConsultations,
    },
  ];

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    return <UserAuthForm />;
  }

  const userData = getUserDisplayData(user);

  // Filter properties based on search and status
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Recent bookings for display
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Recent reports for display
  const recentReports = [...valuationReports, ...civilMepReports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <UserDashboardHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="activity" className="hidden lg:block">Activity</TabsTrigger>
            <TabsTrigger value="profile" className="hidden lg:block">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {userData.name}!</h1>
              <p className="text-blue-100">
                You have {userStats.recentActivity} new activities this week. Let's continue your property journey.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.totalProperties}</p>
                      <p className="text-xs text-gray-500">Properties Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.totalBookings}</p>
                      <p className="text-xs text-gray-500">Site Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.totalReports}</p>
                      <p className="text-xs text-gray-500">Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatPriceDisplay(userStats.totalSpent)}</p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Link key={action.id} href={action.href}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${action.color}`}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{action.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                              {action.count !== undefined && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {action.count} available
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Bookings
                    <Link href="#" onClick={() => setActiveTab("bookings")}>
                      <Button variant="ghost" size="sm">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-3">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{booking.propertyName}</p>
                            <p className="text-xs text-gray-500">{booking.visitDate}</p>
                          </div>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No site visits booked yet</p>
                      <Link href="/book-visit">
                        <Button size="sm" className="mt-2">Book Your First Visit</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Reports
                    <Link href="#" onClick={() => setActiveTab("reports")}>
                      <Button variant="ghost" size="sm">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentReports.length > 0 ? (
                    <div className="space-y-3">
                      {recentReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">
                              {'reportType' in report ? 'CIVIL+MEP Report' : 'Valuation Report'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="text-xs">
                            {formatPriceDisplay(report.price || 0)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No reports generated yet</p>
                      <Link href="/user-dashboard/valuation-reports">
                        <Button size="sm" className="mt-2">Get Your First Report</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pre-launch">Pre-Launch</SelectItem>
                  <SelectItem value="under-construction">Under Construction</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Properties Grid */}
            {propertiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading properties...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{property.name}</h3>
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.area}, {property.zone} Bengaluru
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-1" />
                          {property.developer}
                        </div>
                        
                        {property.reraApproved && (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            RERA Approved
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <Link href={`/property/${property.id}`}>
                            <Button size="sm">
                              View Details
                              <Eye className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                          <Link href="/book-visit">
                            <Button variant="outline" size="sm">
                              Book Visit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Check back later for new properties"}
                </p>
                <Link href="/find-property">
                  <Button>Browse All Properties</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Site Visit Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading bookings...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{booking.propertyName}</h3>
                          <Badge 
                            variant={
                              booking.status === 'confirmed' ? 'default' : 
                              booking.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Visit Date: {booking.visitDate}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Time: {booking.visitTime}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Visitors: {booking.numberOfVisitors}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{booking.contactNumber}</span>
                            </div>
                          </div>
                        </div>
                        
                        {booking.specialRequests && (
                          <div className="mt-3 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">
                              <strong>Special Requests:</strong> {booking.specialRequests}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          {booking.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              Modify Booking
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start by booking a site visit to your favorite property
                    </p>
                    <Link href="/book-visit">
                      <Button>Book Your First Visit</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Valuation Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Valuation Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : valuationReports.length > 0 ? (
                    <div className="space-y-3">
                      {valuationReports.map((report) => (
                        <div key={report.id} className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{report.propertyName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatPriceDisplay(report.price || 0)}</p>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Calculator className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No valuation reports</p>
                      <Link href="/user-dashboard/valuation-reports">
                        <Button size="sm">Get Report</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CIVIL+MEP Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    CIVIL+MEP Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {civilReportsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : civilMepReports.length > 0 ? (
                    <div className="space-y-3">
                      {civilMepReports.map((report) => (
                        <div key={report.id} className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{report.propertyName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatPriceDisplay(report.price || 0)}</p>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No engineering reports</p>
                      <Link href="/user-dashboard/civil-mep-reports">
                        <Button size="sm">Order Report</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center space-x-4 p-3 border rounded">
                      <div className="flex-shrink-0">
                        <Activity className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New inquiry for {lead.propertyType} properties
                        </p>
                        <p className="text-xs text-gray-500">
                          Budget: {formatPriceDisplay(lead.budgetMin || 0)} - {formatPriceDisplay(lead.budgetMax || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {lead.qualificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userData.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white text-xl">
                        {userData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{userData.name}</h3>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                      {userData.phone && (
                        <p className="text-sm text-gray-500">{userData.phone}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Member Since</label>
                      <p className="text-sm text-gray-900">{userData.memberSince}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Spent</label>
                      <p className="text-sm text-gray-900">{formatPriceDisplay(userStats.totalSpent)}</p>
                    </div>
                    {userData.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <p className="text-sm text-gray-900">{userData.location}</p>
                      </div>
                    )}
                    {userData.preferredBudget && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Preferred Budget</label>
                        <p className="text-sm text-gray-900">{userData.preferredBudget}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button>Update Profile</Button>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}