import { useState } from "react";
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
  FileText
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function CivilMepReports() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50" style={{ paddingTop: '100px' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/95 backdrop-blur border-b border-red-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white shadow-lg">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CIVIL+MEP Engineering Report</h1>
                <p className="text-gray-600 mt-1">Professional engineering analysis before you buy - protect your investment with Priti</p>
              </div>
            </div>
            
            {/* Key Stats - Compact */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">200+</div>
                <div className="text-xs text-gray-500">Issues Found</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">24-48h</div>
                <div className="text-xs text-gray-500">Emergency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">₹5L</div>
                <div className="text-xs text-gray-500">Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        
        {/* Why You Need It Section */}
        <section className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-red-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why You Need CIVIL+MEP Engineering Report</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Structural Safety Verification</h3>
                <p className="text-sm text-gray-600">Ensure the building's foundation, beams, and load-bearing elements are structurally sound and safe for habitation.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Electrical System Analysis</h3>
                <p className="text-sm text-gray-600">Comprehensive evaluation of electrical wiring, circuits, and safety compliance to prevent fire hazards.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Plumbing & Drainage Check</h3>
                <p className="text-sm text-gray-600">Thorough inspection of water supply, drainage systems, and potential leakage or water damage issues.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Flame className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fire Safety Compliance</h3>
                <p className="text-sm text-gray-600">Verify fire safety measures, emergency exits, and compliance with local fire safety regulations.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Code Compliance Verification</h3>
                <p className="text-sm text-gray-600">Ensure the property meets all local building codes, RERA requirements, and municipal regulations.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Future Risk Assessment</h3>
                <p className="text-sm text-gray-600">Identify potential maintenance issues and long-term structural concerns before they become expensive problems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="bg-gradient-to-br from-red-50 to-orange-100 rounded-xl p-6 shadow-sm border border-red-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-4">What's Included in Our Engineering Report</h2>
          <p className="text-red-700 mb-4">Our certified engineers provide you with a comprehensive 15+ page report covering:</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Complete structural integrity assessment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Electrical safety and load capacity analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Plumbing system evaluation and water quality test</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">HVAC system performance and efficiency check</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Fire safety compliance verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Building code compliance documentation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Detailed remediation recommendations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Cost estimates for required repairs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Professional engineer certification & stamp</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Digital report with high-resolution images</span>
            </div>
          </div>
        </section>

        {/* Pricing & Timeline Section */}
        <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-red-600 mr-2" />
              Timeline & Process
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Standard Report</span>
                <span className="text-sm font-semibold text-gray-900">5-7 business days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority Service</span>
                <span className="text-sm font-semibold text-orange-600">3-4 business days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Emergency Service</span>
                <span className="text-sm font-semibold text-red-600">24-48 hours</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">All reports include on-site inspection by certified engineers</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <IndianRupee className="h-5 w-5 text-green-600 mr-2" />
              Professional Pricing
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Standard Report</span>
                <span className="text-lg font-bold text-green-600">₹8,999</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority Service</span>
                <span className="text-lg font-bold text-orange-600">₹12,999</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Emergency Service</span>
                <span className="text-lg font-bold text-red-600">₹18,999</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Includes ₹5 lakh repair cost protection coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm border border-gray-200 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Award className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Certified Engineers</span>
              <span className="text-xs text-gray-600">15+ Years Experience</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">₹5L Protection</span>
              <span className="text-xs text-gray-600">Repair Cost Coverage</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">100% Satisfaction</span>
              <span className="text-xs text-gray-600">Guaranteed Quality</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-xl p-8 border border-red-600/20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Protect Your Investment. Get Peace of Mind.</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Don't let hidden engineering issues cost you lakhs later. Get your property professionally inspected by certified engineers today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={() => setLocation("/civil-mep-reports/form")}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg text-white px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Order Engineering Report
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>Pay Later Option Available</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Detailed Report</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Professional Engineers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Quick Turnaround</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}