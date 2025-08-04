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
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/admin-layout";
import { type Property, type PropertyStats } from "@shared/schema";

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState("30d");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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



  // Calculate analytics data
  const filteredProperties = properties.filter(property => {
    const matchesZone = zoneFilter === "all" || property.zone === zoneFilter;
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    return matchesZone && matchesType;
  });

  const calculatePriceAnalytics = () => {
    if (filteredProperties.length === 0) return { avgPrice: 0, priceRange: { min: 0, max: 0 } };
    
    const prices = filteredProperties.map(p => (p as any).startingPrice || 0);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
    
    return { avgPrice, priceRange };
  };

  const getZoneDistribution = () => {
    const zones = filteredProperties.reduce((acc, property) => {
      acc[property.zone] = (acc[property.zone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(zones).map(([zone, count]) => ({ zone, count }));
  };

  const getTypeDistribution = () => {
    const types = filteredProperties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  };

  const getRecentActivity = () => {
    const recentLeads = leads.slice(0, 3);
    const recentBookings = bookings.slice(0, 2);
    return { recentLeads, recentBookings };
  };

  const { avgPrice, priceRange } = calculatePriceAnalytics();
  const zoneDistribution = getZoneDistribution();
  const typeDistribution = getTypeDistribution();
  const { recentLeads, recentBookings } = getRecentActivity();



  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{stats?.totalProperties || properties.length}</div>
                  <div className="text-sm text-gray-600">Total Properties</div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{leads.length}</div>
                  <div className="text-sm text-gray-600">Active Leads</div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
                  <div className="text-sm text-gray-600">Site Visits</div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-gray-600">Valuations</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
        </div>

        {/* Analytics Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="h-6 w-6 mr-3 text-primary" />
              Advanced Analytics & Insights
            </h3>
            <div className="flex space-x-3">
              <Link href="/admin-panel/properties/view">
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Properties
                </Button>
              </Link>
              <Link href="/admin-panel/analytics">
                <Button size="sm" className="bg-gradient-to-r from-primary to-blue-600 text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Full Analytics
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
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
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Zone Filter</label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="North">North Bangalore</SelectItem>
                  <SelectItem value="South">South Bangalore</SelectItem>
                  <SelectItem value="East">East Bangalore</SelectItem>
                  <SelectItem value="West">West Bangalore</SelectItem>
                  <SelectItem value="Central">Central Bangalore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Property Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Properties Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredProperties.length}</div>
              <p className="text-xs text-gray-500 mt-1">Total in selected filters</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ₹{avgPrice > 0 ? (avgPrice / 10000000).toFixed(2) : '0'}Cr
              </div>
              <p className="text-xs text-gray-500 mt-1">Filtered properties</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                ₹{priceRange.min > 0 ? (priceRange.min / 10000000).toFixed(1) : '0'}Cr - 
                ₹{priceRange.max > 0 ? (priceRange.max / 10000000).toFixed(1) : '0'}Cr
              </div>
              <p className="text-xs text-gray-500 mt-1">Min - Max pricing</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Active Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
              <p className="text-xs text-gray-500 mt-1">Total in pipeline</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Zone Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {zoneDistribution.map(({ zone, count }) => (
                  <div key={zone} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">{zone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <Badge variant="outline">{((count / filteredProperties.length) * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Property Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typeDistribution.map(({ type, count }) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <Badge variant="outline">{((count / filteredProperties.length) * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Lead Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Lead Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{lead.leadSource}</p>
                        <p className="text-xs text-gray-500">Score: {lead.leadScore}</p>
                      </div>
                      <Badge variant={lead.qualificationStatus === 'qualified' ? 'default' : 'secondary'}>
                        {lead.qualificationStatus}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent lead activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Site Visit Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Site Visit Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{booking.type}</p>
                        <p className="text-xs text-gray-500">{booking.date}</p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent bookings</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">0</div>
                <p className="text-sm text-gray-600">Valuation Reports</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{bookings.length}</div>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {leads.filter((lead: any) => lead.qualificationStatus === 'qualified').length}
                </div>
                <p className="text-sm text-gray-600">Qualified Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}