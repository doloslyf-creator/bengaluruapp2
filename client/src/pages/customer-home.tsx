import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Shield, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp,
  Award,
  Users,
  Building2,
  FileText,
  Clock,
  Zap,
  Target,
  Heart,
  Play,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";

export default function CustomerHome() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageRating: 4.8
  });

  // Fetch real property statistics
  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  useEffect(() => {
    if (propertiesStats) {
      setStats(propertiesStats);
    }
  }, [propertiesStats]);

  const features = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Smart Property Discovery",
      description: "AI-powered search that finds properties matching your exact lifestyle and budget preferences",
      color: "bg-blue-50 border-blue-100"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "RERA Verified Properties",
      description: "Every property undergoes rigorous verification ensuring complete legal compliance and transparency",
      color: "bg-green-50 border-green-100"
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: "Expert Advisory Services",
      description: "Professional property valuation, legal due diligence, and engineering reports from certified experts",
      color: "bg-purple-50 border-purple-100"
    }
  ];

  const services = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Property Valuation Reports",
      description: "Professional assessment with market analysis",
      price: "₹15,000",
      badge: "Popular"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "CIVIL+MEP Engineering Reports",
      description: "Comprehensive structural and MEP analysis",
      price: "₹25,000",
      badge: "Expert"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Legal Due Diligence",
      description: "Complete legal verification and documentation",
      price: "₹10,000",
      badge: "Essential"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Site Visit Booking",
      description: "Scheduled property visits with expert guidance",
      price: "Free",
      badge: "Service"
    }
  ];

  const zones = [
    { 
      name: "North Bengaluru", 
      count: `${Math.floor(stats.totalProperties * 0.2)}+ Properties`, 
      popular: "Hebbal, Yelahanka, Devanahalli",
      growth: "+12%",
      avgPrice: "₹85L"
    },
    { 
      name: "South Bengaluru", 
      count: `${Math.floor(stats.totalProperties * 0.3)}+ Properties`, 
      popular: "JP Nagar, BTM Layout, Banashankari",
      growth: "+8%",
      avgPrice: "₹1.2Cr"
    },
    { 
      name: "East Bengaluru", 
      count: `${Math.floor(stats.totalProperties * 0.25)}+ Properties`, 
      popular: "Whitefield, Marathahalli, ITPL",
      growth: "+15%",
      avgPrice: "₹95L"
    },
    { 
      name: "West Bengaluru", 
      count: `${Math.floor(stats.totalProperties * 0.25)}+ Properties`, 
      popular: "Rajajinagar, Malleshwaram, Yeshwanthpur",
      growth: "+6%",
      avgPrice: "₹1.1Cr"
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer at TCS",
      content: "I was completely lost in the property market until I found these guys. They literally held my hand through the entire process - from finding options to ensuring everything was legally sound. Got my perfect 2BHK in Whitefield!",
      rating: 5,
      image: "PS"
    },
    {
      name: "Rajesh Kumar",
      role: "Small Business Owner",
      content: "As someone who's been burnt before by property deals, I was skeptical. But their legal due diligence caught issues that could have cost me lakhs. These people genuinely care about protecting your investment.",
      rating: 5,
      image: "RK"
    },
    {
      name: "Anitha Reddy",
      role: "Working Mom",
      content: "Finding a home while managing work and kids seemed impossible. They understood my constraints and found me a beautiful villa in JP Nagar that ticked all my boxes. So grateful!",
      rating: 5,
      image: "AR"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/20 via-blue-100/30 to-purple-200/20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,107,158,0.05)_50%,transparent_75%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-700 border-0 shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              We're here to help you find home
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Dream Home is
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-600 to-purple-600">
                Closer Than You Think
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              We understand how overwhelming property hunting can be. That's why we're here to guide you 
              every step of the way - from finding the right property to ensuring it's legally sound and worth your investment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/find-property')}
                className="text-lg px-8 py-4 h-auto rounded-xl bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Search className="h-5 w-5 mr-2" />
                Let's Find Your Home
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/consultation')}
                className="text-lg px-8 py-4 h-auto rounded-xl border-2 border-gray-300 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <Phone className="h-5 w-5 mr-2" />
                Talk to Us First
              </Button>
            </div>

            {/* Personal Touch Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">{stats.totalProperties}+</div>
                <div className="text-sm text-gray-700">Homes we've helped find</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-700">Families settled</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.averageRating}</div>
                <div className="text-sm text-gray-700">Trust rating</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur rounded-lg p-3 border border-white/40">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">3+</div>
                <div className="text-sm text-gray-700">Years of care</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Our Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Property Advisory Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive property intelligence with expert reports and analysis to make informed decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="relative hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {service.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{service.price}</span>
                    <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-white">
                      Learn More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Trusted Property Advisory Partner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine technology with expertise to provide transparent, reliable property services
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${feature.color}`}>
                <CardHeader className="pb-4">
                  <div className="mb-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zones Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Property Zones</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Bengaluru's Prime Locations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find properties in Bengaluru's most sought-after areas with real-time market insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zones.map((zone, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-0 shadow-lg"
                    onClick={() => navigate('/find-property')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h4 className="font-bold text-gray-900">{zone.name}</h4>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {zone.growth}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-primary">{zone.count}</p>
                    <p className="text-lg font-semibold text-gray-700">{zone.avgPrice}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Popular: {zone.popular}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                    View Properties 
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Customer Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from customers who found their perfect properties with our guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.image}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-400 via-blue-500 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Let's Find Your Perfect Home Together
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            You don't have to navigate this journey alone. We're here to guide you every step of the way, 
            from your first search to holding your new keys.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/find-property')}
              className="text-lg px-8 py-4 h-auto rounded-xl bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Search className="h-5 w-5 mr-2" />
              I'm Ready to Start
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/consultation')}
              className="text-lg px-8 py-4 h-auto rounded-xl bg-transparent border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <Phone className="h-5 w-5 mr-2" />
              Let's Talk First
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-black tracking-tight">
                    Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                  </div>
                  <span className="text-sm text-gray-400">Curated Property Advisors</span>
                </div>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Your trusted partner in Bengaluru real estate. We provide comprehensive property advisory 
                services including valuations, legal due diligence, and engineering reports.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/find-property" className="hover:text-white transition-colors">Property Search</a></li>
                <li><a href="/services/valuation" className="hover:text-white transition-colors">Property Valuation</a></li>
                <li><a href="/services/civil-mep" className="hover:text-white transition-colors">Engineering Reports</a></li>
                <li><a href="/services/legal" className="hover:text-white transition-colors">Legal Due Diligence</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4" />
                  <span>+91 95603 66601</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" />
                  <span>info@ownitright.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4" />
                  <span>Bengaluru, Karnataka</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 OwnItRight. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">RERA Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}