import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, Building, Edit2, Trash2, Eye, MapPin, Calendar, 
  DollarSign, Tag, Users, Grid3X3, List, ChevronRight,
  AlertCircle, CheckCircle, Clock, Home
} from "lucide-react";
import { PropertyFilters } from "@/components/property/property-filters";
import { StatsCards } from "@/components/property/stats-cards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPriceDisplay } from "@/lib/utils";
import AdminLayout from "@/components/layout/admin-layout";
import { type Property, type PropertyStats } from "@shared/schema";

export default function PropertiesView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table"); // Default to table view
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      setShowDeleteDialog(false);
      setSelectedProperty(null);
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

  const handleEditProperty = (property: Property) => {
    navigate(`/admin-panel/property/${property.id}/edit`);
  };

  const handleDeleteProperty = () => {
    if (selectedProperty) {
      deletePropertyMutation.mutate(selectedProperty.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      sold: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      "under-construction": { color: "bg-blue-100 text-blue-800", icon: Clock },
      "coming-soon": { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span className="capitalize">{status.replace('-', ' ')}</span>
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      apartment: "bg-blue-50 text-blue-700",
      villa: "bg-green-50 text-green-700",
      plot: "bg-orange-50 text-orange-700",
      commercial: "bg-purple-50 text-purple-700",
    };
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-50 text-gray-700"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout title="View Properties">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Building className="h-4 w-4" />
                <span>Properties</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">View Properties</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">Property Listings</h2>
              <p className="text-sm text-gray-600">Manage and view all property listings</p>
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
            </div>
          </div>
        </header>

        <PropertyFilters filters={filters} onFiltersChange={setFilters} />

        {/* Stats Cards */}
        <div className="px-6 py-4">
          <StatsCards stats={stats} />
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : viewMode === "table" ? (
            /* Table View */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Properties ({filteredProperties.length})</span>
                  <Badge variant="outline">{filteredProperties.length} properties found</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary/10 rounded-lg p-2">
                                <Building className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{property.name}</div>
                                <div className="text-sm text-gray-600">{property.area}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(property.type)}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>{property.zone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {formatPriceDisplay(property.startingPrice, property.maxPrice)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">{property.developer}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/property/${property.id}`)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProperty(property)}
                                className="flex items-center space-x-1"
                              >
                                <Edit2 className="h-3 w-3" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setShowDeleteDialog(true);
                                }}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredProperties.length === 0 && (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters to find properties.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{property.area}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getTypeBadge(property.type)}
                        {getStatusBadge(property.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Price Range</p>
                        <p className="font-medium">{formatPriceDisplay(property.startingPrice, property.maxPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Developer</p>
                        <p className="font-medium">{property.developer}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Zone</p>
                        <p className="font-medium">{property.zone}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProperty(property)}
                        className="flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProperty?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex space-x-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProperty}
                disabled={deletePropertyMutation.isPending}
              >
                {deletePropertyMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}