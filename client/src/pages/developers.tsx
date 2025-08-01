import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Building, Search, TrendingUp, MapPin } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

export default function Developers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Group properties by developer
  const developerData = properties.reduce((acc, property) => {
    if (!acc[property.developer]) {
      acc[property.developer] = {
        name: property.developer,
        properties: [],
        totalProjects: 0,
        activeProjects: 0,
        reraApproved: 0,
        avgPrice: 0,
        zones: new Set(),
        types: new Set(),
      };
    }
    
    acc[property.developer].properties.push(property);
    acc[property.developer].totalProjects += 1;
    
    if (property.status === "active" || property.status === "under-construction") {
      acc[property.developer].activeProjects += 1;
    }
    
    if (property.reraApproved) {
      acc[property.developer].reraApproved += 1;
    }
    
    acc[property.developer].zones.add(property.zone);
    acc[property.developer].types.add(property.type);
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate average prices
  Object.values(developerData).forEach((developer: any) => {
    const totalPrice = developer.properties.reduce((sum: number, prop: Property) => sum + prop.price, 0);
    developer.avgPrice = Math.round(totalPrice / developer.totalProjects / 10) / 10;
  });

  const developers = Object.values(developerData).filter((developer: any) =>
    searchQuery === "" || developer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price >= 100) {
      return `₹${(price / 100).toFixed(1)} Cr`;
    }
    return `₹${price} L`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Developers</h2>
              <p className="text-sm text-gray-600 mt-1">Developer profiles and project portfolios</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search developers..."
                className="w-80 pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Developers</p>
                  <p className="text-2xl font-semibold text-gray-900">{developers.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Projects per Developer</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {developers.length > 0 ? Math.round(properties.length / developers.length * 10) / 10 : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Active Zone</p>
                  <p className="text-2xl font-semibold text-gray-900 capitalize">
                    {(() => {
                      const zoneCounts = properties.reduce((acc, prop) => {
                        acc[prop.zone] = (acc[prop.zone] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      const sortedZones = Object.entries(zoneCounts).sort(([,a], [,b]) => b - a);
                      return sortedZones[0]?.[0] || "N/A";
                    })()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">RERA Compliance Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {properties.length > 0 ? Math.round((properties.filter(p => p.reraApproved).length / properties.length) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : developers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No developers found</h3>
              <p className="text-gray-600">
                {searchQuery ? "Try adjusting your search" : "No developers available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {developers.map((developer: any) => (
                <Card key={developer.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{developer.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(developer.zones).map((zone: string) => (
                        <Badge key={zone} variant="secondary" className="bg-blue-100 text-blue-800">
                          {zone.charAt(0).toUpperCase() + zone.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Projects:</span>
                      <span className="ml-1 font-medium">{developer.totalProjects}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Active:</span>
                      <span className="ml-1 font-medium">{developer.activeProjects}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">RERA Approved:</span>
                      <span className="ml-1 font-medium">{developer.reraApproved}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Price:</span>
                      <span className="ml-1 font-medium">₹{developer.avgPrice}Cr</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Property Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(developer.types).map((type: string) => (
                        <Badge key={type} variant="outline" className="capitalize">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Recent Projects:</p>
                    <div className="space-y-1">
                      {developer.properties.slice(0, 2).map((property: Property) => (
                        <div key={property.id} className="text-sm text-gray-600">
                          <span className="font-medium">{property.name}</span> - {formatPrice(property.price)}
                        </div>
                      ))}
                      {developer.properties.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{developer.properties.length - 2} more projects
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}