import { Calendar, MapPin, Edit, Trash2, IndianRupee, Play } from "lucide-react";
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
    if (configurations.length === 0) {
      // Show default pricing if no configurations available
      return "₹45 L - ₹2.5 Cr";
    }

    // Calculate actual prices using pricePerSqft * builtUpArea
    const prices = configurations.map(c => {
      const pricePerSqft = parseFloat(c.pricePerSqft.toString());
      const builtUpArea = c.builtUpArea;
      return pricePerSqft * builtUpArea;
    });

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatPriceDisplay(minPrice);
    }
    return `${formatPriceDisplay(minPrice)} - ${formatPriceDisplay(maxPrice)}`;
  };

  return (
    <div
      className="card-stripe group hover:shadow-lg transition-stripe cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-xl flex items-center justify-center relative overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <>
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {property.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                +{property.images.length - 1} more
              </div>
            )}
            {property.youtubeVideoUrl && (
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                <Play className="h-3 w-3 mr-1" />
                Video
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground text-center group-hover:scale-110 transition-stripe">
            <div className="text-3xl mb-2">🏢</div>
            <p className="text-body-small font-medium">Property Image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-stripe"></div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-heading-3 text-foreground mb-2 group-hover:text-primary transition-stripe">{property.name}</h3>
            <p className="text-body-small text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {property.area}, {property.zone ? property.zone.charAt(0).toUpperCase() + property.zone.slice(1) : 'Bengaluru'} Bengaluru
            </p>
          </div>
          <Badge className={`${statusColors[property.status]} font-medium px-3 py-1 rounded-lg`}>
            {property.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {property.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`${tagColors[tag as keyof typeof tagColors] || "bg-muted text-muted-foreground"} text-xs font-medium px-2 py-1 rounded-md`}
            >
              {tag.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          ))}
          {property.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
              +{property.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-body-small">
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium text-foreground capitalize">{property.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Zone:</span>
              <span className="ml-2 font-medium text-foreground capitalize">{property.zone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Developer:</span>
              <span className="ml-2 font-medium text-foreground">{property.developer}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Possession:</span>
              <span className="ml-2 font-medium text-foreground">
                {property.possessionDate === "immediate" ? "Ready" : property.possessionDate}
              </span>
            </div>
          </div>
        </div>

        {/* Price Range Display */}
        <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-xl border border-border/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <IndianRupee className="h-4 w-4 text-primary" />
            </div>
            <span className="text-body-small text-muted-foreground font-medium">Price Range</span>
          </div>
          <span className="text-body font-semibold text-primary">
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