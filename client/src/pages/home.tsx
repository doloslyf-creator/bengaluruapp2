import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, Shield, Users, Star, ArrowRight, Building, MapPin, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-2">
            Trusted by 500+ Property Buyers
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-600 to-slate-800 bg-clip-text text-transparent">
              OwnItRight
            </span>
            <span className="block text-3xl lg:text-4xl text-slate-600 mt-4">
              Curated Property Consultants
            </span>
          </h1>
          
          <p className="text-xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            After spending 5 years in Service business we understand how difficult developers can be. 
            We are small but effective team in researching properties, completing due diligence and 
            offering you peace of mind property search experience with us.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link href="/find-property">
                Find Your Property
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg">
              <a href="#how-it-works">
                How It Works
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">Due Diligence</div>
                <div className="text-sm text-slate-600">Comprehensive verification</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">Expert Team</div>
                <div className="text-sm text-slate-600">5+ years experience</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">Peace of Mind</div>
                <div className="text-sm text-slate-600">Trusted process</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our proven 4-step process ensures you find the perfect property with complete confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-4">01</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Property Discovery</h3>
                <p className="text-slate-600">Use our smart search to find properties that match your exact requirements and budget</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-4">02</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Due Diligence</h3>
                <p className="text-slate-600">Our experts conduct thorough verification of legal documents, approvals, and developer credibility</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-4">03</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Site Visit</h3>
                <p className="text-slate-600">Schedule guided site visits with our property experts who know every detail</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-4">04</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Final Decision</h3>
                <p className="text-slate-600">Make informed decisions with our comprehensive property report and ongoing support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real experiences from satisfied property buyers who trusted OwnItRight
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "OwnItRight's team saved us from a potential legal nightmare. Their due diligence process caught issues that other consultants missed. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    RS
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Rajesh Sharma</div>
                    <div className="text-sm text-slate-600">Software Engineer, Whitefield</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "The property search experience was seamless. Their expertise in Bengaluru market helped us find our dream home within budget. Professional and trustworthy team."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    PM
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Priya Menon</div>
                    <div className="text-sm text-slate-600">Marketing Manager, Koramangala</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "After 5 years in property business, OwnItRight understands what buyers really need. Their transparent approach and detailed research gave us complete confidence."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    AK
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Anand Kumar</div>
                    <div className="text-sm text-slate-600">Business Owner, Electronic City</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-slate-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let our experienced team guide you through your property buying journey with complete peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link href="/find-property">
                Start Property Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              <Link href="/consultation">
                Get Expert Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-slate-300 bg-clip-text text-transparent mb-4">
                OwnItRight
              </h3>
              <p className="text-slate-300 max-w-md">
                Your trusted partner in property discovery with 5+ years of experience in due diligence and customer service.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/find-property" className="block text-slate-300 hover:text-blue-400 transition-colors">Find Property</Link>
                <Link href="/consultation" className="block text-slate-300 hover:text-blue-400 transition-colors">Expert Consultation</Link>
                <Link href="/admin" className="block text-slate-300 hover:text-blue-400 transition-colors">Admin Portal</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Bengaluru, Karnataka</span>
                </div>
                <div>Expert Property Consultancy Services</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 OwnItRight. All rights reserved. Curated Property Consultants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}