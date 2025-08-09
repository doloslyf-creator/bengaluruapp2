import { Edit, Download, MapPin, Calendar, Building, IndianRupee } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { formatPriceDisplay } from "@/lib/utils";
import { type Property, type PropertyConfiguration } from "@shared/schema";

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

  // Fetch configurations for this property
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

  const formatArea = (area: number | null) => {
    if (!area) return "N/A";
    return `${area.toLocaleString()} sq ft`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.name}</DialogTitle>
          <DialogDescription>
            Detailed information about this property including specifications and configurations.
          </DialogDescription>
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
                  <span className="text-gray-600">Developer:</span>
                  <span className="font-medium ml-1">{property.developer}</span>
                </div>
                <div>
                  <span className="text-gray-600">Zone:</span>
                  <span className="font-medium ml-1 capitalize">{property.zone || 'Unknown Zone'} Bengaluru</span>
                </div>
                <div>
                  <span className="text-gray-600">Possession:</span>
                  <span className="font-medium ml-1">{property.possessionDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={statusColors[property.status]}>
                    {property.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">RERA Approved:</span>
                  <Badge variant={property.reraApproved ? "default" : "secondary"}>
                    {property.reraApproved ? "Yes" : "No"}
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
                <strong>{property.area}</strong>, {property.zone ? (property.zone.charAt(0).toUpperCase() + property.zone.slice(1)) : 'Unknown Zone'} Bengaluru
              </p>
              <p className="text-gray-600 text-sm">{property.address}</p>
            </div>

            {/* Property Configurations */}
            {configurations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Available Configurations
                </h4>
                <div className="space-y-3">
                  {configurations.map((config, index) => (
                    <div key={config.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{config.configuration}</h5>
                        <span className="font-semibold text-primary text-lg">
                          {formatPriceDisplay(parseFloat(config.pricePerSqft.toString()) * config.builtUpArea)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span>Built-up Area: </span>
                          <span className="font-medium">{config.builtUpArea?.toLocaleString()} sq ft</span>
                        </div>
                        <div>
                          <span>Price per Sqft: </span>
                          <span className="font-medium">₹{config.pricePerSqft?.toLocaleString()}</span>
                        </div>
                        {config.plotSize && (
                          <div>
                            <span>Plot Size: </span>
                            <span className="font-medium">{config.plotSize?.toLocaleString()} sq ft</span>
                          </div>
                        )}
                        <div>
                          <span>Status: </span>
                          <Badge variant={config.availabilityStatus === "available" ? "default" : "secondary"} className="text-xs">
                            {config.availabilityStatus === "available" ? "Available" : config.availabilityStatus === "sold-out" ? "Sold Out" : "Limited"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
