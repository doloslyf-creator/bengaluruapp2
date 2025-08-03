import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Building,
  Calendar,
  FileText,
  Settings,
  Bell,
  User,
  Home,
  BookOpen,
  TrendingUp,
  MapPin,
  CreditCard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Phone,
  Mail,
  Search,
  Filter,
  ChevronRight,
  Heart,
  Eye,
  IndianRupee
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/hooks/useUserAuth";
import { UserAuthForm } from "@/components/auth/UserAuthForm";
import { type Property, type Booking, type Lead, type PropertyValuationReport, type CivilMepReport } from "@shared/schema";

// Helper function to get user display data
const getUserDisplayData = (user: any) => ({
  id: user.id,
  name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
  email: user.email || "",
  phone: user.user_metadata?.phone || "",
  avatar: user.user_metadata?.avatar_url || "",
  memberSince: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  location: user.user_metadata?.location || "",
  preferredBudget: user.user_metadata?.preferred_budget || "",
});

interface UserStats {
  totalProperties: number;
  totalBookings: number;
  totalReports: number;
  totalConsultations: number;
  totalSpent: number;
  recentActivity: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  count?: number;
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user, loading, signOut } = useUserAuth();
  const queryClient = useQueryClient();

  // Dynamic data queries - always call hooks before early returns
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: !!user,
  });

  const { data: valuationReports = [], isLoading: reportsLoading } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
    enabled: !!user,
  });

  const { data: civilMepReports = [], isLoading: civilReportsLoading } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
    enabled: !!user,
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <UserAuthForm />;
  }

  // Get current user display data
  const currentUser = getUserDisplayData(user);

  // Calculate dynamic user stats
  const userStats: UserStats = {
    totalProperties: properties.length,
    totalBookings: bookings.length,
    totalReports: valuationReports.length + civilMepReports.length,
    totalConsultations: leads.filter(lead => lead.status === 'qualified').length,
    totalSpent: [...valuationReports, ...civilMepReports].reduce((sum, report) => {
      return sum + ((report as any).price || 0);
    }, 0),
    recentActivity: leads.filter(lead => {
      if (!lead.createdAt) return false;
      const createdDate = new Date(lead.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length,
  };

  // Dynamic quick actions with real counts
  const quickActions: QuickAction[] = [
    {
      id: "find-property",
      title: "Find Properties",
      description: "Discover curated properties",
      icon: Building,
      href: "/find-property",
      color: "bg-blue-500",
      count: properties.length,
    },
    {
      id: "book-visit",
      title: "Book Site Visit",
      description: "Schedule property visits",
      icon: Calendar,
      href: "/book-visit",
      color: "bg-green-500",
      count: bookings.length,
    },
    {
      id: "valuation-report",
      title: "Valuation Report",
      description: "Get property valuation",
      icon: FileText,
      href: "/property-valuation",
      color: "bg-purple-500",
      count: valuationReports.length,
    },
    {
      id: "civil-mep",
      title: "CIVIL+MEP Report",
      description: "Engineering assessments",
      icon: BookOpen,
      href: "/civil-mep-reports",
      color: "bg-orange-500",
      count: civilMepReports.length,
    },
    {
      id: "legal-tracker",
      title: "Legal Tracker",
      description: "Due diligence tracking",
      icon: TrendingUp,
      href: "/legal-due-diligence",
      color: "bg-indigo-500",
    },
    {
      id: "consultation",
      title: "Book Consultation",
      description: "Expert guidance",
      icon: MessageSquare,
      href: "/consultation",
      color: "bg-teal-500",
      count: leads.filter(lead => lead.status === 'qualified').length,
    },
  ];

  // Sidebar menu items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "properties", label: "My Properties", icon: Building },
    { id: "bookings", label: "Site Visits", icon: Calendar },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "consultations", label: "Consultations", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
      navigate("/");
    } catch (error) {
      toast({ title: "Error signing out", variant: "destructive" });
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}!</h1>
        <p className="text-blue-100">Your property journey continues here. Track your progress and discover new opportunities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties Viewed</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.totalProperties}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Site Visits</p>
                <p className="text-2xl font-bold text-green-600">{userStats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">₹{userStats.totalSpent.toLocaleString()}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.id} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${action.color} rounded-lg p-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      {action.count !== undefined && (
                        <Badge variant="secondary">{action.count}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {userStats.recentActivity > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Recent consultation requests: {userStats.recentActivity}</p>
                    <p className="text-xs text-gray-500">Last 7 days</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Start exploring properties to see your activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
        <Button asChild>
          <Link href="/find-property">Find More Properties</Link>
        </Button>
      </div>
      
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 6).map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="aspect-video bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.area}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">₹{(property as any).priceMin?.toLocaleString() || 'Price on request'}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/property/${property.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No properties viewed yet</p>
            <Button asChild>
              <Link href="/find-property">Start Exploring Properties</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">My Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valuation Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Valuation Reports</span>
              <Badge variant="secondary">{valuationReports.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {valuationReports.length > 0 ? (
              <div className="space-y-3">
                {valuationReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{(report as any).propertyAddress || 'Property Report'}</p>
                      <p className="text-xs text-gray-500">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Date N/A'}
                      </p>
                    </div>
                    <Badge variant={(report as any).status === 'completed' ? 'default' : 'secondary'}>
                      {(report as any).status || 'In Progress'}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/user-valuation-reports">View All Reports</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">No valuation reports yet</p>
                <Button size="sm" asChild>
                  <Link href="/property-valuation">Get Valuation Report</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CIVIL+MEP Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <span>CIVIL+MEP Reports</span>
              <Badge variant="secondary">{civilMepReports.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {civilMepReports.length > 0 ? (
              <div className="space-y-3">
                {civilMepReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Report #{(report as any).reportId || report.id.slice(0,8)}</p>
                      <p className="text-xs text-gray-500">
                        Score: {report.overallScore || 'N/A'}/10
                      </p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/user-civil-mep-reports">View All Reports</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">No CIVIL+MEP reports yet</p>
                <Button size="sm" asChild>
                  <Link href="/civil-mep-reports">Order Report</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "properties":
        return renderProperties();
      case "bookings":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Site Visits</h2>
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No site visits booked yet</p>
                <Button asChild>
                  <Link href="/book-visit">Book Your First Visit</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "reports":
        return renderReports();
      case "consultations":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Consultations</h2>
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No consultations scheduled</p>
                <Button asChild>
                  <Link href="/consultation">Book Consultation</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No new notifications</p>
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentUser.name}</h3>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                    <p className="text-xs text-gray-500">Member since {currentUser.memberSince}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={handleSignOut} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-white text-blue-600">{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">{currentUser.name}</h2>
                <p className="text-blue-100 text-sm truncate">{currentUser.email}</p>
              </div>
            </div>
            
            {/* Home Navigation */}
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">
            {sidebarItems.find(item => item.id === activeTab)?.label || "Dashboard"}
          </h1>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}