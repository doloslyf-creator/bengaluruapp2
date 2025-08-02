import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function PropertyValuation() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" style={{ paddingTop: '100px' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-white">
                <Calculator className="h-10 w-10" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Professional Property Valuation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Hi! I'm Priti, and I'll personally prepare a comprehensive valuation report for your property. 
              Get accurate market pricing, detailed analysis, and professional insights to make informed decisions.
            </p>
            
            {/* Key Stats */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-blue-200"
              >
                <Award className="h-6 w-6 text-blue-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">500+ Reports</h3>
                <p className="text-sm text-gray-600">Accurate valuations delivered</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-green-200"
              >
                <Clock className="h-6 w-6 text-green-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">24-48 Hours</h3>
                <p className="text-sm text-gray-600">Quick turnaround time</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur rounded-lg p-4 border border-purple-200"
              >
                <Shield className="h-6 w-6 text-purple-600 mb-2 mx-auto" />
                <h3 className="font-medium text-gray-900 mb-1">RERA Compliant</h3>
                <p className="text-sm text-gray-600">Legal documentation support</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Problem vs Solution Section */}
        <div className="space-y-12">
          {/* Why This Matters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-4xl mx-auto">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-red-800 mb-3">The Risk of Wrong Property Pricing</h2>
                  <div className="grid md:grid-cols-2 gap-4 text-red-700">
                    <div className="space-y-2">
                      <p className="font-medium">🚨 What 60% of property buyers face:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Overpaying by ₹10-30 lakhs without knowing</li>
                        <li>• Buying properties with poor appreciation potential</li>
                        <li>• Missing hidden legal and compliance issues</li>
                        <li>• Lack of proper market comparable analysis</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">💰 The cost of guesswork:</p>
                      <ul className="text-sm space-y-1">
                        <li>• ₹10-30 lakhs overpayment on average</li>
                        <li>• Poor ROI and appreciation rates</li>
                        <li>• Difficulty in resale or rental</li>
                        <li>• Legal complications during transactions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-4xl mx-auto">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-green-800 mb-3">The Solution: Professional Property Valuation</h2>
                  <div className="grid md:grid-cols-2 gap-4 text-green-700">
                    <div className="space-y-2">
                      <p className="font-medium">✅ What Priti's valuation includes:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Comprehensive market research and analysis</li>
                        <li>• Comparable property pricing study</li>
                        <li>• Legal compliance and RERA verification</li>
                        <li>• Future appreciation potential assessment</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">🛡️ Your protection guarantee:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Accurate pricing within ±5% market value</li>
                        <li>• 5+ years of Bengaluru market expertise</li>
                        <li>• RERA-compliant documentation</li>
                        <li>• Investment recommendation and ROI analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <Button
                onClick={() => setLocation("/property-valuation/form")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Get My Property Valuation Report
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>

            <p className="text-gray-600 max-w-2xl mx-auto">
              Get a comprehensive valuation analysis that includes market research, comparable pricing, 
              legal verification, and investment recommendations.
            </p>
          </motion.div>
        </div>
      </main>

      {/* What's Included Section */}
      <div className="bg-white/80 backdrop-blur border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included in Your Valuation Report?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every report I prepare gives you complete transparency about your property's true market value
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Market Analysis</h3>
              <p className="text-sm text-gray-600">Detailed pricing trends and comparable properties</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Legal Verification</h3>
              <p className="text-sm text-gray-600">RERA compliance and documentation check</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Growth Potential</h3>
              <p className="text-sm text-gray-600">Future appreciation and ROI projections</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Final Recommendation</h3>
              <p className="text-sm text-gray-600">Clear buy/hold/avoid guidance with reasoning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white/60 backdrop-blur border-t">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Trust Priti's Valuation?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              5 years of Bengaluru real estate expertise with a personal touch you won't find elsewhere
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">5+ Years Experience</h3>
              <p className="text-sm text-gray-600">Deep expertise in Bengaluru's micro-markets and pricing dynamics</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">500+ Reports</h3>
              <p className="text-sm text-gray-600">Successfully guided hundreds of property investment decisions</p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Personal Attention</h3>
              <p className="text-sm text-gray-600">Every report personally reviewed and customized by Priti</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}