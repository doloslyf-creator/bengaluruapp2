import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface PropertyFiltersProps {
  filters: {
    type: string;
    status: string;
    zone: string;
  };
  onFiltersChange: (filters: { type: string; status: string; zone: string }) => void;
}

export function PropertyFilters({ filters, onFiltersChange }: PropertyFiltersProps) {
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
    });
  };

  const hasActiveFilters = filters.type !== "all" || filters.status !== "all" || filters.zone !== "all";

  return (
    <div className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pre-launch">Pre-Launch</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under-construction">Under Construction</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="sold-out">Sold Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Zone:</label>
          <Select value={filters.zone} onValueChange={(value) => updateFilter("zone", value)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Zones" />
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
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
        >
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
        </Button>
      </div>
    </div>
  );
}
