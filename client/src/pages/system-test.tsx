
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function SystemTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const newResults = prev.filter(r => r.name !== name);
      return [...newResults, { name, status, message, details }];
    });
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);

    // Test 1: Database Connection
    updateTestResult('Database Connection', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/properties');
      if (response.ok) {
        const data = await response.json();
        updateTestResult('Database Connection', 'success', `Connected successfully. Found ${data.length} properties.`);
      } else {
        updateTestResult('Database Connection', 'error', `Failed with status: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('Database Connection', 'error', `Connection failed: ${error.message}`);
    }

    // Test 2: Properties API
    updateTestResult('Properties API', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/properties/stats');
      if (response.ok) {
        const stats = await response.json();
        updateTestResult('Properties API', 'success', `Stats loaded: ${stats.totalProperties} total properties`);
      } else {
        updateTestResult('Properties API', 'error', `Stats API failed: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('Properties API', 'error', `Properties API error: ${error.message}`);
    }

    // Test 3: Leads/Customers API
    updateTestResult('Customers API', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const customers = await response.json();
        updateTestResult('Customers API', 'success', `Found ${customers.length} customers`);
      } else {
        updateTestResult('Customers API', 'error', `Customers API failed: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('Customers API', 'error', `Customers API error: ${error.message}`);
    }

    // Test 4: Orders API
    updateTestResult('Orders API', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const orders = await response.json();
        updateTestResult('Orders API', 'success', `Found ${orders.length} orders`);
      } else {
        updateTestResult('Orders API', 'error', `Orders API failed: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('Orders API', 'error', `Orders API error: ${error.message}`);
    }

    // Test 5: Settings API
    updateTestResult('Settings API', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        updateTestResult('Settings API', 'success', `Settings loaded: ${settings.businessName}`);
      } else {
        updateTestResult('Settings API', 'error', `Settings API failed: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('Settings API', 'error', `Settings API error: ${error.message}`);
    }

    // Test 6: API Keys Configuration
    updateTestResult('API Keys', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/settings/api-keys');
      if (response.ok) {
        const apiKeys = await response.json();
        const configuredKeys = Object.keys(apiKeys).filter(key => 
          key !== 'id' && key !== 'lastUpdated' && key !== 'updatedBy' && apiKeys[key]
        );
        updateTestResult('API Keys', 'success', `${configuredKeys.length} API keys configured`);
      } else {
        updateTestResult('API Keys', 'error', `API Keys failed: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('API Keys', 'error', `API Keys error: ${error.message}`);
    }

    // Test 7: Reports System
    updateTestResult('Reports System', 'pending', 'Testing...');
    try {
      const [valuationResponse, civilMepResponse] = await Promise.all([
        fetch('/api/valuation-reports'),
        fetch('/api/civil-mep-reports')
      ]);
      
      if (valuationResponse.ok && civilMepResponse.ok) {
        const valuationReports = await valuationResponse.json();
        const civilMepReports = await civilMepResponse.json();
        updateTestResult('Reports System', 'success', 
          `Valuation reports: ${valuationReports.length}, Civil+MEP reports: ${civilMepReports.length}`);
      } else {
        updateTestResult('Reports System', 'error', 'One or more reports APIs failed');
      }
    } catch (error) {
      updateTestResult('Reports System', 'error', `Reports error: ${error.message}`);
    }

    // Test 8: Payment System
    updateTestResult('Payment System', 'pending', 'Testing...');
    try {
      const response = await fetch('/api/orders/stats');
      if (response.ok) {
        const orderStats = await response.json();
        updateTestResult('Payment System', 'success', 
          `Total orders: ${orderStats.totalOrders}, Revenue: ₹${orderStats.totalRevenue?.toLocaleString() || 0}`);
      } else {
        updateTestResult('Payment System', 'error', `Payment stats failed: ${response.status}`);
      }
    } catch (error) {
      updateTestResult('Payment System', 'error', `Payment system error: ${error.message}`);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Check</h1>
          <p className="text-gray-600">Test all critical system components</p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={testing}
          size="lg"
        >
          {testing ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="grid gap-4">
          {testResults.map((result, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span>{result.name}</span>
                  </CardTitle>
                  {getStatusBadge(result.status)}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{result.message}</CardDescription>
                {result.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {testResults.length === 0 && !testing && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Click "Run All Tests" to start system testing</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
