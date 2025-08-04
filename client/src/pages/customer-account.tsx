import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  User,
  FileText,
  Download,
  Eye,
  Calendar,
  MapPin,
  Building,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  CreditCard,
  Bell,
  Home,
  ChevronRight,
  ExternalLink,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPriceDisplay } from "@/lib/utils";
import { type CivilMepReport, type PropertyValuationReport } from "@shared/schema";

// Mock customer data (will be replaced with auth later)
const mockCustomer = {
  id: "customer-1",
  name: "Sri Krishna",
  email: "srikrishna@timeless.co",
  phone: "+91 98664 *****",
  avatar: "",
  memberSince: "December 2024",
  address: "No.35 Heavens colony",
  city: "Chennai",
  dateOfBirth: "25/03/1993",
  gender: "Male",
  investorType: "Resident Indian Citizen",
  contacts: "+91 98664 *****"
};

interface CustomerStats {
  totalReports: number;
  civilMepReports: number;
  valuationReports: number;
  pendingReports: number;
  completedReports: number;
}

export default function CustomerAccount() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch customer's Civil MEP reports
  const { data: civilMepReports = [], isLoading: civilMepLoading } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customer's Property Valuation reports
  const { data: valuationReports = [], isLoading: valuationLoading } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate customer statistics
  const customerStats: CustomerStats = {
    totalReports: civilMepReports.length + valuationReports.length,
    civilMepReports: civilMepReports.length,
    valuationReports: valuationReports.length,
    pendingReports: [...civilMepReports, ...valuationReports].filter(report => 
      ('status' in report && (report.status === 'pending' || report.status === 'in-progress')) ||
      (!('status' in report))
    ).length,
    completedReports: [...civilMepReports, ...valuationReports].filter(report => 
      ('status' in report && report.status === 'completed')
    ).length,
  };

  const sidebarNavigation = [
    { id: "dashboard", name: "Dashboard", icon: Activity },
    { id: "account", name: "My Account", icon: User },
    { id: "reports", name: "My Reports", icon: FileText },
    { id: "settings", name: "Settings", icon: Settings },
    { id: "help", name: "Help", icon: HelpCircle },
  ];

  const getStatusBadge = (report: any) => {
    if ('status' in report) {
      switch (report.status) {
        case 'completed':
          return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
        case 'in-progress':
          return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
        case 'draft':
          return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
        case 'approved':
          return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>;
        default:
          return <Badge variant="secondary">{report.status}</Badge>;
      }
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Available</Badge>;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {mockCustomer.name}!</h2>
            <p className="text-gray-600">Manage your property reports and account settings</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-semibold">{mockCustomer.memberSince}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Civil & MEP</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.civilMepReports}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valuation Reports</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.valuationReports}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.completedReports}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Reports
            <Button asChild variant="outline" size="sm">
              <Link href="#" onClick={() => setActiveTab("reports")}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...civilMepReports, ...valuationReports]
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 3)
              .map((report, index) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {('propertyName' in report && report.propertyName) || 'Property Report'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {'reportType' in report ? 'Civil & MEP Report' : 'Property Valuation Report'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report)}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccount = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={mockCustomer.avatar} />
            <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
              {mockCustomer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{mockCustomer.name}</h2>
            <p className="text-gray-500">Edit display image</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="Sri" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="Krishna" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue={mockCustomer.address} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" defaultValue={mockCustomer.city} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" defaultValue={mockCustomer.dateOfBirth} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select defaultValue={mockCustomer.gender.toLowerCase()}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contacts">Contacts</Label>
            <Input id="contacts" defaultValue={mockCustomer.contacts} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">E-mail Id</Label>
            <Input id="email" defaultValue={mockCustomer.email} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="investorType">Investor type</Label>
            <Select defaultValue="resident">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Resident Indian Citizen</SelectItem>
                <SelectItem value="nri">Non-Resident Indian</SelectItem>
                <SelectItem value="foreign">Foreign National</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="civil-mep">Civil & MEP</TabsTrigger>
          <TabsTrigger value="valuation">Property Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {[...civilMepReports, ...valuationReports]
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .map((report) => (
                <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {('propertyName' in report && report.propertyName) || 'Property Report'}
                          </h3>
                          <p className="text-gray-500">
                            {'reportType' in report ? 'Civil & MEP Report' : 'Property Valuation Report'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(report)}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/civil-mep-report/${report.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="civil-mep" className="space-y-4">
          <div className="grid gap-4">
            {civilMepReports.map((report) => (
              <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {('propertyName' in report && report.propertyName) || 'Civil & MEP Report'}
                        </h3>
                        <p className="text-gray-500">Civil & MEP Engineering Report</p>
                        <p className="text-sm text-gray-400">
                          Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(report)}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/civil-mep-report/${report.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <div className="grid gap-4">
            {valuationReports.map((report) => (
              <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {('propertyName' in report && report.propertyName) || 'Property Valuation Report'}
                        </h3>
                        <p className="text-gray-500">Property Valuation Report</p>
                        <p className="text-sm text-gray-400">
                          Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(report)}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderSettings = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your reports</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Get text updates for important changes</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Privacy</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-gray-500">Make your profile visible to other users</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Security</h3>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Payment Methods
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderHelp = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <Button variant="outline" className="w-full justify-start h-auto p-4">
            <div className="text-left">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Frequently Asked Questions</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Find answers to common questions</p>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start h-auto p-4">
            <div className="text-left">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span className="font-medium">Report Documentation</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Learn how to read your reports</p>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start h-auto p-4">
            <div className="text-left">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                <span className="font-medium">Contact Support</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Get help from our team</p>
            </div>
          </Button>
        </div>

        <Separator />

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Need immediate help?</h4>
          <p className="text-blue-700 text-sm mb-3">
            Our support team is available Monday to Friday, 9 AM to 6 PM
          </p>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Email:</strong> support@ownitright.com
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> +91 98765 43210
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "account":
        return renderAccount();
      case "reports":
        return renderReports();
      case "settings":
        return renderSettings();
      case "help":
        return renderHelp();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">OwnItRight</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">My Account</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mockCustomer.avatar} />
                  <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                    {mockCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:block">{mockCustomer.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sidebarNavigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}