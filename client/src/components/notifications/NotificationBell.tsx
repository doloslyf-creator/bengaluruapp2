import { useState, useEffect } from "react";
import { Bell, X, CheckCheck, Archive, Clock, AlertCircle, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

interface NotificationBellProps {
  userId: string;
  className?: string;
}

const getNotificationIcon = (type: string, priority: string) => {
  const iconClass = cn(
    "h-4 w-4 shrink-0",
    priority === "urgent" && "text-red-500",
    priority === "high" && "text-orange-500",
    priority === "medium" && "text-blue-500",
    priority === "low" && "text-gray-500"
  );

  switch (type) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
    case "error":
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    case "report":
      return <Clock className={iconClass} />;
    case "booking":
      return <CheckCircle className={iconClass} />;
    case "payment":
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    default:
      return <Info className={iconClass} />;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationData, isLoading } = useQuery({
    queryKey: ["/api/notifications", userId],
    queryParams: {
      userId,
      limit: 20,
      unreadOnly: false,
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        body: { userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/notifications/mark-all-read", {
        method: "PATCH",
        body: { userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleArchive = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    archiveMutation.mutate(notificationId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative",
                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type, notification.priority)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleArchive(e, notification.id)}
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.actionText && (
                          <span className="text-xs text-primary font-medium">
                            {notification.actionText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" size="sm">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}