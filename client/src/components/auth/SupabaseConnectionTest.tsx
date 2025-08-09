import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CheckCircle, AlertTriangle, Wifi, Database } from "lucide-react";

export function SupabaseConnectionTest() {
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    details?: any;
  }>({ status: 'idle', message: '' });

  const testConnection = async () => {
    setTestResult({ status: 'testing', message: 'Testing connection...' });

    try {
      if (!isSupabaseConfigured()) {
        setTestResult({
          status: 'error',
          message: 'Supabase is not configured - missing environment variables',
          details: {
            VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        });
        return;
      }

      // Test basic connection
      const { data, error } = await supabase!.from('auth.users').select('count').limit(0);
      
      if (error) {
        setTestResult({
          status: 'error',
          message: `Connection failed: ${error.message}`,
          details: {
            code: error.code,
            hint: error.hint,
            details: error.details
          }
        });
        return;
      }

      setTestResult({
        status: 'success',
        message: 'Connection successful! Supabase is working properly.',
        details: { timestamp: new Date().toISOString() }
      });

    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Unexpected error: ${err.message || 'Unknown error'}`,
        details: err
      });
    }
  };

  const getStatusIcon = () => {
    switch (testResult.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Wifi className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    const configured = isSupabaseConfigured();
    if (!configured) {
      return <Badge variant="destructive">Not Configured</Badge>;
    }
    
    switch (testResult.status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Connection Failed</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="outline">Ready to Test</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Supabase Connection</span>
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={testResult.status === 'testing'}
          className="w-full"
        >
          {testResult.status === 'testing' ? 'Testing...' : 'Test Connection'}
        </Button>
        
        {testResult.message && (
          <Alert variant={testResult.status === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
        
        {testResult.details && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded border">
            <strong>Details:</strong>
            <pre className="mt-1 whitespace-pre-wrap">
              {JSON.stringify(testResult.details, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Environment Check:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</li>
            <li>• VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}