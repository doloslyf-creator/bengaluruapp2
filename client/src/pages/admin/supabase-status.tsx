import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminLayout from "@/components/layout/admin-layout";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Users,
  Building2,
  Calendar,
  FileText
} from "lucide-react";

interface SupabaseStatusData {
  supabaseReady: boolean;
  existingData: {
    properties: number;
    leads: number;
    bookings: number;
    teamMembers: number;
  };
}

export default function SupabaseStatus() {
  const { data: status, isLoading, refetch } = useQuery<SupabaseStatusData>({
    queryKey: ["/api/supabase/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (ready: boolean) => {
    if (ready) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (ready: boolean) => {
    if (ready) {
      return <Badge className="bg-green-50 text-green-700 border-green-200">Connected</Badge>;
    }
    return <Badge variant="destructive">Not Connected</Badge>;
  };

  const dataItems = [
    { key: 'properties', label: 'Properties', icon: Building2, count: status?.existingData?.properties || 0 },
    { key: 'leads', label: 'Leads', icon: Users, count: status?.existingData?.leads || 0 },
    { key: 'bookings', label: 'Bookings', icon: Calendar, count: status?.existingData?.bookings || 0 },
    { key: 'teamMembers', label: 'Team Members', icon: FileText, count: status?.existingData?.teamMembers || 0 },
  ];

  return (
    <AdminLayout 
      title="Supabase Integration Status"
      showBackButton={true}
      backUrl="/admin-panel"
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Connection Status</span>
                </CardTitle>
                <CardDescription>
                  Real-time status of Supabase database integration
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  getStatusIcon(status?.supabaseReady || false)
                )}
                {getStatusBadge(status?.supabaseReady || false)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Supabase Project: <code className="text-xs bg-gray-100 px-2 py-1 rounded">qugmemmukizgrggpnstl</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!status?.supabaseReady && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Database schema setup required</p>
                <div className="text-sm space-y-1">
                  <p>1. Go to your Supabase SQL Editor</p>
                  <p>2. Run the schema from <code>migrations/supabase_schema.sql</code></p>
                  <p>3. Return here to verify connection</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://qugmemmukizgrggpnstl.supabase.co/project/default/sql', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase SQL Editor
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Data in PostgreSQL</CardTitle>
            <CardDescription>
              Data ready for migration to Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dataItems.map((item) => (
                <div key={item.key} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <item.icon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Migration Interface Link */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Tools</CardTitle>
            <CardDescription>
              Access migration interface and database management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Button asChild>
                <a href="/admin-panel/supabase-migration">
                  <Database className="h-4 w-4 mr-2" />
                  Open Migration Interface
                </a>
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://qugmemmukizgrggpnstl.supabase.co', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}