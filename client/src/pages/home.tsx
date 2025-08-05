import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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
  Target
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
      stats: `${propertiesStats?.totalProperties || 0} Properties`
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
      stats: `${leadsData?.length || 0} Active Leads`
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
      stats: `${ordersData?.length || 0} Orders`
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-0 w-[600px] h-[300px] bg-gradient-to-l from-indigo-100/30 to-cyan-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[250px] bg-gradient-to-r from-pink-100/20 to-orange-100/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Real Estate Management Platform</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
              Own It
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Right
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              The complete platform for property management, analytics, and growth. 
              Streamline your real estate business with powerful tools and insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-10 py-6 h-auto rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-500/25 border-0"
              >
                <Link href="/admin-panel">
                  <Activity className="h-5 w-5 mr-2" />
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 h-auto rounded-2xl border-2 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg hover:border-blue-300 transition-all duration-300"
              >
                <a href="#features">
                  <Target className="h-5 w-5 mr-2" />
                  View Features
                </a>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-gray-800 mb-2">{propertiesStats?.totalProperties || 0}</div>
                <div className="text-sm font-medium text-gray-600">Properties</div>
              </div>
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-green-600 mb-2">{leadsData?.length || 0}</div>
                <div className="text-sm font-medium text-gray-600">Active Leads</div>
              </div>
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-purple-600 mb-2">{ordersData?.length || 0}</div>
                <div className="text-sm font-medium text-gray-600">Orders</div>
              </div>
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-2">4</div>
                <div className="text-sm font-medium text-gray-600">Zones</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <p className="text-lg text-gray-600">Jump right into your most common tasks</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50"
              >
                <Link href={action.href}>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{action.name}</h3>
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 mb-6">
              <Shield className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools designed to streamline your real estate operations and accelerate business growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white/80 backdrop-blur-sm overflow-hidden relative"
              >
                <Link href={feature.href}>
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="pb-6 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-500">
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
                        {feature.stats}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                    <div className="flex items-center text-primary font-medium">
                      <span>Access Module</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of property professionals who trust OwnItRight to manage their real estate portfolio efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              asChild
              size="lg" 
              className="text-lg px-10 py-6 h-auto rounded-2xl bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl font-semibold"
            >
              <Link href="/admin-panel">
                <Database className="h-5 w-5 mr-2" />
                Access Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="text-lg px-10 py-6 h-auto rounded-2xl bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white transition-all duration-300"
            >
              <Link href="/admin-panel/analytics">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}