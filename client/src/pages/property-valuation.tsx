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
      <div className="bg-white/95 backdrop-blur border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-white shadow-lg">
                <Calculator className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Professional Property Valuation</h1>
                <p className="text-gray-600 mt-1">Get accurate market pricing with comprehensive analysis by Priti</p>
              </div>
            </div>
            
            {/* Key Stats - Compact */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">500+</div>
                <div className="text-xs text-gray-500">Reports</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">24-48h</div>
                <div className="text-xs text-gray-500">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">RERA</div>
                <div className="text-xs text-gray-500">Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Problem vs Solution Section - Compact */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-red-800 mb-2">The Risk of Wrong Property Pricing</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-red-700 mb-1">🚨 What 60% of property buyers face:</p>
                    <ul className="text-red-600 space-y-0.5">
                      <li>• Overpaying by ₹10-30 lakhs without knowing</li>
                      <li>• Buying properties with poor appreciation potential</li>
                      <li>• Missing hidden legal and compliance issues</li>
                      <li>• Lack of proper market comparable analysis</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 mb-1">💰 The cost of guesswork:</p>
                    <ul className="text-red-600 space-y-0.5">
                      <li>• ₹10-30 lakhs overpayment on average</li>
                      <li>• Poor ROI and appreciation rates</li>
                      <li>• Difficulty in resale or rental</li>
                      <li>• Legal complications during transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Solution Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-green-800 mb-2">The Solution: Professional Property Valuation</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-green-700 mb-1">✅ What Priti's valuation includes:</p>
                    <ul className="text-green-600 space-y-0.5">
                      <li>• Comprehensive market research and analysis</li>
                      <li>• Comparable property pricing study</li>
                      <li>• Legal compliance and RERA verification</li>
                      <li>• Future appreciation potential assessment</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-green-700 mb-1">🛡️ Your protection guarantee:</p>
                    <ul className="text-green-600 space-y-0.5">
                      <li>• Accurate pricing within ±5% market value</li>
                      <li>• 5+ years of Bengaluru market expertise</li>
                      <li>• RERA-compliant documentation</li>
                      <li>• Investment recommendation and ROI analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-block"
          >
            <Button
              onClick={() => setLocation("/property-valuation/form")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Get My Property Valuation Report
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
          <p className="text-gray-600 mt-2 text-sm max-w-2xl mx-auto">
            Get a comprehensive valuation analysis that includes market research, comparable pricing, 
            legal verification, and investment recommendations.
          </p>
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