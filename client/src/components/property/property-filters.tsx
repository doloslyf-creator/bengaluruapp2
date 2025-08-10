import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const uniqueTypes = Array.from(new Set(properties.map(p => p.type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(properties.map(p => p.status).filter(Boolean)));
  const uniqueZones = Array.from(new Set(properties.map(p => p.zone).filter(Boolean)));

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
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  Advanced Filters
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Property Type */}
          <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Zone */}
          <Select value={filters.zone} onValueChange={(value) => updateFilter("zone", value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {uniqueZones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* RERA Status */}
          <Select value={filters.reraApproved} onValueChange={(value) => updateFilter("reraApproved", value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="RERA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RERA</SelectItem>
              <SelectItem value="true">RERA Approved</SelectItem>
              <SelectItem value="false">Pending RERA</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="startingPrice">Price</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-50l">Under ₹50L</SelectItem>
                  <SelectItem value="50l-1cr">₹50L - ₹1Cr</SelectItem>
                  <SelectItem value="1cr-2cr">₹1Cr - ₹2Cr</SelectItem>
                  <SelectItem value="2cr-5cr">₹2Cr - ₹5Cr</SelectItem>
                  <SelectItem value="above-5cr">Above ₹5Cr</SelectItem>
                </SelectContent>
              </Select>

              {/* Possession Status */}
              <Select value={filters.possessionStatus} onValueChange={(value) => updateFilter("possessionStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Possession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Possession</SelectItem>
                  <SelectItem value="ready">Ready to Move</SelectItem>
                  <SelectItem value="under-construction">Under Construction</SelectItem>
                  <SelectItem value="tbd">TBD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}