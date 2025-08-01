import { Edit, Download, MapPin, Calendar, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Property } from "@shared/schema";

interface PropertyDetailsDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function PropertyDetailsDialog({ property, open, onOpenChange }: PropertyDetailsDialogProps) {
  if (!property) return null;

  const formatPrice = (price: number) => {
    if (price >= 100) {
      return `₹${(price / 100).toFixed(1)} Cr`;
    }
    return `₹${price} L`;
  };

  const formatArea = (area: number | null) => {
    if (!area) return "N/A";
    return `${area.toLocaleString()} sq ft`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Image */}
          <div>
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-gray-400 text-center">
                <Building className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Property Image</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag) => (
                <Badge
                  key={tag}
                  className={tagColors[tag as keyof typeof tagColors] || "bg-gray-100 text-gray-800"}
                >
                  {tag.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium ml-1 capitalize">{property.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium ml-1">{formatPrice(property.price)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Built-up Area:</span>
                  <span className="font-medium ml-1">{formatArea(property.builtUpArea)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Land Area:</span>
                  <span className="font-medium ml-1">{formatArea(property.landArea)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-medium ml-1 uppercase">
                    {property.bedrooms?.replace("-", " ") || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Possession:</span>
                  <span className="font-medium ml-1">{property.possessionDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Developer:</span>
                  <span className="font-medium ml-1">{property.developer}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={statusColors[property.status]}>
                    {property.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </h4>
              <p className="text-gray-600 mb-2">
                <strong>{property.area}</strong>, {property.zone.charAt(0).toUpperCase() + property.zone.slice(1)} Bengaluru
              </p>
              <p className="text-gray-600 text-sm">{property.address}</p>
            </div>

            {property.reraNumber && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">RERA Number</h4>
                <p className="text-gray-600 font-mono text-sm">{property.reraNumber}</p>
              </div>
            )}

            {(property.infrastructureVerdict || property.zoningInfo) && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h4>
                {property.infrastructureVerdict && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Infrastructure:</span>
                    <p className="text-gray-600 text-sm">{property.infrastructureVerdict}</p>
                  </div>
                )}
                {property.zoningInfo && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Zoning:</span>
                    <p className="text-gray-600 text-sm">{property.zoningInfo}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
