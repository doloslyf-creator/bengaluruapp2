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
  UserPlus,
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
  Briefcase,
  MoreHorizontal
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
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    interestedProperties: [] as string[],
    notes: ""
  });
  const [newLeadForm, setNewLeadForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    source: "",
    budget: "",
    propertyType: "",
    location: "",
    notes: ""
  });

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

  const addCustomerMutation = useMutation({
    mutationFn: (customerData: typeof newCustomerForm) => 
      apiRequest("POST", "/api/customers", customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/stats"] });
      setShowAddCustomerDialog(false);
      setNewCustomerForm({
        name: "",
        email: "",
        phone: "",
        source: "",
        interestedProperties: [],
        notes: ""
      });
      toast({
        title: "Customer Added",
        description: "New customer has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  const addLeadMutation = useMutation({
    mutationFn: (leadData: typeof newLeadForm) => 
      apiRequest("POST", "/api/leads", leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/stats"] });
      setShowAddLeadDialog(false);
      setNewLeadForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        source: "",
        budget: "",
        propertyType: "",
        location: "",
        notes: ""
      });
      toast({
        title: "Lead Added",
        description: "New lead has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add lead",
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

  const handleAddCustomer = () => {
    if (newCustomerForm.name && newCustomerForm.email && newCustomerForm.phone) {
      addCustomerMutation.mutate(newCustomerForm);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields (name, email, phone)",
        variant: "destructive",
      });
    }
  };

  const handleAddLead = () => {
    if (newLeadForm.customerName && newLeadForm.customerEmail && newLeadForm.source) {
      // Transform form data to match schema requirements
      const leadData = {
        leadId: `LD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        source: newLeadForm.source === "website" ? "property-inquiry" : 
                newLeadForm.source === "referral" ? "property-inquiry" :
                newLeadForm.source === "social_media" ? "property-inquiry" :
                newLeadForm.source === "advertisement" ? "property-inquiry" :
                newLeadForm.source === "walk_in" ? "consultation" :
                newLeadForm.source === "phone_call" ? "consultation" : "property-inquiry",
        customerName: newLeadForm.customerName,
        phone: newLeadForm.customerPhone,
        email: newLeadForm.customerEmail,
        propertyName: newLeadForm.location ? `${newLeadForm.propertyType} in ${newLeadForm.location}` : "General Property Interest",
        budgetRange: newLeadForm.budget || "Not Specified",
        leadType: "warm" as const,
        priority: "medium" as const,
        leadScore: 50,
        status: "new" as const,
        leadDetails: {
          propertyType: newLeadForm.propertyType,
          budgetRange: newLeadForm.budget,
          preferredLocation: newLeadForm.location,
          leadNotes: newLeadForm.notes
        }
      };
      addLeadMutation.mutate(leadData);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields (name, email, source)",
        variant: "destructive",
      });
    }
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
              <Button size="sm" onClick={() => setShowAddCustomerDialog(true)}>
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
                              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <DialogTitle className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                          <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                          <h2 className="text-xl font-bold">{customer.name}</h2>
                                          <p className="text-sm text-gray-500">{customer.email}</p>
                                        </div>
                                      </DialogTitle>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {getStatusBadge(customer.status)}
                                      <Badge variant="outline">Score: {customer.leadScore}</Badge>
                                    </div>
                                  </div>
                                  <DialogDescription>
                                    Complete customer relationship overview with all connected data
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedCustomer && (
                                  <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">{selectedCustomer.orders.length}</div>
                                        <div className="text-sm text-gray-600">Total Orders</div>
                                      </div>
                                      <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">₹{selectedCustomer.totalSpent.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Spent</div>
                                      </div>
                                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-600">{selectedCustomer.bookings.length}</div>
                                        <div className="text-sm text-gray-600">Site Visits</div>
                                      </div>
                                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-orange-600">{selectedCustomer.leads.length}</div>
                                        <div className="text-sm text-gray-600">Lead Activities</div>
                                      </div>
                                    </div>

                                    <Tabs defaultValue="overview" className="w-full">
                                      <TabsList className="grid w-full grid-cols-7">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="reports">Reports</TabsTrigger>
                                        <TabsTrigger value="orders">Orders</TabsTrigger>
                                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                                        <TabsTrigger value="schedules">Schedules</TabsTrigger>
                                        <TabsTrigger value="communications">Communications</TabsTrigger>
                                        <TabsTrigger value="notes">Notes</TabsTrigger>
                                      </TabsList>

                                      {/* Overview Tab */}
                                      <TabsContent value="overview" className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          {/* Contact & Personal Info */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center">
                                                <User className="h-5 w-5 mr-2" />
                                                Contact Information
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Email:</span>
                                                <span className="font-medium">{selectedCustomer.email}</span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Phone:</span>
                                                <span className="font-medium">{selectedCustomer.phone}</span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Source:</span>
                                                <Badge variant="outline">{selectedCustomer.source}</Badge>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Last Activity:</span>
                                                <span className="text-sm">{format(new Date(selectedCustomer.lastActivity), 'MMM dd, yyyy')}</span>
                                              </div>
                                              <div className="pt-2">
                                                <div className="flex justify-between items-center mb-2">
                                                  <span className="text-sm text-gray-600">Lead Score:</span>
                                                  <span className="font-medium">{selectedCustomer.leadScore}/100</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                  <div 
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${selectedCustomer.leadScore}%` }}
                                                  ></div>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Property Interests */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center">
                                                <Building className="h-5 w-5 mr-2" />
                                                Property Interests
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              {selectedCustomer.interestedProperties.length > 0 ? (
                                                <div className="space-y-2">
                                                  {selectedCustomer.interestedProperties.map((property, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                      <span className="text-sm font-medium">{property}</span>
                                                      <Badge variant="secondary" size="sm">Interested</Badge>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-gray-500">No property interests recorded</p>
                                              )}
                                            </CardContent>
                                          </Card>
                                        </div>

                                        {/* Recent Activities Timeline */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center">
                                              <Activity className="h-5 w-5 mr-2" />
                                              Recent Activities Timeline
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-4">
                                              {/* Combine all activities */}
                                              {[
                                                ...selectedCustomer.orders.map(order => ({
                                                  type: 'order',
                                                  date: order.createdAt,
                                                  description: `Ordered ${order.reportType}`,
                                                  amount: order.amount,
                                                  status: order.status
                                                })),
                                                ...selectedCustomer.bookings.map(booking => ({
                                                  type: 'booking',
                                                  date: booking.createdAt,
                                                  description: `Site visit booked for ${booking.propertyName}`,
                                                  status: booking.status
                                                })),
                                                ...selectedCustomer.leads.map(lead => ({
                                                  type: 'lead',
                                                  date: lead.createdAt,
                                                  description: `Lead from ${lead.source}`,
                                                  status: lead.status
                                                }))
                                              ]
                                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                              .slice(0, 10)
                                              .map((activity, idx) => (
                                                <div key={idx} className="flex items-start space-x-3">
                                                  <div className={`w-3 h-3 rounded-full mt-2 ${
                                                    activity.type === 'order' ? 'bg-green-500' :
                                                    activity.type === 'booking' ? 'bg-blue-500' : 'bg-purple-500'
                                                  }`}></div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                      <p className="text-sm font-medium">{activity.description}</p>
                                                      <span className="text-xs text-gray-500">{format(new Date(activity.date), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                      <Badge 
                                                        variant="outline" 
                                                        size="sm"
                                                        className={
                                                          activity.type === 'order' ? 'bg-green-50 text-green-700' :
                                                          activity.type === 'booking' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                                        }
                                                      >
                                                        {activity.type}
                                                      </Badge>
                                                      {activity.amount && (
                                                        <span className="text-sm font-medium text-green-600">₹{parseFloat(activity.amount).toLocaleString()}</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      {/* Reports Tab */}
                                      <TabsContent value="reports" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                              <span className="flex items-center">
                                                <FileText className="h-5 w-5 mr-2" />
                                                Property Reports ({selectedCustomer.orders.length})
                                              </span>
                                              <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Generate Report
                                              </Button>
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            {selectedCustomer.orders.length > 0 ? (
                                              <div className="space-y-3">
                                                {selectedCustomer.orders.map((order, idx) => (
                                                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                      </div>
                                                      <div>
                                                        <h4 className="font-medium">{order.reportType || 'CIVIL+MEP Report'}</h4>
                                                        <p className="text-sm text-gray-500">
                                                          {format(new Date(order.createdAt), 'MMM dd, yyyy')} • ₹{parseFloat(order.amount).toLocaleString()}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <Badge 
                                                        variant={order.status === 'completed' ? 'default' : 'secondary'}
                                                        className={order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                                      >
                                                        {order.status}
                                                      </Badge>
                                                      <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4" />
                                                      </Button>
                                                      <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p>No reports generated yet</p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      {/* Orders Tab */}
                                      <TabsContent value="orders" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                              <span className="flex items-center">
                                                <ShoppingCart className="h-5 w-5 mr-2" />
                                                Order History (₹{selectedCustomer.totalSpent.toLocaleString()})
                                              </span>
                                              <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                New Order
                                              </Button>
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            {selectedCustomer.orders.length > 0 ? (
                                              <Table>
                                                <TableHeader>
                                                  <TableRow>
                                                    <TableHead>Order ID</TableHead>
                                                    <TableHead>Service</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Payment Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {selectedCustomer.orders.map((order, idx) => (
                                                    <TableRow key={idx}>
                                                      <TableCell className="font-medium">#{order.id || `ORD-${idx + 1}`}</TableCell>
                                                      <TableCell>{order.reportType || 'CIVIL+MEP Report'}</TableCell>
                                                      <TableCell>₹{parseFloat(order.amount).toLocaleString()}</TableCell>
                                                      <TableCell>
                                                        <Badge 
                                                          variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                                                          className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                                        >
                                                          {order.paymentStatus}
                                                        </Badge>
                                                      </TableCell>
                                                      <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                                                      <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                          <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                          </Button>
                                                          <Button variant="ghost" size="sm">
                                                            <Download className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p>No orders placed yet</p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      {/* Bookings Tab */}
                                      <TabsContent value="bookings" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                              <span className="flex items-center">
                                                <Calendar className="h-5 w-5 mr-2" />
                                                Site Visits & Bookings ({selectedCustomer.bookings.length})
                                              </span>
                                              <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Schedule Visit
                                              </Button>
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            {selectedCustomer.bookings.length > 0 ? (
                                              <div className="space-y-3">
                                                {selectedCustomer.bookings.map((booking, idx) => (
                                                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <MapPin className="h-5 w-5 text-green-600" />
                                                      </div>
                                                      <div>
                                                        <h4 className="font-medium">{booking.propertyName}</h4>
                                                        <p className="text-sm text-gray-500">
                                                          {booking.bookingType} • {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <Badge 
                                                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                                        className={
                                                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                          'bg-red-100 text-red-800'
                                                        }
                                                      >
                                                        {booking.status}
                                                      </Badge>
                                                      <Button variant="ghost" size="sm">
                                                        <Calendar className="h-4 w-4" />
                                                      </Button>
                                                      <Button variant="ghost" size="sm">
                                                        <Phone className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-8 text-gray-500">
                                                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p>No site visits scheduled</p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      {/* Schedules Tab */}
                                      <TabsContent value="schedules" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                              <span className="flex items-center">
                                                <Clock className="h-5 w-5 mr-2" />
                                                Upcoming Schedules & Follow-ups
                                              </span>
                                              <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Schedule
                                              </Button>
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-3">
                                              {/* Mock upcoming schedules */}
                                              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                                                <div className="flex items-center space-x-3">
                                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Phone className="h-5 w-5 text-blue-600" />
                                                  </div>
                                                  <div>
                                                    <h4 className="font-medium">Follow-up Call</h4>
                                                    <p className="text-sm text-gray-500">Discuss property valuation report feedback</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-sm font-medium">Tomorrow, 2:00 PM</p>
                                                  <Badge variant="outline" size="sm">High Priority</Badge>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <MessageSquare className="h-5 w-5 text-green-600" />
                                                  </div>
                                                  <div>
                                                    <h4 className="font-medium">Send Property Updates</h4>
                                                    <p className="text-sm text-gray-500">Weekly property matches based on preferences</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-sm font-medium">Every Friday</p>
                                                  <Badge variant="secondary" size="sm">Recurring</Badge>
                                                </div>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      {/* Communications Tab */}
                                      <TabsContent value="communications" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                              <span className="flex items-center">
                                                <MessageSquare className="h-5 w-5 mr-2" />
                                                Communication History
                                              </span>
                                              <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="sm">
                                                  <Phone className="h-4 w-4 mr-2" />
                                                  Call
                                                </Button>
                                                <Button size="sm">
                                                  <Send className="h-4 w-4 mr-2" />
                                                  Email
                                                </Button>
                                              </div>
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-4">
                                              {/* Mock communication history */}
                                              {[
                                                { type: 'email', subject: 'Property Valuation Report Ready', date: '2024-01-15', status: 'sent' },
                                                { type: 'call', subject: 'Follow-up on site visit', date: '2024-01-12', status: 'completed', duration: '12 min' },
                                                { type: 'sms', subject: 'Reminder: Site visit tomorrow', date: '2024-01-10', status: 'delivered' },
                                                { type: 'email', subject: 'Welcome to OwnItRight', date: '2024-01-05', status: 'opened' },
                                              ].map((comm, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-3 border rounded-lg">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    comm.type === 'email' ? 'bg-blue-100' :
                                                    comm.type === 'call' ? 'bg-green-100' : 'bg-purple-100'
                                                  }`}>
                                                    {comm.type === 'email' ? <Mail className="h-4 w-4 text-blue-600" /> :
                                                     comm.type === 'call' ? <Phone className="h-4 w-4 text-green-600" /> :
                                                     <MessageSquare className="h-4 w-4 text-purple-600" />}
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                      <h4 className="font-medium">{comm.subject}</h4>
                                                      <span className="text-xs text-gray-500">{format(new Date(comm.date), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                      <Badge variant="outline" size="sm">{comm.type}</Badge>
                                                      <Badge variant="secondary" size="sm">{comm.status}</Badge>
                                                      {comm.duration && <span className="text-xs text-gray-500">{comm.duration}</span>}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      {/* Notes Tab */}
                                      <TabsContent value="notes" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center">
                                              <FileText className="h-5 w-5 mr-2" />
                                              Customer Notes & Internal Comments
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-4">
                                              <div className="flex space-x-2">
                                                <Textarea 
                                                  placeholder="Add a note about this customer..."
                                                  value={newNote}
                                                  onChange={(e) => setNewNote(e.target.value)}
                                                  className="flex-1"
                                                />
                                                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                                  <Plus className="h-4 w-4 mr-2" />
                                                  Add Note
                                                </Button>
                                              </div>
                                              
                                              {selectedCustomer.notes && selectedCustomer.notes.length > 0 ? (
                                                <div className="space-y-3">
                                                  {selectedCustomer.notes.map((note, idx) => (
                                                    <div key={idx} className="p-4 border rounded-lg">
                                                      <div className="flex items-start justify-between">
                                                        <p className="text-sm">{note.content}</p>
                                                        <Button variant="ghost" size="sm">
                                                          <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                      </div>
                                                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                                        <span className="text-xs text-gray-500">
                                                          {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                        <Badge variant="outline" size="sm">Admin</Badge>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                  <p>No notes added yet</p>
                                                </div>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                    </Tabs>
                                  </div>
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

          {/* Lead Management Tab */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              {/* Lead Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {filteredCustomers.reduce((sum, c) => sum + c.leads.length, 0)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                        <p className="text-2xl font-bold text-red-600">{stats?.hotLeads || 0}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats?.totalCustomers ? Math.round((stats.convertedCustomers / stats.totalCustomers) * 100) : 0}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Lead Score</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {Math.round(filteredCustomers.reduce((sum, c) => sum + c.leadScore, 0) / (filteredCustomers.length || 1))}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Funnel Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Lead Conversion Funnel
                  </CardTitle>
                  <CardDescription>
                    Visual representation of lead progression through qualification stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: "Cold Leads", count: filteredCustomers.filter(c => c.status === "cold").length, color: "bg-blue-500" },
                      { stage: "Warm Leads", count: filteredCustomers.filter(c => c.status === "warm").length, color: "bg-yellow-500" },
                      { stage: "Hot Leads", count: filteredCustomers.filter(c => c.status === "hot").length, color: "bg-red-500" },
                      { stage: "Converted", count: filteredCustomers.filter(c => c.status === "converted").length, color: "bg-green-500" },
                    ].map((stage) => (
                      <div key={stage.stage} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium">{stage.stage}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${stage.color} transition-all duration-500`}
                            style={{ 
                              width: `${filteredCustomers.length ? (stage.count / filteredCustomers.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm font-medium text-right">{stage.count}</div>
                        <div className="w-12 text-xs text-gray-500">
                          {filteredCustomers.length ? Math.round((stage.count / filteredCustomers.length) * 100) : 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Scoring & Qualification */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Lead Scoring Rules
                    </CardTitle>
                    <CardDescription>
                      Configure automatic lead scoring criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Property Interest</div>
                          <div className="text-sm text-gray-600">Viewed 3+ properties</div>
                        </div>
                        <Badge variant="secondary">+15 points</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Site Visit Booked</div>
                          <div className="text-sm text-gray-600">Scheduled property visit</div>
                        </div>
                        <Badge variant="secondary">+25 points</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Budget Confirmed</div>
                          <div className="text-sm text-gray-600">Provided budget range</div>
                        </div>
                        <Badge variant="secondary">+20 points</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Report Ordered</div>
                          <div className="text-sm text-gray-600">Requested valuation/MEP report</div>
                        </div>
                        <Badge variant="secondary">+30 points</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Scoring Rules
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Lead Qualification
                    </CardTitle>
                    <CardDescription>
                      Qualification criteria and automation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Budget Qualification</div>
                          <div className="text-sm text-gray-600">Min ₹50L budget confirmed</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Timeline Qualification</div>
                          <div className="text-sm text-gray-600">Purchase timeline ≤ 6 months</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Authority Qualification</div>
                          <div className="text-sm text-gray-600">Decision maker identified</div>
                        </div>
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Need Qualification</div>
                          <div className="text-sm text-gray-600">Specific requirements defined</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Update BANT Criteria
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Management Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Lead Pipeline Management
                      </CardTitle>
                      <CardDescription>
                        Comprehensive lead tracking and nurturing workflow
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Leads
                      </Button>
                      <Button size="sm" onClick={() => setShowAddLeadDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lead
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead Details</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Activities</TableHead>
                        <TableHead>Next Action</TableHead>
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
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    customer.leadScore >= 80 ? 'bg-green-600' :
                                    customer.leadScore >= 60 ? 'bg-yellow-600' :
                                    customer.leadScore >= 40 ? 'bg-orange-600' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${customer.leadScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{customer.leadScore}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <span className="text-sm">{customer.source}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {customer.leads.length} leads
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {customer.bookings.length} visits
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {customer.orders.length} orders
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {customer.status === "hot" ? "Schedule follow-up call" :
                               customer.status === "warm" ? "Send property recommendations" :
                               customer.status === "cold" ? "Nurture with content" :
                               customer.status === "converted" ? "Post-sale support" :
                               "Re-engagement campaign"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Lead Nurturing Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Lead Nurturing Campaigns
                  </CardTitle>
                  <CardDescription>
                    Automated nurturing sequences and campaign performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Property Discovery Series</h4>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Enrolled:</span>
                          <span className="font-medium">24 leads</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Open Rate:</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Click Rate:</span>
                          <span className="font-medium">24%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversions:</span>
                          <span className="font-medium text-green-600">3</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Re-engagement Campaign</h4>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Target:</span>
                          <span className="font-medium">18 cold leads</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span className="font-medium">Next Week</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">4 weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected ROI:</span>
                          <span className="font-medium text-blue-600">15%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">VIP Customer Journey</h4>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Enrolled:</span>
                          <span className="font-medium">8 leads</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Score:</span>
                          <span className="font-medium">85</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion:</span>
                          <span className="font-medium">62%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium text-green-600">₹18L</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <Button variant="outline">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Campaign Analytics
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}




                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-b">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const dayNumber = ((i - 2) % 31) + 1;
                      const hasBooking = [3, 7, 12, 15, 18, 22, 25, 28].includes(dayNumber);
                      return (
                        <div 
                          key={i} 
                          className={`p-2 text-center text-sm border cursor-pointer hover:bg-gray-50 ${
                            hasBooking ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="font-medium">{dayNumber > 0 ? dayNumber : ''}</div>
                          {hasBooking && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Management Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Booking Management
                      </CardTitle>
                      <CardDescription>
                        Comprehensive booking tracking and visit coordination
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Visit Type</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Team Member</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.flatMap((customer) => 
                        customer.bookings.map((booking, index) => (
                          <TableRow key={`${customer.id}-${index}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{booking.propertyName}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={booking.bookingType === "Site Visit" ? "default" : "secondary"}>
                                {booking.bookingType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                                </div>
                                <div className="text-sm text-gray-500">10:30 AM</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  booking.status === "confirmed" ? "default" :
                                  booking.status === "completed" ? "default" :
                                  booking.status === "pending" ? "secondary" : "destructive"
                                }
                                className={
                                  booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                                  booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                                  booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-blue-600" />
                                </div>
                                <span className="text-sm">Rajesh Kumar</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Team Performance & Visitor Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Team Performance
                    </CardTitle>
                    <CardDescription>
                      Site visit team productivity and customer satisfaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Rajesh Kumar", visits: 12, rating: 4.8, conversions: 4 },
                        { name: "Priya Sharma", visits: 8, rating: 4.9, conversions: 3 },
                        { name: "Amit Patel", visits: 15, rating: 4.6, conversions: 5 },
                        { name: "Sneha Reddy", visits: 10, rating: 4.7, conversions: 2 },
                      ].map((member) => (
                        <div key={member.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">
                                {member.visits} visits • ⭐ {member.rating}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">{member.conversions} conversions</div>
                            <div className="text-sm text-gray-500">
                              {Math.round((member.conversions / member.visits) * 100)}% rate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Visitor Analytics
                    </CardTitle>
                    <CardDescription>
                      Site visit trends and conversion insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">32</div>
                          <div className="text-sm text-gray-600">This Week</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">28%</div>
                          <div className="text-sm text-gray-600">Conversion</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Peak Hours</span>
                          <span className="text-sm font-medium">10 AM - 12 PM</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Visit Duration</span>
                          <span className="text-sm font-medium">45 minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">No-Show Rate</span>
                          <span className="text-sm font-medium text-red-600">8%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Reschedule Rate</span>
                          <span className="text-sm font-medium text-yellow-600">12%</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Popular Properties</h4>
                        <div className="space-y-2">
                          {[
                            { name: "Prestige High Fields", visits: 8 },
                            { name: "Brigade Eldorado", visits: 6 },
                            { name: "Sobha Neopolis", visits: 5 },
                          ].map((property) => (
                            <div key={property.name} className="flex justify-between text-sm">
                              <span className="text-gray-600">{property.name}</span>
                              <span className="font-medium">{property.visits} visits</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visit Scheduling Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Quick Scheduling Tools
                  </CardTitle>
                  <CardDescription>
                    Streamlined booking and scheduling utilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="text-center">
                        <div className="font-medium">Bulk Scheduling</div>
                        <div className="text-sm text-gray-500">Schedule multiple visits</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <Clock className="h-8 w-8 text-green-600" />
                      <div className="text-center">
                        <div className="font-medium">Auto-Reminders</div>
                        <div className="text-sm text-gray-500">SMS & email alerts</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <MapPin className="h-8 w-8 text-purple-600" />
                      <div className="text-center">
                        <div className="font-medium">Route Optimization</div>
                        <div className="text-sm text-gray-500">Plan visit routes</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Revenue Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{stats?.totalRevenue?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {filteredCustomers.reduce((sum, c) => sum + c.orders.length, 0)}
                        </p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{stats?.averageOrderValue?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                        <p className="text-2xl font-bold text-yellow-600">₹2.4L</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue and order volume analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: "Jan 2024", revenue: 45000, orders: 12, growth: "+15%" },
                      { month: "Feb 2024", revenue: 52000, orders: 14, growth: "+16%" },
                      { month: "Mar 2024", revenue: 48000, orders: 13, growth: "-8%" },
                      { month: "Apr 2024", revenue: 61000, orders: 16, growth: "+27%" },
                      { month: "May 2024", revenue: 58000, orders: 15, growth: "-5%" },
                      { month: "Jun 2024", revenue: 67000, orders: 18, growth: "+16%" },
                    ].map((data) => (
                      <div key={data.month} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="font-medium">{data.month}</div>
                          <div className="text-sm text-gray-500">{data.orders} orders</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="font-medium">₹{data.revenue.toLocaleString()}</div>
                          <Badge 
                            variant={data.growth.startsWith('+') ? 'default' : 'destructive'}
                            className={data.growth.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {data.growth}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Management Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Order Management
                      </CardTitle>
                      <CardDescription>
                        Track all customer orders and payment status
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Orders
                      </Button>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Order Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.flatMap((customer) => 
                        customer.orders.map((order, index) => (
                          <TableRow key={`${customer.id}-${index}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                CIVIL+MEP Report
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">₹{parseFloat(order.amount).toLocaleString()}</div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  order.paymentStatus === "paid" ? "default" :
                                  order.paymentStatus === "pending" ? "secondary" : "destructive"
                                }
                                className={
                                  order.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                                  order.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }
                              >
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(order.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">Property Analysis</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Revenue Analytics & Payment Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Revenue Breakdown
                    </CardTitle>
                    <CardDescription>
                      Revenue distribution by service type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { service: "Property Valuation Reports", revenue: 180000, percentage: 45, color: "bg-blue-500" },
                        { service: "CIVIL+MEP Reports", revenue: 140000, percentage: 35, color: "bg-green-500" },
                        { service: "Legal Due Diligence", revenue: 60000, percentage: 15, color: "bg-purple-500" },
                        { service: "Consultation Services", revenue: 20000, percentage: 5, color: "bg-yellow-500" },
                      ].map((item) => (
                        <div key={item.service} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.service}</span>
                            <span className="text-sm text-gray-500">{item.percentage}%</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">₹{item.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Payment Insights
                    </CardTitle>
                    <CardDescription>
                      Payment patterns and customer behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">92%</div>
                          <div className="text-sm text-gray-600">Payment Success Rate</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">3.2 days</div>
                          <div className="text-sm text-gray-600">Avg Payment Time</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">UPI Payments</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Net Banking</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Credit/Debit Cards</span>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Top Revenue Customers</h4>
                        <div className="space-y-2">
                          {[
                            { name: "Rajesh Kumar", amount: 45000 },
                            { name: "Priya Sharma", amount: 38000 },
                            { name: "Amit Patel", amount: 32000 },
                          ].map((customer) => (
                            <div key={customer.name} className="flex justify-between text-sm">
                              <span className="text-gray-600">{customer.name}</span>
                              <span className="font-medium">₹{customer.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Management Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Revenue Management Tools
                  </CardTitle>
                  <CardDescription>
                    Financial operations and revenue optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="text-center">
                        <div className="font-medium">Payment Reminders</div>
                        <div className="text-sm text-gray-500">Automated follow-ups</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="text-center">
                        <div className="font-medium">Invoice Generation</div>
                        <div className="text-sm text-gray-500">Bulk invoicing</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                      <div className="text-center">
                        <div className="font-medium">Revenue Forecasting</div>
                        <div className="text-sm text-gray-500">Predictive analytics</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                      <RefreshCw className="h-8 w-8 text-orange-600" />
                      <div className="text-center">
                        <div className="font-medium">Refund Management</div>
                        <div className="text-sm text-gray-500">Process refunds</div>
                      </div>
                    </Button>
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

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Add New Customer
            </DialogTitle>
            <DialogDescription>
              Add a new customer to your CRM system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Enter customer name"
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={newCustomerForm.email}
                onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone *</label>
              <Input
                placeholder="+91 98765 43210"
                value={newCustomerForm.phone}
                onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Source</label>
              <Select value={newCustomerForm.source} onValueChange={(value) => setNewCustomerForm({...newCustomerForm, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add any additional notes..."
                value={newCustomerForm.notes}
                onChange={(e) => setNewCustomerForm({...newCustomerForm, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} disabled={addCustomerMutation.isPending}>
              {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Add New Lead
            </DialogTitle>
            <DialogDescription>
              Create a new lead for lead management and nurturing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer Name *</label>
              <Input
                placeholder="Enter customer name"
                value={newLeadForm.customerName}
                onChange={(e) => setNewLeadForm({...newLeadForm, customerName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={newLeadForm.customerEmail}
                onChange={(e) => setNewLeadForm({...newLeadForm, customerEmail: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="+91 98765 43210"
                value={newLeadForm.customerPhone}
                onChange={(e) => setNewLeadForm({...newLeadForm, customerPhone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Source *</label>
              <Select value={newLeadForm.source} onValueChange={(value) => setNewLeadForm({...newLeadForm, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Budget Range</label>
              <Select value={newLeadForm.budget} onValueChange={(value) => setNewLeadForm({...newLeadForm, budget: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_50L">Under ₹50L</SelectItem>
                  <SelectItem value="50L_1Cr">₹50L - ₹1Cr</SelectItem>
                  <SelectItem value="1Cr_2Cr">₹1Cr - ₹2Cr</SelectItem>
                  <SelectItem value="2Cr_5Cr">₹2Cr - ₹5Cr</SelectItem>
                  <SelectItem value="above_5Cr">Above ₹5Cr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Property Type</label>
              <Select value={newLeadForm.propertyType} onValueChange={(value) => setNewLeadForm({...newLeadForm, propertyType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Preferred Location</label>
              <Input
                placeholder="e.g., Whitefield, HSR Layout"
                value={newLeadForm.location}
                onChange={(e) => setNewLeadForm({...newLeadForm, location: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add any additional lead notes..."
                value={newLeadForm.notes}
                onChange={(e) => setNewLeadForm({...newLeadForm, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddLeadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLead} disabled={addLeadMutation.isPending}>
              {addLeadMutation.isPending ? "Adding..." : "Add Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}