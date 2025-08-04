import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
  Server,
  Users,
  FileText,
  Settings,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SupabaseMigration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [migrationStep, setMigrationStep] = useState<string | null>(null);

  // Fetch migration status
  const { data: migrationStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/supabase/migration-status"],
    refetchInterval: 5000, // Refresh every 5 seconds during migration
  });

  // Fetch existing Supabase status
  const { data: supabaseStatus } = useQuery({
    queryKey: ["/api/supabase/status"],
  });

  // Complete migration mutation
  const migrateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/supabase/migrate-all-data"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/migration-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/status"] });
      toast({
        title: "Migration Successful",
        description: data.message || "All data has been migrated to Supabase successfully!",
      });
      setMigrationStep(null);
    },
    onError: (error: any) => {
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to migrate data to Supabase",
        variant: "destructive",
      });
      setMigrationStep(null);
    },
  });

  // Verify migration mutation
  const verifyMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/supabase/verify-migration"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/migration-status"] });
      toast({
        title: "Verification Complete",
        description: "Migration verification completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify migration",
        variant: "destructive",
      });
    },
  });

  const handleMigrateAll = () => {
    setMigrationStep("migration");
    migrateMutation.mutate();
  };

  const handleVerifyMigration = () => {
    verifyMutation.mutate();
  };

  const isSupabaseConnected = migrationStatus?.supabaseConnected;
  const migrationCounts = migrationStatus?.migrationStatus?.counts;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Supabase Migration</h1>
          <p className="text-muted-foreground">
            Migrate your data from PostgreSQL to Supabase for unified database management
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Connection Status</span>
            </CardTitle>
            <CardDescription>
              Current database connections and migration readiness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Database */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Server className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-medium">Current PostgreSQL</div>
                    <div className="text-sm text-muted-foreground">Active database</div>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              {/* Supabase */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">Supabase</div>
                    <div className="text-sm text-muted-foreground">Target database</div>
                  </div>
                </div>
                {statusLoading ? (
                  <Badge variant="secondary">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Checking...
                  </Badge>
                ) : isSupabaseConnected ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </div>

            {!isSupabaseConnected && !statusLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Supabase connection failed. Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Current Data Summary */}
        {supabaseStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Current Data Summary</span>
              </CardTitle>
              <CardDescription>
                Overview of data in your current database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {supabaseStatus.existingData?.properties || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Properties</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {supabaseStatus.existingData?.leads || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Leads</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {supabaseStatus.existingData?.valuationReports || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Reports</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {supabaseStatus.existingData?.settings || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Settings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Migration Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Migration Actions</span>
            </CardTitle>
            <CardDescription>
              Start the data migration process to Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Migration Process Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold">Migration Process:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <span>Properties & Configurations</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <span>Valuation Reports & Data</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                  <span>Application Settings</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">4</div>
                  <span>Verification & Testing</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Migration Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleMigrateAll}
                disabled={!isSupabaseConnected || migrateMutation.isPending}
                size="lg"
                className="flex-1"
              >
                {migrateMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Migrating Data...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Start Complete Migration</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <Button
                onClick={handleVerifyMigration}
                disabled={!isSupabaseConnected || verifyMutation.isPending}
                variant="outline"
                size="lg"
              >
                {verifyMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify Migration</span>
                  </div>
                )}
              </Button>

              <Button
                onClick={() => refetchStatus()}
                variant="outline"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Migration Progress */}
            {migrationStep && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Migration Progress</span>
                  <span className="text-sm text-muted-foreground">In Progress...</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Migration Results */}
        {migrationCounts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Migration Results</span>
              </CardTitle>
              <CardDescription>
                Current data in Supabase after migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{migrationCounts.properties}</div>
                  <div className="text-sm text-muted-foreground">Properties Migrated</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{migrationCounts.valuationReports}</div>
                  <div className="text-sm text-muted-foreground">Reports Migrated</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{migrationCounts.customers}</div>
                  <div className="text-sm text-muted-foreground">Customers Migrated</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{migrationCounts.settings}</div>
                  <div className="text-sm text-muted-foreground">Settings Migrated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Important Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Before Migration:</strong> Ensure you have your Supabase database connection string ready. 
                After successful migration, you'll need to update your DATABASE_URL environment variable to point to Supabase.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold">Post-Migration Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Update DATABASE_URL environment variable with your Supabase connection string</li>
                <li>Restart the application to use the new database connection</li>
                <li>Verify that all data appears correctly in the application</li>
                <li>Test key functionality like property management and reports</li>
                <li>Consider backing up your old PostgreSQL database before removing it</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}