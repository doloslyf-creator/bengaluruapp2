import { useState } from "react";
import { Bell, Filter, Search, CheckCircle, Archive, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { NotificationBell } from "./NotificationBell";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "report" | "booking" | "payment" | "system";
  category: "property" | "report" | "booking" | "payment" | "lead" | "system" | "promotion";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  userId: string;
  userType?: "admin" | "user";
  className?: string;
}

const typeColors = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  report: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  booking: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

const priorityColors = {
  low: "border-l-gray-300",
  medium: "border-l-blue-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
};

export function NotificationCenter({ userId, userType = "user", className }: NotificationCenterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("all");
  
  const queryClient = useQueryClient();

  // Fetch notifications with filters
  const { data: notificationData, isLoading } = useQuery({
    queryKey: ["/api/notifications", userId, filterCategory, filterType, filterPriority, selectedTab],
    queryParams: {
      userId,
      limit: 50,
      unreadOnly: selectedTab === "unread",
      category: filterCategory !== "all" ? filterCategory : undefined,
      priority: filterPriority !== "all" ? filterPriority : undefined,
    },
    refetchInterval: 30000,
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  // Filter notifications by search term and type
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || notification.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        body: { userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Archive notification mutation
  const archiveMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest(`/api/notifications/${notificationId}/archive`, {
        method: "PATCH",
        body: { userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Notification Center</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationBell userId={userId} />
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="booking">Bookings</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="promotion">Promotions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterCategory !== "all" || filterType !== "all" || filterPriority !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-l-4",
                    priorityColors[notification.priority],
                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", typeColors[notification.type])}
                          >
                            {notification.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                          {notification.priority === "urgent" && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <h3 className={cn(
                          "text-base font-medium mb-1",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.actionText && (
                            <span className="text-primary font-medium">
                              {notification.actionText}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notification.id);
                            }}
                            disabled={markAsReadMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate(notification.id);
                          }}
                          disabled={archiveMutation.isPending}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}