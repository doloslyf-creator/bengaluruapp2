
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search, Building, Edit2, Trash2, Eye, MapPin, Calendar,
  DollarSign, Tag, Users, Grid3X3, List, ChevronRight,
  AlertCircle, CheckCircle, Clock, Home, Filter, X, Plus
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
import AdminLayout from "@/components/layout/admin-layout";
import { type Property, type PropertyStats } from "@shared/schema";

export default function PropertiesView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    zone: "all",
    reraApproved: "all",
    priceRange: "all",
    possessionStatus: "all",
    sortBy: "name",
    sortOrder: "asc"
  });

  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    retry: 3,
    retryDelay: 1000,
  });

  const { data: stats } = useQuery<PropertyStats>({
    queryKey: ["/api/properties/stats"],
  });

  console.log("Properties data:", properties);
  console.log("Properties loading:", isLoading);
  console.log("Properties error:", error);

  const filteredAndSortedProperties = useMemo(() => {
    if (!Array.isArray(properties)) {
      console.log("Properties is not an array:", properties);
      return [];
    }

    let computedProperties = [...properties];

    // Apply search query
    if (searchQuery.trim()) {
      computedProperties = computedProperties.filter((property: Property) =>
        property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.zone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type !== "all") {
      computedProperties = computedProperties.filter(p => p.type === filters.type);
    }

    if (filters.status !== "all") {
      computedProperties = computedProperties.filter(p => p.status === filters.status);
    }

    if (filters.zone !== "all") {
      computedProperties = computedProperties.filter(p => p.zone === filters.zone);
    }

    if (filters.reraApproved !== "all") {
      const isReraFilter = filters.reraApproved === "true";
      computedProperties = computedProperties.filter(p => !!p.reraNumber === isReraFilter);
    }

    if (filters.priceRange !== "all") {
      computedProperties = computedProperties.filter(p => {
        const price = p.startingPrice || 0;
        switch (filters.priceRange) {
          case "under-50l": return price < 5000000;
          case "50l-1cr": return price >= 5000000 && price < 10000000;
          case "1cr-2cr": return price >= 10000000 && price < 20000000;
          case "2cr-5cr": return price >= 20000000 && price < 50000000;
          case "above-5cr": return price >= 50000000;
          default: return true;
        }
      });
    }

    if (filters.possessionStatus !== "all") {
      const currentDate = new Date();
      computedProperties = computedProperties.filter(p => {
        if (!p.possessionDate) return filters.possessionStatus === "tbd";
        const possessionDate = new Date(p.possessionDate);
        
        switch (filters.possessionStatus) {
          case "ready": return possessionDate <= currentDate;
          case "under-construction": return possessionDate > currentDate;
          case "tbd": return !p.possessionDate;
          default: return true;
        }
      });
    }

    // Apply sorting
    computedProperties.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Property] || "";
      let bValue: any = b[filters.sortBy as keyof Property] || "";

      if (filters.sortBy === "startingPrice") {
        aValue = a.startingPrice || 0;
        bValue = b.startingPrice || 0;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return computedProperties;
  }, [properties, searchQuery, filters]);

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

  const formatPriceDisplay = (startingPrice?: number, maxPrice?: number) => {
    if (!startingPrice && !maxPrice) return "Price on Request";

    const formatPrice = (price: number): string => {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
      } else {
        return `₹${price.toLocaleString()}`;
      }
    };

    if (startingPrice && maxPrice && startingPrice !== maxPrice) {
      return `${formatPrice(startingPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(startingPrice || maxPrice || 0);
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "default";
      case "sold out": return "destructive";
      case "coming soon": return "secondary";
      case "under construction": return "outline";
      default: return "secondary";
    }
  };

  const renderTableView = () => (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Developer</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price Range</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>RERA</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedProperties.map((property) => (
            <TableRow key={property.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{property.name}</div>
                  <div className="text-sm text-gray-500">{property.area}</div>
                </div>
              </TableCell>
              <TableCell className="text-gray-900">{property.developer}</TableCell>
              <TableCell>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.zone}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{property.type}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                {formatPriceDisplay(property.startingPrice, property.maxPrice)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(property.status)}>
                  {property.status}
                </Badge>
              </TableCell>
              <TableCell>
                {property.reraNumber ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Approved</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-xs">Pending</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/property-detail-minimal?id=${property.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProperty(property)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedProperties.map((property) => (
        <Card key={property.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{property.developer}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(property.status)}>
                {property.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property.area}, {property.zone}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Home className="h-4 w-4 mr-2" />
                <span>{property.type}</span>
              </div>

              <div className="flex items-center text-gray-900 font-semibold">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>{formatPriceDisplay(property.startingPrice, property.maxPrice)}</span>
              </div>

              {property.reraNumber && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">RERA Approved</span>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/property-detail-minimal?id=${property.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProperty(property)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedProperty(property);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    console.error("Properties fetch error:", error);
    return (
      <AdminLayout title="View Properties">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
            <p className="text-gray-600 mb-4">There was a problem fetching the properties data.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/properties"] })}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedProperties.length} of {properties.length} properties
              </p>
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
              <Button onClick={() => navigate("/admin-panel/properties/add")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <StatsCards stats={stats} />
          </div>
        )}

        {/* Filters */}
        <PropertyFilters
          filters={filters}
          onFiltersChange={setFilters}
          properties={properties}
          totalCount={properties.length}
          filteredCount={filteredAndSortedProperties.length}
        />

        {/* Content */}
        <div className="flex-1 px-6 py-6 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            </div>
          ) : filteredAndSortedProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {properties.length === 0 ? "No properties found" : "No properties match your filters"}
              </h3>
              <p className="text-gray-600 mb-4">
                {properties.length === 0 
                  ? "Get started by adding your first property"
                  : "Try adjusting your search or filters"
                }
              </p>
              {properties.length === 0 && (
                <Button onClick={() => navigate("/admin-panel/properties/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              )}
            </div>
          ) : (
            viewMode === "table" ? renderTableView() : renderCardView()
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
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
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
