import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { updateMetaTags } from "@/utils/seo";
import { 
  Home, 
  Shield, 
  Users, 
  Award,
  CheckCircle,
  ArrowRight,
  Quote,
  Star,
  TrendingUp,
  Heart,
  Target,
  Lightbulb
} from "lucide-react";
import { Link } from "wouter";

export default function About() {
  useEffect(() => {
    updateMetaTags(
      'About OwnitWise - Your Trusted Property Advisory Partner',
      'Learn about OwnitWise\'s mission to help home buyers make informed decisions. We provide independent property analysis, legal verification, and expert guidance to ensure you buy the right home at the right price. Own homes With Confidence.',
      'about ownitwise, property advisory, real estate consultant bangalore, independent property analysis, home buying guidance',
      undefined,
      window.location.origin + '/about'
    );
  }, []);

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Independence First",
      description: "We work exclusively for buyers. No builder partnerships, no developer commissions. Our loyalty is to you, not sales targets."
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Data-Driven Decisions",
      description: "Every recommendation is backed by market analysis, legal verification, and engineering assessment. No gut feelings, just facts."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Human-Centered Approach",
      description: "We understand that buying a home is emotional. We balance market logic with your dreams and financial reality."
    }
  ];

  const expertise = [
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      title: "Market Analysis",
      description: "Real-time pricing trends, location scoring, and investment potential assessment"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Legal Verification",
      description: "12-step due diligence process covering RERA compliance, title verification, and documentation"
    },
    {
      icon: <Award className="w-6 h-6 text-purple-600" />,
      title: "Engineering Assessment",
      description: "Structural integrity, MEP systems analysis, and construction quality evaluation"
    }
  ];

  const stats = [
    { number: "500+", label: "Properties Analyzed" },
    { number: "₹50Cr+", label: "Value Protected" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Expert Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-6 text-sm px-4 py-2 bg-blue-100 text-blue-700 border-blue-200">
              About OwnitWise
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              We Help You Buy Right, Not Just Buy Fast
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              In a market full of sales-driven advice, we provide independent analysis to help you 
              make the biggest financial decision of your life with confidence and clarity.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Real Estate Industry Has a Problem
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Most property advisors work for developers and builders. Their primary goal 
                  is to sell inventory, not to find you the perfect home at the right price.
                </p>
                <p>
                  Buyers end up overpaying by 20-30% because they lack independent market analysis, 
                  legal verification, and engineering assessment. The result? Poor investment decisions 
                  that cost families their financial security.
                </p>
                <p className="font-semibold text-gray-900">
                  We exist to change that. We work for buyers, not builders.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Hidden Costs</h4>
                    <p className="text-sm text-gray-600">Buyers discover 15-25% additional costs after booking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Legal Issues</h4>
                    <p className="text-sm text-gray-600">40% of projects have documentation or approval problems</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quality Compromises</h4>
                    <p className="text-sm text-gray-600">Poor construction quality discovered only after handover</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Solution: Independent Property Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive analysis that developers don't want you to have. 
              Our reports reveal the complete truth about every property.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {expertise.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3 mb-4">
                      {item.icon}
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why We Do This Differently
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our principles guide every recommendation we make. We believe in transparency, 
              independence, and putting your interests first.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Every analysis we deliver helps families make better property decisions
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Quote className="w-16 h-16 text-blue-200 mx-auto mb-8" />
            <blockquote className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
              "OwnItRight saved us from a costly mistake. Their analysis revealed construction 
              quality issues that the builder had hidden. We found a better property for 
              15% less money because of their independent guidance."
            </blockquote>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <cite className="text-gray-600 font-medium">
              Priya & Arjun Kumar, Whitefield Residents
            </cite>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Buy Right?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Don't make the biggest financial decision of your life without independent analysis. 
              Get expert guidance that puts your interests first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/find-property">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  <Home className="w-5 h-5 mr-2" />
                  Find Your Perfect Property
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/property-reports">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8">
                  <Shield className="w-5 h-5 mr-2" />
                  Get Property Analysis
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No commitments • Independent analysis • Your interests first
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}