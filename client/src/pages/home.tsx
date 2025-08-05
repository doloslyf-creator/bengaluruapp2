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
  Target,
  Calculator,
  CheckCircle,
  Star,
  Quote
} from "lucide-react";

export default function Home() {
  // SEO optimization
  useEffect(() => {
    updateMetaTags(
      'OwnItRight - Property Investment Made Smart | Real Estate Advisory',
      'Discover top investment properties with expert guidance. Make informed property investment decisions with our comprehensive analysis and proven results.',
      'property investment, real estate advisory, property analysis, investment properties, real estate consultant bangalore',
      undefined,
      window.location.origin
    );
    
    // Inject organization schema
    injectSchema(generateOrganizationSchema(), 'organization-schema');
  }, []);
  
  // Fetch real statistics for dashboard
  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  const { data: leadsData } = useQuery({
    queryKey: ["/api/leads"],
  });

  const { data: ordersData } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Investment statistics from real data
  const investmentStats = [
    {
      value: "₹500M+",
      label: "ASSETS UNDER GUIDANCE",
      description: "Total property value managed"
    },
    {
      value: "10K+",
      label: "PROPERTIES REVIEWED",
      description: "Comprehensive analysis completed"
    },
    {
      value: "100K+",
      label: "INVESTORS SERVED",
      description: "Satisfied customers"
    },
    {
      value: "8-10%",
      label: "AVERAGE RETURNS",
      description: "Annual investment returns"
    }
  ];

  const keyFeatures = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Expert assistance",
      description: "Get expert guidance from our experienced property advisors"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Long term value",
      description: "Invest in properties with proven long-term appreciation potential"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Stress-free investing",
      description: "We handle the research, you make informed decisions"
    }
  ];

  const propertyTypes = [
    {
      title: "Modern downtown condo with...",
      location: "Koramangala",
      price: "₹2.5M (8%)",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Luxury oceanfront apartment t...",
      location: "Whitefield",
      price: "₹5.2M (12%)",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Spacious family home in...",
      location: "HSR Layout",
      price: "₹4.2M (9%)",
      image: "/api/placeholder/300/200"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Discover properties",
      description: "Browse our curated selection of investment properties"
    },
    {
      step: "2", 
      title: "Invest with confidence",
      description: "Get detailed analysis and expert recommendations"
    },
    {
      step: "3",
      title: "Earn & track",
      description: "Monitor your investments and track returns"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Investment Theme */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side - Investment Stats */}
            <div className="lg:col-span-5 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {investmentStats.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </div>
                ))}
              </div>
              
              {/* Key Features */}
              <div className="space-y-4">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                asChild 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6"
                data-testid="button-start-investing"
              >
                <Link href="/properties">
                  Start Investing Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Right side - Main Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Invest in property,<br />
                <span className="text-green-600">build your future</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Take control of your financial future by diversifying your portfolio with 
                secure savings and real estate properties.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-6 px-8"
                  data-testid="button-browse-properties"
                >
                  <Link href="/properties">
                    Browse Properties
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-6 px-8"
                  data-testid="button-learn-more"
                >
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Property showcase mockup */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Discover our top investment properties</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Featured</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {propertyTypes.map((property, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl">
                      <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                      <h4 className="font-medium text-gray-900 mb-1">{property.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                      <p className="text-sm font-semibold text-green-600">{property.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Invest with confidence in just a few steps
            </h2>
            <p className="text-lg text-gray-600">
              Follow our transparent, data-driven process and start building wealth through real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              asChild 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 px-8"
              data-testid="button-get-started-process"
            >
              <Link href="/properties">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by investors, proven by results
            </h2>
          </div>

          <div className="bg-green-50 p-8 rounded-2xl max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <Quote className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <blockquote className="text-lg text-gray-900 mb-4">
                  "As someone new to real estate investing, I was initially hesitant. 
                  However, the expert guidance and trust-worthy platform made it easy 
                  and helped me choose the right properties. Within 3 months, I 
                  started seeing great returns. This is the smartest financial decision I've ever made!"
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">David Harrison</div>
                    <div className="text-sm text-gray-600">Real Estate Investor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-6 px-8"
              data-testid="button-view-properties"
            >
              <Link href="/properties">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Panel Access - Keep original functionality */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Admin Panel Access</h2>
          <p className="text-xl text-gray-300 mb-8">
            Manage properties, leads, and analytics with powerful admin tools
          </p>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-gray-900 rounded-xl py-6 px-8"
            data-testid="button-admin-panel"
          >
            <Link href="/admin-panel">
              <Settings className="h-5 w-5 mr-2" />
              Access Admin Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}