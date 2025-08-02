import { useState } from "react";
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
  Building
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function LegalDueDiligence() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50" style={{ paddingTop: '100px' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/95 backdrop-blur border-b border-purple-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white shadow-lg">
                <Scale className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Legal Due Diligence Tracker</h1>
                <p className="text-gray-600 mt-1">Complete legal verification in 12 steps - secure your property investment with Priti</p>
              </div>
            </div>
            
            {/* Key Stats - Compact */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">12</div>
                <div className="text-xs text-gray-500">Step Process</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">7-10d</div>
                <div className="text-xs text-gray-500">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">100%</div>
                <div className="text-xs text-gray-500">Legal Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        
        {/* Why You Need It Section */}
        <section className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-purple-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why You Need Legal Due Diligence</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Title Verification</h3>
                <p className="text-sm text-gray-600">Ensure clear and marketable title with proper ownership documentation and no legal disputes.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Legal Compliance Check</h3>
                <p className="text-sm text-gray-600">Verify all approvals, NOCs, and compliance with local regulations and RERA requirements.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Encumbrance Analysis</h3>
                <p className="text-sm text-gray-600">Detailed review of property history, previous transactions, and any financial liabilities.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                <p className="text-sm text-gray-600">Identify potential legal risks, disputes, or compliance issues that could affect ownership.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Development Rights</h3>
                <p className="text-sm text-gray-600">Verify construction permissions, FSI utilization, and future development possibilities.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Documentation Review</h3>
                <p className="text-sm text-gray-600">Complete review of sale deed, agreements, NOCs, and all legal documents for accuracy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-xl p-6 shadow-sm border border-purple-200 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-purple-800 mb-4">What's Included in Our 12-Step Legal Process</h2>
          <p className="text-purple-700 mb-4">Our experienced legal team conducts comprehensive verification covering:</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Property title verification and chain analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Encumbrance certificate review (15 years)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Municipal approvals and NOC verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">RERA registration and compliance check</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Building plan approval verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Occupancy certificate validation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Khata and property tax verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Legal notice and litigation search</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Power of attorney verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Stamp duty and registration compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Environmental clearance review</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Final legal opinion and risk assessment</span>
            </div>
          </div>
        </section>

        {/* Pricing & Timeline Section */}
        <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              Timeline & Process
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Document Collection</span>
                <span className="text-sm font-semibold text-gray-900">1-2 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Legal Verification</span>
                <span className="text-sm font-semibold text-purple-600">5-7 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Report Preparation</span>
                <span className="text-sm font-semibold text-blue-600">1-2 days</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Total completion time: 7-10 business days</p>
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
                <span className="text-sm text-gray-600">Residential Property</span>
                <span className="text-lg font-bold text-green-600">₹4,999</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Commercial Property</span>
                <span className="text-lg font-bold text-blue-600">₹7,999</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Premium Complex Review</span>
                <span className="text-lg font-bold text-purple-600">₹9,999</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">All packages include complete 12-step verification</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm border border-gray-200 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Award className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Expert Legal Team</span>
              <span className="text-xs text-gray-600">20+ Years Experience</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">100% Legal Coverage</span>
              <span className="text-xs text-gray-600">Complete Verification</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">Guaranteed Accuracy</span>
              <span className="text-xs text-gray-600">Professional Reports</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-8 border border-purple-600/20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Your Property. Verify Every Detail.</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Don't take legal risks with your property investment. Get complete legal verification with our comprehensive 12-step process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={() => setLocation("/legal-due-diligence/form")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg text-white px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Start Legal Verification
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>Track Progress Live</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>12-Step Process</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Expert Legal Team</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>7-10 Day Completion</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}