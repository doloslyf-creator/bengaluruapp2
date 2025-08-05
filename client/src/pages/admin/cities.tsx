import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users, Building, Eye, Edit, Trash2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdminCities() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cities
  const { data: cities = [], isLoading: isLoadingCities } = useQuery<any[]>({
    queryKey: ["/api/cities"],
  });

  // Delete city mutation
  const deleteCityMutation = useMutation({
    mutationFn: async (cityId: string) => {
      const response = await apiRequest("DELETE", `/api/cities/${cityId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({ title: "City deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting city",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoadingCities) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cities Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage cities and their geographical information for property organization
            </p>
          </div>
          <Button onClick={() => setLocation("/admin-panel/cities/create")} data-testid="button-create-city">
            <Plus className="h-4 w-4 mr-2" />
            Add City
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cities.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cities.filter(city => city.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cities.reduce((total, city) => total + (city.zones?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Property Price</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cities.length > 0 
                  ? formatPrice(cities.reduce((sum, city) => sum + (city.avgPropertyPrice || 0), 0) / cities.length)
                  : "₹0"
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
          </CardHeader>
          <CardContent>
            {cities.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cities</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first city to start organizing properties geographically.
                </p>
                <Button onClick={() => setLocation("/admin-panel/cities/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First City
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">City</th>
                      <th className="text-left p-4 font-medium">State/Country</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Zones</th>
                      <th className="text-left p-4 font-medium">Population</th>
                      <th className="text-left p-4 font-medium">Avg Property Price</th>
                      <th className="text-left p-4 font-medium">Infrastructure</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((city) => (
                      <tr key={city.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Order: {city.displayOrder || 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {city.state && <div>{city.state}</div>}
                            <div className="text-muted-foreground">{city.country || 'India'}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(city.isActive)}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">
                            {city.zones?.length || 0} zones
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {city.population ? formatNumber(city.population) : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">
                            {city.avgPropertyPrice ? formatPrice(city.avgPropertyPrice) : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {city.infrastructureScore ? `${city.infrastructureScore}/10` : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin-panel/cities/${city.id}`)}
                              data-testid={`button-view-${city.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin-panel/cities/${city.id}/edit`)}
                              data-testid={`button-edit-${city.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCityMutation.mutate(city.id)}
                              disabled={deleteCityMutation.isPending}
                              data-testid={`button-delete-${city.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}