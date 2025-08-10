import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalyticsInit, useAnalytics } from "@/hooks/use-analytics";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import PerformanceOptimizer from "@/components/seo/PerformanceOptimizer";
import MobileOptimization from "@/components/seo/MobileOptimization";
import { ScrollRestoration } from "@/hooks/use-scroll-restoration";
import { AuthForm } from "@/components/auth/AuthForm";
import { AdminAuthForm } from "@/components/auth/AdminAuthForm";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProperties from "@/pages/admin/properties";
import PropertiesView from "@/pages/admin/properties-view";
import PropertiesAdd from "@/pages/admin/properties-add";
import PropertyScoring from "@/pages/admin/property-scoring";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminZones from "@/pages/admin/zones";
import ZonesView from "@/pages/admin/zones-view";
import ZonesAdd from "@/pages/admin/zones-add";
import ZonesEdit from "@/pages/admin/zones-edit";
import AdminDevelopers from "@/pages/admin/developers";
import DevelopersView from "@/pages/admin/developers-view";
import DevelopersAdd from "@/pages/admin/developers-add";



import Contact from "@/pages/contact";
import ContactThankYou from "@/pages/contact-thank-you";
import Orders from "@/pages/admin/orders";
import Customers from "@/pages/admin/customers";

import PropertyEdit from "@/pages/property-edit";
import PropertyDetailMinimal from "@/pages/property-detail-minimal";
import FindProperty from "@/pages/find-property";

import PropertyResults from "@/pages/property-results";
import BookVisit from "@/pages/book-visit";
import Consultation from "@/pages/consultation";

import EnhancedLeads from "@/pages/admin/enhanced-leads";

import CustomerHome from "@/pages/customer-home";
import CustomerAccount from "@/pages/customer-account";
import Home from "@/pages/home-modern";
import About from "@/pages/about";
import LeadsPage from "@/pages/leads";
import FAQ from "@/pages/faq";
import ReportDocumentation from "@/pages/report-documentation";
import FirstTimeBuyerOnboarding from "@/pages/first-time-buyer-onboarding";

import AdminSettings from "@/pages/admin/settings";
import TeamManagement from "@/pages/admin/team-management";
import WhatsAppManagement from "@/pages/admin/whatsapp-management";
import SupabaseMigration from "@/pages/admin/supabase-migration";
import SupabaseStatus from "@/pages/admin/supabase-status";

import AdminBookings from "@/pages/admin/bookings";

import BackupSystem from "@/pages/admin/backup-system";
import { AdminCivilMepReports } from "@/pages/admin-civil-mep-reports";
import CivilMepReportsCreate from "@/pages/admin/civil-mep-reports-create";
import CivilMepReportsEdit from "@/pages/admin/civil-mep-reports-edit";
import { CivilMepReportView } from "@/pages/civil-mep-report-view";
import AdminLegalAuditReports from "@/pages/admin/legal-audit-reports";
import AdminLegalAuditReportsCreate from "@/pages/admin/legal-audit-reports-create";
import AdminLegalAuditReportsEdit from "@/pages/admin/legal-audit-reports-edit";
import { LegalAuditReportView } from "@/pages/legal-audit-report-view";
import AdminCities from "@/pages/admin/cities";
import AdminCitiesCreate from "@/pages/admin/cities-create";
import AdminCitiesView from "@/pages/admin/cities-view";
import AdminCitiesEdit from "@/pages/admin/cities-edit";

import Reports from "@/pages/reports";

import ValuationReportsPage from "@/pages/admin/valuation-reports";
import ValuationReportEdit from "@/pages/admin/valuation-report-edit-comprehensive";
import ValuationReportsCreate from "@/pages/admin/valuation-reports-create";
import ValuationReportsCreateComprehensive from "@/pages/admin/valuation-reports-create-comprehensive";
import ValuationReportView from "@/pages/admin/valuation-report-view";
import SetupWizard from "@/pages/setup-wizard";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import RefundPolicy from "@/pages/refund-policy";

import PropertiesLocation from "@/pages/properties-location";
import NotFound from "@/pages/not-found";
import LeadNurturingPage from "@/pages/admin/lead-nurturing";
import SystemTest from "./pages/system-test";
// Import video education components
import VideoEducationPage from "./pages/admin/video-education";
import VideoCoursesPage from "./pages/admin/video-courses";
import VideoChaptersPage from "./pages/admin/video-chapters";
import PropertyEducation from "./pages/property-education";
import VideoCourseViewer from "./pages/video-course-viewer";


