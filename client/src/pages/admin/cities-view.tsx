import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Building, 
  DollarSign, 
  Globe,
  Edit,
  Trash2
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";

export default function CityView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: city, isLoading } = useQuery({
    queryKey: [`/api/cities/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${id}`);
      if (!response.ok) throw new Error("Failed to fetch city");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Loading City...">
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

  if (!city) {
    return (
      <AdminLayout title="City Not Found">
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">City Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested city could not be found.
          </p>
          <Button onClick={() => setLocation("/admin-panel/cities")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cities
          </Button>
        </div>
      </AdminLayout>
    );
  }

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

  return (
    <AdminLayout title={`${city.name} Details`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/admin-panel/cities")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {city.name}
                <Badge variant={city.isActive ? "default" : "secondary"}>
                  {city.isActive ? "Active" : "Inactive"}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1">
                {city.state && `${city.state}, `}{city.country || 'India'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setLocation(`/admin-panel/cities/${city.id}/edit`)}
              data-testid="button-edit"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Population</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {city.population ? formatNumber(city.population) : 'Not Available'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Area</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {city.area ? `${city.area} km²` : 'Not Available'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Property Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {city.averagePropertyPrice ? formatPrice(city.averagePropertyPrice) : 'Not Available'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Display Order</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {city.displayOrder || 1}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Price Appreciation Rate
                </div>
                <div className="text-lg font-semibold">
                  {city.priceAppreciationRate ? `${city.priceAppreciationRate}%` : 'Not Available'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Rental Yield Range
                </div>
                <div className="text-lg font-semibold">
                  {city.rentalYieldRange || 'Not Available'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Transport
                  </div>
                  <div className="text-lg font-semibold">
                    {city.transportScore || 0}/10
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Education
                  </div>
                  <div className="text-lg font-semibold">
                    {city.educationScore || 0}/10
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Healthcare
                  </div>
                  <div className="text-lg font-semibold">
                    {city.healthcareScore || 0}/10
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Employment
                  </div>
                  <div className="text-lg font-semibold">
                    {city.employmentScore || 0}/10
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {city.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {city.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Created
              </div>
              <div className="text-sm">
                {city.createdAt ? new Date(city.createdAt).toLocaleString() : 'Not Available'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </div>
              <div className="text-sm">
                {city.updatedAt ? new Date(city.updatedAt).toLocaleString() : 'Not Available'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}