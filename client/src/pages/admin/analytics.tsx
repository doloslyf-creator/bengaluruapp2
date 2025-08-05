import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Calendar,
  Filter,
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
  Star,
  ChevronRight,
  Bell,
  Percent,
  Calculator,
  MapPin,
  Building,
  IndianRupee,
  Timer,
  FileBarChart,
  Search,
  Download,
  RefreshCw,
  Layers,
  Grid3X3,
  Hash,
  LineChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/layout/admin-layout";
import { type Property, type PropertyStats } from "@shared/schema";

export default function AdminAnalytics() {
  const [timeFilter, setTimeFilter] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [metricFilter, setMetricFilter] = useState("all");

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

  // Advanced Analytics Calculations
  const getRevenueAnalytics = () => {
    const civilRevenue = civilMepReports.reduce((sum: number, report: any) => sum + (report.price || 2499), 0);
    const valuationRevenue = propertyValuationReports.reduce((sum: number, report: any) => sum + (report.price || 1499), 0);
    const legalRevenue = legalAuditReports.reduce((sum: number, report: any) => sum + (report.price || 999), 0);
    
    const totalRevenue = civilRevenue + valuationRevenue + legalRevenue;
    const totalReports = civilMepReports.length + propertyValuationReports.length + legalAuditReports.length;
    
    return {
      totalRevenue,
      civilRevenue,
      valuationRevenue,
      legalRevenue,
      avgRevenuePerReport: totalReports > 0 ? Math.round(totalRevenue / totalReports) : 0,
      reportBreakdown: {
        civil: { count: civilMepReports.length, revenue: civilRevenue, avgPrice: 2499 },
        valuation: { count: propertyValuationReports.length, revenue: valuationRevenue, avgPrice: 1499 },
        legal: { count: legalAuditReports.length, revenue: legalRevenue, avgPrice: 999 }
      }
    };
  };

  const getPerformanceMetrics = () => {
    const totalLeads = leads.length;
    const totalReports = civilMepReports.length + propertyValuationReports.length + legalAuditReports.length;
    const conversionRate = totalLeads > 0 ? Math.round((totalReports / totalLeads) * 100) : 0;
    
    const completedReports = [
      ...civilMepReports.filter((r: any) => r.status === 'completed'),
      ...propertyValuationReports.filter((r: any) => r.status === 'completed'),
      ...legalAuditReports.filter((r: any) => r.status === 'completed')
    ].length;
    
    const completionRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;
    
    const propertiesWithReports = properties.filter(prop => 
      civilMepReports.some((report: any) => report.propertyId === prop.id) ||
      propertyValuationReports.some((report: any) => report.propertyId === prop.id) ||
      legalAuditReports.some((report: any) => report.propertyId === prop.id)
    ).length;
    
    const propertyCoverage = properties.length > 0 ? Math.round((propertiesWithReports / properties.length) * 100) : 0;
    
    return {
      conversionRate,
      completionRate,
      propertyCoverage,
      totalLeads,
      totalReports,
      completedReports,
      propertiesWithReports
    };
  };

  const getPropertyInsights = () => {
    const zoneDistribution = properties.reduce((acc, property) => {
      acc[property.zone] = (acc[property.zone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const typeDistribution = properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgPropertyPrice = properties.length > 0 
      ? properties.reduce((sum, prop) => sum + ((prop as any).startingPrice || 0), 0) / properties.length 
      : 0;
    
    return {
      zoneDistribution: Object.entries(zoneDistribution).map(([zone, count]) => ({ zone, count })),
      typeDistribution: Object.entries(typeDistribution).map(([type, count]) => ({ type, count })),
      avgPropertyPrice,
      totalProperties: properties.length
    };
  };

  const getLeadAnalytics = () => {
    const leadsByType = {
      hot: leads.filter((lead: any) => lead.leadType === 'hot').length,
      warm: leads.filter((lead: any) => lead.leadType === 'warm').length,
      cold: leads.filter((lead: any) => lead.leadType === 'cold').length
    };
    
    const leadsBySource = leads.reduce((acc, lead: any) => {
      const source = lead.source || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentLeads = leads.slice(0, 10);
    
    return {
      leadsByType,
      leadsBySource: Object.entries(leadsBySource).map(([source, count]) => ({ source, count })),
      recentLeads,
      totalLeads: leads.length
    };
  };

  const revenueAnalytics = getRevenueAnalytics();
  const performanceMetrics = getPerformanceMetrics();
  const propertyInsights = getPropertyInsights();
  const leadAnalytics = getLeadAnalytics();

  return (
    <AdminLayout title="Analytics & Insights" showBackButton={true}>
      <div className="space-y-8">
        {/* Header with Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-gray-600 mt-2">Comprehensive business intelligence and performance metrics</p>
          </div>
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
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700">₹{revenueAnalytics.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-green-600">Total Revenue</div>
                  <div className="text-xs text-green-500 mt-1">
                    Avg: ₹{revenueAnalytics.avgRevenuePerReport}/report
                  </div>
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
                  <div className="text-2xl font-bold text-blue-700">{performanceMetrics.conversionRate}%</div>
                  <div className="text-sm text-blue-600">Lead Conversion</div>
                  <div className="text-xs text-blue-500 mt-1">
                    {performanceMetrics.totalReports} from {performanceMetrics.totalLeads} leads
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700">{performanceMetrics.completionRate}%</div>
                  <div className="text-sm text-purple-600">Report Completion</div>
                  <div className="text-xs text-purple-500 mt-1">
                    {performanceMetrics.completedReports} completed
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-700">{performanceMetrics.propertyCoverage}%</div>
                  <div className="text-sm text-orange-600">Property Coverage</div>
                  <div className="text-xs text-orange-500 mt-1">
                    {performanceMetrics.propertiesWithReports} with reports
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">Civil+MEP Reports</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">₹{revenueAnalytics.civilRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{revenueAnalytics.reportBreakdown.civil.count} reports</div>
                      </div>
                    </div>
                    <Progress 
                      value={revenueAnalytics.totalRevenue > 0 ? (revenueAnalytics.civilRevenue / revenueAnalytics.totalRevenue) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-medium">Property Valuation</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">₹{revenueAnalytics.valuationRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{revenueAnalytics.reportBreakdown.valuation.count} reports</div>
                      </div>
                    </div>
                    <Progress 
                      value={revenueAnalytics.totalRevenue > 0 ? (revenueAnalytics.valuationRevenue / revenueAnalytics.totalRevenue) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium">Legal Audit</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">₹{revenueAnalytics.legalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{revenueAnalytics.reportBreakdown.legal.count} reports</div>
                      </div>
                    </div>
                    <Progress 
                      value={revenueAnalytics.totalRevenue > 0 ? (revenueAnalytics.legalRevenue / revenueAnalytics.totalRevenue) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lead Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Lead Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{leadAnalytics.leadsByType.hot}</div>
                      <div className="text-xs text-red-500">Hot Leads</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{leadAnalytics.leadsByType.warm}</div>
                      <div className="text-xs text-yellow-500">Warm Leads</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{leadAnalytics.leadsByType.cold}</div>
                      <div className="text-xs text-blue-500">Cold Leads</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Lead Sources</h4>
                    {leadAnalytics.leadsBySource.map(({ source, count }) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm">{source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${(count / leadAnalytics.totalLeads) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  Property Distribution Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-sm mb-4">By Zone</h4>
                    <div className="space-y-3">
                      {propertyInsights.zoneDistribution.map(({ zone, count }) => (
                        <div key={zone} className="flex items-center justify-between">
                          <span className="text-sm">{zone}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${(count / propertyInsights.totalProperties) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-4">By Type</h4>
                    <div className="space-y-3">
                      {propertyInsights.typeDistribution.map(({ type, count }) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 transition-all"
                                style={{ width: `${(count / propertyInsights.totalProperties) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin-panel/civil-mep-reports">
                <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Civil+MEP Reports</h3>
                    <div className="text-3xl font-bold text-blue-700 mb-2">₹{revenueAnalytics.civilRevenue.toLocaleString()}</div>
                    <p className="text-blue-600 text-sm">Revenue Generated</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reports:</span>
                        <span className="font-bold">{revenueAnalytics.reportBreakdown.civil.count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Avg Price:</span>
                        <span className="font-bold">₹{revenueAnalytics.reportBreakdown.civil.avgPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-panel/property-valuation-reports">
                <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Property Valuation</h3>
                    <div className="text-3xl font-bold text-purple-700 mb-2">₹{revenueAnalytics.valuationRevenue.toLocaleString()}</div>
                    <p className="text-purple-600 text-sm">Revenue Generated</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reports:</span>
                        <span className="font-bold">{revenueAnalytics.reportBreakdown.valuation.count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Avg Price:</span>
                        <span className="font-bold">₹{revenueAnalytics.reportBreakdown.valuation.avgPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-panel/legal-audit-reports">
                <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-900 mb-2">Legal Audit</h3>
                    <div className="text-3xl font-bold text-red-700 mb-2">₹{revenueAnalytics.legalRevenue.toLocaleString()}</div>
                    <p className="text-red-600 text-sm">Revenue Generated</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reports:</span>
                        <span className="font-bold">{revenueAnalytics.reportBreakdown.legal.count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Avg Price:</span>
                        <span className="font-bold">₹{revenueAnalytics.reportBreakdown.legal.avgPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Revenue Growth Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-600" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Revenue trend chart will be displayed here</p>
                    <p className="text-sm text-gray-400">Real-time data visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Civil+MEP Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reports</span>
                      <span className="font-bold">{civilMepReports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-bold text-green-600">
                        {civilMepReports.filter((r: any) => r.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-bold text-yellow-600">
                        {civilMepReports.filter((r: any) => r.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Draft</span>
                      <span className="font-bold text-gray-600">
                        {civilMepReports.filter((r: any) => r.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Valuation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reports</span>
                      <span className="font-bold">{propertyValuationReports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-bold text-green-600">
                        {propertyValuationReports.filter((r: any) => r.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-bold text-yellow-600">
                        {propertyValuationReports.filter((r: any) => r.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Draft</span>
                      <span className="font-bold text-gray-600">
                        {propertyValuationReports.filter((r: any) => r.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legal Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reports</span>
                      <span className="font-bold">{legalAuditReports.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-bold text-green-600">
                        {legalAuditReports.filter((r: any) => r.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-bold text-yellow-600">
                        {legalAuditReports.filter((r: any) => r.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Draft</span>
                      <span className="font-bold text-gray-600">
                        {legalAuditReports.filter((r: any) => r.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Zone Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyInsights.zoneDistribution.map(({ zone, count }) => {
                      const percentage = Math.round((count / propertyInsights.totalProperties) * 100);
                      return (
                        <div key={zone} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{zone}</span>
                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyInsights.typeDistribution.map(({ type, count }) => {
                      const percentage = Math.round((count / propertyInsights.totalProperties) * 100);
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">{type}</span>
                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Property Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
                    <div className="text-sm text-gray-500">Total Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{performanceMetrics.propertiesWithReports}</div>
                    <div className="text-sm text-gray-500">With Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{performanceMetrics.propertyCoverage}%</div>
                    <div className="text-sm text-gray-500">Coverage Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{(propertyInsights.avgPropertyPrice / 10000000).toFixed(1)}Cr
                    </div>
                    <div className="text-sm text-gray-500">Avg Price</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}