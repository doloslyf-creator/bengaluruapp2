import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Link } from "wouter";
import { LogOut, Building2, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

export default function AdminDevelopers() {
  const { logout } = useAuth();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Group properties by developer
  const developerStats = properties.reduce((acc, property) => {
    if (!acc[property.developer]) {
      acc[property.developer] = {
        name: property.developer,
        properties: [],
        zones: new Set(),
        types: new Set(),
        statuses: new Set(),
      };
    }
    acc[property.developer].properties.push(property);
    acc[property.developer].zones.add(property.zone);
    acc[property.developer].types.add(property.type);
    acc[property.developer].statuses.add(property.status);
    return acc;
  }, {} as Record<string, {
    name: string;
    properties: Property[];
    zones: Set<string>;
    types: Set<string>;
    statuses: Set<string>;
  }>);

  const developers = Object.values(developerStats).sort((a, b) => 
    b.properties.length - a.properties.length
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Developers</h1>
              <p className="text-gray-600 font-medium mt-2">Developer insights and portfolio analysis</p>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="flex space-x-8">
                <Link href="/admin-panel" className="text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200">Dashboard</Link>
                <Link href="/admin-panel/analytics" className="text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200">Analytics</Link>
                <Link href="/admin-panel/leads" className="text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200">Leads</Link>
                <Link href="/admin-panel/developers" className="text-green-600 font-semibold bg-green-50 px-3 py-2 rounded-lg">Developers</Link>
                <Link href="/admin-panel/zones" className="text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200">Zones</Link>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Developers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{developers.length}</div>
              <p className="text-xs text-muted-foreground">Active developers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Portfolio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {developers.length > 0 ? Math.round(properties.length / developers.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Properties per developer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Developer</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {developers.length > 0 ? developers[0].properties.length : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {developers.length > 0 ? developers[0].name : "No developers"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {developers.map((developer) => (
            <Card key={developer.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{developer.name}</CardTitle>
                    <CardDescription>
                      {developer.properties.length} properties in portfolio
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {developer.zones.size} zones
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Property Types */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Property Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(developer.types).map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Zones */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Coverage Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(developer.zones).map((zone) => (
                        <Badge key={zone} variant="outline" className="text-xs capitalize">
                          {zone} Bengaluru
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Project Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(developer.statuses).map((status) => (
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

                  {/* Recent Properties */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Properties</h4>
                    <div className="space-y-1">
                      {developer.properties.slice(0, 3).map((property) => (
                        <div key={property.id} className="text-sm text-gray-600 flex justify-between">
                          <span>{property.name}</span>
                          <span className="text-xs capitalize">{property.area}</span>
                        </div>
                      ))}
                      {developer.properties.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{developer.properties.length - 3} more properties
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {developers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No developers found</h3>
            <p className="text-gray-600">Add some properties to see developer analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}