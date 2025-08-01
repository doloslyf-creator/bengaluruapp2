import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, Search, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { PropertyCard } from "@/components/property/property-card";
import { AddPropertyDialog } from "@/components/property/add-property-dialog";
import { PropertyDetailsDialog } from "@/components/property/property-details-dialog";
import { PropertyFilters } from "@/components/property/property-filters";
import { StatsCards } from "@/components/property/stats-cards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Property, type PropertyStats } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
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
    const matchesSearch = searchQuery === "" || 
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
        title: "Success",
        description: "Property deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProperty = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setShowDetailsDialog(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Property Management</h2>
              <p className="text-sm text-gray-600 mt-2 font-medium">Manage residential properties across Bengaluru</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search properties..."
                  className="w-80 pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-6">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filters.type || filters.status || filters.zone 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first property"}
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : (
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
          )}
        </main>
      </div>

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
  );
}
