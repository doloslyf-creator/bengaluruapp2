import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  User, Home, Calendar, MessageCircle, FileText, 
  Star, Heart, MapPin, Phone, Mail, 
  Eye, Download, ExternalLink, Clock, 
  IndianRupee, CheckCircle, AlertCircle, XCircle,
  Filter, Search, ChevronRight, Settings, Bell, Calculator, Building
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
    totalSpent: userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
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

  const filteredBookings = userBookings.filter(booking => {
    const matchesSearch = searchQuery === "" || 
      booking.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredConsultations = userConsultations.filter(consultation => {
    const matchesSearch = searchQuery === "" || 
      consultation.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && consultation.source === 'consultation';
  });

  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = searchQuery === "" || 
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.propertyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-black tracking-tight text-gray-900">
                  My Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                </div>
                <p className="text-sm text-gray-600">Curated Properties • User Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Avatar>
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback>{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="text-lg">{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{mockUser.name}</CardTitle>
                <p className="text-sm text-gray-600">Member since {mockUser.memberSince}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{mockUser.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{mockUser.phone}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.totalViewed}</div>
                    <div className="text-xs text-gray-600">Properties Viewed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.totalBookings}</div>
                    <div className="text-xs text-gray-600">Bookings</div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link href="/find-property">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Search className="h-4 w-4 mr-2" />
                        Find Properties
                      </Button>
                    </Link>
                    <Link href="/user-panel/valuation-reports">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calculator className="h-4 w-4 mr-2" />
                        Valuation Reports
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="consultations">Consultations</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Properties Viewed</p>
                          <p className="text-3xl font-bold text-primary">{userStats.totalViewed}</p>
                        </div>
                        <Eye className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Site Visits</p>
                          <p className="text-3xl font-bold text-blue-600">{userStats.totalBookings}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Consultations</p>
                          <p className="text-3xl font-bold text-green-600">{userStats.totalConsultations}</p>
                        </div>
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Link href="/user-panel/valuation-reports">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Valuation Reports</p>
                            <p className="text-3xl font-bold text-purple-600">View</p>
                          </div>
                          <Calculator className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userBookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Site visit booked</p>
                              <p className="text-sm text-gray-600">{booking.propertyName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(booking.status)}
                            <p className="text-sm text-gray-600 mt-1">{formatDate(booking.preferredDate || booking.createdAt?.toString() || '')}</p>
                          </div>
                        </div>
                      ))}
                      {userOrders.slice(0, 2).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="font-medium">CIVIL+MEP Report ordered</p>
                              <p className="text-sm text-gray-600">{order.propertyName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.paymentStatus)}
                            <p className="text-sm text-gray-600 mt-1">₹{(order.totalAmount / 100).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Properties Tab */}
              <TabsContent value="properties" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recently Viewed Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewedProperties.slice(0, 6).map((property) => (
                        <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{property.name}</h3>
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.area}, {property.zone} Bengaluru
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline">{property.type}</Badge>
                              <Badge variant="outline" className="ml-2">{property.status}</Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>My Site Visits</CardTitle>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Search bookings..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64"
                        />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">{booking.propertyName}</h3>
                              <p className="text-sm text-gray-600">{booking.customerName}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Visit Date</p>
                              <p className="font-medium">{formatDate(booking.preferredDate || booking.createdAt?.toString() || '')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Time</p>
                              <p className="font-medium">{booking.preferredTime || 'TBD'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Phone</p>
                              <p className="font-medium">{booking.phone}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </Button>
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Consultations Tab */}
              <TabsContent value="consultations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Consultations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredConsultations.map((consultation) => (
                        <div key={consultation.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">{consultation.propertyName}</h3>
                              <p className="text-sm text-gray-600">Score: {consultation.leadScore}/100</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Consultation</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Budget</p>
                              <p className="font-medium">{consultation.budgetRange}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Deal Value</p>
                              <p className="font-medium">₹{consultation.dealValue || 0} L</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Status</p>
                              <p className="font-medium capitalize">{consultation.status}</p>
                            </div>
                          </div>
                          {consultation.qualificationNotes && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">Notes:</p>
                              <p className="text-sm">{consultation.qualificationNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>My Orders</CardTitle>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Search orders..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64"
                        />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">CIVIL+MEP Report</h3>
                              <p className="text-sm text-gray-600">{order.propertyName}</p>
                            </div>
                            {getStatusBadge(order.paymentStatus)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Order Date</p>
                              <p className="font-medium">{formatDate(order.createdAt?.toString() || '')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Amount</p>
                              <p className="font-medium">₹{(order.totalAmount / 100).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Due Date</p>
                              <p className="font-medium">{order.dueDate ? formatDate(order.dueDate) : 'N/A'}</p>
                            </div>
                            <div className="flex space-x-2">
                              {order.paymentStatus === 'paid' && (
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              )}
                              {order.paymentStatus === 'pending' && (
                                <Button size="sm">
                                  <IndianRupee className="h-4 w-4 mr-1" />
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}