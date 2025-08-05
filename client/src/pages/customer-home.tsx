import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Search, 
  Shield, 
  Star, 
  Phone, 
  Mail, 
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
  Sparkles,
  Home,
  IndianRupee,
  Calendar,
  MapPin,
  Eye,
  ThumbsUp,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";

export default function CustomerHome() {
  const [, navigate] = useLocation();


  // Fetch real property statistics
  const { data: propertiesStats } = useQuery({
    queryKey: ["/api/properties/stats"],
  });

  const stats = propertiesStats || {
    totalProperties: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageRating: 4.8
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">
              🎉 Save 30-50% on property investment mistakes with expert guidance
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Never overpay for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                property investments
              </span>{" "}
              again
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Our experts analyze every property 24/7, providing critical insights and legal verification. 
              We work for <strong>buyers first</strong> - not builders, not developers, just you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate('/first-time-buyer')}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl border-2 border-orange-400"
                data-testid="button-first-time-buyer"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                First-Time Buyer? Start Here →
              </Button>
              
              <Button
                onClick={() => navigate('/find-property')}
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                data-testid="button-find-property"
              >
                <Search className="h-5 w-5 mr-2" />
                Find Your Perfect Home
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="text-red-500">🔥</div>
                <span><strong>2,300+</strong> families already protected with OwnItRight</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-yellow-500">⚡</div>
                <span>Only <strong>47</strong> consultation spots remaining this month</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simulated Savings Demo */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Property Investment Could Save Like This
            </h2>
            <p className="text-xl text-gray-600">
              See real property advisory comparisons in action. Click "Get Analysis" to witness our expertise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Brigade Signature Towers</h3>
                    <p className="text-gray-600">3BHK, Whitefield • Market Analysis</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Live Analysis</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Builder Price</p>
                    <p className="text-2xl font-bold text-red-600 line-through">₹2.8 Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fair Market Value</p>
                    <p className="text-2xl font-bold text-green-600">₹2.3 Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Your Savings</p>
                    <p className="text-2xl font-bold text-primary">₹50 L</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Builder Direct</span>
                    <span className="font-semibold text-red-600">₹2.8 Cr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Market Rate (Our Analysis)</span>
                    <span className="font-semibold text-green-600">₹2.3 Cr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Competitor Rate</span>
                    <span className="font-semibold text-gray-600">₹2.6 Cr</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-xl font-semibold"
                  onClick={() => navigate('/property-valuation')}
                  data-testid="button-get-analysis"
                >
                  Get My Property Analysis →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Buy Smart. Save Big.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See real property comparisons and expert insights in action. No hidden agendas, no builder partnerships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full text-center p-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-500 rounded-2xl text-white">
                    <Search className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Property Discovery</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-powered search finds properties matching your exact needs, budget, and lifestyle - 
                  no time wasted on mismatched options.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full text-center p-8 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-500 rounded-2xl text-white">
                    <Shield className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Property Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our experts critique every property with the same scrutiny we'd use for our own family's purchase. 
                  No sugar-coating, just truth.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full text-center p-8 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-purple-500 rounded-2xl text-white">
                    <Award className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Legal Protection</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every property comes with professional valuation, legal verification, and engineering reports. 
                  Buy with complete confidence.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How OwnItRight Works
            </h2>
            <p className="text-xl text-gray-600">
              Set your preferences and let our experts handle everything. No more property hunting stress.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-blue-100 rounded-2xl">
                  <Home className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Tell Us Your Dreams</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your budget, preferences, and lifestyle needs. Our property finder learns exactly what you want in your perfect home.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-green-100 rounded-2xl">
                  <Eye className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. We Analyze Everything</h3>
              <p className="text-gray-600 leading-relaxed">
                Our experts examine legal documents, structural integrity, market rates, and future growth potential. 
                Every detail is scrutinized.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-purple-100 rounded-2xl">
                  <ThumbsUp className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. You Buy with Confidence</h3>
              <p className="text-gray-600 leading-relaxed">
                Get comprehensive reports, fair price validation, and ongoing support. 
                Make your investment decision with complete peace of mind.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Fair Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            You only pay for services that help you make better decisions. No hidden fees, no subscriptions.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Property Search</h3>
              <div className="text-3xl font-bold text-primary mb-4">FREE</div>
              <p className="text-gray-600 text-sm">Find and shortlist properties that match your needs</p>
            </Card>

            <Card className="p-6 border-2 border-primary bg-primary/5 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                Most Popular
              </Badge>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Property Valuation</h3>
              <div className="text-3xl font-bold text-primary mb-4">₹5,000</div>
              <p className="text-gray-600 text-sm">Professional market analysis and fair price assessment</p>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Legal Verification</h3>
              <div className="text-3xl font-bold text-primary mb-4">₹8,000</div>
              <p className="text-gray-600 text-sm">Complete legal due diligence and documentation review</p>
            </Card>
          </div>

          <Button
            onClick={() => navigate('/find-property')}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl"
            data-testid="button-start-saving"
          >
            Start Saving Today →
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            💸 You only pay for services you actually use
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Families Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of smart buyers who chose expertise over guesswork
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6 bg-white border-0 shadow-lg h-full">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "OwnItRight saved our family ₹25 lakhs by catching overpricing and legal issues we never would have spotted. 
                  Their buyer-first approach is genuine."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Rajesh & Priya Kumar</div>
                    <div className="text-sm text-gray-500">Software Engineers, Whitefield</div>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">₹25L saved</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6 bg-white border-0 shadow-lg h-full">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Their legal verification uncovered title issues that could have cost us everything. 
                  Worth every rupee for the peace of mind and protection."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Sneha Reddy</div>
                    <div className="text-sm text-gray-500">Marketing Director, HSR Layout</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">Legal Issues Avoided</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 bg-white border-0 shadow-lg h-full">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Finally found advisors who work for buyers instead of builders. 
                  Their property analysis helped us choose the right investment for our future."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Arjun & Kavya Sharma</div>
                    <div className="text-sm text-gray-500">Doctors, Electronic City</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 text-xs">Smart Investment</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mt-16 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2,300+</div>
              <div className="text-gray-600">Happy Families</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">₹15L</div>
              <div className="text-gray-600">Average Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98.5%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{(stats as any)?.totalProperties || 5}+</div>
              <div className="text-gray-600">Properties Analyzed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Property Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of smart buyers who chose expert guidance over expensive mistakes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/find-property')}
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
                data-testid="button-find-home-cta"
              >
                <Home className="h-5 w-5 mr-2" />
                Find My Dream Home
              </Button>
              
              <Button
                onClick={() => navigate('/contact')}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold rounded-xl"
                data-testid="button-contact-experts"
              >
                <Phone className="h-5 w-5 mr-2" />
                Talk to Our Experts
              </Button>
            </div>

            <p className="text-sm opacity-75 mt-6">
              🎯 Zero risk guarantee - We only earn when we help you save
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}