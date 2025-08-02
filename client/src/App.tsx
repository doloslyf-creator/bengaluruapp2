import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProperties from "@/pages/admin/properties";
import PropertiesView from "@/pages/admin/properties-view";
import PropertiesAdd from "@/pages/admin/properties-add";
import PropertyScoring from "@/pages/admin/property-scoring";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminZones from "@/pages/admin/zones";
import ZonesView from "@/pages/admin/zones-view";
import ZonesAdd from "@/pages/admin/zones-add";
import AdminDevelopers from "@/pages/admin/developers";
import DevelopersView from "@/pages/admin/developers-view";
import DevelopersAdd from "@/pages/admin/developers-add";
import BlogManagement from "@/pages/admin/blog";
import CivilMepReports from "@/pages/admin/civil-mep-reports";
import CivilMepReportDetail from "@/pages/admin/civil-mep-report-detail";
import CreateCivilMepReport from "@/pages/admin/create-civil-mep-report";
import CivilMepReportsPage from "@/pages/civil-mep-reports";
import CivilMepReportsForm from "@/pages/civil-mep-reports-form";
import LegalDueDiligencePage from "@/pages/legal-due-diligence";
import LegalDueDiligenceForm from "@/pages/legal-due-diligence-form";
import Contact from "@/pages/contact";
import ContactThankYou from "@/pages/contact-thank-you";
import Orders from "@/pages/admin/orders";
import Customers from "@/pages/admin/customers";
import ValuationReports from "@/pages/admin/valuation-reports";
import ValuationReportEdit from "@/pages/admin/valuation-report-edit";
import PropertyEdit from "@/pages/property-edit";
import PropertyDetail from "@/pages/property-detail";
import FindProperty from "@/pages/find-property";
import PropertyValuation from "@/pages/property-valuation";
import PropertyValuationForm from "@/pages/property-valuation-form";
import PropertyResults from "@/pages/property-results";
import BookVisit from "@/pages/book-visit";
import Consultation from "@/pages/consultation";
import UserPanel from "@/pages/user-panel";
import EnhancedUserPanel from "@/pages/enhanced-user-panel";
import UserValuationReports from "@/pages/user-valuation-reports";
import UserCivilMepReports from "@/pages/user-civil-mep-reports";
import CustomerHome from "@/pages/customer-home";
import Home from "@/pages/home";
import LeadsPage from "@/pages/leads";
import LegalTracker from "@/pages/admin/legal-tracker-enhanced";
import LegalManagement from "@/pages/admin/legal-management";
import UserLegalTracker from "@/pages/user-legal-tracker-enhanced";
import AdminSettings from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";

function Router() {
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
      <Route path="/admin-panel/zones" component={AdminZones} />
      <Route path="/admin-panel/zones/view" component={ZonesView} />
      <Route path="/admin-panel/zones/add" component={ZonesAdd} />
      <Route path="/admin-panel/blog" component={BlogManagement} />
      <Route path="/admin-panel/civil-mep-reports" component={CivilMepReports} />
      <Route path="/admin-panel/civil-mep-reports/:id" component={CivilMepReportDetail} />
      <Route path="/admin-panel/create-civil-mep-report" component={CreateCivilMepReport} />
      <Route path="/admin-panel/orders" component={Orders} />
      <Route path="/admin-panel/customers" component={Customers} />
      <Route path="/admin/customers" component={Customers} />
      <Route path="/admin-panel/valuation-reports" component={ValuationReports} />
      <Route path="/admin-panel/valuation-reports/:action/:id?" component={ValuationReportEdit} />
      <Route path="/admin-panel/property/:id/edit" component={PropertyEdit} />
      <Route path="/admin-panel/leads" component={LeadsPage} />
      <Route path="/admin-panel/legal-management" component={LegalManagement} />
      <Route path="/admin-panel/legal-tracker" component={LegalTracker} />
      <Route path="/admin-panel/legal-tracker/manage" component={LegalTracker} />
      <Route path="/admin-panel/legal-tracker/team" component={LegalTracker} />
      <Route path="/admin-panel/legal-tracker/reports" component={LegalTracker} />
      <Route path="/admin-panel/settings" component={AdminSettings} />
      
      {/* Customer-facing routes */}
      <Route path="/find-property" component={FindProperty} />
      <Route path="/find-property/results" component={PropertyResults} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/property-valuation" component={PropertyValuation} />
      <Route path="/property-valuation/form" component={PropertyValuationForm} />
      <Route path="/civil-mep-reports" component={CivilMepReportsPage} />
      <Route path="/civil-mep-reports/form" component={CivilMepReportsForm} />
      <Route path="/legal-due-diligence" component={LegalDueDiligencePage} />
      <Route path="/legal-due-diligence/form" component={LegalDueDiligenceForm} />
      <Route path="/contact" component={Contact} />
      <Route path="/contact/thank-you" component={ContactThankYou} />
      <Route path="/book-visit" component={BookVisit} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/user-panel" component={UserPanel} />
      <Route path="/user-dashboard" component={EnhancedUserPanel} />
      <Route path="/user-panel/valuation-reports" component={UserValuationReports} />
      <Route path="/user-panel/civil-mep-reports" component={UserCivilMepReports} />
      <Route path="/user-panel/legal-tracker" component={UserLegalTracker} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
