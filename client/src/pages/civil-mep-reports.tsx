import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Shield, 
  Building2, 
  Zap, 
  Droplets, 
  Flame, 
  Clock, 
  IndianRupee,
  ChevronRight,
  CheckCircle,
  Award,
  Eye,
  Check,
  TrendingUp,
  FileText,
  ArrowRight,
  Timer,
  Users,
  Sparkles,
  Wrench,
  Search
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CivilMepReports() {
  const [, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 8,
    minutes: 42,
    seconds: 15
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
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-4 text-sm">
          <span className="font-semibold">🚨 Emergency: Get CIVIL+MEP Report Before Possession:</span>
          <div className="flex items-center space-x-2 font-mono font-bold">
            <span>{timeLeft.days}d</span>
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
          </div>
          <span>• Avoid ₹5-20L repair costs!</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-red-100 text-red-800 border-red-200">
              ⚠️ Prevent catastrophic structural and electrical failures with expert inspection
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Don't take possession until{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                everything is perfect
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Our certified engineers inspect civil structure, MEP systems, and safety compliance. 
              Find critical issues <strong>before handover</strong> - when builders still have to fix them for free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate('/civil-mep-reports-form')}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                data-testid="button-order-inspection"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Order Emergency Inspection
              </Button>
              
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2"
                data-testid="button-see-sample"
              >
                <Eye className="h-5 w-5 mr-2" />
                See Sample Report →
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="text-red-500">💸</div>
                <span><strong>₹8.5L</strong> average repair costs avoided</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-yellow-500">⚡</div>
                <span><strong>24-48hr</strong> emergency inspection available</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Horror Story Demo */}
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
              We Saved This Family from Disaster
            </h2>
            <p className="text-xl text-gray-600">
              Real case study - family almost took possession of apartment with 47 critical defects.
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
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Sobha Emerald</h3>
                    <p className="text-gray-600">3BHK, Sarjapur Road • Pre-possession</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">47 Defects Found!</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Defects Found</p>
                    <p className="text-2xl font-bold text-red-600">47</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Repair Cost Avoided</p>
                    <p className="text-2xl font-bold text-green-600">₹12.5 L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Family Saved</p>
                    <p className="text-2xl font-bold text-primary">₹12.5 L</p>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Critical Issues We Found:</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Electrical:</strong> Faulty wiring, no earthing (fire hazard)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Plumbing:</strong> 6 leakages, pressure issues</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Civil:</strong> Wall cracks, flooring defects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Safety:</strong> No smoke detectors, fire exits blocked</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Result:</h4>
                  <p className="text-sm text-gray-700">
                    Builder fixed ALL 47 defects for free before handover. Family moved into perfect apartment 
                    without spending a single rupee on repairs.
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-xl font-semibold"
                  onClick={() => navigate('/civil-mep-reports-form')}
                  data-testid="button-book-inspection"
                >
                  Book My Pre-Possession Inspection →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What We Inspect */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Engineers Inspect
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive 150+ point checklist covering every aspect of your new home.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full text-center p-6 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-500 rounded-2xl text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Civil Structure</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Wall cracks & seepage</li>
                  <li>• Floor & ceiling defects</li>
                  <li>• Door & window alignment</li>
                  <li>• Paint quality issues</li>
                  <li>• Tile installation problems</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full text-center p-6 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-500 rounded-2xl text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Electrical Systems</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Wiring & switch points</li>
                  <li>• Earthing & safety</li>
                  <li>• Circuit breaker testing</li>
                  <li>• Power outlet functionality</li>
                  <li>• Lighting systems</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full text-center p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-500 rounded-2xl text-white">
                    <Droplets className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Plumbing</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Water supply & pressure</li>
                  <li>• Drainage system</li>
                  <li>• Leakage detection</li>
                  <li>• Fixture installation</li>
                  <li>• Hot water systems</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full text-center p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-500 rounded-2xl text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Safety & Compliance</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Fire safety systems</li>
                  <li>• Ventilation adequacy</li>
                  <li>• Emergency exits</li>
                  <li>• Building code compliance</li>
                  <li>• Security systems</li>
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
            Emergency Inspection Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Professional engineering inspection - costs ₹8,000, saves ₹8 lakhs on average.
          </p>

          <div className="max-w-md mx-auto">
            <Card className="p-8 border-2 border-red-500 bg-white relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white">
                24-48 Hour Service
              </Badge>
              <div className="mb-6">
                <div className="text-4xl font-bold text-red-600 mb-2">₹8,000</div>
                <div className="text-gray-600">Complete CIVIL+MEP Inspection</div>
                <div className="text-sm text-green-600 font-semibold mt-2">Average savings: ₹8.5 lakhs</div>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span>150+ point inspection checklist</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span>Certified civil & MEP engineers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span>Detailed defect report with photos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span>Priority-wise fixing guidelines</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span>24-48 hour inspection slot</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                  <span>Builder negotiation support</span>
                </li>
              </ul>
              
              <Button
                onClick={() => navigate('/civil-mep-reports-form')}
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 text-lg font-semibold rounded-xl"
                data-testid="button-book-emergency"
              >
                Book Emergency Inspection →
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                🚨 Don't take possession until you know everything is perfect
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
              Families We've Protected
            </h2>
            <p className="text-xl text-gray-600">
              Real stories of how our inspections prevented costly disasters
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
                  "Found 23 electrical defects including fire hazards. Builder fixed everything for free 
                  before handover. Could have cost us ₹5 lakhs later."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Vikram & Kavitha Nair</div>
                    <div className="text-sm text-gray-500">Pharmacists, Marathahalli</div>
                    <Badge className="mt-2 bg-red-100 text-red-800 text-xs">₹5L saved</Badge>
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
                  "Detected major plumbing issues that would have flooded our apartment. 
                  The inspection was thorough and professional. Money well spent!"
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Ramesh Kumar</div>
                    <div className="text-sm text-gray-500">Bank Manager, Whitefield</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">Flood Prevented</Badge>
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
                  "The detailed report with photos helped us negotiate with builder professionally. 
                  They fixed all 31 defects without argument. Excellent service!"
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Deepika Sharma</div>
                    <div className="text-sm text-gray-500">HR Executive, Electronic City</div>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">31 Defects Fixed</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Take Possession of a Defective Home
            </h2>
            <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
              24-48 hour emergency inspection available. Find issues while builder still has to fix them free.
            </p>
            <p className="text-sm mb-8 opacity-75">
              200+ families protected from costly repairs. Average savings: ₹8.5 lakhs.
            </p>
            
            <Button
              onClick={() => navigate('/civil-mep-reports-form')}
              size="lg"
              variant="secondary"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              data-testid="button-emergency-inspection"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Book Emergency Inspection Now
            </Button>

            <p className="text-sm opacity-75 mt-6">
              🚨 Every day you delay, defects become your expensive responsibility
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}