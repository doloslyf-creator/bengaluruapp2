import { useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { updateMetaTags } from '@/utils/seo';
import { 
  FileText, 
  Building, 
  Shield, 
  Calculator, 
  CheckCircle, 
  Calendar,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Services() {
  useEffect(() => {
    updateMetaTags(
      'Professional Property Services - OwnItRight | Valuations & Reports',
      'Expert property services in Bangalore: Professional valuations, CIVIL+MEP reports, legal due diligence, and investment consultation. Get accurate property assessments.',
      'property valuation bangalore, civil mep reports, legal due diligence, property consultation, real estate services, property assessment',
      undefined,
      `${window.location.origin}/services`
    );
  }, []);

  const services = [
    {
      icon: <Calculator className="w-8 h-8 text-blue-600" />,
      title: "Property Valuation Reports",
      price: "₹2,499",
      description: "Comprehensive property valuation with market analysis, comparable sales, and investment recommendations.",
      features: [
        "Detailed market analysis",
        "Comparable property research",
        "Investment ROI calculations",
        "Risk assessment",
        "Professional certification"
      ],
      href: "/services/property-valuation",
      popular: true
    },
    {
      icon: <Building className="w-8 h-8 text-green-600" />,
      title: "CIVIL & MEP Reports",
      price: "₹2,499", 
      description: "Technical engineering assessment covering civil structure and MEP (Mechanical, Electrical, Plumbing) systems.",
      features: [
        "Structural assessment",
        "MEP system evaluation",
        "Compliance verification",
        "Safety recommendations",
        "Quality scoring"
      ],
      href: "/services/civil-mep-reports",
      popular: false
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Legal Due Diligence",
      price: "Custom",
      description: "Complete legal verification and documentation review to ensure clear property title and compliance.",
      features: [
        "Title verification",
        "Document review",
        "Approval status check",
        "Encumbrance certificate",
        "Legal clearance"
      ],
      href: "/services/legal-due-diligence",
      popular: false
    },
    {
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      title: "Property Consultation",
      price: "₹999",
      description: "One-on-one consultation with property experts for personalized investment guidance and market insights.",
      features: [
        "Market trend analysis",
        "Investment strategy",
        "Area recommendations",
        "Timing guidance",
        "Portfolio review"
      ],
      href: "/consultation",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6">
            <Star className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700">Professional Services</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Property Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Expert property advisory services designed to help you make informed real estate decisions with confidence.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="relative group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                {service.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      Popular
                    </Badge>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardHeader className="pb-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{service.price}</p>
                      <p className="text-sm text-gray-500">per report</p>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-3">{service.title}</CardTitle>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex gap-4">
                    <Button asChild className="flex-1">
                      <Link href={service.href}>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/consultation">
                        <Calendar className="w-4 h-4 mr-2" />
                        Consult
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose OwnItRight?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional expertise backed by years of experience in the Bangalore real estate market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">RERA Certified</h3>
              <p className="text-gray-600">All our reports comply with RERA regulations and industry standards.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
              <p className="text-gray-600">Licensed professionals with deep market knowledge and technical expertise.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">Rigorous quality checks ensure accurate and reliable assessments every time.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}