// Protected Routes Component that shows auth form for admin routes when not authenticated
function ProtectedRouter() {
  const { user, loading } = useAuth();

  // Initialize Google Analytics with stored measurement ID
  useAnalyticsInit();

  // Track page views when routes change
  useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show admin auth form for admin routes if not authenticated
  const currentPath = window.location.pathname;
  if (!user && (currentPath.startsWith('/admin-panel') || currentPath === '/admin')) {
    return <AdminAuthForm />;
  }

  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/admin" component={Home} />
      <Route path="/admin-panel" component={AdminDashboard} />
      <Route path="/admin-panel/properties" component={AdminProperties} />
      <Route path="/admin-panel/properties/view" component={PropertiesView} />
      <Route path="/admin-panel/properties/add" component={PropertiesAdd} />
      <Route path="/admin-panel/property-scoring" component={PropertyScoring} />
      <Route path="/admin-panel/analytics" component={AdminAnalytics} />
      <Route path="/admin-panel/developers" component={AdminDevelopers} />
      <Route path="/admin-panel/developers/view" component={DevelopersView} />
      <Route path="/admin-panel/developers/add" component={DevelopersAdd} />
      <Route path="/admin-panel/cities" component={AdminCities} />
      <Route path="/admin-panel/cities/create" component={AdminCitiesCreate} />
      <Route path="/admin-panel/cities/:id" component={AdminCitiesView} />
      <Route path="/admin-panel/cities/:id/edit" component={AdminCitiesEdit} />
      <Route path="/admin-panel/zones" component={AdminZones} />
      <Route path="/admin-panel/zones/view" component={ZonesView} />
      <Route path="/admin-panel/zones/add" component={ZonesAdd} />
      <Route path="/admin-panel/zones/edit/:id" component={ZonesEdit} />


      <Route path="/admin-panel/orders" component={Orders} />
      <Route path="/admin-panel/customers" component={Customers} />
      <Route path="/admin/customers" component={Customers} />

      <Route path="/admin-panel/civil-mep-reports" component={AdminCivilMepReports} />
      <Route path="/admin-panel/civil-mep-reports/create" component={CivilMepReportsCreate} />
      <Route path="/admin-panel/civil-mep-reports/:id/edit" component={CivilMepReportsEdit} />
      <Route path="/admin/civil-mep-reports/:id/edit" component={CivilMepReportsEdit} />
      <Route path="/civil-mep-report/:id" component={CivilMepReportView} />
      <Route path="/admin-panel/legal-audit-reports" component={AdminLegalAuditReports} />
      <Route path="/admin-panel/legal-audit-reports/create" component={AdminLegalAuditReportsCreate} />
      <Route path="/admin-panel/legal-audit-reports/:id/edit" component={AdminLegalAuditReportsEdit} />
      <Route path="/legal-audit-report/:id" component={LegalAuditReportView} />
      <Route path="/admin-panel/valuation-reports" component={ValuationReportsPage} />
      <Route path="/admin-panel/valuation-reports/create" component={ValuationReportsCreate} />
      <Route path="/admin-panel/valuation-reports/create-comprehensive" component={ValuationReportsCreateComprehensive} />
      <Route path="/admin-panel/valuation-reports/view/:id" component={ValuationReportView} />
      <Route path="/admin-panel/valuation-reports/edit/:id" component={ValuationReportEdit} />
      <Route path="/admin-panel/property/:id/edit" component={PropertyEdit} />



      <Route path="/admin-panel/settings" component={AdminSettings} />
      <Route path="/admin-panel/team-management" component={TeamManagement} />
      <Route path="/admin-panel/whatsapp-management" component={WhatsAppManagement} />
      <Route path="/admin-panel/enhanced-leads" component={EnhancedLeads} />
      <Route path="/admin/enhanced-leads" component={EnhancedLeads} />
      <Route path="/admin-panel/lead-nurturing" component={LeadNurturingPage} />
      <Route path="/admin-panel/video-education" component={VideoEducationPage} />
      <Route path="/admin-panel/video-courses" component={VideoCoursesPage} />
      <Route path="/admin-panel/video-courses/:courseId/chapters" component={VideoChaptersPage} />
      <Route path="/property-education" component={PropertyEducation} />
      <Route path="/courses/:courseSlug" component={VideoCourseViewer} />
      <Route path="/admin-panel/supabase-migration" component={SupabaseMigration} />
      <Route path="/admin-panel/supabase-status" component={SupabaseStatus} />
      <Route path="/admin-panel/supabase" component={SupabaseStatus} />

      {/* Setup Wizard */}
      <Route path="/setup" component={SetupWizard} />

      {/* Customer-facing routes */}
      <Route path="/about" component={About} />
      <Route path="/find-property" component={FindProperty} />
      <Route path="/property-results" component={PropertyResults} />
      <Route path="/property/:id" component={PropertyDetailMinimal} />
      <Route path="/property/:id/:slug" component={PropertyDetailMinimal} />

      <Route path="/contact" component={Contact} />
      <Route path="/contact/thank-you" component={ContactThankYou} />
      <Route path="/book-visit" component={BookVisit} />
      <Route path="/consultation" component={Consultation} />

      {/* Customer Account */}
      <Route path="/my-account" component={CustomerAccount} />

      {/* Help & Support */}
      <Route path="/faq" component={FAQ} />
      <Route path="/report-documentation" component={ReportDocumentation} />

      {/* Onboarding */}
      <Route path="/first-time-buyer" component={FirstTimeBuyerOnboarding} />

      {/* Services */}
      <Route path="/reports" component={Reports} />

      {/* Properties by Location */}
      <Route path="/properties/:location" component={PropertiesLocation} />

      {/* Legal Pages */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/refund-policy" component={RefundPolicy} />

      {/* System Test Route */}
      <Route path="/system-test" component={SystemTest} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <PerformanceOptimizer />
          <MobileOptimization />
          <ScrollRestoration />
          <Toaster />
          <ProtectedRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;