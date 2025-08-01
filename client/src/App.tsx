import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminZones from "@/pages/admin/zones";
import AdminDevelopers from "@/pages/admin/developers";
import PropertyEdit from "@/pages/property-edit";
import FindProperty from "@/pages/find-property";
import PropertyResults from "@/pages/property-results";
import BookVisit from "@/pages/book-visit";
import Consultation from "@/pages/consultation";
import CustomerHome from "@/pages/customer-home";
import Home from "@/pages/home";
import LeadsPage from "@/pages/leads";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/admin" component={Home} />
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
      <Route path="/admin-panel/leads">
        <ProtectedRoute>
          <LeadsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Customer-facing routes */}
      <Route path="/find-property" component={FindProperty} />
      <Route path="/find-property/results" component={PropertyResults} />
      <Route path="/book-visit" component={BookVisit} />
      <Route path="/consultation" component={Consultation} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <OnboardingProvider>
            <Toaster />
            <Router />
          </OnboardingProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
