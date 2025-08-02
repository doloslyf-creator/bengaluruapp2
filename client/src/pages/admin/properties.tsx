import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Building, Eye, Edit2, List, BarChart3, 
  ChevronRight, Home, MapPin, Users, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/admin-layout";
import { type PropertyStats } from "@shared/schema";

export default function AdminProperties() {
  const { data: stats } = useQuery<PropertyStats>({
    queryKey: ["/api/properties/stats"],
  });

  return (
    <AdminLayout title="Property Management">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Property Management</h2>
              <p className="text-sm text-gray-600">Manage your property listings and inventory</p>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        {stats && (
          <div className="px-6 py-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalProperties}</p>
                    </div>
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-3xl font-bold text-green-600">{stats.activeProjects}</p>
                    </div>
                    <Home className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Zones</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalZones}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Developers</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalDevelopers}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Sub-Menu Navigation */}
        <div className="flex-1 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* View Properties */}
            <Link href="/admin-panel/properties/view">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <List className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">View Properties</h3>
                        <p className="text-sm text-gray-600">Browse and manage all property listings</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Table view by default</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Edit2 className="h-4 w-4" />
                      <span>Edit, delete, and view property details</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Search className="h-4 w-4" />
                      <span>Advanced search and filtering options</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>Property statistics and analytics</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline">
                      {stats ? `${stats.totalProperties} properties` : 'Loading...'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Add New Property */}
            <Link href="/admin-panel/properties/add">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-lg p-3">
                        <Plus className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Add New Property</h3>
                        <p className="text-sm text-gray-600">Create a new property listing</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>Complete property information form</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Location and zone selection</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Developer and pricing details</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Plus className="h-4 w-4" />
                      <span>Media uploads and property tags</span>
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