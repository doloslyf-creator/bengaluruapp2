import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, MapPin, Building, IndianRupee, Users } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { type Property, type PropertyStats, type PropertyConfiguration } from "@shared/schema";

export default function Analytics() {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<PropertyStats>({
    queryKey: ["/api/properties/stats"],
  });

  // Get all configurations for price analysis
  const { data: allConfigurations = [], isLoading: configurationsLoading } = useQuery<PropertyConfiguration[]>({
    queryKey: ["/api/all-configurations"],
    queryFn: async () => {
      const configs: PropertyConfiguration[] = [];
      for (const property of properties) {
        const response = await fetch(`/api/property-configurations/${property.id}`);
        if (response.ok) {
          const propertyConfigs = await response.json();
          configs.push(...propertyConfigs);
        }
      }
      return configs;
    },
    enabled: properties.length > 0,
  });

  // Calculate zone distribution
  const zoneDistribution = properties.reduce((acc, property) => {
    acc[property.zone] = (acc[property.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate type distribution
  const typeDistribution = properties.reduce((acc, property) => {
    acc[property.type] = (acc[property.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate status distribution
  const statusDistribution = properties.reduce((acc, property) => {
    acc[property.status] = (acc[property.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate price ranges from configurations
  const priceRanges = allConfigurations.reduce((acc, config) => {
    if (config.price < 100) acc["Under ₹1Cr"] = (acc["Under ₹1Cr"] || 0) + 1;
    else if (config.price < 200) acc["₹1Cr - ₹2Cr"] = (acc["₹1Cr - ₹2Cr"] || 0) + 1;
    else if (config.price < 300) acc["₹2Cr - ₹3Cr"] = (acc["₹2Cr - ₹3Cr"] || 0) + 1;
    else if (config.price < 500) acc["₹3Cr - ₹5Cr"] = (acc["₹3Cr - ₹5Cr"] || 0) + 1;
    else acc["Above ₹5Cr"] = (acc["Above ₹5Cr"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (propertiesLoading || statsLoading || configurationsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-border px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Property market insights and trends</p>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg border border-border">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Property market insights and trends</p>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalProperties || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.activeProjects || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">RERA Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.reraApproved || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{stats?.avgPrice || 0}Cr</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zone Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Zone Distribution
              </h3>
              <div className="space-y-4">
                {Object.entries(zoneDistribution).map(([zone, count]) => (
                  <div key={zone} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {zone} Bengaluru
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(count / properties.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Property Type Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Property Types
              </h3>
              <div className="space-y-4">
                {Object.entries(typeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full" 
                          style={{ width: `${(count / properties.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Project Status
              </h3>
              <div className="space-y-4">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(count / properties.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Price Range Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Price Ranges
              </h3>
              <div className="space-y-4">
                {Object.entries(priceRanges).map(([range, count]) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{range}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(count / properties.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h3>
            <div className="space-y-3">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{property.name}</p>
                    <p className="text-sm text-gray-600">{property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Bengaluru</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {property.price >= 10000000 ? `₹${(property.price / 10000000).toFixed(2)} Cr` : 
                       property.price >= 100000 ? `₹${(property.price / 100000).toFixed(2)} L` : 
                       `₹${property.price.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{property.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}