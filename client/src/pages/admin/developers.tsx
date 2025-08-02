import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Building2, Eye, Edit2, List, BarChart3, 
  ChevronRight, Users, TrendingUp, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/admin-layout";
import { type Property } from "@shared/schema";

export default function AdminDevelopers() {
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: developers = [] } = useQuery({
    queryKey: ["/api/developers"],
    queryFn: async () => {
      const response = await fetch("/api/developers");
      if (!response.ok) throw new Error("Failed to fetch developers");
      return response.json();
    },
  });

  return (
    <AdminLayout title="Developer Management">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Developer Management</h2>
              <p className="text-sm text-gray-600">Manage property developers and builders</p>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="px-6 py-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Developers</p>
                    <p className="text-3xl font-bold text-primary">{developers.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Properties</p>
                    <p className="text-3xl font-bold text-green-600">{properties.length}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Portfolio</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {developers.length > 0 ? Math.round(properties.length / developers.length) : 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sub-Menu Navigation */}
        <div className="flex-1 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* View Developers */}
            <Link href="/admin-panel/developers/view">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <List className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">View Developers</h3>
                        <p className="text-sm text-gray-600">Browse and manage all developers</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Table view with developer details</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Edit2 className="h-4 w-4" />
                      <span>Edit and delete developer information</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>View developer portfolios</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>Performance analytics</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline">
                      {developers.length} developers
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Add New Developer */}
            <Link href="/admin-panel/developers/add">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-lg p-3">
                        <Plus className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Add New Developer</h3>
                        <p className="text-sm text-gray-600">Register a new developer/builder</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>Company name and details</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Contact information</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Operating areas and specialties</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Plus className="h-4 w-4" />
                      <span>Quick developer registration</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Quick Setup
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}