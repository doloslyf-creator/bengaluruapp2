import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { SupabaseConnectionTest } from "./SupabaseConnectionTest";

interface AdminAuthFormProps {
  onSuccess?: () => void;
}

export function AdminAuthForm({ onSuccess }: AdminAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setError("Authentication service is not configured. Please contact your administrator.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Provide more helpful error messages
        let userFriendlyError = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyError = 'Please confirm your email address before signing in.';
        } else if (error.message.includes('Too many requests')) {
          userFriendlyError = 'Too many sign-in attempts. Please wait a moment and try again.';
        } else if (error.message.includes('fetch')) {
          userFriendlyError = 'Connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('API key') || error.message.includes('Invalid API')) {
          userFriendlyError = 'Authentication service configuration issue. Please use the connection diagnostics below to identify the problem.';
          setShowConnectionTest(true); // Auto-show diagnostics for API key issues
        }
        
        setError(userFriendlyError);
        return;
      }

      // Check if user has admin role (you can customize this logic)
      const user = data.user;
      const isAdmin = user?.user_metadata?.role === 'admin' || 
                     user?.email?.endsWith('@ownitright.com') ||
                     user?.email === 'admin@ownitright.com';

      if (!isAdmin) {
        await supabase!.auth.signOut();
        setError("Access denied. Admin privileges required.");
        return;
      }

      toast({
        title: "Welcome to Admin Panel",
        description: "You have successfully signed in as an administrator.",
      });

      onSuccess?.();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-slate-700" />
            <div className="text-2xl font-black tracking-tight text-gray-900">
              Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
            </div>
          </div>
          <CardTitle className="text-xl text-slate-800">Admin Access</CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to access the administrative dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@ownitright.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In to Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowConnectionTest(!showConnectionTest)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showConnectionTest ? 'Hide' : 'Show'} Connection Diagnostics
            </button>
            
            {showConnectionTest && (
              <div className="mt-4">
                <SupabaseConnectionTest />
              </div>
            )}
            
            <p className="mt-4 text-xs text-muted-foreground">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}