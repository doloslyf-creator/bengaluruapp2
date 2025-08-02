import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  User, Home, Calendar, MessageCircle, FileText, 
  Star, Heart, MapPin, Phone, Mail, 
  Eye, Download, ExternalLink, Clock, 
  IndianRupee, CheckCircle, AlertCircle, XCircle,
  Filter, Search, ChevronRight, Settings, Bell, Calculator, Building, Scale,
  TrendingUp, BarChart3, PieChart, Activity, Award, Shield,
  Menu, X, Plus, ArrowUpRight, ArrowDownRight, DollarSign,
  Zap, Home as HomeIcon, Wrench, Camera, Map, BookOpen
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
import { type Property, type Lead, type Booking, type CivilMepReport, type ReportPayment } from "@shared/schema";

// Mock user data (will be replaced with auth later)
const mockUser = {
  id: "user-1",
  name: "Arjun Mehta",
  email: "arjun.mehta@example.com",
  phone: "+91 98765 43210",
  avatar: "",
  memberSince: "January 2024",
  location: "Koramangala, Bengaluru",
  preferredBudget: "₹1.2Cr - ₹1.8Cr",
  totalProperties: 12,
  totalBookings: 4,
  totalOrders: 2
};

interface UserStats {
  totalViewed: number;
  totalBookings: number;
  totalConsultations: number;
  totalOrders: number;
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

export default function EnhancedUserPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Fetch user's properties (favorites/viewed)
  const { data: viewedProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user bookings
  const { data: userBookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    staleTime: 2 * 60 * 1000,
  });

