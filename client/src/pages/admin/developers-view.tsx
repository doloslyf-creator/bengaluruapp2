import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, Plus, Edit2, Trash2, Building2, MapPin, 
  Search, Filter, MoreHorizontal, Phone, Mail
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

export default function DevelopersView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: developers = [], isLoading } = useQuery({
    queryKey: ["/api/developers"],
    queryFn: async () => {
      const response = await fetch("/api/developers");
      if (!response.ok) throw new Error("Failed to fetch developers");
      return response.json();
    },
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const deleteDeveloperMutation = useMutation({
    mutationFn: async (developerId: string) => {
      return apiRequest("DELETE", `/api/developers/${developerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/developers"] });
      toast({
        title: "Developer deleted",
        description: "Developer has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete developer.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (developerId: string, developerName: string) => {
    if (window.confirm(`Are you sure you want to delete "${developerName}"? This action cannot be undone.`)) {
      deleteDeveloperMutation.mutate(developerId);
    }
  };

  // Count properties per developer
  const developerPropertyCounts = properties.reduce((acc: Record<string, number>, property: any) => {
    acc[property.developer] = (acc[property.developer] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout title="View Developers">
      <div className="flex flex-col h-full">
        {/* Breadcrumb Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/admin-panel/developers">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Developers
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                <span>Developers</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">View Developers</span>
              </div>
            </div>
            <Link href="/admin-panel/developers/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Developer
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
                placeholder="Search developers..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Developers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Developers ({developers.length})</span>
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
              ) : developers.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No developers found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first developer.</p>
                  <Link href="/admin-panel/developers/add">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Developer
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {developers.map((developer: any) => (
                      <TableRow key={developer.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="font-medium">{developer.name}</span>
                              {developer.description && (
                                <p className="text-sm text-gray-500">{developer.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {developer.phone && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{developer.phone}</span>
                              </div>
                            )}
                            {developer.email && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span>{developer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{developerPropertyCounts[developer.name] || 0} properties</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {developer.specialization || "General Construction"}
                          </span>
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
                                Edit Developer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(developer.id, developer.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Developer
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