import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/30 via-blue-100/20 to-indigo-200/30"></div>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(30,64,175,0.03)_50%,transparent_75%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-slate-100 text-slate-700 border-0 shadow-sm">
              <Settings className="h-3 w-3 mr-1" />
              Your management hub awaits
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Properties
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600">
                Like a Pro
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Everything you need to efficiently manage your property business is right here. 
              From tracking leads to generating reports - we've built tools that actually work for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 py-4 h-auto rounded-xl bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Link href="/admin-panel">
                  <Database className="h-5 w-5 mr-2" />
                  Let's Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto rounded-xl border-2 border-gray-300 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <a href="#features">
                  <Activity className="h-5 w-5 mr-2" />
                  Explore Features
                </a>
              </Button>
            </div>

            {/* Personal Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-slate-600">{propertiesStats?.totalProperties || 0}</div>
                <div className="text-sm text-gray-700">Properties managed</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-green-600">{leadsData?.length || 0}</div>
                <div className="text-sm text-gray-700">Leads to follow up</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-purple-600">{ordersData?.length || 0}</div>
                <div className="text-sm text-gray-700">Orders processed</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600">4</div>
                <div className="text-sm text-gray-700">Zones covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Common administrative tasks</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button 
                key={index}
                asChild 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                <Link href={action.href}>
                  <action.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{action.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Admin Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful administrative tools designed for real estate professionals to streamline operations and maximize efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg group cursor-pointer">
                <Link href={feature.href}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.stats}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
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
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Manage Your Properties?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Access the full administrative dashboard with comprehensive management tools
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 h-auto rounded-xl bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
            >
              <Link href="/admin-panel">
                <Database className="h-5 w-5 mr-2" />
                Admin Dashboard
              </Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4 h-auto rounded-xl bg-transparent border-white text-white hover:bg-white hover:text-primary transition-all duration-200"
            >
              <Link href="/admin-panel/analytics">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}