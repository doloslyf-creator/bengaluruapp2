import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  FileText, 
  Calculator, 
  MapPin, 
  IndianRupee, 
  Clock, 
  ChevronRight,
  Star,
  Shield,
  Award,
  Download,
  Eye,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Home,
  Scale,
  Target,
  Building,
  Check,
  ArrowRight,
  Timer,
  Users,
  Sparkles
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PropertyValuation() {
  const [, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 22
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-4 text-sm">
          <span className="font-semibold">🔥 Limited Time: 50% OFF Property Valuation Reports Ends In:</span>
          <div className="flex items-center space-x-2 font-mono font-bold">
            <span>{timeLeft.days}d</span>
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
          </div>
          <span>• Save ₹5,000 on expert analysis!</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-green-100 text-green-800 border-green-200">
              💰 Avoid overpaying by ₹10-50 lakhs with professional property valuation
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Never get fooled by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                inflated property prices
              </span>{" "}
              again
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Get professional market analysis in 24-48 hours. Our experts provide fair value assessment, 
              comparable sales data, and investment recommendations - <strong>buyer-first</strong>, no builder bias.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate('/property-valuation-form')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                data-testid="button-get-valuation"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Get My Property Valued Now
              </Button>
              
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2"
                data-testid="button-talk-expert"
              >
                <Eye className="h-5 w-5 mr-2" />
                See Sample Report →
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="text-green-500">💸</div>
                <span><strong>₹25L</strong> average savings per valuation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-yellow-500">⚡</div>
                <span>Only <strong>12 spots</strong> left this week</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valuation Demo */}
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
              See How We Saved This Family ₹45 Lakhs
            </h2>
            <p className="text-xl text-gray-600">
              Real valuation case study - property in Whitefield that looked "fairly priced" but wasn't.
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
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Prestige Lakeside Habitat</h3>
                    <p className="text-gray-600">3BHK, Whitefield • 1,800 sq ft</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Overpriced!</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Builder Asking Price</p>
                    <p className="text-2xl font-bold text-red-600 line-through">₹3.2 Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Our Fair Value</p>
                    <p className="text-2xl font-bold text-green-600">₹2.75 Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Family Saved</p>
                    <p className="text-2xl font-bold text-primary">₹45 L</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Builder Direct Quote</span>
                    <span className="font-semibold text-red-600">₹3.2 Cr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Market Rate (Our Analysis)</span>
                    <span className="font-semibold text-green-600">₹2.75 Cr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Comparable Properties Avg</span>
                    <span className="font-semibold text-gray-600">₹2.8 Cr</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Issues We Found:</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Overpriced by 16% vs market comps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>No metro connectivity in 5 years</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>High maintenance costs (₹8/sq ft)</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold"
                  onClick={() => navigate('/property-valuation-form')}
                  data-testid="button-get-my-analysis"
                >
                  Get My Property Analysis →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You Get in Your Valuation Report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive 15-page professional report with everything you need to make an informed decision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full text-center p-8 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-500 rounded-2xl text-white">
                    <Scale className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fair Market Value</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Data-driven pricing based on 50+ comparable sales, location scoring, and market trends analysis.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Comparable sales analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Location premium assessment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Future appreciation potential</span>
                  </li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full text-center p-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-500 rounded-2xl text-white">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Investment Analysis</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  ROI projections, rental yield assessment, and risk factors specific to this property and location.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>5-year appreciation forecast</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>Rental yield analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>Risk assessment score</span>
                  </li>
                </ul>
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
                    <Target className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Negotiation Strategy</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Data-backed negotiation points, optimal offer price, and tactics to get the best deal.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Optimal offer range</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Negotiation talking points</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Deal closure timeline</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Limited Time Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Professional property valuation at 50% off - but only for the next 48 hours.
          </p>

          <div className="max-w-md mx-auto">
            <Card className="p-8 border-2 border-green-500 bg-white relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                50% OFF - Limited Time
              </Badge>
              <div className="mb-6">
                <div className="text-sm text-gray-500 line-through mb-2">Regular Price: ₹10,000</div>
                <div className="text-4xl font-bold text-green-600 mb-2">₹5,000</div>
                <div className="text-gray-600">Complete Professional Valuation</div>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>15-page comprehensive report</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Fair market value assessment</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Investment analysis & ROI projections</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Negotiation strategy guidance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>24-48 hour delivery</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Free follow-up consultation</span>
                </li>
              </ul>
              
              <Button
                onClick={() => navigate('/property-valuation-form')}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 text-lg font-semibold rounded-xl"
                data-testid="button-order-valuation"
              >
                Order Valuation Report Now →
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                💰 Money-back guarantee if you're not satisfied
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real families who saved lakhs with our professional valuations
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
                  "The valuation report saved us ₹30 lakhs! We were about to pay the builder's quote, 
                  but Priti's analysis showed the property was significantly overpriced."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Amit & Sneha Patel</div>
                    <div className="text-sm text-gray-500">IT Professionals, HSR Layout</div>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">₹30L saved</Badge>
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
                  "Best ₹5,000 I ever spent. The negotiation strategy alone helped me get a ₹15 lakh 
                  discount. The builder came down to our recommended price."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Rajesh Krishnan</div>
                    <div className="text-sm text-gray-500">Business Owner, Whitefield</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">₹15L negotiated</Badge>
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
                  "The ROI analysis was spot-on. They warned us about potential issues that could affect 
                  resale value. Professional, unbiased, and truly buyer-focused."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Priya & Karthik Reddy</div>
                    <div className="text-sm text-gray-500">Doctors, Electronic City</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 text-xs">Smart Decision</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Make a ₹50 Lakh Mistake
            </h2>
            <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
              Get professional valuation before you sign. 48 hours left for 50% off.
            </p>
            <p className="text-sm mb-8 opacity-75">
              Join 500+ smart buyers who avoided overpaying with our expert analysis.
            </p>
            
            <Button
              onClick={() => navigate('/property-valuation-form')}
              size="lg"
              variant="secondary"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              data-testid="button-get-valuation-cta"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Get My Valuation Report Now
            </Button>

            <p className="text-sm opacity-75 mt-6">
              🎯 Money-back guarantee - No overpaying, no regrets
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}