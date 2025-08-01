import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminZones from "@/pages/admin/zones";
import AdminDevelopers from "@/pages/admin/developers";
import PropertyEdit from "@/pages/property-edit";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin-panel/login" component={AdminLogin} />
      <Route path="/admin-panel">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-panel/analytics">
        <ProtectedRoute>
          <AdminAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-panel/developers">
        <ProtectedRoute>
          <AdminDevelopers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-panel/zones">
        <ProtectedRoute>
          <AdminZones />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-panel/property/:id/edit">
        <ProtectedRoute>
          <PropertyEdit />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
