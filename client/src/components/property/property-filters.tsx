
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, SortAsc, SortDesc, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { type Property } from "@shared/schema";

interface PropertyFiltersProps {
  filters: {
    type: string;
    status: string;
    zone: string;
    reraApproved: string;
    priceRange: string;
    possessionStatus: string;
    sortBy: string;
    sortOrder: string;
  };
  onFiltersChange: (filters: any) => void;
  properties?: Property[];
  totalCount?: number;
  filteredCount?: number;
}

export function PropertyFilters({ 
  filters, 
  onFiltersChange, 
  properties = [],
  totalCount = 0,
  filteredCount = 0
}: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      status: "all",
      zone: "all",
      reraApproved: "all",
      priceRange: "all",
      possessionStatus: "all",
      sortBy: "name",
      sortOrder: "asc"
    });
  };

  const hasActiveFilters = Object.values(filters).some((value, index) => {
    const defaultValues = ["all", "all", "all", "all", "all", "all", "name", "asc"];
    return value !== defaultValues[index];
  });

  const getActiveFiltersCount = () => {
    const defaultValues = ["all", "all", "all", "all", "all", "all", "name", "asc"];
    return Object.values(filters).filter((value, index) => value !== defaultValues[index]).length;
  };

  // Get unique values from properties for dynamic options
  const uniqueTypes = Array.from(new Set(properties.map(p => p.type))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(properties.map(p => p.status))).filter(Boolean);
  const uniqueZones = Array.from(new Set(properties.map(p => p.zone))).filter(Boolean);
  const uniqueDevelopers = Array.from(new Set(properties.map(p => p.developer))).filter(Boolean);

  return (
    <div className="bg-white border-b border-border">
      {/* Main Filters Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </div>
            
            {totalCount > 0 && (
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredCount}</span> of{" "}
                <span className="font-semibold">{totalCount}</span> properties
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? "Hide Advanced" : "Advanced Filters"}
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Type</label>
            <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Zone</label>
            <Select value={filters.zone} onValueChange={(value) => updateFilter("zone", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {uniqueZones.map(zone => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Price Range</label>
            <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50">Under ₹50L</SelectItem>
                <SelectItem value="50-100">₹50L - ₹1Cr</SelectItem>
                <SelectItem value="100-200">₹1Cr - ₹2Cr</SelectItem>
                <SelectItem value="200-500">₹2Cr - ₹5Cr</SelectItem>
                <SelectItem value="above-500">Above ₹5Cr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Sort By</label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="possession">Possession</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">Order</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
              className="h-9 justify-start"
            >
              {filters.sortOrder === "asc" ? (
                <>
                  <SortAsc className="h-4 w-4 mr-1" />
                  Ascending
                </>
              ) : (
                <>
                  <SortDesc className="h-4 w-4 mr-1" />
                  Descending
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleContent className="px-6 pb-4">
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-700">RERA Approved</label>
                  <Select value={filters.reraApproved} onValueChange={(value) => updateFilter("reraApproved", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="yes">RERA Approved Only</SelectItem>
                      <SelectItem value="no">Non-RERA Properties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-700">Possession Status</label>
                  <Select value={filters.possessionStatus} onValueChange={(value) => updateFilter("possessionStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ready">Ready to Move</SelectItem>
                      <SelectItem value="under-construction">Under Construction</SelectItem>
                      <SelectItem value="upcoming">Future Projects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-700">Quick Actions</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onFiltersChange({
                          ...filters,
                          reraApproved: "yes",
                          status: "active"
                        });
                      }}
                      className="text-xs"
                    >
                      Active & RERA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onFiltersChange({
                          ...filters,
                          possessionStatus: "ready",
                          status: "active"
                        });
                      }}
                      className="text-xs"
                    >
                      Ready to Move
                    </Button>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Active Filters:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(filters).map(([key, value]) => {
                        const defaultValues = {
                          type: "all", status: "all", zone: "all", 
                          reraApproved: "all", priceRange: "all", possessionStatus: "all",
                          sortBy: "name", sortOrder: "asc"
                        };
                        
                        if (value !== (defaultValues as any)[key]) {
                          return (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-gray-300"
                              onClick={() => updateFilter(key, (defaultValues as any)[key])}
                            >
                              {key}: {value}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
