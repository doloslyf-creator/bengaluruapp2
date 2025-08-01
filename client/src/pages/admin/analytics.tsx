import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Link } from "wouter";
import { LogOut, TrendingUp, Building, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Property, type PropertyConfiguration } from "@shared/schema";
import { formatPriceInCrores } from "@/lib/utils";

export default function AdminAnalytics() {
  const { user, logout } = useAuth();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: configurations = [] } = useQuery<PropertyConfiguration[]>({
    queryKey: ["/api/all-configurations"],
  });

  // Analytics calculations
  const totalProperties = properties.length;
  const totalConfigurations = configurations.length;
  
  const averagePrice = configurations.length > 0 
    ? configurations.reduce((sum, config) => sum + config.price, 0) / configurations.length 
    : 0;

  const propertyTypeDistribution = properties.reduce((acc, property) => {
    acc[property.type] = (acc[property.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const zoneDistribution = properties.reduce((acc, property) => {
    acc[property.zone] = (acc[property.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDistribution = properties.reduce((acc, property) => {
    acc[property.status] = (acc[property.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
              <p className="text-gray-600 font-medium mt-2">Property insights and market analysis</p>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="flex space-x-8">
                <Link href="/admin-panel" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">Dashboard</Link>
                <Link href="/admin-panel/analytics" className="text-purple-600 font-semibold bg-purple-50 px-3 py-2 rounded-lg">Analytics</Link>
                <Link href="/admin-panel/leads" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">Leads</Link>
                <Link href="/admin-panel/developers" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">Developers</Link>
                <Link href="/admin-panel/zones" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200">Zones</Link>
              </nav>
              
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configurations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConfigurations}</div>
              <p className="text-xs text-muted-foreground">Property variants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPriceInCrores(averagePrice)}</div>
              <p className="text-xs text-muted-foreground">Per configuration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(zoneDistribution).length}</div>
              <p className="text-xs text-muted-foreground">Zones covered</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Type Distribution */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-gray-800">Property Types</CardTitle>
              <CardDescription className="text-gray-600 font-medium">Distribution by property type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(propertyTypeDistribution).map(([type, count], index) => {
                  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
                  return (
                    <div key={type} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} shadow-sm`}></div>
                        <span className="text-sm font-semibold capitalize text-gray-700">{type}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Zone Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Zone Coverage</CardTitle>
              <CardDescription>Properties by Bengaluru zones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(zoneDistribution).map(([zone, count]) => (
                  <div key={zone} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-sm font-medium capitalize">{zone} Bengaluru</span>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>Properties by development status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'active' ? 'bg-green-500' :
                        status === 'pre-launch' ? 'bg-yellow-500' :
                        status === 'under-construction' ? 'bg-blue-500' :
                        status === 'completed' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{status.replace('-', ' ')}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}