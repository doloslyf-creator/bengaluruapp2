import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Building2, 
  Calendar,
  Settings
} from "lucide-react";

interface DataSummary {
  supabaseReady: boolean;
  existingData: {
    properties: number;
    leads: number;
    bookings: number;
    teamMembers: number;
  };
  supabaseData?: {
    properties: number;
    leads: number;
    bookings: number;
    teamMembers: number;
  };
}

export default function SupabaseMigration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch migration status
  const { data: status, isLoading: statusLoading, refetch } = useQuery<DataSummary>({
    queryKey: ["/api/supabase/status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Migration mutations
  const migrationMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      const response = await fetch(`/api/supabase/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Migration failed');
      }
      
      return response.json();
    },
    onSuccess: (data, endpoint) => {
      toast({
        title: "Migration Successful",
        description: data.message,
      });
      refetch();
    },
    onError: (error: Error, endpoint) => {
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMigration = (endpoint: string) => {
    migrationMutation.mutate(endpoint);
  };

  if (statusLoading) {
    return (
      <AdminLayout title="Supabase Migration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Supabase status...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Supabase Migration">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Migration</h1>
          <p className="text-muted-foreground">
            Migrate your data from PostgreSQL/Drizzle to Supabase
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={statusLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Connection Status</CardTitle>
            </div>
            <Badge variant={status?.supabaseReady ? "default" : "secondary"}>
              {status?.supabaseReady ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {status?.supabaseReady ? (
            <p className="text-green-600">
              ✅ Supabase is configured and ready for migration
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-orange-600">
                ⚠️ Supabase not configured. Using existing PostgreSQL database.
              </p>
              <p className="text-sm text-muted-foreground">
                Ensure your Supabase credentials are properly set in the environment variables.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Current Database</span>
            </CardTitle>
            <CardDescription>
              Data in your existing PostgreSQL/Drizzle setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>Properties</span>
              </div>
              <Badge variant="outline">{status?.existingData.properties || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-500" />
                <span>Leads</span>
              </div>
              <Badge variant="outline">{status?.existingData.leads || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>Bookings</span>
              </div>
              <Badge variant="outline">{status?.existingData.bookings || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span>Team Members</span>
              </div>
              <Badge variant="outline">{status?.existingData.teamMembers || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Supabase Database</span>
            </CardTitle>
            <CardDescription>
              {status?.supabaseReady 
                ? "Data already migrated to Supabase"
                : "Supabase not available"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.supabaseReady && status.supabaseData ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span>Properties</span>
                  </div>
                  <Badge variant="outline">{status.supabaseData.properties}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>Leads</span>
                  </div>
                  <Badge variant="outline">{status.supabaseData.leads}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>Bookings</span>
                  </div>
                  <Badge variant="outline">{status.supabaseData.bookings}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-orange-500" />
                    <span>Team Members</span>
                  </div>
                  <Badge variant="outline">{status.supabaseData.teamMembers}</Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Supabase not configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Migration Actions */}
      {status?.supabaseReady && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Actions</CardTitle>
            <CardDescription>
              Migrate your data to Supabase. You can migrate individual data types or all at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleMigration('migrate/properties')}
                disabled={migrationMutation.isPending}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center space-y-2"
              >
                <Building2 className="h-6 w-6" />
                <span>Migrate Properties</span>
                <span className="text-xs text-muted-foreground">
                  {status.existingData.properties} records
                </span>
              </Button>

              <Button
                onClick={() => handleMigration('migrate/leads')}
                disabled={migrationMutation.isPending}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center space-y-2"
              >
                <Users className="h-6 w-6" />
                <span>Migrate Leads</span>
                <span className="text-xs text-muted-foreground">
                  {status.existingData.leads} records
                </span>
              </Button>
            </div>

            <Separator className="my-6" />

            <Button
              onClick={() => handleMigration('migrate')}
              disabled={migrationMutation.isPending}
              className="w-full h-12"
              size="lg"
            >
              {migrationMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Migrate All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Before Migration:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Ensure Supabase credentials are properly configured</li>
              <li>Create the database schema using the provided SQL file</li>
              <li>Backup your existing data as a precaution</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">During Migration:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Data is migrated in batches to ensure reliability</li>
              <li>Existing data is preserved and Supabase data is upserted</li>
              <li>Progress is logged and errors are handled gracefully</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">After Migration:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Verify data integrity by comparing record counts</li>
              <li>Test key functionality with Supabase</li>
              <li>Switch storage implementation when ready</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}