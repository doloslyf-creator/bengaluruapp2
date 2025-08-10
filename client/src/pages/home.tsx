import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { updateMetaTags } from "@/utils/seo";
import { 
  ArrowRight, 
  Building, 
  FileText, 
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  Quote,
  Award,
  Search,
  Users,
  MapPin,
  Clock
} from "lucide-react";

export default function HomePage() {
  // SEO optimization
  useEffect(() => {
    updateMetaTags(
      'OwnitWise - Be Wise Before You Buy | Property Due Diligence Experts',
      'From luxury villas to city apartments and open plots — we uncover hidden legal, civil, and builder risks so you invest with confidence. Expert property advisory services in Bangalore.',
      'property due diligence bangalore, legal title verification, civil MEP inspection, builder background check, villa apartment plot experts, property advisory ownitwise',
      undefined,
      window.location.origin
    );
  }, []);
  
  // Fetch dynamic data
  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const services = [
    {
      icon: <FileText className="w-8 h-8 text-emerald-600" />,
      title: "CIVIL+MEP Reports",
      description: "Professional engineering assessments covering structural integrity, MEP systems, and construction quality.",
      link: "/property-reports"
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-600" />,
      title: "Legal Due Diligence",
      description: "Comprehensive 12-step verification process for RERA compliance, title verification, and documentation.",
      link: "/legal-tracker"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      title: "Property Valuation",
      description: "Independent market analysis and investment potential assessment for informed decision making.",
      link: "/valuation-reports"
    }
  ];

  const testimonials = [
    {
      text: "Their detailed analysis helped us identify structural issues that saved us ₹12 lakhs in potential repairs.",
      author: "Priya & Raj Kumar",
      location: "Whitefield"
    },
    {
      text: "The legal verification revealed documentation problems that could have cost us the property. Worth every rupee.",
      author: "Ananya Sharma",
      location: "Electronic City"
    },
    {
      text: "Professional, thorough, and honest. They helped us find the perfect villa within our budget.",
      author: "Vikram Patel",
      location: "Sarjapur"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm mb-8">
              <Award className="w-4 h-4 mr-2" />
              RERA Certified Property Advisory
            </div>
            
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Be Wise Before
              <span className="block text-emerald-600">You Buy</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              From luxury villas to city apartments and open plots — we uncover hidden legal, 
              civil, and builder risks so you invest with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/find-property">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg transition-colors flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Find Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <Link href="/property-reports">
                <button className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl text-lg transition-colors">
                  Get Expert Report
                </button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-light text-emerald-600 mb-2">680+</div>
                <div className="text-sm text-gray-600">Properties Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-emerald-600 mb-2">₹50+ Cr</div>
                <div className="text-sm text-gray-600">Value Protected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-emerald-600 mb-2">4.9/5</div>
                <div className="text-sm text-gray-600">Client Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-emerald-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Expert Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Problem */}
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-8">
                Why Most Property Buyers Lose Money
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Hidden Legal Issues</h3>
                    <p className="text-gray-600">40% of properties have documentation or RERA compliance problems</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Construction Quality</h3>
                    <p className="text-gray-600">Poor structural integrity discovered only after handover</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Overpricing</h3>
                    <p className="text-gray-600">Buyers overpay 20-30% without independent market analysis</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Solution */}
            <div className="bg-emerald-50 p-8 rounded-2xl">
              <h2 className="text-3xl font-light text-gray-900 mb-8">
                Our Solution: Independent Analysis
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Complete Legal Verification</h3>
                    <p className="text-gray-600">12-step due diligence process covering all legal aspects</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Engineering Assessment</h3>
                    <p className="text-gray-600">Professional CIVIL+MEP reports by certified engineers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Market Analysis</h3>
                    <p className="text-gray-600">Independent valuation and investment potential assessment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Our Expert Services
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Comprehensive property analysis services designed to protect your investment 
              and ensure you make informed decisions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Link href={service.link}>
                  <button className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600">
              Real stories from families we've helped make better property decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <Quote className="w-8 h-8 text-emerald-300 mb-6" />
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <cite className="text-gray-600 text-sm not-italic">
                  <strong>{testimonial.author}</strong><br />
                  {testimonial.location}
                </cite>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light text-white mb-6">
            Ready to Make a Smart Property Decision?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Don't risk your hard-earned money on a property without independent analysis. 
            Get expert guidance that puts your interests first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-property">
              <button className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg transition-colors">
                Explore Properties
              </button>
            </Link>
            <Link href="/property-reports">
              <button className="border-2 border-white text-white hover:bg-emerald-700 px-8 py-4 rounded-xl text-lg transition-colors">
                Get Expert Report
              </button>
            </Link>
          </div>
          <p className="text-emerald-200 text-sm mt-6">
            No commitments • Independent analysis • Your interests first
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}