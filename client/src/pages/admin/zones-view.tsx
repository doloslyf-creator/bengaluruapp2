import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, Plus, Edit2, Trash2, MapPin, Building, 
  Search, Filter, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";

export default function ZonesView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["/api/zones"],
    queryFn: async () => {
      const response = await fetch("/api/zones");
      if (!response.ok) throw new Error("Failed to fetch zones");
      return response.json();
    },
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      return apiRequest("DELETE", `/api/zones/${zoneId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
      toast({
        title: "Zone deleted",
        description: "Zone has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete zone.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (zoneId: string, zoneName: string) => {
    if (window.confirm(`Are you sure you want to delete "${zoneName}"? This action cannot be undone.`)) {
      deleteZoneMutation.mutate(zoneId);
    }
  };

  // Count properties per zone
  const zonePropertyCounts = properties.reduce((acc: Record<string, number>, property: any) => {
    acc[property.zone] = (acc[property.zone] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout title="View Zones">
      <div className="flex flex-col h-full">
        {/* Breadcrumb Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/admin-panel/zones">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Zones
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                <span>Zones</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">View Zones</span>
              </div>
            </div>
            <Link href="/admin-panel/zones/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search zones..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Zones Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Zones ({zones.length})</span>
                <Badge variant="outline">
                  {properties.length} properties
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : zones.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first zone.</p>
                  <Link href="/admin-panel/zones/add">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Zone
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map((zone: any) => (
                      <TableRow key={zone.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{zone.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {zone.description || "No description provided"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span>{zonePropertyCounts[zone.name] || 0} properties</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Zone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(zone.id, zone.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Zone
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}