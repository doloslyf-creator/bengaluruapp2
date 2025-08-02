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
                      <Button size="sm">
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