import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Search, Building, Grid3X3, List, Edit2, Eye, MapPin, Calendar, DollarSign, Tag, Users } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { AddPropertyDialog } from "@/components/property/add-property-dialog";
import { PropertyDetailsDialog } from "@/components/property/property-details-dialog";
import { PropertyFilters } from "@/components/property/property-filters";
import { StatsCards } from "@/components/property/stats-cards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { type Property, type PropertyStats } from "@shared/schema";

export default function AdminProperties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    zone: "all",
  });

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: stats } = useQuery<PropertyStats>({
    queryKey: ["/api/properties/stats"],
  });

  const filteredProperties = properties.filter((property: Property) => {
    const matchesSearch = 
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.area.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = 
      (filters.type === "all" || property.type === filters.type) &&
      (filters.status === "all" || property.status === filters.status) &&
      (filters.zone === "all" || property.zone === filters.zone);

    return matchesSearch && matchesFilters;
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/stats"] });
      toast({
        title: "Property deleted",
        description: "Property has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  const handlePropertyClick = (property: Property) => {
    navigate(`/admin-panel/property/${property.id}/edit`);
  };

  const handleDeleteProperty = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  return (
    <AdminLayout title="Property Management">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Property Listings</h2>
              <p className="text-sm text-gray-600">Manage your property inventory</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search properties..."
                  className="w-80 pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "cards" | "table")}>
                <ToggleGroupItem value="cards" aria-label="Card view">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </header>

        <PropertyFilters filters={filters} onFiltersChange={setFilters} />

        <main className="flex-1 overflow-y-auto p-6">
          <StatsCards stats={stats} />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "Try adjusting your search or filters" : "Get started by adding your first property"}
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property: Property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyClick(property)}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>RERA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property: Property) => (
                    <TableRow key={property.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{property.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {property.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{property.developer}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={property.status === 'active' ? 'default' : 
                                 property.status === 'under-construction' ? 'secondary' :
                                 property.status === 'completed' ? 'outline' : 'destructive'}
                        >
                          {property.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{property.area}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {property.zone}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-sm">
                            ₹{property.priceMin?.toFixed(1)}L - ₹{property.priceMax?.toFixed(1)}L
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={property.reraApproved ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {property.reraApproved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePropertyClick(property)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>

        <AddPropertyDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />

        <PropertyDetailsDialog
          property={selectedProperty}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      </div>
    </AdminLayout>
  );
}