import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  TrendingUp, 
  DollarSign,
  Clock,
  User,
  UserPlus,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: ""
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

  const updateCustomerMutation = useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: typeof editForm }) => 
      apiRequest("PUT", `/api/customers/${customerId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/stats"] });
      setShowEditDialog(false);
      setEditingCustomer(null);
      toast({
        title: "Customer Updated",
        description: "Customer details have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: string) => 
      apiRequest("DELETE", `/api/customers/${customerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/stats"] });
      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleEditCustomer = (customer: CustomerProfile) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || ""
    });
    setShowEditDialog(true);
  };

  const handleDeleteCustomer = (customer: CustomerProfile) => {
    if (window.confirm(`Are you sure you want to delete "${customer.name}"? This will permanently delete all their data including leads, bookings, and orders. This action cannot be undone.`)) {
      deleteCustomerMutation.mutate(customer.id);
    }
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    updateCustomerMutation.mutate({
      customerId: editingCustomer.id,
      data: editForm
    });
  };

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

  // Sub-menu items for customer management (removed unwanted sections)
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
                        <TableHead>Source</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading customers...
                          </TableCell>
                        </TableRow>
                      ) : filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No customers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{customer.name}</p>
                                  <p className="text-sm text-gray-600">{customer.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(customer.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium">{customer.leadScore}</div>
                                <div className="w-12 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-blue-500 rounded-full" 
                                    style={{ width: `${customer.leadScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.source}</Badge>
                            </TableCell>
                            <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {customer.lastActivity ? format(new Date(customer.lastActivity), 'MMM d, yyyy') : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setShowCustomerDialog(true);
                                  }}
                                  data-testid={`button-view-customer-${customer.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCustomer(customer)}
                                  data-testid={`button-edit-customer-${customer.id}`}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCustomer(customer)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  data-testid={`button-delete-customer-${customer.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
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
            </div>
          )}

          {activeTab === "leads" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Lead Management
                  </CardTitle>
                  <CardDescription>
                    Advanced lead scoring, qualification, and conversion tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Lead management features will be displayed here...
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
                placeholder="+91 99999 99999"
                value={newCustomerForm.phone}
                onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Source</label>
              <Select value={newCustomerForm.source} onValueChange={(value) => setNewCustomerForm({...newCustomerForm, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="walk_in">Walk In</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional notes about the customer"
                value={newCustomerForm.notes}
                onChange={(e) => setNewCustomerForm({...newCustomerForm, notes: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomer} disabled={addCustomerMutation.isPending}>
                {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              Complete customer profile and interaction history
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedCustomer.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedCustomer.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lead Score</label>
                  <p className="text-lg font-medium mt-1">{selectedCustomer.leadScore}/100</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Spent</label>
                  <p className="text-lg font-medium mt-1">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Add Note</label>
                <div className="flex space-x-2 mt-1">
                  <Textarea
                    placeholder="Add a note about this customer..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Update Status</label>
                <div className="mt-1">
                  <Select 
                    value={selectedCustomer.status} 
                    onValueChange={(value) => handleStatusUpdate(selectedCustomer.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot Lead</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit2 className="h-5 w-5 mr-2" />
              Edit Customer
            </DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Customer name"
                data-testid="input-edit-customer-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="customer@email.com"
                data-testid="input-edit-customer-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="+91 9876543210"
                data-testid="input-edit-customer-phone"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateCustomer} 
                disabled={updateCustomerMutation.isPending}
                data-testid="button-save-customer-edit"
              >
                {updateCustomerMutation.isPending ? "Updating..." : "Update Customer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}