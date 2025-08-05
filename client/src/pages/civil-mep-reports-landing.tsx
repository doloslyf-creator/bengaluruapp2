import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Building2, 
  Wrench, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  FileText, 
  TrendingUp,
  Construction,
  Home,
  Flame,
  Droplets
} from "lucide-react";

export default function CivilMepReportsLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Wrench className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Civil + MEP Engineering
              <span className="block text-blue-600 dark:text-blue-400">Assessment Reports</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Get comprehensive structural, mechanical, electrical, and plumbing assessments for informed property investment decisions. Professional engineering reports starting at just ₹2,499.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/civil-mep-reports">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" data-testid="button-view-properties">
                  <Building2 className="w-5 h-5 mr-2" />
                  View Available Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                Certified Professional Engineers
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">48-Hour Delivery</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Licensed Engineers</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Detailed Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What's Included in Your Assessment
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive engineering evaluation covering all critical building systems
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Construction className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Structural Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Foundation, superstructure, walls, roofing, and overall building integrity assessment
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Mechanical Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  HVAC, ventilation, fire safety, and building management system evaluation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-lg">Electrical Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Power distribution, electrical installations, and safety compliance assessment
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Plumbing Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Water supply, drainage, plumbing fixtures, and water management infrastructure
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Assessment
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Get your comprehensive Civil + MEP engineering report
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">₹2,499</div>
              <CardTitle className="text-xl">Complete Assessment</CardTitle>
              <CardDescription>Per property evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Complete structural assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">MEP systems evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Investment recommendation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">48-hour delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Licensed engineer certification</span>
                </div>
              </div>
              
              <Link to="/civil-mep-reports" className="block">
                <Button className="w-full" size="lg" data-testid="button-get-assessment">
                  <FileText className="w-4 h-4 mr-2" />
                  Get Your Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Engineering Reports?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Certified Professionals</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All assessments conducted by licensed structural and MEP engineers with years of experience
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Investment Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get clear investment recommendations based on engineering analysis and market conditions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive documentation with photos, analysis, and actionable recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Your Property Assessed?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse available properties and order your engineering assessment today
          </p>
          
          <Link to="/civil-mep-reports">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" data-testid="button-browse-properties">
              <Building2 className="w-5 h-5 mr-2" />
              Browse Properties
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}