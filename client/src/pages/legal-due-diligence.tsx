import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Scale, 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  IndianRupee,
  ChevronRight,
  Award,
  Eye,
  Check,
  Search,
  Building,
  ArrowRight,
  Timer,
  Users,
  Sparkles,
  Gavel,
  Star
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LegalDueDiligence() {
  const [, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 16,
    minutes: 28,
    seconds: 45
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-4 text-sm">
          <span className="font-semibold">⚖️ Legal Protection Special: Complete Due Diligence Ends In:</span>
          <div className="flex items-center space-x-2 font-mono font-bold">
            <span>{timeLeft.days}d</span>
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
          </div>
          <span>• Protect your ₹2+ Cr investment!</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-purple-100 text-purple-800 border-purple-200">
              ⚖️ Avoid legal nightmares that could cost you everything
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Never buy property with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                hidden legal issues
              </span>{" "}
              again
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Complete 12-step legal verification by expert lawyers. Uncover title defects, 
              pending litigations, and compliance issues <strong>before you sign</strong> - not after.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate('/legal-due-diligence-form')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                data-testid="button-start-verification"
              >
                <Scale className="h-5 w-5 mr-2" />
                Start Legal Verification
              </Button>
              
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2"
                data-testid="button-see-tracker"
              >
                <Eye className="h-5 w-5 mr-2" />
                See 12-Step Process →
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="text-purple-500">⚖️</div>
                <span><strong>100%</strong> legal issues caught before signing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-yellow-500">🛡️</div>
                <span><strong>Zero</strong> clients lost money to legal problems</span>
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
              We Saved This Family's ₹3.5 Cr Investment
            </h2>
            <p className="text-xl text-gray-600">
              Real case study - family almost bought property with serious title disputes.
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
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Brigade Opus</h3>
                    <p className="text-gray-600">4BHK, Yeshwanthpur • ₹3.5 Crores</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Legal Issues Found!</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Legal Issues</p>
                    <p className="text-2xl font-bold text-red-600">7</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Investment at Risk</p>
                    <p className="text-2xl font-bold text-orange-600">₹3.5 Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Family Saved</p>
                    <p className="text-2xl font-bold text-green-600">₹3.5 Cr</p>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Critical Legal Issues We Found:</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Title Dispute:</strong> Previous owner's legal heirs contesting sale</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Bank Lien:</strong> Undisclosed mortgage on property</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>RERA Issues:</strong> Project not RERA compliant</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span><strong>Approvals:</strong> Environmental clearance pending</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Result:</h4>
                  <p className="text-sm text-gray-700">
                    Family walked away before signing. Found similar property with clean title. 
                    Saved ₹3.5 crores from getting stuck in legal mess for years.
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold"
                  onClick={() => navigate('/legal-due-diligence-form')}
                  data-testid="button-protect-investment"
                >
                  Protect My Investment →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 12-Step Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our 12-Step Legal Verification Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive legal due diligence covering every aspect that could affect your ownership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-500 rounded-2xl text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Title Verification (Steps 1-4)</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Original title document verification</li>
                  <li>• Chain of ownership for 30+ years</li>
                  <li>• Previous sale deed authenticity</li>
                  <li>• Power of attorney validation</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-500 rounded-2xl text-white">
                    <Search className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Legal Compliance (Steps 5-8)</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• RERA registration verification</li>
                  <li>• Building approvals & sanctions</li>
                  <li>• Environmental clearances</li>
                  <li>• NOC from relevant authorities</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-500 rounded-2xl text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Risk Assessment (Steps 9-12)</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Pending litigation search</li>
                  <li>• Financial encumbrance check</li>
                  <li>• Tax compliance verification</li>
                  <li>• Final legal opinion report</li>
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
            Complete Legal Protection
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Comprehensive legal due diligence - costs ₹15,000, protects crores of investment.
          </p>

          <div className="max-w-md mx-auto">
            <Card className="p-8 border-2 border-purple-500 bg-white relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                7-10 Day Process
              </Badge>
              <div className="mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">₹15,000</div>
                <div className="text-gray-600">Complete Legal Due Diligence</div>
                <div className="text-sm text-green-600 font-semibold mt-2">Protects your entire investment</div>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>12-step comprehensive verification</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>Expert property lawyers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>Title search for 30+ years</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>All government approvals verified</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>Litigation & encumbrance check</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>Detailed legal opinion report</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>Ongoing legal support</span>
                </li>
              </ul>
              
              <Button
                onClick={() => navigate('/legal-due-diligence-form')}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 text-lg font-semibold rounded-xl"
                data-testid="button-order-verification"
              >
                Order Legal Verification →
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                ⚖️ 100% money-back guarantee if we miss any legal issue
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
              Real stories of how our legal verification prevented massive losses
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
                  "Found title dispute that could have tied up our ₹2.8 crore investment in courts for years. 
                  Saved us from a nightmare. Worth every rupee."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Suresh & Lakshmi Iyer</div>
                    <div className="text-sm text-gray-500">Engineers, Koramangala</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 text-xs">₹2.8Cr Saved</Badge>
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
                  "Discovered the project didn't have proper environmental clearance. 
                  Could have been demolished later. Professional service, thorough verification."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Anita Menon</div>
                    <div className="text-sm text-gray-500">Architect, Indiranagar</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">Legal Disaster Avoided</Badge>
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
                  "The 12-step process caught financial encumbrances that weren't disclosed. 
                  Detailed report helped us negotiate safely. Excellent legal protection."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900">Madhav & Priyanka Rao</div>
                    <div className="text-sm text-gray-500">Doctors, Hebbal</div>
                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">Safe Purchase</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Risk Your Life Savings on Legal Issues
            </h2>
            <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
              Complete 12-step legal verification in 7-10 days. Protect your crores from legal nightmares.
            </p>
            <p className="text-sm mb-8 opacity-75">
              Zero clients lost money to legal issues. 100% track record of catching problems early.
            </p>
            
            <Button
              onClick={() => navigate('/legal-due-diligence-form')}
              size="lg"
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              data-testid="button-legal-protection"
            >
              <Scale className="h-5 w-5 mr-2" />
              Start Legal Protection Now
            </Button>

            <p className="text-sm opacity-75 mt-6">
              ⚖️ Your investment is too important to trust to luck
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}