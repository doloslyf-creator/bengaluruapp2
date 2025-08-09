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
  Award,
  Search,
  MessageCircle,
  Clock
} from "lucide-react";

export default function Home() {
  // SEO optimization
  useEffect(() => {
    updateMetaTags(
      'OwnItRight - Property Advisory Services in Bangalore | Expert Real Estate Analysis',
      'Professional property advisory services in Bangalore. Get expert property valuations, CIVIL+MEP reports, legal due diligence, and personalized real estate investment guidance.',
      'property advisory bangalore, real estate valuation, property reports, CIVIL MEP analysis, property investment bangalore, real estate consultant',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      <Header />
      
      {/* Market Alert Banner - Critical Urgency */}
      <NotificationBanner 
        message="⚡ Bangalore Market Alert: Properties appreciating 18% annually - Limited inventory in premium locations!"
        type="urgent"
        actionText="Find Properties Now"
        actionUrl="/find-property"
      />

      {/* Enhanced Premium Trust Banner with Animations */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-4 border-b border-yellow-400/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
            <span className="flex items-center group hover:text-yellow-300 transition-colors duration-300">
              <Award className="h-4 w-4 mr-2 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
              RERA Certified Experts
            </span>
            <span className="flex items-center group hover:text-yellow-300 transition-colors duration-300">
              <Shield className="h-4 w-4 mr-2 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              680+ Properties Verified
            </span>
            <span className="flex items-center group hover:text-yellow-300 transition-colors duration-300">
              <CheckCircle className="h-4 w-4 mr-2 text-yellow-400 group-hover:bounce transition-transform duration-300" />
              ₹50+ Cr Investments Guided
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Hero Section with Modern Animations */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-purple-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Enhanced Content with Animations */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Award className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Premium Villa Consultation Services</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight animate-slide-up delay-100">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Expert Property Advisory
                </span>
                <span className="block text-orange-600 mt-2">
                  for Discerning Investors
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed font-medium animate-slide-up delay-200">
                Our RERA-certified experts provide comprehensive property analysis, 
                structural assessments, and investment guidance to help you make 
                informed decisions in Bangalore's premium real estate market.
              </p>
              
              {/* Enhanced Key Benefits with Staggered Animations */}
              <div className="space-y-4 animate-slide-up delay-300">
                {[
                  "Professional CIVIL+MEP Reports", 
                  "Independent Property Valuations", 
                  "Legal Due Diligence Support"
                ].map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 group hover:bg-white/50 hover:shadow-lg rounded-lg p-3 transition-all duration-300"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-slate-700 font-medium group-hover:text-slate-900">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-500">
                <Link href="/find-property">
                  <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Search className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Explore Properties</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/property-reports">
                  <Button variant="outline" size="lg" className="group px-8 py-4 rounded-xl border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300">
                    <FileText className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Get Expert Report
                  </Button>
                </Link>
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
