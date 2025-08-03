import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { LogOut, TrendingUp, Building, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Property, type PropertyConfiguration } from "@shared/schema";
import { formatPriceInCrores } from "@/lib/utils";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdminAnalytics() {

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
    ? configurations.reduce((sum, config) => {
        const calculatedPrice = parseFloat(config.pricePerSqft.toString()) * config.builtUpArea;
        return sum + calculatedPrice;
      }, 0) / configurations.length 
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



  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Properties</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalProperties}</div>
              <p className="text-xs text-gray-600 mt-1">Active listings managed</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Property Types</CardTitle>
              <CardDescription>Distribution by property type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(propertyTypeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
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
    </AdminLayout>
  );
}