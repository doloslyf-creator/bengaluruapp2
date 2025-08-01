import { Calendar, MapPin, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
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

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 100) {
      return `₹${(price / 100).toFixed(1)} Cr`;
    }
    return `₹${price} L`;
  };

  const formatArea = (area: number | null, type: string) => {
    if (!area) return null;
    return `${area.toLocaleString()} sq ft`;
  };

  // Remove display area since it's now in configurations

  return (
    <div
      className="bg-white rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-2">🏢</div>
          <p className="text-sm">Property Image</p>
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
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-gray-600">
            {property.reraApproved && (
              <Badge variant="outline" className="text-xs">
                RERA Approved
              </Badge>
            )}
          </span>
          <div className="flex items-center space-x-2">
            <Link href={`/property/${property.id}/edit`}>
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
                // TODO: Handle delete
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
