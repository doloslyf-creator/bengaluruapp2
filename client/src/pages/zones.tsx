import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Building, TrendingUp, IndianRupee, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Property, type PropertyConfiguration } from "@shared/schema";

export default function Zones() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: allConfigurations = [], isLoading: configurationsLoading } = useQuery<PropertyConfiguration[]>({
    queryKey: ["/api/all-configurations"],
  });

  // Group properties by zone
  const zoneData = properties.reduce((acc, property) => {
    if (!acc[property.zone]) {
      acc[property.zone] = {
        zone: property.zone,
        properties: [],
        totalProjects: 0,
        activeProjects: 0,
        reraApproved: 0,
        avgPrice: 0,
        developers: new Set(),
        types: new Set(),
        areas: new Set(),
      };
    }
    
    acc[property.zone].properties.push(property);
    acc[property.zone].totalProjects += 1;
    
    if (property.status === "active" || property.status === "under-construction") {
      acc[property.zone].activeProjects += 1;
    }
    
    if (property.reraApproved) {
      acc[property.zone].reraApproved += 1;
    }
    
    acc[property.zone].developers.add(property.developer);
    acc[property.zone].types.add(property.type);
    acc[property.zone].areas.add(property.area);
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate average prices from configurations
  Object.values(zoneData).forEach((zone: any) => {
    const zoneConfigs = allConfigurations.filter(config => {
      const property = properties.find(p => p.id === config.propertyId);
      return property && property.zone === zone.zone;
    });
    
    if (zoneConfigs.length > 0) {
      const totalPrice = zoneConfigs.reduce((sum: number, config: PropertyConfiguration) => sum + config.price, 0);
      zone.avgPrice = Math.round(totalPrice / zoneConfigs.length * 10) / 10;
    } else {
      zone.avgPrice = 0;
    }
  });

  const zones = Object.values(zoneData).filter((zone: any) =>
    (selectedZone === "all" || zone.zone === selectedZone) &&
    (searchQuery === "" || 
     zone.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
     Array.from(zone.areas).some((area: any) => area.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(1)} Cr`;
  };

  const getZoneDescription = (zone: string) => {
    const descriptions: Record<string, string> = {
      north: "Emerging residential areas with good connectivity to the airport and upcoming metro lines.",
      south: "Premium residential zone with established IT corridors and excellent infrastructure.",
      east: "Major IT hub with Whitefield and surrounding areas, high growth potential.",
      west: "Developing residential areas with upcoming infrastructure projects.",
      central: "Core city areas with established commercial and residential developments."
    };
    return descriptions[zone] || "Residential development zone in Bengaluru.";
  };

  if (propertiesLoading || configurationsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-border px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">Zones</h2>
            <p className="text-sm text-gray-600 mt-1">Loading zone data...</p>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Zones</h2>
              <p className="text-sm text-gray-600 mt-1">Bengaluru residential zone analysis and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="north">North Bengaluru</SelectItem>
                  <SelectItem value="south">South Bengaluru</SelectItem>
                  <SelectItem value="east">East Bengaluru</SelectItem>
                  <SelectItem value="west">West Bengaluru</SelectItem>
                  <SelectItem value="central">Central Bengaluru</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search zones or areas..."
                  className="w-80 pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Zones</p>
                  <p className="text-2xl font-semibold text-gray-900">{Object.keys(zoneData).length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-semibold text-gray-900">{properties.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Highest Activity</p>
                  <p className="text-2xl font-semibold text-gray-900 capitalize">
                    {(() => {
                      const mostActive = Object.values(zoneData).sort((a: any, b: any) => b.totalProjects - a.totalProjects)[0] as any;
                      return mostActive?.zone || "N/A";
                    })()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Zone Price</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{Object.values(zoneData).length > 0 
                      ? Math.round(Object.values(zoneData).reduce((sum: number, zone: any) => sum + zone.avgPrice, 0) / Object.values(zoneData).length * 10) / 10 
                      : 0}Cr
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {propertiesLoading || configurationsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
              <p className="text-gray-600">
                {searchQuery ? "Try adjusting your search" : "No zones available"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {zones.map((zone: any) => (
                <Card key={zone.zone} className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 capitalize mb-2">
                        {zone.zone} Bengaluru
                      </h3>
                      <p className="text-sm text-gray-600 max-w-2xl">
                        {getZoneDescription(zone.zone)}
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">
                      {zone.totalProjects} Properties
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Projects</p>
                          <p className="text-xl font-semibold text-gray-900">{zone.totalProjects}</p>
                        </div>
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Projects</p>
                          <p className="text-xl font-semibold text-gray-900">{zone.activeProjects}</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">RERA Approved</p>
                          <p className="text-xl font-semibold text-gray-900">{zone.reraApproved}</p>
                        </div>
                        <Badge className="h-5 w-5 bg-green-100 text-green-800 rounded-full" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Price</p>
                          <p className="text-xl font-semibold text-gray-900">₹{zone.avgPrice}Cr</p>
                        </div>
                        <IndianRupee className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Active Developers</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(zone.developers).slice(0, 3).map((developer: any) => (
                          <Badge key={developer} variant="outline" className="text-xs">
                            {developer}
                          </Badge>
                        ))}
                        {zone.developers.size > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{zone.developers.size - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Property Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(zone.types).map((type: any) => (
                          <Badge key={type} variant="secondary" className="text-xs capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(zone.areas).slice(0, 3).map((area: any) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {zone.areas.size > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{zone.areas.size - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Properties</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {zone.properties.slice(0, 4).map((property: Property) => (
                        <div key={property.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{property.name}</p>
                              <p className="text-xs text-gray-600">{property.developer}</p>
                              <p className="text-xs text-gray-500">{property.area}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 text-sm">
                                {(() => {
                                  const propertyConfigs = allConfigurations.filter(c => c.propertyId === property.id);
                                  if (propertyConfigs.length === 0) return "Price on request";
                                  const avgPrice = propertyConfigs.reduce((sum, c) => sum + c.price, 0) / propertyConfigs.length;
                                  return formatPrice(avgPrice);
                                })()}
                              </p>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  property.status === "active" ? "bg-green-100 text-green-800" :
                                  property.status === "pre-launch" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {property.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
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