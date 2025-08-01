import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Link, useLocation } from "wouter";
import { Plus, Search, LogOut } from "lucide-react";
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
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

  const handleEditClick = (property: Property) => {
    navigate(`/admin-panel/property/${property.id}/edit`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Admin Panel</h1>
              <p className="text-gray-600">Welcome back, Admin ({user?.phoneNumber})</p>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="flex space-x-8">
                <Link href="/admin-panel" className="text-violet-600 font-medium">Dashboard</Link>
                <Link href="/admin-panel/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
                <Link href="/admin-panel/developers" className="text-gray-600 hover:text-gray-900">Developers</Link>
                <Link href="/admin-panel/zones" className="text-gray-600 hover:text-gray-900">Zones</Link>
              </nav>
              
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && <StatsCards stats={stats} />}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties, developers, locations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={() => setShowAddDialog(true)} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>

          <div className="mt-6">
            <PropertyFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="mb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filters.type !== "all" || filters.status !== "all" || filters.zone !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first property"
                }
              </p>
              {!searchQuery && filters.type === "all" && filters.status === "all" && filters.zone === "all" && (
                <Button onClick={() => setShowAddDialog(true)} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Property
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property: Property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyClick(property)}
                  onDelete={handleDeleteProperty}
                  onEdit={() => handleEditClick(property)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddPropertyDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
      
      <PropertyDetailsDialog
        property={selectedProperty}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onEdit={handleEditClick}
      />
    </div>
  );
}