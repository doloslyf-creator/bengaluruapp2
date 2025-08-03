import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  User, Home, Calendar, MessageCircle, FileText, 
  Star, Heart, MapPin, Phone, Mail, 
  Eye, Download, ExternalLink, Clock, 
  IndianRupee, CheckCircle, AlertCircle, XCircle,
  Filter, Search, ChevronRight, Settings, Bell, Calculator, Building, Scale,
  TrendingUp, BarChart3, Zap, Award, Target, ArrowUpRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatPriceDisplay } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { type Property, type Lead, type Booking, type CivilMepReport, type ReportPayment } from "@shared/schema";

// Mock user data (will be replaced with auth later)
const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+91 98765 43210",
  avatar: "",
  memberSince: "January 2024",
  totalProperties: 5,
  totalBookings: 3,
  totalOrders: 1
};

interface UserStats {
  totalViewed: number;
  totalBookings: number;
  totalConsultations: number;
  totalOrders: number;
  totalSpent: number;
}

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

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
    totalSpent: userOrders.reduce((sum, order) => sum + ((order as any).totalAmount || 0), 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Pending</Badge>;
      case 'cancelled':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="hover:bg-gray-50">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredBookings = userBookings.filter(booking => {
    const matchesSearch = searchQuery === "" || 
      (booking as any).propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking as any).name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredConsultations = userConsultations.filter(consultation => {
    const matchesSearch = searchQuery === "" || 
      (consultation as any).propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && consultation.source === 'consultation';
  });

  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = searchQuery === "" || 
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order as any).reportType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const quickActions = [
    {
      title: "Find Properties",
      description: "Discover your dream property",
      icon: Building,
      href: "/find-property",
      gradient: "from-blue-500 to-blue-700",
      hoverGradient: "hover:from-blue-600 hover:to-blue-800"
    },
    {
      title: "Book Site Visit",
      description: "Schedule property visits",
      icon: Calendar,
      href: "/book-visit",
      gradient: "from-green-500 to-green-700",
      hoverGradient: "hover:from-green-600 hover:to-green-800"
    },
    {
      title: "Valuation Report",
      description: "Get property valuation",
      icon: Calculator,
      href: "/property-valuation",
      gradient: "from-purple-500 to-purple-700",
      hoverGradient: "hover:from-purple-600 hover:to-purple-800"
    },
    {
      title: "Legal Due Diligence",
      description: "Legal verification tracker",
      icon: Scale,
      href: "/legal-due-diligence",
      gradient: "from-orange-500 to-orange-700",
      hoverGradient: "hover:from-orange-600 hover:to-orange-800"
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {mockUser.name}!</h1>
              <p className="text-blue-100 text-lg mb-4">Your property journey continues here. Track your progress and discover new opportunities.</p>
              <div className="flex items-center space-x-2 text-blue-100">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Member since {mockUser.memberSince}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Sparkles className="h-12 w-12 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Properties Viewed</p>
                <p className="text-3xl font-bold text-blue-600">{userStats.totalViewed}</p>
                <p className="text-xs text-gray-500 mt-1">Active exploration</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Site Visits</p>
                <p className="text-3xl font-bold text-green-600">{userStats.totalBookings}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled visits</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Consultations</p>
                <p className="text-3xl font-bold text-purple-600">{userStats.totalConsultations}</p>
                <p className="text-xs text-gray-500 mt-1">Expert guidance</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-orange-600">₹{userStats.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Investment so far</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <IndianRupee className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600">Get started with our premium services</p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Fast & Reliable</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br ${action.gradient} ${action.hoverGradient}`}>
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 group-hover:bg-white/30 transition-colors">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-white">{action.title}</h3>
                    <p className="text-white/80 text-sm group-hover:text-white/90">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {userStats.totalViewed > 0 || userStats.totalBookings > 0 ? (
              <div className="space-y-4">
                {userStats.totalViewed > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Viewed {userStats.totalViewed} properties</p>
                      <p className="text-sm text-gray-600">Keep exploring to find your perfect match</p>
                    </div>
                  </div>
                )}
                {userStats.totalBookings > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-100 rounded-full p-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Scheduled {userStats.totalBookings} site visits</p>
                      <p className="text-sm text-gray-600">Experience properties firsthand</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No recent activity</p>
                <p className="text-sm text-gray-400">Start exploring properties to see your journey here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span>Your Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Building className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-900">Find Dream Property</span>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-200">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Complete Due Diligence</span>
                </div>
                <Badge variant="outline">Upcoming</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Award className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Secure Financing</span>
                </div>
                <Badge variant="outline">Upcoming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
          <p className="text-gray-600">Track your property interests and favorites</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
          <Link href="/find-property">
            <Building className="h-4 w-4 mr-2" />
            Find More Properties
          </Link>
        </Button>
      </div>
      
      {viewedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewedProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                      {property.type}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {property.name}
                  </h3>
                  <p className="text-gray-600 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {property.area}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Starting from</p>
                      <p className="text-xl font-bold text-blue-600">
                        ₹{(property as any).priceMin?.toLocaleString() || 'Price on request'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-200" asChild>
                      <Link href={`/property/${property.id}`}>
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <Building className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties viewed yet</h3>
            <p className="text-gray-600 mb-6">Start exploring our curated property collection</p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
              <Link href="/find-property">Start Exploring Properties</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600">Manage your property site visits</p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" asChild>
          <Link href="/book-visit">
            <Calendar className="h-4 w-4 mr-2" />
            Book New Visit
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{(booking as any).propertyName || 'Property Visit'}</h3>
                      <p className="text-sm text-gray-600">
                        {(booking as any).visitDate ? formatDate((booking as any).visitDate) : 'Date pending'} • {(booking as any).visitTime || 'Time TBD'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Contact: {(booking as any).phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(booking.status)}
                    <Button variant="outline" size="sm">
                      View Details
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="bg-green-50 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <Calendar className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No site visits booked yet</h3>
            <p className="text-gray-600 mb-6">Schedule your first property visit to get started</p>
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" asChild>
              <Link href="/book-visit">Book Your First Visit</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Home className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-gray-900">OwnItRight</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold text-gray-900">User Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {mockUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-96 mx-auto bg-white shadow-sm border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Building className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="properties">
            {renderProperties()}
          </TabsContent>

          <TabsContent value="bookings">
            {renderBookings()}
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                  <p className="text-gray-600">Track your report orders and payments</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                  <Link href="/property-valuation">
                    <FileText className="h-4 w-4 mr-2" />
                    Order New Report
                  </Link>
                </Button>
              </div>
              
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {(order as any).reportType || 'Property Report'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Order ID: {order.id.slice(0, 8)}...
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Amount: ₹{((order as any).totalAmount || 0)?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge((order as any).paymentStatus || 'pending')}
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-200">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="bg-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                      <FileText className="h-12 w-12 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Order your first property report to get started</p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                      <Link href="/property-valuation">Order Your First Report</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}