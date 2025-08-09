import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, Phone, Mail, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Filter, Wrench, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

interface ReportPayment {
  id: string;
  reportId: string;
  reportType: string;
  propertyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  payLaterDueDate?: string;
  accessGrantedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderWithDetails extends ReportPayment {
  propertyName?: string;
  reportTitle?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingPayments: number;
  completedPayments: number;
  totalRevenue: number;
  overduePayments: number;
}

export default function Orders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const { data: stats } = useQuery<OrderStats>({
    queryKey: ["/api/orders/stats"],
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      apiRequest("PATCH", `/api/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/stats"] });
      toast({
        title: "Order Updated",
        description: "Payment status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === "all" || order.paymentStatus === statusFilter;
    const serviceMatch = serviceFilter === "all" || order.reportType === serviceFilter;
    return statusMatch && serviceMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "processing":
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case "pay-later-pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pay Later</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "refunded":
        return <Badge className="bg-purple-100 text-purple-800"><XCircle className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updatePaymentStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <AdminLayout title="Orders">
      <div className="p-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedPayments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overduePayments}</div>
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
            </div>
          )}

          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="civil-mep">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span>CIVIL+MEP Reports</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="property-valuation">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-emerald-600" />
                      <span>Property Valuation</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Status Filter moved to Tabs below */}
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
                <TabsTrigger value="pay-later-pending">Pay Later</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="refunded">Refunded</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                All report orders with payment tracking ({filteredOrders.length} {serviceFilter === 'all' ? 'total' : serviceFilter === 'civil-mep' ? 'CIVIL+MEP' : 'property valuation'} orders)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <DollarSign className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">
                    {statusFilter === "all" ? "No orders have been placed yet" : `No ${statusFilter} orders found`}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(-8)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {order.reportType === 'civil-mep' ? (
                              <>
                                <Wrench className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">CIVIL+MEP</span>
                              </>
                            ) : order.reportType === 'property-valuation' ? (
                              <>
                                <Calculator className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-medium">Valuation</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">Unknown</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.propertyName || "Unknown Property"}</div>
                        </TableCell>
                        <TableCell>₹{parseFloat(order.amount).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell>
                          {order.payLaterDueDate ? format(new Date(order.payLaterDueDate), "MMM dd, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                                <DialogDescription>
                                  Order ID: {order.id}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Customer Information */}
                                  <div>
                                    <h4 className="font-medium mb-3">Customer Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <div className="font-medium">{selectedOrder.customerName}</div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{selectedOrder.customerEmail}</span>
                                      </div>
                                      {selectedOrder.customerPhone && (
                                        <div className="flex items-center space-x-2">
                                          <Phone className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm">{selectedOrder.customerPhone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Property Information */}
                                  <div>
                                    <h4 className="font-medium mb-3">Property Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-sm text-gray-500">Property Name:</span>
                                        <div className="font-medium">{selectedOrder.propertyName || "Unknown Property"}</div>
                                      </div>
                                      <div>
                                        <span className="text-sm text-gray-500">Report Type:</span>
                                        <div className="font-medium">
                                          {selectedOrder.reportType === 'civil-mep' ? 'CIVIL+MEP Report' : 
                                           selectedOrder.reportType === 'property-valuation' ? 'Property Valuation Report' : 
                                           'Unknown Report'}
                                        </div>
                                      </div>
                                      {selectedOrder.reportTitle && (
                                        <div className="col-span-2">
                                          <span className="text-sm text-gray-500">Report Title:</span>
                                          <div className="font-medium">{selectedOrder.reportTitle}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div>
                                    <h4 className="font-medium mb-3">Payment Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-sm text-gray-500">Amount:</span>
                                        <div className="font-medium">₹{parseFloat(selectedOrder.amount).toLocaleString()}</div>
                                      </div>
                                      <div>
                                        <span className="text-sm text-gray-500">Payment Method:</span>
                                        <div className="font-medium">{selectedOrder.paymentMethod}</div>
                                      </div>
                                      <div>
                                        <span className="text-sm text-gray-500">Status:</span>
                                        <div className="mt-1">{getStatusBadge(selectedOrder.paymentStatus)}</div>
                                      </div>
                                      {selectedOrder.payLaterDueDate && (
                                        <div>
                                          <span className="text-sm text-gray-500">Due Date:</span>
                                          <div className="font-medium flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(selectedOrder.payLaterDueDate), "MMM dd, yyyy")}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Update Actions */}
                                  {["pending", "processing", "pay-later-pending", "overdue", "failed"].includes(selectedOrder.paymentStatus) && (
                                    <div>
                                      <h4 className="font-medium mb-3">Update Payment Status</h4>
                                      <div className="flex space-x-2">
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "completed")}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Mark as Paid
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "overdue")}
                                          className={selectedOrder.paymentStatus === "overdue" ? "hidden" : ""}
                                        >
                                          Mark as Overdue
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "failed")}
                                          className={selectedOrder.paymentStatus === "failed" ? "hidden" : ""}
                                        >
                                          Mark as Failed
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "refunded")}
                                          className={selectedOrder.paymentStatus === "refunded" ? "hidden" : ""}
                                        >
                                          Mark as Refunded
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
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
      </div>
    </AdminLayout>
  );
}