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
  AlertCircle
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

  return (
    <AdminLayout title="Customer Management">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Customer CRM</h2>
              <p className="text-sm text-gray-600">Manage customer relationships and track interactions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.hotLeads}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Converted</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.convertedCustomers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.avgOrderValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>
                Unified view of all customer interactions and touchpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading customers...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <User className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-600">
                    {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Customers will appear here as they interact with your properties"}
                  </p>
                </div>
              ) : (
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
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${customer.leadScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{customer.leadScore}/100</span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(customer.lastActivity), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Dialog open={showCustomerDialog && selectedCustomer?.id === customer.id} onOpenChange={(open) => {
                            setShowCustomerDialog(open);
                            if (open) setSelectedCustomer(customer);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <User className="h-5 w-5" />
                                  <span>{customer.name}</span>
                                  {getStatusBadge(customer.status)}
                                </DialogTitle>
                                <DialogDescription>
                                  Complete customer profile and interaction history
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedCustomer && (
                                <Tabs defaultValue="overview" className="w-full">
                                  <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="leads">Leads</TabsTrigger>
                                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                                    <TabsTrigger value="orders">Orders</TabsTrigger>
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-sm">Contact Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span>{selectedCustomer.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{selectedCustomer.phone}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                      
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-sm">Customer Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div>Lead Score: {selectedCustomer.leadScore}/100</div>
                                          <div>Total Orders: {selectedCustomer.totalOrders}</div>
                                          <div>Total Spent: ₹{selectedCustomer.totalSpent.toLocaleString()}</div>
                                          <div>Source: {selectedCustomer.source}</div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                    
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Update Status</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Select 
                                          value={selectedCustomer.status} 
                                          onValueChange={(value) => handleStatusUpdate(selectedCustomer.id, value)}
                                        >
                                          <SelectTrigger className="w-48">
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
                                      </CardContent>
                                    </Card>
                                  </TabsContent>
                                  
                                  <TabsContent value="leads">
                                    <div className="space-y-2">
                                      {selectedCustomer.leads.map((lead, index) => (
                                        <Card key={index}>
                                          <CardContent className="pt-4">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="font-medium">{lead.leadType} Lead</div>
                                                <div className="text-sm text-gray-500">Source: {lead.source}</div>
                                                <div className="text-sm text-gray-500">Score: {lead.leadScore}/100</div>
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="bookings">
                                    <div className="space-y-2">
                                      {selectedCustomer.bookings.map((booking, index) => (
                                        <Card key={index}>
                                          <CardContent className="pt-4">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="font-medium">{booking.bookingType}</div>
                                                <div className="text-sm text-gray-500">Property: {booking.propertyName}</div>
                                                <div className="text-sm text-gray-500">Status: {booking.status}</div>
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="orders">
                                    <div className="space-y-2">
                                      {selectedCustomer.orders.map((order, index) => (
                                        <Card key={index}>
                                          <CardContent className="pt-4">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="font-medium">CIVIL+MEP Report</div>
                                                <div className="text-sm text-gray-500">Amount: ₹{parseFloat(order.amount).toLocaleString()}</div>
                                                <div className="text-sm text-gray-500">Status: {order.paymentStatus}</div>
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="notes">
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Textarea
                                          placeholder="Add a note about this customer..."
                                          value={newNote}
                                          onChange={(e) => setNewNote(e.target.value)}
                                        />
                                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Add Note
                                        </Button>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {selectedCustomer.notes.map((note, index) => (
                                          <Card key={index}>
                                            <CardContent className="pt-4">
                                              <div className="text-sm">{note.content}</div>
                                              <div className="text-xs text-gray-500 mt-2">
                                                {format(new Date(note.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                                              </div>
                                            </CardContent>
                                          </Card>
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
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminLayout>
  );
}