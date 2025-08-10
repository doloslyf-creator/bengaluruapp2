import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
  Eye,
  Building2,
  TreePine,
  Banknote,
  Clock,
  ChevronRight,
  Play,
  DollarSign,
  Phone,
  Mail
} from "lucide-react";

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // SEO optimization
  useEffect(() => {
    updateMetaTags(
      'OwnitWise - Be Wise Before You Buy | Property Due Diligence Experts',
      'From luxury villas to city apartments and open plots — we uncover hidden legal, civil, and builder risks so you invest with confidence. Expert property advisory services in Bangalore.',
      'property due diligence bangalore, legal title verification, civil MEP inspection, builder background check, villa apartment plot experts, property advisory ownitwise',
      undefined,
      window.location.origin
    );
    
    // Inject organization schema
    injectSchema(generateOrganizationSchema(), 'organization-schema');
  }, []);
  
  // Fetch dynamic data from admin panel
  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  const { data: ordersData } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Dynamic content data
  const stats = {
    totalValue: "100+ Cr",
    propertiesChecked: propertiesStats?.totalProperties || 0,
    ordersProcessed: ordersData?.length || 0,
    currentProjects: propertiesStats?.activeProjects || 0
  };

  const services = [
    {
      icon: <Building className="w-6 h-6 text-emerald-600" />,
      title: "Property Management",
      description: "Complete property lifecycle management with detailed analytics and insights."
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      title: "Expert Reports",
      description: "Professional CIVIL+MEP reports and comprehensive property valuations."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: "Investment Analysis",
      description: "Strategic investment guidance with market analysis and risk assessment."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Minimal Trust Banner */}
      <div className="bg-emerald-600 text-white py-3">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <span className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              RERA Certified
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              680+ Properties
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              ₹50+ Cr Guided
            </span>
          </div>
        </div>
      </div>

      {/* Minimal Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-6">
                Expert Property Advisory for Discerning Investors
              </h1>
              
              <p className="text-gray-600 mb-8">
                Our RERA-certified experts provide comprehensive property analysis, 
                structural assessments, and investment guidance to help you make 
                informed decisions in Bangalore's premium real estate market.
              </p>
              
              {/* Key Benefits */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">Professional CIVIL+MEP Reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">Independent Property Valuations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">Legal Due Diligence Support</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/find-property">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors">
                    Explore Properties
                  </button>
                </Link>
                <Link href="/property-reports">
                  <button className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl transition-colors">
                    Get Expert Report
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Right Column - Stats */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-6 text-center">Trust & Expertise</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-light text-emerald-600 mb-1">680+</div>
                  <div className="text-xs text-gray-600">Properties Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-emerald-600 mb-1">₹50+ Cr</div>
                  <div className="text-xs text-gray-600">Investments Guided</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-emerald-600 mb-1">4.9/5</div>
                  <div className="text-xs text-gray-600">Client Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-emerald-600 mb-1">RERA</div>
                  <div className="text-xs text-gray-600">Certified Team</div>
                </div>
              </div>
              
              {/* Client Testimonial */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start space-x-3">
                  <Quote className="h-4 w-4 text-gray-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Their detailed analysis helped us identify structural issues 
                      that saved us ₹12 lakhs in potential repairs."
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">— Priya & Raj S.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Our Expert Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive property analysis and consultation services tailored 
              for the sophisticated real estate investor.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {service.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-3">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {service.description}
                </p>
                <button className="text-emerald-600 text-sm hover:text-emerald-700 transition-colors">
                  Learn More
                </button>
              </div>
            ))}
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
