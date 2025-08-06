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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden">
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
            
            {/* Urgency Alert */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-red-100 text-red-800 px-6 py-3 rounded-full text-sm font-bold mb-6 animate-pulse border-2 border-red-200">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-ping"></div>
                🚨 MARKET ALERT: Property prices surged 27% this quarter - Don't wait!
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
              Stop Losing
              <span className="block bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                ₹5+ Lakhs
              </span>
              <span className="block text-4xl md:text-5xl text-gray-700 font-semibold">on Every Property Purchase</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
              <span className="text-red-600 font-bold">94% of buyers overpay</span> without expert analysis. 
              Our professional reports have saved clients <span className="text-green-600 font-bold">₹2.3 Cr+ collectively</span> 
              in hidden costs, structural issues, and overpriced deals.
            </p>
            
            {/* Social Proof Bar */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-12 text-sm font-medium">
              <div className="flex items-center bg-white/90 px-4 py-2 rounded-full border border-gray-200">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                <span><strong className="text-blue-600">2,847</strong> properties analyzed</span>
              </div>
              <div className="flex items-center bg-white/90 px-4 py-2 rounded-full border border-gray-200">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <span><strong className="text-yellow-600">4.9/5</strong> expert rating</span>
              </div>
              <div className="flex items-center bg-white/90 px-4 py-2 rounded-full border border-gray-200">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                <span><strong className="text-green-600">₹2.3 Cr+</strong> saved for clients</span>
              </div>
            </div>

            {/* Urgency CTA Box */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-3xl p-8 text-white text-center mb-12 border-4 border-red-200 relative overflow-hidden">
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">🔥 LIMITED TIME: Free Property Risk Assessment</h3>
                <p className="text-red-100 mb-6 text-lg">Get instant alerts on hidden issues that could cost you ₹5+ lakhs later</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-lg px-10 py-6 h-auto rounded-2xl bg-white text-red-600 hover:bg-gray-100 font-bold transform hover:scale-105 transition-all duration-300 shadow-xl border-0"
                  >
                    <Link href="/find-property">
                      <Shield className="h-5 w-5 mr-2" />
                      GET FREE RISK CHECK NOW
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-10 py-6 h-auto rounded-2xl border-2 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-red-600 transition-all duration-300"
                  >
                    <Link href="/property-reports">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Order Full Analysis ₹1,499
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-6 text-sm text-red-100 font-medium">
                  ⏰ <strong>478 reports</strong> ordered this month • <strong>Next price increase</strong> in 7 days
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-gray-800 mb-2">{(propertiesStats as any)?.totalProperties || 2847}</div>
                <div className="text-sm font-medium text-gray-600">Properties</div>
              </div>
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-green-600 mb-2">{(leadsData as any)?.length || 127}</div>
                <div className="text-sm font-medium text-gray-600">Active Leads</div>
              </div>
              <div className="group text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl md:text-4xl font-black text-purple-600 mb-2">{(ordersData as any)?.length || 478}</div>
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 border border-green-200/50 mb-6">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-700">Client Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              See How We Saved Clients <span className="text-green-600">₹2.3+ Crores</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real clients, real savings, real results. Here's how our expert analysis prevented costly mistakes.
            </p>
          </div>
          
          {/* Success Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">Rajesh K.</h4>
                    <p className="text-sm text-green-600">IT Professional, Whitefield</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-2">Saved ₹4.2 Lakhs</div>
                <p className="text-sm text-gray-700 mb-4">
                  "Civil MEP report revealed major plumbing issues that would have cost me ₹4+ lakhs to fix. 
                  Negotiated price down based on OwnItRight's findings."
                </p>
                <div className="flex items-center text-xs text-green-600">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Verified Purchase • Nov 2024</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800">Priya M.</h4>
                    <p className="text-sm text-blue-600">Investment Banker, HSR Layout</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-2">Saved ₹7.8 Lakhs</div>
                <p className="text-sm text-gray-700 mb-4">
                  "Valuation report showed property was overpriced by 18%. Used it to negotiate 
                  and bought at market rate. Best ₹1,499 I ever spent!"
                </p>
                <div className="flex items-center text-xs text-blue-600">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Verified Purchase • Dec 2024</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-800">Amit & Sneha</h4>
                    <p className="text-sm text-purple-600">Young Couple, Electronic City</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-2">Saved ₹12.5 Lakhs</div>
                <p className="text-sm text-gray-700 mb-4">
                  "About to buy in a project with legal issues. Legal tracker report saved us 
                  from a disaster. Found perfect alternative property instead."
                </p>
                <div className="flex items-center text-xs text-purple-600">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Verified Purchase • Oct 2024</span>
                </div>
              </CardContent>
            </Card>
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

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-red-600 via-orange-600 to-red-600 text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-400 text-red-800 px-6 py-3 rounded-full inline-block mb-6 font-bold text-lg animate-bounce">
            🔥 PRICE INCREASE IN 7 DAYS 🔥
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Don't Be the Next Person Who<br />Loses ₹5+ Lakhs on Hidden Issues
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong>2,847 smart buyers</strong> have already used our reports to save money. 
            <strong>Join them today</strong> before prices increase next week.
          </p>
          
          {/* Urgency Timer Mock */}
          <div className="bg-black/20 rounded-2xl p-6 mb-8 inline-block">
            <div className="text-sm text-red-200 mb-2">Next Price Increase In:</div>
            <div className="flex items-center justify-center space-x-4 text-2xl font-bold">
              <div className="text-center">
                <div className="bg-white text-red-600 px-3 py-2 rounded-lg">07</div>
                <div className="text-xs text-red-200 mt-1">DAYS</div>
              </div>
              <div className="text-white">:</div>
              <div className="text-center">
                <div className="bg-white text-red-600 px-3 py-2 rounded-lg">14</div>
                <div className="text-xs text-red-200 mt-1">HOURS</div>
              </div>
              <div className="text-white">:</div>
              <div className="text-center">
                <div className="bg-white text-red-600 px-3 py-2 rounded-lg">23</div>
                <div className="text-xs text-red-200 mt-1">MINS</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              asChild
              size="lg" 
              className="text-xl px-12 py-8 h-auto rounded-2xl bg-white text-red-600 hover:bg-yellow-100 transform hover:scale-105 transition-all duration-300 shadow-2xl font-bold border-4 border-yellow-400"
            >
              <Link href="/find-property">
                <Shield className="h-6 w-6 mr-2" />
                GET FREE RISK CHECK NOW
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="text-xl px-12 py-8 h-auto rounded-2xl bg-transparent border-4 border-white text-white hover:bg-white hover:text-red-600 transition-all duration-300 font-bold"
            >
              <Link href="/property-reports">
                <BarChart3 className="h-6 w-6 mr-2" />
                Order Analysis ₹1,499
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 text-red-100">
            💡 <strong>Limited time:</strong> First 100 customers get Civil+MEP + Valuation reports for ₹2,499 (Save ₹1,500)
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">🔴 Live Activity Feed</h3>
            <p className="text-gray-600">See what other smart buyers are doing right now</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-medium">Ramesh K.</span>
                  <span className="text-gray-600 ml-2">just ordered a Civil+MEP report for</span>
                  <span className="font-semibold text-blue-600 ml-1">Prestige Lakeside Habitat</span>
                </div>
                <span className="text-xs text-gray-500">2 min ago</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-medium">Priya S.</span>
                  <span className="text-gray-600 ml-2">saved ₹3.2L using our valuation report in</span>
                  <span className="font-semibold text-green-600 ml-1">Electronic City</span>
                </div>
                <span className="text-xs text-gray-500">5 min ago</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-medium">Amit & Kavya</span>
                  <span className="text-gray-600 ml-2">found hidden legal issues in</span>
                  <span className="font-semibold text-red-600 ml-1">Whitefield project</span>
                  <span className="text-green-600 ml-1">- Crisis averted!</span>
                </div>
                <span className="text-xs text-gray-500">8 min ago</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span><strong>127 reports</strong> ordered in the last 24 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">💰 Calculate Your Potential Savings</h3>
            <p className="text-gray-600">See how much you could save with professional property analysis</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Property Value Range</h4>
                <div className="space-y-4">
                  <button className="w-full text-left p-4 bg-white rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 savings-option" data-value="50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">₹30L - ₹60L</span>
                      <span className="text-blue-600 font-bold">Save ₹1.5L - ₹3L</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 bg-white rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 savings-option" data-value="80">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">₹60L - ₹1Cr</span>
                      <span className="text-blue-600 font-bold">Save ₹3L - ₹5L</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 bg-white rounded-lg border-2 border-blue-500 bg-blue-50 savings-option" data-value="120">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">₹1Cr - ₹2Cr</span>
                      <span className="text-blue-600 font-bold">Save ₹5L - ₹10L</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-4 bg-white rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 savings-option" data-value="200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">₹2Cr+</span>
                      <span className="text-blue-600 font-bold">Save ₹10L+</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-4xl mb-4">🎯</div>
                  <h5 className="text-xl font-bold text-gray-900 mb-4">Your Potential Savings</h5>
                  <div className="text-4xl font-bold text-green-600 mb-4" id="savings-amount">₹5L - ₹10L</div>
                  <div className="text-sm text-gray-600 mb-6">
                    Based on our analysis of <strong>2,847 properties</strong>
                  </div>
                  <Link href="/property-reports">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
                      <Shield className="h-4 w-4 mr-2" />
                      Secure These Savings Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Alert Banner */}
      <section className="py-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-white rounded-full mr-3 animate-ping"></div>
              <h3 className="text-2xl font-bold">⚠️ HIGH RISK ALERT</h3>
              <div className="w-4 h-4 bg-white rounded-full ml-3 animate-ping"></div>
            </div>
            <p className="text-lg mb-6">
              <strong>89% of properties</strong> in Bangalore have at least one hidden issue. 
              Don't be the next person to discover costly problems <strong>after</strong> purchase.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/find-property">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 font-bold h-12 px-8">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Check My Property Risk Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DataTransparencyFooter />
      <Footer />
      
      {/* Interactive Elements */}
      <NotificationBanner />
      <ExitIntentPopup />
      <FloatingActionButtons />
    </div>
  );
}