  // Fetch user consultations (from leads)
  const { data: userConsultations = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    staleTime: 2 * 60 * 1000,
  });

  // Fetch user orders (report payments)
  const { data: userOrders = [] } = useQuery<ReportPayment[]>({
    queryKey: ["/api/report-payments"],
    staleTime: 2 * 60 * 1000,
  });

  // Calculate user statistics
  const userStats: UserStats = {
    totalViewed: viewedProperties.length,
    totalBookings: userBookings.length,
    totalConsultations: userConsultations.filter(lead => lead.source === 'consultation').length,
    totalOrders: userOrders.length,
    totalSpent: userOrders.reduce((sum, order) => sum + (order.amount || 0), 0),
    recentActivity: 8 // Mock recent activity count
  };

  const quickActions: QuickAction[] = [
    {
      id: "search",
      title: "Find Properties",
      description: "Discover new properties",
      icon: Search,
      href: "/find-property",
      color: "bg-blue-500",
      count: 150
    },
    {
      id: "valuation",
      title: "Property Valuation",
      description: "Get property reports",
      icon: Calculator,
      href: "/user-valuation-reports",
      color: "bg-green-500",
      count: userStats.totalOrders
    },
    {
      id: "civil-mep",
      title: "CIVIL+MEP Reports",
      description: "Engineering assessments",
      icon: Building,
      href: "/user-civil-mep-reports",
      color: "bg-purple-500",
      count: 3
    },
    {
      id: "legal",
      title: "Legal Due Diligence",
      description: "Track legal processes",
      icon: Scale,
      href: "/user-legal-tracker-enhanced",
      color: "bg-orange-500",
      count: 2
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ action }: { action: QuickAction }) => (
    <Link href={action.href} className="block">
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
            {action.count !== undefined && (
              <Badge variant="secondary" className="text-xs">{action.count}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const RecentPropertyCard = ({ property }: { property: Property }) => (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{property.area}, {property.zone}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-primary">
                {formatPriceDisplay(property.price)}
              </span>
              <Badge variant="outline" className="text-xs">
                {property.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <HomeIcon className="h-6 w-6 text-primary" />
            <div>
              <div className="text-lg font-black tracking-tight text-gray-900">
                Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {quickActions.map((action) => (
                    <Link key={action.id} href={action.href} className="block">
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
                        <action.icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{action.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-80 bg-white border-r border-gray-200 shadow-sm">
          <div className="flex flex-col w-full">
            {/* Logo */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <HomeIcon className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-xl font-black tracking-tight text-gray-900">
                    Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                  </div>
                  <p className="text-xs text-gray-600">User Dashboard</p>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-primary text-white">
                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{mockUser.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{mockUser.location}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{mockUser.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{mockUser.phone}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 border-b">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.totalViewed}</div>
                  <div className="text-xs text-gray-600">Properties Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.totalBookings}</div>
                  <div className="text-xs text-gray-600">Site Visits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.totalOrders}</div>
                  <div className="text-xs text-gray-600">Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.recentActivity}</div>
                  <div className="text-xs text-gray-600">Activities</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6">
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.id} href={action.href} className="block">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <action.icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium flex-1">{action.title}</span>
                      {action.count !== undefined && (
                        <Badge variant="secondary" className="text-xs">{action.count}</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Welcome back, {mockUser.name.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-gray-600 mt-1">Here's what's happening with your property journey</p>
                </div>
                <div className="mt-4 lg:mt-0 flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Properties Viewed"
                  value={userStats.totalViewed}
                  icon={Eye}
                  trend="up"
                  trendValue="+12%"
                  color="bg-blue-500"
                />
                <StatCard
                  title="Site Visits Booked"
                  value={userStats.totalBookings}
                  icon={Calendar}
                  trend="up"
                  trendValue="+8%"
                  color="bg-green-500"
                />
                <StatCard
                  title="Reports Ordered"
                  value={userStats.totalOrders}
                  icon={FileText}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Total Spent"
                  value={`₹${(userStats.totalSpent / 1000).toFixed(0)}K`}
                  icon={DollarSign}
                  color="bg-orange-500"
                />
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                      <QuickActionCard key={action.id} action={action} />
                    ))}
                  </div>
                </div>

                {/* Recent Properties */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recently Viewed Properties</h2>
                    <Link href="/find-property">
                      <Button variant="outline" size="sm">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewedProperties.slice(0, 6).map((property) => (
                      <RecentPropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Viewed property in <span className="font-medium">Koramangala</span>
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Booked site visit for <span className="font-medium">HSR Layout property</span>
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Downloaded valuation report
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="under-offer">Under Offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {viewedProperties.map((property) => (
                    <RecentPropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Site Visit Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userBookings.length > 0 ? (
                        userBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-semibold">{booking.name}</h3>
                              <p className="text-sm text-gray-600">{formatDate(booking.visitDate || '')}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(booking.status)}
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No bookings yet</p>
                          <Link href="/find-property">
                            <Button className="mt-4">Book Your First Visit</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                {/* Reports Grid - Aligned Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Property Valuation Reports */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Calculator className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-gray-900">Property Valuation</div>
                          <div className="text-sm text-gray-500 font-normal">Market Analysis Reports</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-green-600">2</div>
                            <div className="text-sm text-gray-600">Reports Available</div>
                          </div>
                          <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Latest Report</span>
                            <span className="font-medium">15 Dec 2024</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Average Value</span>
                            <span className="font-medium text-green-600">₹1.4Cr</span>
                          </div>
                        </div>
                        <Link href="/user-valuation-reports" className="block">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View Reports
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CIVIL+MEP Reports */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Building className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-gray-900">CIVIL+MEP Reports</div>
                          <div className="text-sm text-gray-500 font-normal">Engineering Assessments</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-purple-600">1</div>
                            <div className="text-sm text-gray-600">Engineering Report</div>
                          </div>
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200">Completed</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Latest Report</span>
                            <span className="font-medium">12 Dec 2024</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Report Cost</span>
                            <span className="font-medium text-purple-600">₹25,000</span>
                          </div>
                        </div>
                        <Link href="/user-civil-mep-reports" className="block">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View Reports
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Legal Due Diligence */}
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <Scale className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-gray-900">Legal Due Diligence</div>
                          <div className="text-sm text-gray-500 font-normal">Verification Tracker</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-orange-600">85%</div>
                            <div className="text-sm text-gray-600">Verification Complete</div>
                          </div>
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200">In Progress</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Active Properties</span>
                            <span className="font-medium">2 Properties</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pending Steps</span>
                            <span className="font-medium text-orange-600">3 Steps</span>
                          </div>
                        </div>
                        <Link href="/user-legal-tracker-enhanced" className="block">
                          <Button className="w-full bg-orange-600 hover:bg-orange-700">
                            <Activity className="h-4 w-4 mr-2" />
                            Track Progress
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Report Summary Card */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Reports Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
                        <div className="text-sm text-gray-600">Total Reports</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">₹45K</div>
                        <div className="text-sm text-gray-600">Total Investment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">92%</div>
                        <div className="text-sm text-gray-600">Avg Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">3</div>
                        <div className="text-sm text-gray-600">Active Trackers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}