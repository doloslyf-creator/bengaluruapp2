import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, User, Phone, Mail, MapPin, Edit, Check, X, AlertCircle, Filter, Plus, Eye, Trash2 } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "rescheduled", "completed", "cancelled", "no-show"]),
  confirmedDate: z.string().optional(),
  confirmedTime: z.string().optional(),
  assignedTo: z.string().optional(),
  meetingPoint: z.string().optional(),
  staffNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  cancelReason: z.string().optional(),
});

type UpdateBookingForm = z.infer<typeof updateBookingSchema>;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  rescheduled: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
};

export default function AdminBookings() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Fetch booking statistics
  const { data: stats } = useQuery<{
    totalBookings: string;
    pendingBookings: string;
    confirmedBookings: string;
    completedBookings: string;
    conversionRate: number;
  }>({
    queryKey: ["/api/bookings/stats"],
  });

  // Fetch booking staff
  const { data: staff = [] } = useQuery<Array<{id: string; name: string; role: string}>>({
    queryKey: ["/api/booking-staff"],
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to delete booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/stats"] });
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UpdateBookingForm> }) => {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/stats"] });
      setIsEditDialogOpen(false);
      setSelectedBooking(null);
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const form = useForm<UpdateBookingForm>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      status: "pending",
      confirmedDate: "",
      confirmedTime: "",
      assignedTo: "",
      meetingPoint: "",
      staffNotes: "",
      customerNotes: "",
      cancelReason: "",
    },
  });

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking);
    form.reset({
      status: booking.status,
      confirmedDate: booking.confirmedDate || "",
      confirmedTime: booking.confirmedTime || "",
      assignedTo: booking.assignedTo || "",
      meetingPoint: booking.meetingPoint || "",
      staffNotes: booking.staffNotes || "",
      customerNotes: booking.customerNotes || "",
      cancelReason: booking.cancelReason || "",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: UpdateBookingForm) => {
    if (!selectedBooking) return;
    
    const updateData = { ...data };
    
    // Remove empty strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateBookingForm] === "") {
        delete updateData[key as keyof UpdateBookingForm];
      }
    });

    updateBookingMutation.mutate({
      id: selectedBooking.id,
      data: updateData,
    });
  };

  const quickStatusUpdate = (bookingId: string, status: "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no-show", notes?: string) => {
    updateBookingMutation.mutate({
      id: bookingId,
      data: { status, ...(notes && { cancelReason: notes }) },
    });
  };

  const handleDeleteBooking = (bookingId: string, customerName: string) => {
    if (confirm(`Are you sure you want to delete the booking for ${customerName}? This action cannot be undone.`)) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  // Filter bookings
  const filteredBookings = (bookings as any[]).filter((booking: any) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch = !searchQuery || 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.includes(searchQuery) ||
      booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.propertyName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-600">Error loading bookings</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-bookings">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="bookings-title">Site Visit Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and track property site visit bookings</p>
        </div>
        <Button 
          data-testid="button-create-booking"
          onClick={() => {
            // For now, redirect to the booking form page
            window.location.href = '/book-visit';
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Manual Booking
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-bookings">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-pending-bookings">{stats.pendingBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="stat-confirmed-bookings">{stats.confirmedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-completed-bookings">{stats.completedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600" data-testid="stat-conversion-rate">{stats.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by customer name, phone, email, or property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
          data-testid="input-search"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">No bookings match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking: any) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow" data-testid={`booking-card-${booking.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold" data-testid={`booking-customer-${booking.id}`}>
                          {booking.customerName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {booking.customerPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {booking.customerEmail}
                          </span>
                        </div>
                      </div>
                      <Badge className={statusColors[booking.status] || "bg-gray-100 text-gray-800"} data-testid={`booking-status-${booking.id}`}>
                        {booking.status.replace("-", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Property</div>
                        <div className="text-sm text-gray-600" data-testid={`booking-property-${booking.id}`}>
                          {booking.propertyName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">{booking.propertyArea}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Visit Type</div>
                        <div className="text-sm text-gray-600 capitalize" data-testid={`booking-visit-type-${booking.id}`}>
                          {booking.visitType?.replace("-", " ") || "Site Visit"}
                        </div>
                        <div className="text-xs text-gray-500">{booking.numberOfVisitors} visitors</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Preferred Date & Time</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {booking.preferredDate || "Not set"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.preferredTime || "Not set"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Assigned Staff</div>
                        <div className="text-sm text-gray-600" data-testid={`booking-assigned-${booking.id}`}>
                          {booking.assignedTo || "Not assigned"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.confirmedDate && (
                            <>Confirmed: {booking.confirmedDate} {booking.confirmedTime}</>
                          )}
                        </div>
                      </div>
                    </div>

                    {(booking.specialRequests || booking.staffNotes) && (
                      <div className="space-y-2">
                        {booking.specialRequests && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Special Requests</div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {booking.specialRequests}
                            </div>
                          </div>
                        )}
                        {booking.staffNotes && (
                          <div>
                            <div className="text-sm font-medium text-gray-700">Staff Notes</div>
                            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                              {booking.staffNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => quickStatusUpdate(booking.id, "confirmed")}
                          data-testid={`button-confirm-${booking.id}`}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => quickStatusUpdate(booking.id, "cancelled", "Cancelled by admin")}
                          data-testid={`button-cancel-${booking.id}`}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => quickStatusUpdate(booking.id, "completed")}
                        data-testid={`button-complete-${booking.id}`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditBooking(booking)}
                      data-testid={`button-edit-${booking.id}`}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBooking(booking.id, booking.customerName)}
                      disabled={deleteBookingMutation.isPending}
                      data-testid={`button-delete-${booking.id}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-edit-booking">
          <DialogHeader>
            <DialogTitle>Edit Booking - {selectedBooking?.customerName}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="rescheduled">Rescheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Staff</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-assigned-staff">
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staff.map((member: any) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="confirmedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmed Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-confirmed-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmed Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-confirmed-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="meetingPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Point</FormLabel>
                    <FormControl>
                      <Input placeholder="Where to meet the customer..." {...field} data-testid="input-meeting-point" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Internal notes for staff..." {...field} data-testid="textarea-staff-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes from customer interaction..." {...field} data-testid="textarea-customer-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("status") === "cancelled" && (
                <FormField
                  control={form.control}
                  name="cancelReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Reason</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Reason for cancellation..." {...field} data-testid="textarea-cancel-reason" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateBookingMutation.isPending}
                  data-testid="button-save-booking"
                >
                  {updateBookingMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}