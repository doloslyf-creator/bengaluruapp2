import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Clock,
  User,
  Building,
  FileText,
  MessageSquare,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  BookOpen,
  ShoppingCart,
  Send,
  BarChart3,
  Plus,
  Download,
  Upload,
  Settings,
  RefreshCw,
  CalendarDays,
  PieChart,
  Activity,
  UserCheck,
  Zap,
  Heart,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "hot" | "warm" | "cold" | "converted" | "inactive";
  totalOrders: number;
  totalSpent: number;
  lastActivity: string;
  source: string;
  interestedProperties: string[];
  leadScore: number;
  
  // Aggregated data
  leads: any[];
  bookings: any[];
  orders: any[];
  activities: any[];
  notes: any[];
}

interface CustomerStats {
  totalCustomers: number;
  hotLeads: number;
  convertedCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: customers = [], isLoading } = useQuery<CustomerProfile[]>({
    queryKey: ["/api/customers"],
  });

  const { data: stats } = useQuery<CustomerStats>({
    queryKey: ["/api/customers/stats"],
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ customerId, note }: { customerId: string; note: string }) => 
      apiRequest("POST", `/api/customers/${customerId}/notes`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setNewNote("");
      toast({
        title: "Note Added",
        description: "Customer note has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const updateCustomerStatusMutation = useMutation({
    mutationFn: ({ customerId, status }: { customerId: string; status: string }) => 
      apiRequest("PATCH", `/api/customers/${customerId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/stats"] });
      toast({
        title: "Customer Updated",
        description: "Customer status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hot":
        return <Badge className="bg-red-100 text-red-800"><TrendingUp className="w-3 h-3 mr-1" />Hot Lead</Badge>;
      case "warm":
        return <Badge className="bg-yellow-100 text-yellow-800"><Star className="w-3 h-3 mr-1" />Warm</Badge>;
      case "cold":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Cold</Badge>;
      case "converted":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Converted</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleAddNote = () => {
    if (selectedCustomer && newNote.trim()) {
      addNoteMutation.mutate({ customerId: selectedCustomer.id, note: newNote.trim() });
    }
  };

  const handleStatusUpdate = (customerId: string, newStatus: string) => {
    updateCustomerStatusMutation.mutate({ customerId, status: newStatus });
  };

  // Sub-menu items for customer management
  const customerMenuItems = [
    {
      id: "overview",
      title: "Overview",
      icon: Users,
      description: "Customer dashboard & analytics",
      badge: stats?.totalCustomers || 0
    },
    {
      id: "leads",
      title: "Lead Management",
      icon: Target,
      description: "Lead scoring & qualification",
      badge: stats?.hotLeads || 0
    },
    {
      id: "bookings",
      title: "Bookings & Visits",
      icon: CalendarDays,
      description: "Site visits & scheduling",
      badge: filteredCustomers.reduce((sum, c) => sum + c.bookings.length, 0)
    },
    {
      id: "orders",
      title: "Orders & Revenue",
      icon: ShoppingCart,
      description: "Orders & payment tracking",
      badge: stats?.convertedCustomers || 0
    },
    {
      id: "communications",
      title: "Communications",
      icon: Send,
      description: "Email campaigns & history",
      badge: "New"
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      icon: BarChart3,
      description: "Performance insights",
      badge: `₹${Math.round((stats?.totalRevenue || 0) / 1000)}K`
    }
  ];

  return (
    <AdminLayout title="Customer Management">
      <div className="flex flex-col h-full">
        {/* Enhanced Header with Actions */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
              <p className="text-sm text-gray-600">Comprehensive CRM for property advisory services</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </header>

        {/* Sub-Menu Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {customerMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative p-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white shadow-md ring-1 ring-blue-200 text-blue-700"
                    : "bg-white/50 hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-md ${
                    activeTab === item.id ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs opacity-75 truncate">{item.description}</p>
                  </div>
                </div>
                {item.badge && (
                  <div className="absolute -top-1 -right-1">
                    <Badge 
                      variant={typeof item.badge === 'number' ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Customers</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                          <p className="text-2xl font-bold text-red-600">{stats.hotLeads}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Converted</p>
                          <p className="text-2xl font-bold text-green-600">{stats.convertedCustomers}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-purple-600">₹{Math.round(stats.totalRevenue / 1000)}K</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Order</p>
                          <p className="text-2xl font-bold text-orange-600">₹{Math.round(stats.avgOrderValue / 1000)}K</p>
                        </div>
                        <Target className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    className="w-80 pl-10 pr-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="hot">Hot Leads</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Database</CardTitle>
                  <CardDescription>
                    Unified view of all customer interactions and touchpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lead Score</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-2">{customer.leadScore}/100</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${customer.leadScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{customer.totalOrders}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">₹{customer.totalSpent.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {format(new Date(customer.lastActivity), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Customer Profile: {customer.name}</DialogTitle>
                                  <DialogDescription>
                                    Comprehensive customer relationship data
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCustomer && (
                                  <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                      <TabsTrigger value="overview">Overview</TabsTrigger>
                                      <TabsTrigger value="activities">Activities</TabsTrigger>
                                      <TabsTrigger value="orders">Orders</TabsTrigger>
                                      <TabsTrigger value="notes">Notes</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium">Contact Information</h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex items-center"><Mail className="h-4 w-4 mr-2" />{selectedCustomer.email}</div>
                                            <div className="flex items-center"><Phone className="h-4 w-4 mr-2" />{selectedCustomer.phone}</div>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium">Status & Scoring</h4>
                                          <div className="space-y-2">
                                            {getStatusBadge(selectedCustomer.status)}
                                            <div className="text-sm">Lead Score: {selectedCustomer.leadScore}/100</div>
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="activities" className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-3">Recent Activities</h4>
                                        <div className="space-y-3">
                                          {selectedCustomer.leads.length > 0 && (
                                            <div>
                                              <h5 className="text-sm font-medium">Leads ({selectedCustomer.leads.length})</h5>
                                              {selectedCustomer.leads.slice(0, 3).map((lead, idx) => (
                                                <div key={idx} className="text-sm text-gray-600 ml-4">
                                                  • {lead.customerName} - {lead.source}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {selectedCustomer.bookings.length > 0 && (
                                            <div>
                                              <h5 className="text-sm font-medium">Bookings ({selectedCustomer.bookings.length})</h5>
                                              {selectedCustomer.bookings.slice(0, 3).map((booking, idx) => (
                                                <div key={idx} className="text-sm text-gray-600 ml-4">
                                                  • {booking.propertyName} - {format(new Date(booking.visitDate), 'MMM dd, yyyy')}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="orders" className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-3">Order History ({selectedCustomer.orders.length})</h4>
                                        <div className="space-y-2">
                                          {selectedCustomer.orders.map((order, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                              <div>
                                                <div className="font-medium">{order.reportType}</div>
                                                <div className="text-sm text-gray-600">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                                              </div>
                                              <div className="text-right">
                                                <div className="font-medium">₹{order.amount}</div>
                                                <div className="text-sm text-green-600">{order.status}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="notes" className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-3">Customer Notes</h4>
                                        <div className="space-y-3">
                                          <div className="flex space-x-2">
                                            <Textarea 
                                              placeholder="Add a note about this customer..."
                                              value={newNote}
                                              onChange={(e) => setNewNote(e.target.value)}
                                            />
                                            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                              Add Note
                                            </Button>
                                          </div>
                                          {selectedCustomer.notes && selectedCustomer.notes.map((note, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 rounded">
                                              <div className="text-sm">{note.content}</div>
                                              <div className="text-xs text-gray-500 mt-1">{format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Tab Content Placeholders */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Lead Management Dashboard
                  </CardTitle>
                  <CardDescription>
                    Manage lead scoring, qualification, and nurturing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Lead management features coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Bookings & Site Visits
                  </CardTitle>
                  <CardDescription>
                    Manage property visits, scheduling, and follow-ups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Booking management features coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Orders & Revenue Analytics
                  </CardTitle>
                  <CardDescription>
                    Track orders, payments, and revenue metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Order analytics features coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "communications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Communication Center
                  </CardTitle>
                  <CardDescription>
                    Email campaigns, SMS, and communication history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Communication features coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Customer Analytics & Reports
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics, insights, and reporting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Analytics dashboard coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}