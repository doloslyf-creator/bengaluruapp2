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
  CheckCircle,
  Star,
  Quote,
  Award,
  Search,
  Eye,
  Building2,
  TreePine,
  Home,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Play,
  Phone,
  Mail,
  Globe,
  Briefcase,
  HeartHandshake,
  LineChart,
  Sparkles,
  Compass
} from "lucide-react";

export default function ModernHomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // SEO optimization
  useEffect(() => {
    updateMetaTags(
      'OwnitWise - Smart Property Investment Platform | Bengaluru Real Estate',
      'Discover verified properties, get expert insights, and make confident investment decisions with OwnitWise. Your trusted partner for property investment in Bengaluru.',
      'property investment bengaluru, real estate platform, property verification, investment advisory, smart property decisions, ownitwise',
      undefined,
      window.location.origin
    );
    
    injectSchema(generateOrganizationSchema(), 'organization-schema');
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  // Dynamic stats
  const stats = {
    propertiesVerified: propertiesStats?.totalProperties || 5,
    reportsDelivered: ordersData?.length || 12,
    activeProjects: propertiesStats?.activeProjects || 3,
    avgSavings: "₹8.5L"
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Properties",
      description: "Every property undergoes comprehensive verification",
      color: "bg-blue-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Market Insights", 
      description: "Real-time market analysis and trends",
      color: "bg-green-500"
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: "Expert Guidance",
      description: "RERA certified experts guide your decisions",
      color: "bg-purple-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick Decisions",
      description: "Fast-track your property investment journey",
      color: "bg-orange-500"
    }
  ];

  const propertyTypes = [
    {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      title: "Luxury Villas",
      description: "Premium independent houses",
      count: properties.filter(p => p.type?.includes('villa')).length || 2
    },
    {
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      title: "Modern Apartments",
      description: "Contemporary city living",
      count: properties.filter(p => p.type?.includes('apartment')).length || 3
    },
    {
      icon: <TreePine className="w-8 h-8 text-purple-600" />,
      title: "Investment Plots",
      description: "Future development opportunities",
      count: properties.filter(p => p.type?.includes('plot')).length || 1
    }
  ];

  const services = [
    {
      icon: <FileText className="w-12 h-12 text-white" />,
      title: "Property Reports",
      description: "Comprehensive analysis and verification",
      price: "₹2,499",
      popular: true
    },
    {
      icon: <Compass className="w-12 h-12 text-white" />,
      title: "Investment Advisory",
      description: "Personalized investment guidance",
      price: "₹4,999",
      popular: false
    },
    {
      icon: <LineChart className="w-12 h-12 text-white" />,
      title: "Market Analysis",
      description: "Detailed market insights and trends",
      price: "₹1,999",
      popular: false
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          {/* Trust Indicators */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-6 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-2 text-blue-600" />
                RERA Certified
              </div>
              <div className="w-1 h-4 bg-gray-300"></div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                {stats.propertiesVerified}+ Verified
              </div>
              <div className="w-1 h-4 bg-gray-300"></div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                4.9/5 Rating
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Smart Property
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Investments
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Discover verified properties, get expert insights, and make confident investment decisions with India's most trusted property platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Properties
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-full">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Dynamic Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.propertiesVerified}+</div>
                  <div className="text-sm text-gray-600">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.reportsDelivered}+</div>
                  <div className="text-sm text-gray-600">Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.avgSavings}</div>
                  <div className="text-sm text-gray-600">Avg Savings</div>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Feature Showcase */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Why Choose OwnitWise?</h3>
                  <div className="flex space-x-1">
                    {features.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === activeFeature ? 'bg-blue-600 w-6' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl transition-all cursor-pointer ${
                        index === activeFeature 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveFeature(index)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl text-white ${feature.color}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Property Types</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From luxury villas to modern apartments and investment plots - find your perfect property match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {propertyTypes.map((type, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <Badge variant="secondary" className="text-lg font-semibold">
                      {type.count}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <Button variant="ghost" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600">
                    View Properties
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Expert Services</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive solutions for all your property investment needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all group ${service.popular ? 'ring-2 ring-yellow-400' : ''}`}>
                {service.popular && (
                  <div className="bg-yellow-400 text-gray-900 text-sm font-semibold px-4 py-1 text-center">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-300 mb-6">{service.description}</p>
                  <div className="text-3xl font-bold mb-6 text-yellow-400">{service.price}</div>
                  <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Make Smart Property Decisions?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied investors who trust OwnitWise for their property needs
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full shadow-lg">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-white px-8 py-4 rounded-full">
              <Phone className="mr-2 h-5 w-5" />
              Talk to Expert
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Verified Data</span>
            </div>
          </div>
        </div>
      </section>

      <DataTransparencyFooter />
      <Footer />
      <ExitIntentPopup />
      <FloatingActionButtons />
      <NotificationBanner />
    </div>
  );
}