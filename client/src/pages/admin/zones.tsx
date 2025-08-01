import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Link } from "wouter";
import { LogOut, MapPin, Building, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

export default function AdminZones() {
  const { logout } = useAuth();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Group properties by zone
  const zoneStats = properties.reduce((acc, property) => {
    if (!acc[property.zone]) {
      acc[property.zone] = {
        name: property.zone,
        properties: [],
        developers: new Set(),
        types: new Set(),
        statuses: new Set(),
        areas: new Set(),
      };
    }
    acc[property.zone].properties.push(property);
    acc[property.zone].developers.add(property.developer);
    acc[property.zone].types.add(property.type);
    acc[property.zone].statuses.add(property.status);
    acc[property.zone].areas.add(property.area);
    return acc;
  }, {} as Record<string, {
    name: string;
    properties: Property[];
    developers: Set<string>;
    types: Set<string>;
    statuses: Set<string>;
    areas: Set<string>;
  }>);

  const zones = Object.values(zoneStats).sort((a, b) => 
    b.properties.length - a.properties.length
  );

  const getZoneDisplayName = (zone: string) => {
    return zone.charAt(0).toUpperCase() + zone.slice(1) + " Bengaluru";
  };

  const getZoneColor = (zone: string) => {
    const colors = {
      north: "bg-blue-100 text-blue-800 border-blue-200",
      south: "bg-green-100 text-green-800 border-green-200", 
      east: "bg-orange-100 text-orange-800 border-orange-200",
      west: "bg-purple-100 text-purple-800 border-purple-200",
      central: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[zone as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Zone Analysis</h1>
              <p className="text-gray-600 font-medium mt-2">Bengaluru property market by zones</p>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="flex space-x-8">
                <Link href="/admin-panel" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200">Dashboard</Link>
                <Link href="/admin-panel/analytics" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200">Analytics</Link>
                <Link href="/admin-panel/leads" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200">Leads</Link>
                <Link href="/admin-panel/developers" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200">Developers</Link>
                <Link href="/admin-panel/zones" className="text-orange-600 font-semibold bg-orange-50 px-3 py-2 rounded-lg">Zones</Link>
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
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{zones.length}</div>
              <p className="text-xs text-muted-foreground">Coverage areas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {zones.length > 0 ? Math.round(properties.length / zones.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per zone</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {zones.length > 0 ? zones[0].properties.length : 0}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {zones.length > 0 ? getZoneDisplayName(zones[0].name) : "No zones"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Areas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {zones.reduce((acc, zone) => acc + zone.areas.size, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Unique localities</p>
            </CardContent>
          </Card>
        </div>

        {/* Zone Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {zones.map((zone) => (
            <Card key={zone.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge className={getZoneColor(zone.name)}>
                        {getZoneDisplayName(zone.name)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {zone.properties.length} properties • {zone.developers.size} developers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Property Types */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Property Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(zone.types).map((type) => (
                        <Badge key={type} variant="outline" className="text-xs capitalize">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Top Developers */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Active Developers</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(zone.developers).slice(0, 3).map((developer) => (
                        <Badge key={developer} variant="outline" className="text-xs">
                          {developer}
                        </Badge>
                      ))}
                      {zone.developers.size > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{zone.developers.size - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Popular Areas */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Areas</h4>
                    <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                      {Array.from(zone.areas).slice(0, 6).map((area) => (
                        <div key={area} className="truncate">{area}</div>
                      ))}
                      {zone.areas.size > 6 && (
                        <div className="text-xs text-gray-500 col-span-2">
                          +{zone.areas.size - 6} more areas
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Project Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(zone.statuses).map((status) => (
                        <Badge 
                          key={status} 
                          variant="outline" 
                          className={`text-xs ${
                            status === 'active' ? 'border-green-300 text-green-700' :
                            status === 'pre-launch' ? 'border-yellow-300 text-yellow-700' :
                            status === 'under-construction' ? 'border-blue-300 text-blue-700' :
                            status === 'completed' ? 'border-purple-300 text-purple-700' :
                            'border-gray-300 text-gray-700'
                          }`}
                        >
                          {status.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Market Activity */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Activity</span>
                      <span className="font-medium">
                        {zone.properties.length > 10 ? 'High' : 
                         zone.properties.length > 5 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {zones.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
            <p className="text-gray-600">Add some properties to see zone analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}