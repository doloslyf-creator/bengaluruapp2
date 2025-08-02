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
  CheckCircle,
  Home,
  CreditCard,
  Scale,
  Target,
  Building,
  Check
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
        <div className="max-w-5xl mx-auto px-4 py-6">
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
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        
        {/* Why You Need It Section */}
        <section className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-blue-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why You Need Professional Property Valuation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Buying a Property?</h3>
                <p className="text-sm text-gray-600">Avoid overpaying by knowing the fair value</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Selling Your Property?</h3>
                <p className="text-sm text-gray-600">Price it right to attract serious buyers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Loan Against Property?</h3>
                <p className="text-sm text-gray-600">Get accurate figures for financing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Scale className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Legal Disputes?</h3>
                <p className="text-sm text-gray-600">Independent third-party report</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Target className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Investment Decisions?</h3>
                <p className="text-sm text-gray-600">Identify appreciation potential</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">NRI Property Owner?</h3>
                <p className="text-sm text-gray-600">Remote valuation services available</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-green-800 mb-4">What's Included in Our Valuation Report</h2>
          <p className="text-green-700 mb-4">Our reports go beyond surface-level estimations. You get:</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Fair Market Value Estimate</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Comparative Market Analysis (CMA)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Property Condition & Age Assessment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Location & Infrastructure Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Legal & Zoning Overview</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Rental Yield Estimate</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Future Appreciation Potential</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Supporting Photographs & Maps</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">RERA-Registered Valuer Certification</span>
            </div>
          </div>
        </section>

        {/* Pricing & Timeline Section */}
        <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              Delivery Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Digital Report</span>
                <span className="font-semibold text-blue-600">3-5 working days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Site Visit + Detailed Report</span>
                <span className="font-semibold text-blue-600">5-7 working days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Express 48-Hour Report</span>
                <span className="font-semibold text-orange-600">Additional fee</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <IndianRupee className="h-5 w-5 text-green-600 mr-2" />
              Transparent Pricing
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Standard Desktop Valuation</span>
                <span className="font-semibold text-green-600">₹2,999</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">On-Site Valuation with Expert Visit</span>
                <span className="font-semibold text-green-600">From ₹6,999</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">RERA-Certified Valuation</span>
                <span className="font-semibold text-blue-600">Custom Quote</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Don't Guess. Know.</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Request your property valuation today and take the next step with certainty. 
            Get started in 3 simple steps: Submit property details, choose report type, receive your expert report.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-block"
          >
            <Button
              onClick={() => setLocation("/property-valuation/form")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Request Your Valuation Report
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
          
          <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Unbiased & Confidential</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4 text-blue-600" />
              <span>RERA-Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span>100% Satisfaction Guarantee</span>
            </div>
          </div>
        </section>
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