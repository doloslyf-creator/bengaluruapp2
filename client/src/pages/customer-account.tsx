import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  AlertCircle,
  Edit2,
  Save,
  X,
  Star,
  TrendingUp,
  DollarSign,
  BarChart3
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
import { apiRequest } from "@/lib/queryClient";
import { type CivilMepReport, type PropertyValuationReport } from "@shared/schema";

// Customer profile interface
interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  memberSince: string;
  address: string;
  city: string;
  dateOfBirth: string;
  gender: string;
  investorType: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
  };
}

interface CustomerStats {
  totalReports: number;
  civilMepReports: number;
  valuationReports: number;
  pendingReports: number;
  completedReports: number;
}

export default function CustomerAccount() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customer's data dynamically based on current user
  const currentCustomerId = user?.email || "zaks.chaudhary@gmail.com"; // Default to our test customer
  
  // Fetch customer profile data
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    staleTime: 5 * 60 * 1000,
  });

  // Find current customer data
  const currentCustomer = customers.find((c: any) => c.email === currentCustomerId || c.id === currentCustomerId);

  // Fetch customer's Civil MEP reports (filtered by customer if needed)
  const { data: allCivilMepReports = [], isLoading: civilMepLoading } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customer's Property Valuation reports
  const { data: allValuationReports = [], isLoading: valuationLoading } = useQuery<PropertyValuationReport[]>({
    queryKey: ["/api/valuation-reports"],
    staleTime: 5 * 60 * 1000,
  });

  // Filter reports for current customer (for now, show all - in real app would filter by customer assignment)
  const civilMepReports = allCivilMepReports;
  const valuationReports = allValuationReports.filter((report: any) => 
    report.assignedTo === currentCustomerId || !report.assignedTo
  );

  // Initialize profile data with defaults, will be updated by useEffect
  const [profileData, setProfileData] = useState<CustomerProfile>({
    id: "zaks.chaudhary@gmail.com",
    firstName: "Mohd",
    lastName: "Zaki",
    email: "zaks.chaudhary@gmail.com",
    phone: "+91 98776 54321",
    avatar: "",
    memberSince: "January 2025",
    address: "Koramangala 4th Block",
    city: "Bengaluru",
    dateOfBirth: "15/08/1990",
    gender: "Male",
    investorType: "First Time Home Buyer",
    notifications: {
      email: true,
      sms: true,
    },
    privacy: {
      profileVisible: true,
    }
  });

  // Update profile data when customer data loads
  useEffect(() => {
    if (currentCustomer) {
      setProfileData(prev => ({
        ...prev,
        id: currentCustomer.id,
        firstName: currentCustomer.name?.split(' ')[0] || prev.firstName,
        lastName: currentCustomer.name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: currentCustomer.email || prev.email,
        phone: currentCustomer.phone || prev.phone,
        memberSince: currentCustomer.lastActivity ? new Date(currentCustomer.lastActivity).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : prev.memberSince,
      }));
    }
  }, [currentCustomer]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<CustomerProfile>) => {
      // For demo purposes, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate customer statistics
  const customerStats: CustomerStats = {
    totalReports: civilMepReports.length + valuationReports.length,
    civilMepReports: civilMepReports.length,
    valuationReports: valuationReports.length,
    pendingReports: [...civilMepReports, ...valuationReports].filter(report => 
      ('status' in report && (report.status === 'draft' || report.status === 'in-progress')) ||
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {profileData.firstName} {profileData.lastName}!</h2>
            <p className="text-gray-600">Manage your property reports and account settings</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-semibold">{profileData.memberSince}</p>
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

  const handleProfileUpdate = (field: keyof CustomerProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const renderAccount = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profileData.avatar} />
              <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
              <p className="text-gray-500">Member since {profileData.memberSince}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditingProfile ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={updateProfileMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profileData.address}
              onChange={(e) => handleProfileUpdate('address', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profileData.city}
              onChange={(e) => handleProfileUpdate('city', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              value={profileData.dateOfBirth}
              onChange={(e) => handleProfileUpdate('dateOfBirth', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={profileData.gender.toLowerCase()}
              onValueChange={(value) => handleProfileUpdate('gender', value.charAt(0).toUpperCase() + value.slice(1))}
              disabled={!isEditingProfile}
            >
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => handleProfileUpdate('phone', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={profileData.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
              disabled={!isEditingProfile}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="investorType">Investor Type</Label>
            <Select
              value={profileData.investorType.toLowerCase().replace(/\s+/g, '-')}
              onValueChange={(value) => {
                const mappedValue = value === 'resident-indian-citizen' ? 'Resident Indian Citizen' :
                  value === 'non-resident-indian' ? 'Non-Resident Indian' : 'Foreign National';
                handleProfileUpdate('investorType', mappedValue);
              }}
              disabled={!isEditingProfile}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident-indian-citizen">Resident Indian Citizen</SelectItem>
                <SelectItem value="non-resident-indian">Non-Resident Indian</SelectItem>
                <SelectItem value="foreign-national">Foreign National</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <div className="grid gap-6">
            {[...civilMepReports, ...valuationReports]
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .map((report) => {
                const isCivilMep = 'reportType' in report;
                const reportData = isCivilMep ? report as CivilMepReport : report as PropertyValuationReport;
                
                return (
                  <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isCivilMep ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {isCivilMep ? (
                              <Building className="h-7 w-7 text-green-600" />
                            ) : (
                              <Shield className="h-7 w-7 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">
                              {isCivilMep ? 
                                (('projectName' in reportData && reportData.projectName) || 'Civil & MEP Engineering Report') :
                                (('propertyName' in reportData && reportData.propertyName) || 'Property Valuation Report')
                              }
                            </h3>
                            <p className="text-gray-600 font-medium">
                              {isCivilMep ? 'Civil & MEP Engineering Analysis' : 'Property Valuation Assessment'}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-gray-500 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {('location' in reportData && reportData.location) || 'Location not specified'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(report)}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {isCivilMep ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600">Overall Score</p>
                                <p className="text-2xl font-bold text-blue-900">
                                  {reportData.overallScore || 'N/A'}
                                </p>
                              </div>
                              <Star className="h-8 w-8 text-blue-500" />
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-600">Status</p>
                                <p className="text-lg font-semibold text-green-900 capitalize">
                                  {('status' in reportData && reportData.status) || 'Available'}
                                </p>
                              </div>
                              <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-600">Report Type</p>
                                <p className="text-lg font-semibold text-purple-900">
                                  Standard
                                </p>
                              </div>
                              <BarChart3 className="h-8 w-8 text-purple-500" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-emerald-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-emerald-600">Market Value</p>
                                <p className="text-2xl font-bold text-emerald-900">
                                  {reportData.overallScore || 'N/A'}
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-emerald-500" />
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-orange-600">Growth Potential</p>
                                <p className="text-lg font-semibold text-orange-900">High</p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-orange-500" />
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600">Investment Grade</p>
                                <p className="text-lg font-semibold text-blue-900">A+</p>
                              </div>
                              <Star className="h-8 w-8 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/civil-mep-report/${report.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download PDF
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Last updated: {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="civil-mep" className="space-y-4">
          <div className="grid gap-6">
            {civilMepReports.map((report) => (
              <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                        <Building className="h-7 w-7 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">
                          {('projectName' in report && report.projectName) || 'Civil & MEP Engineering Report'}
                        </h3>
                        <p className="text-green-600 font-medium">Civil & MEP Engineering Analysis</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {('location' in report && report.location) || 'Location not specified'}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(report)}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Overall Score</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {report.overallScore || 'N/A'}
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Status</p>
                          <p className="text-lg font-semibold text-green-900 capitalize">
                            {report.status || 'Available'}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Report Type</p>
                          <p className="text-lg font-semibold text-purple-900">
                            Standard
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Priority</p>
                          <p className="text-lg font-semibold text-orange-900">
                            Medium
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/civil-mep-report/${report.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Last updated: {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <div className="grid gap-6">
            {valuationReports.map((report) => (
              <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Shield className="h-7 w-7 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">
                          {('propertyName' in report && report.propertyName) || 'Property Valuation Report'}
                        </h3>
                        <p className="text-purple-600 font-medium">Property Valuation Assessment</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {('location' in report && report.location) || 'Location not specified'}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(report)}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600">Market Value</p>
                          <p className="text-2xl font-bold text-emerald-900">
                            {report.overallScore || 'N/A'}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-emerald-500" />
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Growth Potential</p>
                          <p className="text-lg font-semibold text-orange-900">High</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Investment Grade</p>
                          <p className="text-lg font-semibold text-blue-900">A+</p>
                        </div>
                        <Star className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600">Risk Level</p>
                          <p className="text-lg font-semibold text-red-900">Low</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Last updated: {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const handleNotificationUpdate = (type: 'email' | 'sms', value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const handlePrivacyUpdate = (setting: 'profileVisible', value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: value
      }
    }));
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your reports via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profileData.notifications.email}
              onChange={(e) => handleNotificationUpdate('email', e.target.checked)}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Get text updates for important changes</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profileData.notifications.sms}
              onChange={(e) => handleNotificationUpdate('sms', e.target.checked)}
              className="rounded"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-gray-500">Make your profile visible to other users</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profileData.privacy.profileVisible}
              onChange={(e) => handlePrivacyUpdate('profileVisible', e.target.checked)}
              className="rounded"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Security & Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start h-auto p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
          </Button>
          <Button variant="outline" className="w-full justify-start h-auto p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Payment Methods</p>
                <p className="text-sm text-gray-500">Manage your payment methods and billing</p>
              </div>
            </div>
          </Button>
          <Button variant="outline" className="w-full justify-start h-auto p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Account Preferences</p>
                <p className="text-sm text-gray-500">Customize your account preferences</p>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button variant="outline" className="h-auto p-6" asChild>
              <Link href="/faq">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Frequently Asked Questions</p>
                    <p className="text-sm text-gray-600">Find answers to common questions</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6" asChild>
              <Link href="/report-documentation">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Report Documentation</p>
                    <p className="text-sm text-gray-600">Learn how to read your reports</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6" asChild>
              <Link href="/contact">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Contact Support</p>
                    <p className="text-sm text-gray-600">Get help from our team</p>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Help Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Report Related</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href="/faq">How to read Civil & MEP reports</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href="/faq">Understanding valuation metrics</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href="/faq">Report delivery timeline</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Account & Billing</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href="/faq">Managing account settings</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href="/faq">Payment and billing questions</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href="/faq">Downloading report copies</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Need immediate help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Our support team is available Monday to Friday, 9 AM to 6 PM
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">Email Support</p>
              <p className="text-sm text-blue-700">support@ownitright.com</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">Phone Support</p>
              <p className="text-sm text-blue-700">+91 98765 43210</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:block">{profileData.firstName} {profileData.lastName}</span>
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