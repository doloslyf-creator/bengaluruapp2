import { Calendar, MapPin, Edit, Trash2, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatPriceDisplay } from "@/lib/utils";
import { type Property, type PropertyConfiguration } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  "pre-launch": "bg-yellow-100 text-yellow-800",
  "active": "bg-green-100 text-green-800",
  "under-construction": "bg-blue-100 text-blue-800",
  "completed": "bg-green-100 text-green-800",
  "sold-out": "bg-red-100 text-red-800",
};

const tagColors = {
  "rera-approved": "bg-primary/10 text-primary",
  "gated-community": "bg-blue-100 text-blue-800",
  "flood-zone": "bg-red-100 text-red-800",
  "premium": "bg-orange-100 text-orange-800",
  "golf-course": "bg-purple-100 text-purple-800",
  "eco-friendly": "bg-green-100 text-green-800",
  "metro-connectivity": "bg-indigo-100 text-indigo-800",
  "it-hub-proximity": "bg-cyan-100 text-cyan-800",
};

export function PropertyCard({ property, onClick, onDelete }: PropertyCardProps) {
  // Fetch configurations for this property to show pricing
  const { data: configurations = [] } = useQuery<PropertyConfiguration[]>({
    queryKey: ["/api/property-configurations", property.id],
    queryFn: async () => {
      const response = await fetch(`/api/property-configurations/${property.id}`);
      if (response.ok) {
        return response.json();
      }
      return [];
    },
  });

  const formatArea = (area: number | null, type: string) => {
    if (!area) return null;
    return `${area.toLocaleString()} sq ft`;
  };

  // Get price range from configurations
  const getPriceRange = () => {
    if (configurations.length === 0) return "Price on request";
    const prices = configurations.map(c => c.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPriceDisplay(minPrice);
    }
    return `${formatPriceDisplay(minPrice)} - ${formatPriceDisplay(maxPrice)}`;
  };

  return (
    <div
      className="bg-white/95 backdrop-blur-sm rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-t-xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <div className="text-gray-600 text-center relative z-10">
          <div className="text-4xl mb-2 filter drop-shadow-sm">🏢</div>
          <p className="text-sm font-semibold">Property Image</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {property.area}, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Bengaluru
            </p>
          </div>
          <Badge className={statusColors[property.status]}>
            {property.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {property.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={tagColors[tag as keyof typeof tagColors] || "bg-gray-100 text-gray-800"}
            >
              {tag.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-1 font-medium capitalize">{property.type}</span>
          </div>
          <div>
            <span className="text-gray-600">Developer:</span>
            <span className="ml-1 font-medium">{property.developer}</span>
          </div>
          <div>
            <span className="text-gray-600">Zone:</span>
            <span className="ml-1 font-medium capitalize">{property.zone} Bengaluru</span>
          </div>
          <div>
            <span className="text-gray-600">Possession:</span>
            <span className="ml-1 font-medium">
              {property.possessionDate === "immediate" ? "Ready" : property.possessionDate}
            </span>
          </div>
        </div>
        
        {/* Price Range Display */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <IndianRupee className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm text-gray-600">Price Range:</span>
          </div>
          <span className="font-semibold text-primary">
            {getPriceRange()}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-gray-600">
            {property.reraApproved && (
              <Badge variant="outline" className="text-xs">
                RERA Approved
              </Badge>
            )}
          </span>
          <div className="flex items-center space-x-2">
            <Link href={`/admin-panel/property/${property.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${property.name}? This action cannot be undone.`)) {
                  onDelete?.(property.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
