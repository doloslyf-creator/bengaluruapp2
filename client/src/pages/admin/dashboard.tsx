import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  MapPin, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Eye,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Award,
  TrendingDown,
  Home,
  Briefcase,
  Star,
  ChevronRight,
  Bell,
  Percent,
  Calculator,
  MapIcon,
  Building,
  IndianRupee,
  Phone,
  Mail,
  Timer,
  FileBarChart,
  Search,
  ExternalLink,
  Settings,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/layout/admin-layout";
import { type Property, type PropertyStats } from "@shared/schema";

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all data sources
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: stats } = useQuery<PropertyStats>({
    queryKey: ["/api/properties/stats"],
  });

  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ["/api/leads"],
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: civilMepReports = [] } = useQuery<any[]>({
    queryKey: ["/api/civil-mep-reports"],
  });

  const { data: propertyValuationReports = [] } = useQuery<any[]>({
    queryKey: ["/api/property-valuation-reports"],
  });

  const { data: legalAuditReports = [] } = useQuery<any[]>({
    queryKey: ["/api/legal-audit-reports"],
  });

  const { data: civilMepStats } = useQuery<any>({
    queryKey: ["/api/civil-mep-reports-stats"],
  });

  const { data: propertyValuationStats } = useQuery<any>({
    queryKey: ["/api/property-valuation-reports-stats"],
  });

  const { data: legalAuditStats } = useQuery<any>({
    queryKey: ["/api/legal-audit-reports-stats"],
  });

  // Advanced Analytics Calculations
  const getBusinessMetrics = () => {
    const totalRevenue = propertyValuationReports.reduce((sum: number, report: any) => sum + (report.price || 1499), 0);
    const civilRevenue = civilMepReports.reduce((sum: number, report: any) => sum + (report.price || 2499), 0);
    const legalRevenue = legalAuditReports.reduce((sum: number, report: any) => sum + (report.price || 999), 0);
    
    const totalReports = propertyValuationReports.length + civilMepReports.length + legalAuditReports.length;
    const conversionRate = leads.length > 0 ? Math.round((totalReports / leads.length) * 100) : 0;
    
    return {
      totalRevenue: totalRevenue + civilRevenue + legalRevenue,
      avgRevenuePerReport: totalReports > 0 ? Math.round((totalRevenue + civilRevenue + legalRevenue) / totalReports) : 0,
      conversionRate,
      totalReports
    };
  };

  const getPropertyInsights = () => {
    const hotLeads = leads.filter((lead: any) => lead.leadType === 'hot').length;
    const coldLeads = leads.filter((lead: any) => lead.leadType === 'cold').length;
    const warmLeads = leads.filter((lead: any) => lead.leadType === 'warm').length;
    
    const completedBookings = bookings.filter((booking: any) => booking.status === 'completed').length;
    const pendingBookings = bookings.filter((booking: any) => booking.status === 'confirmed').length;
    
    const propertiesWithReports = properties.filter(prop => 
      civilMepReports.some((report: any) => report.propertyId === prop.id) ||
      propertyValuationReports.some((report: any) => report.propertyId === prop.id)
    ).length;
    
    return {
      hotLeads, coldLeads, warmLeads,
      completedBookings, pendingBookings,
      propertiesWithReports,
      reportCoverage: properties.length > 0 ? Math.round((propertiesWithReports / properties.length) * 100) : 0
    };
  };

  const getReportPerformance = () => {
    const civilCompleted = civilMepReports.filter((r: any) => r.status === 'completed').length;
    const civilInProgress = civilMepReports.filter((r: any) => r.status === 'in-progress').length;
    const civilDraft = civilMepReports.filter((r: any) => r.status === 'draft').length;
    
    const valuationCompleted = propertyValuationReports.filter((r: any) => r.status === 'completed').length;
    const valuationInProgress = propertyValuationReports.filter((r: any) => r.status === 'in-progress').length;
    const valuationDraft = propertyValuationReports.filter((r: any) => r.status === 'draft').length;
    
    const legalCompleted = legalAuditReports.filter((r: any) => r.status === 'completed').length;
    const legalInProgress = legalAuditReports.filter((r: any) => r.status === 'in-progress').length;
    const legalDraft = legalAuditReports.filter((r: any) => r.status === 'draft').length;
    
    return {
      civil: { completed: civilCompleted, inProgress: civilInProgress, draft: civilDraft, total: civilMepReports.length },
      valuation: { completed: valuationCompleted, inProgress: valuationInProgress, draft: valuationDraft, total: propertyValuationReports.length },
      legal: { completed: legalCompleted, inProgress: legalInProgress, draft: legalDraft, total: legalAuditReports.length }
    };
  };

  const getRecentActivity = () => {
    const recentLeads = leads.slice(0, 5);
    const recentBookings = bookings.slice(0, 3);
    const recentReports = [...civilMepReports, ...propertyValuationReports, ...legalAuditReports]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    return { recentLeads, recentBookings, recentReports };
  };

  const businessMetrics = getBusinessMetrics();
  const propertyInsights = getPropertyInsights(); 
  const reportPerformance = getReportPerformance();
  const { recentLeads, recentBookings, recentReports } = getRecentActivity();

  return (
    <AdminLayout title="Dashboard" showBackButton={false}>
      <div className="space-y-8">
        {/* Hero Section with Key Metrics */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to OwnItRight Dashboard</h1>
              <p className="text-blue-100 mb-6">Your comprehensive property intelligence and analytics center</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">₹{businessMetrics.totalRevenue.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm">Total Revenue</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{businessMetrics.conversionRate}%</div>
                  <div className="text-blue-100 text-sm">Lead Conversion</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                <Link href="/admin-panel/properties/view" className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <Building2 className="h-8 w-8 mb-2" />
                  <div className="text-xl font-bold">{properties.length}</div>
                  <div className="text-blue-100 text-sm">Properties</div>
                </Link>
                <Link href="/admin-panel/civil-mep-reports" className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <FileBarChart className="h-8 w-8 mb-2" />
                  <div className="text-xl font-bold">{businessMetrics.totalReports}</div>
                  <div className="text-blue-100 text-sm">Total Reports</div>
                </Link>
                <Link href="/admin-panel/leads" className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 mb-2" />
                  <div className="text-xl font-bold">{leads.length}</div>
                  <div className="text-blue-100 text-sm">Active Leads</div>
                </Link>
                <Link href="/admin-panel/bookings" className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <Calendar className="h-8 w-8 mb-2" />
                  <div className="text-xl font-bold">{bookings.length}</div>
                  <div className="text-blue-100 text-sm">Site Visits</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports Analytics
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lead Intelligence
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Property Insights
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Business Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-700">₹{businessMetrics.avgRevenuePerReport}</div>
                      <div className="text-sm text-green-600">Avg Revenue/Report</div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-700">{propertyInsights.reportCoverage}%</div>
                      <div className="text-sm text-blue-600">Property Coverage</div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{propertyInsights.hotLeads}</div>
                      <div className="text-sm text-purple-600">Hot Leads</div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-700">{propertyInsights.completedBookings}</div>
                      <div className="text-sm text-orange-600">Visits Completed</div>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-blue-600" />
                    Report Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Civil+MEP Reports</span>
                      </div>
                      <Link href="/admin-panel/civil-mep-reports">
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="font-bold text-green-700">{reportPerformance.civil.completed}</div>
                        <div className="text-green-600">Completed</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-center">
                        <div className="font-bold text-yellow-700">{reportPerformance.civil.inProgress}</div>
                        <div className="text-yellow-600">In Progress</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-bold text-gray-700">{reportPerformance.civil.draft}</div>
                        <div className="text-gray-600">Draft</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Property Valuation</span>
                      </div>
                      <Link href="/admin-panel/property-valuation-reports">
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="font-bold text-green-700">{reportPerformance.valuation.completed}</div>
                        <div className="text-green-600">Completed</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-center">
                        <div className="font-bold text-yellow-700">{reportPerformance.valuation.inProgress}</div>
                        <div className="text-yellow-600">In Progress</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-bold text-gray-700">{reportPerformance.valuation.draft}</div>
                        <div className="text-gray-600">Draft</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Legal Audit</span>
                      </div>
                      <Link href="/admin-panel/legal-audit-reports">
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="font-bold text-green-700">{reportPerformance.legal.completed}</div>
                        <div className="text-green-600">Completed</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-center">
                        <div className="font-bold text-yellow-700">{reportPerformance.legal.inProgress}</div>
                        <div className="text-yellow-600">In Progress</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-bold text-gray-700">{reportPerformance.legal.draft}</div>
                        <div className="text-gray-600">Draft</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.length > 0 ? (
                      recentReports.map((report: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {report.reportTitle || report.propertyName || 'Report'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {report.reportType || 'Property Report'}
                              </div>
                            </div>
                          </div>
                          <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent reports found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Analytics Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin-panel/civil-mep-reports">
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Civil+MEP Reports</h3>
                    <div className="text-3xl font-bold text-blue-700 mb-2">{civilMepReports.length}</div>
                    <p className="text-blue-600 text-sm">Total Reports</p>
                    <div className="mt-4 text-xs text-blue-500">
                      Revenue: ₹{(civilMepReports.length * 2499).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-panel/property-valuation-reports">
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Property Valuation</h3>
                    <div className="text-3xl font-bold text-purple-700 mb-2">{propertyValuationReports.length}</div>
                    <p className="text-purple-600 text-sm">Total Reports</p>
                    <div className="mt-4 text-xs text-purple-500">
                      Revenue: ₹{(propertyValuationReports.length * 1499).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-panel/legal-audit-reports">
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-900 mb-2">Legal Audit</h3>
                    <div className="text-3xl font-bold text-red-700 mb-2">{legalAuditReports.length}</div>
                    <p className="text-red-600 text-sm">Total Reports</p>
                    <div className="mt-4 text-xs text-red-500">
                      Revenue: ₹{(legalAuditReports.length * 999).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          {/* Lead Intelligence Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{propertyInsights.hotLeads}</div>
                  <div className="text-sm text-red-600">Hot Leads</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Timer className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-700">{propertyInsights.warmLeads}</div>
                  <div className="text-sm text-yellow-600">Warm Leads</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{propertyInsights.coldLeads}</div>
                  <div className="text-sm text-blue-600">Cold Leads</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <Percent className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{businessMetrics.conversionRate}%</div>
                  <div className="text-sm text-green-600">Conversion Rate</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Recent Leads
                    </span>
                    <Link href="/admin-panel/leads">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentLeads.length > 0 ? (
                      recentLeads.map((lead: any) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                          <Badge variant={lead.leadType === 'hot' ? 'destructive' : lead.leadType === 'warm' ? 'default' : 'secondary'}>
                            {lead.leadType}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No recent leads</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Bookings
                    </span>
                    <Link href="/admin-panel/bookings">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-sm text-gray-500">{booking.propertyName}</div>
                          </div>
                          <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No recent bookings</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Property Insights Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{properties.length}</div>
                  <div className="text-sm text-gray-600">Total Properties</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{propertyInsights.propertiesWithReports}</div>
                  <div className="text-sm text-gray-600">With Reports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{propertyInsights.reportCoverage}%</div>
                  <div className="text-sm text-gray-600">Coverage Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{propertyInsights.pendingBookings}</div>
                  <div className="text-sm text-gray-600">Pending Visits</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Property Distribution
                    </span>
                    <Link href="/admin-panel/properties/view">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {properties.length > 0 ? (
                      ['apartment', 'villa', 'plot', 'commercial'].map(type => {
                        const count = properties.filter(p => p.type === type).length;
                        const percentage = properties.length > 0 ? Math.round((count / properties.length) * 100) : 0;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="capitalize">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{count}</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400 w-8">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">No properties found</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Top Performing Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {properties.slice(0, 5).map((property, index) => (
                      <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ₹{((property as any).startingPrice / 10000000).toFixed(1)}Cr
                          </div>
                          <div className="text-xs text-gray-500">{property.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}