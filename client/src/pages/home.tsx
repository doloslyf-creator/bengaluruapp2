import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { DataTransparencyFooter } from "@/components/data-transparency-footer";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { FloatingActionButtons } from "@/components/floating-action-buttons";
import { NotificationBanner } from "@/components/notification-banner";
import { updateMetaTags, generateOrganizationSchema, injectSchema } from "@/utils/seo";
import { 
  ArrowRight, 
  Building, 
  BarChart3, 
  MapPin, 
  Users,
  FileText,
  Shield,
  TrendingUp,
  Settings,
  Database,
  Activity,
  Target,
  Calculator,
  CheckCircle,
  Star,
  Quote,
  AlertTriangle,
  Award
} from "lucide-react";

export default function Home() {
  // SEO optimization
  useEffect(() => {
    updateMetaTags(
      'OwnitWise - Property Advisory Services in Bangalore | Expert Real Estate Analysis',
      'Professional property advisory services in Bangalore. Get expert property valuations, CIVIL+MEP reports, legal due diligence, and personalized real estate investment guidance. Own homes With Confidence.',
      'property advisory bangalore, real estate valuation, property reports, CIVIL MEP analysis, property investment bangalore, real estate consultant, ownitwise',
      undefined,
      window.location.origin
    );
    
    // Inject organization schema
    injectSchema(generateOrganizationSchema(), 'organization-schema');
  }, []);
  
  // Fetch real statistics for admin dashboard
  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  const { data: leadsData } = useQuery({
    queryKey: ["/api/leads"],
  });

  const { data: ordersData } = useQuery({
    queryKey: ["/api/orders"],
  });

  const adminFeatures = [
    {
      icon: <Building className="w-8 h-8 text-primary" />,
      title: "Property Management",
      description: "Complete CRUD operations for apartments, villas, and plots with detailed configurations and pricing.",
      href: "/admin-panel/properties",
      stats: `${(propertiesStats as any)?.totalProperties || 0} Properties`
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: "Analytics & Reports",
      description: "Advanced data visualization and analytics for property statistics, trends, and performance metrics.",
      href: "/admin-panel/analytics",
      stats: "Real-time Insights"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Lead Management",
      description: "Comprehensive lead tracking with automated scoring and conversion funnel management.",
      href: "/admin-panel/leads",
      stats: `${(leadsData as any)?.length || 0} Active Leads`
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: "CIVIL+MEP Reports",
      description: "Engineering report management with comprehensive property analysis and documentation.",
      href: "/admin-panel/civil-mep-reports",
      stats: "Expert Reports"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Orders & Revenue",
      description: "Financial analytics with revenue tracking, payment management, and performance monitoring.",
      href: "/admin-panel/orders",
      stats: `${(ordersData as any)?.length || 0} Orders`
    },
    {
      icon: <MapPin className="w-8 h-8 text-teal-600" />,
      title: "Zone Management",
      description: "Comprehensive zone-based categorization and management for Bengaluru's property market.",
      href: "/admin-panel/zones",
      stats: "4 Active Zones"
    }
  ];

  const quickActions = [
    { name: "Add New Property", href: "/admin-panel/properties/add", icon: Building },
    { name: "Create CIVIL+MEP Report", href: "/admin-panel/create-civil-mep-report", icon: FileText },
    { name: "View Analytics", href: "/admin-panel/analytics", icon: BarChart3 },
    { name: "Manage Leads", href: "/admin-panel/leads", icon: Users },
  ];

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      {/* Premium Trust Banner */}
      <div className="bg-navy text-white py-3 border-b border-yellow-400/20">
        <div className="container-premium text-center">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <span className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-yellow-600" />
              RERA Certified Experts
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-yellow-400" />
              680+ Properties Verified
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-yellow-400" />
              ₹50+ Cr Investments Guided
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="section-premium">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="fade-in-up">
              <div className="trust-badge mb-6">
                <Award className="h-4 w-4 mr-2" />
                Premium Villa Consultation Services
              </div>
              
              <h1 className="text-display mb-6 text-gradient-premium fade-in-up-delay">
                Expert Property Advisory for Discerning Investors
              </h1>
              
              <p className="text-body-large text-muted-foreground mb-8 fade-in-up-delay-2">
                Our RERA-certified experts provide comprehensive property analysis, 
                structural assessments, and investment guidance to help you make 
                informed decisions in Bangalore's premium real estate market.
              </p>
              
              {/* Key Benefits */}
              <div className="space-y-4 mb-8 fade-in-up-delay-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-body">Professional CIVIL+MEP Reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-body">Independent Property Valuations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-body">Legal Due Diligence Support</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 fade-in-up-delay-2">
                <Button asChild className="btn-premium">
                  <Link href="/find-property">
                    <Search className="h-5 w-5 mr-2" />
                    Explore Properties
                  </Link>
                </Button>
                <Button asChild variant="outline" className="btn-secondary-premium">
                  <Link href="/property-reports">
                    <FileText className="h-5 w-5 mr-2" />
                    Get Expert Report
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Right Column - Stats & Trust Indicators */}
            <div className="fade-in-up-delay">
              <div className="card-premium-elevated p-8">
                <h3 className="text-heading-3 mb-6 text-center">Trust & Expertise</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">680+</div>
                    <div className="text-sm text-muted-foreground">Properties Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">₹50+ Cr</div>
                    <div className="text-sm text-muted-foreground">Investments Guided</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
                    <div className="text-sm text-muted-foreground">Client Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">RERA</div>
                    <div className="text-sm text-muted-foreground">Certified Team</div>
                  </div>
                </div>
                
                {/* Client Testimonial */}
                <div className="border-t pt-6">
                  <div className="flex items-start space-x-3">
                    <Quote className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        "Their detailed analysis helped us identify structural issues 
                        that saved us ₹12 lakhs in potential repairs."
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">— Priya & Raj S.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-premium bg-muted/50">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="text-heading-1 mb-6 fade-in-up">Our Expert Services</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto fade-in-up-delay">
              Comprehensive property analysis and consultation services tailored 
              for the sophisticated real estate investor.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-premium p-8 text-center fade-in-up">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-heading-3 mb-4">Property Management</h3>
              <p className="text-muted-foreground mb-6">
                Complete property lifecycle management with detailed analytics and insights.
              </p>
              <Button asChild variant="outline">
                <Link href="/admin-panel/properties">View Properties</Link>
              </Button>
            </div>
            
            <div className="card-premium p-8 text-center fade-in-up-delay">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-heading-3 mb-4">Expert Reports</h3>
              <p className="text-muted-foreground mb-6">
                Professional CIVIL+MEP reports and comprehensive property valuations.
              </p>
              <Button asChild variant="outline">
                <Link href="/property-reports">Get Report</Link>
              </Button>
            </div>
            
            <div className="card-premium p-8 text-center fade-in-up-delay-2">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-heading-3 mb-4">Investment Analysis</h3>
              <p className="text-muted-foreground mb-6">
                Strategic investment guidance with market analysis and risk assessment.
              </p>
              <Button asChild variant="outline">
                <Link href="/find-property">Explore Options</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <DataTransparencyFooter />
      <ExitIntentPopup />
      <FloatingActionButtons />
      <NotificationBanner />
    </div>
  );
}
