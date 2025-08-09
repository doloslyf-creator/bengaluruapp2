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
  Banknote,
  Clock,
  ChevronRight,
  Play,
  DollarSign,
  Phone,
  Mail,
  Home,
  AlertTriangle
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

  // Dynamic stats from admin panel
  const stats = {
    totalValue: "100+ Cr",
    propertiesChecked: propertiesStats?.totalProperties || 5,
    ordersProcessed: ordersData?.length || 12,
    currentProjects: propertiesStats?.activeProjects || 3
  };

  const whyChooseUsFeatures = [
    {
      icon: <Shield className="w-8 h-8 text-navy" />,
      title: "Legal & Title Verification",
      description: "From plot ownership disputes to missing apartment OC/CC approvals — we catch them all."
    },
    {
      icon: <Building className="w-8 h-8 text-navy" />,
      title: "Civil & MEP Inspection", 
      description: "Construction quality checks for villas and apartments to prevent costly repairs later."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-navy" />,
      title: "Builder & Project Background Check",
      description: "We review financial stability, past delivery records, and RERA history."
    }
  ];

  const whoWeHelp = [
    {
      icon: <Home className="w-6 h-6 text-gold" />,
      title: "Villa Buyers",
      description: "Luxury, gated, and independent houses."
    },
    {
      icon: <Building2 className="w-6 h-6 text-gold" />,
      title: "Apartment Buyers", 
      description: "Ready-to-move or under construction."
    },
    {
      icon: <TreePine className="w-6 h-6 text-gold" />,
      title: "Plot Investors",
      description: "Layout approval & legal compliance checks."
    }
  ];

  const caseStudies = [
    {
      type: "Plot Buyer",
      story: "Avoided ₹20 lakh legal dispute over missing conversion approvals.",
      icon: <TreePine className="w-5 h-5" />
    },
    {
      type: "Villa Buyer", 
      story: "Found ₹35 lakh in hidden repairs before purchase.",
      icon: <Home className="w-5 h-5" />
    },
    {
      type: "Apartment Buyer",
      story: "Uncovered no OC and stalled project before final payment.", 
      icon: <Building2 className="w-5 h-5" />
    }
  ];

  const services = [
    {
      title: "Full Due Diligence Report",
      description: "Legal, civil, builder background check.",
      price: "₹2,499"
    },
    {
      title: "On-site Snag & Handover Inspection", 
      description: "Civil/MEP snags documented.",
      price: "₹2,499"
    },
    {
      title: "Custom Advisory",
      description: "For unique property challenges.",
      price: "Custom"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Villa Buyer, Whitefield",
      text: "OwnitWise saved me from a ₹50 lakh mistake. Their thorough inspection revealed major structural issues the builder had hidden.",
      rating: 5
    },
    {
      name: "Priya Sharma", 
      location: "Apartment Buyer, Koramangala",
      text: "The legal verification caught missing OC approvals. We avoided investing in a project that's still stalled today.",
      rating: 5
    },
    {
      name: "Vikram Reddy",
      location: "Plot Investor, Electronic City", 
      text: "Their RERA and BDA checks revealed the plot had conversion issues. We're grateful for their expertise.",
      rating: 5
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Share property/project details",
      description: "Tell us about the property you're considering"
    },
    {
      step: "2", 
      title: "Our experts investigate",
      description: "Online records + on-site verification"
    },
    {
      step: "3",
      title: "Get detailed report",
      description: "Actionable insights before you commit"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-warm-grey">
      <Header />
      
      {/* Trust Banner */}
      <div className="bg-navy text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <span className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-gold" />
              RERA Certified Experts
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-gold" />
              {stats.totalValue} Worth Properties Safeguarded
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-gold" />
              {stats.propertiesChecked}+ Properties Verified
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-gold/5"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-navy mb-6 leading-tight">
                Be Wise Before <span className="text-gold">You Buy</span>
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                From luxury villas to city apartments and open plots — we uncover hidden legal, civil, and builder risks so you invest with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold px-8 py-4">
                  Get My Property Checked
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white px-8 py-4">
                  <Play className="mr-2 h-5 w-5" />
                  See Sample Report
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-navy">{stats.ordersProcessed}+</div>
                  <div className="text-sm text-gray-600">Reports Delivered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy">{stats.currentProjects}</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy">24hr</div>
                  <div className="text-sm text-gray-600">Report Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <Home className="w-12 h-12 text-navy mb-4" />
                    <h3 className="font-semibold text-navy mb-2">Villa Facade</h3>
                    <p className="text-sm text-gray-600">Luxury independent homes</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg mt-8">
                  <CardContent className="p-6">
                    <Building2 className="w-12 h-12 text-navy mb-4" />
                    <h3 className="font-semibold text-navy mb-2">Apartments</h3>
                    <p className="text-sm text-gray-600">Modern city living</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg -mt-4">
                  <CardContent className="p-6">
                    <TreePine className="w-12 h-12 text-navy mb-4" />
                    <h3 className="font-semibold text-navy mb-2">Plot Development</h3>
                    <p className="text-sm text-gray-600">Investment opportunities</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <Shield className="w-12 h-12 text-gold mb-4" />
                    <h3 className="font-semibold text-navy mb-2">Expert Verified</h3>
                    <p className="text-sm text-gray-600">RERA certified</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">One Expert Team. Every Property Type.</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach ensures no stone is left unturned in your property evaluation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUsFeatures.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-sage/10 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-20 bg-sage/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-8">Who We Help</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {whoWeHelp.map((segment, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white px-6 py-4 rounded-full shadow-md">
                  {segment.icon}
                  <div>
                    <div className="font-semibold text-navy">{segment.title}</div>
                    <div className="text-sm text-gray-600">{segment.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Money Saved. Regrets Avoided.</h2>
            <p className="text-xl text-gray-600">Real stories from our satisfied clients</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="border-l-4 border-l-gold shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gold/10 rounded-full mr-3">
                      {study.icon}
                    </div>
                    <Badge variant="outline" className="text-navy border-navy">
                      {study.type}
                    </Badge>
                  </div>
                  <p className="text-gray-700 font-medium">{study.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
              See More Client Wins
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Property Due Diligence</h2>
            <p className="text-xl text-gray-300">Choose the service that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-300 mb-6">{service.description}</p>
                  <div className="text-2xl font-bold text-gold mb-6">{service.price}</div>
                  <Button className="w-full bg-gold text-navy hover:bg-gold/90">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-warm-grey">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple process, comprehensive results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gold text-navy font-bold text-2xl rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-navy mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof & Trust Signals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-8">Trusted by Property Buyers Across Bangalore</h2>
            
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">{stats.totalValue}</div>
                <div className="text-gray-600">Property Purchases Safeguarded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">RERA</div>
                <div className="text-gray-600">Certified Experts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">BBMP</div>
                <div className="text-gray-600">Verified Records</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold mb-2">BDA</div>
                <div className="text-gray-600">Legal References</div>
              </div>
            </div>

            {/* Client Testimonial Carousel */}
            <Card className="max-w-4xl mx-auto border-none shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <Quote className="w-12 h-12 text-gold mx-auto mb-6" />
                  <p className="text-lg text-gray-700 mb-6 italic">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                  <div className="font-semibold text-navy">{testimonials[activeTestimonial].name}</div>
                  <div className="text-sm text-gray-600">{testimonials[activeTestimonial].location}</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === activeTestimonial ? 'bg-gold' : 'bg-gray-300'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-navy to-navy/90 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Don't Buy Blind. <span className="text-gold">Own It Wise.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Your property is your biggest investment — secure it with expert due diligence.
          </p>
          
          <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold px-12 py-4 text-lg">
            Book Your Property Check
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          <div className="flex items-center justify-center space-x-8 mt-12 text-sm">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gold" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gold" />
              <span>contact@ownitwise.com</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gold" />
              <span>24hr Report Delivery</span>
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