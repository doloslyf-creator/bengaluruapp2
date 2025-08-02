import { useLocation } from "wouter";
import { Search, Home, Star, Phone, Mail, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomerHome() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Smart Property Search",
      description: "Find properties that match your exact preferences with our intelligent matching system"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      title: "RERA Verified Properties",
      description: "All properties are verified and RERA compliant for your peace of mind"
    },
    {
      icon: <Phone className="h-8 w-8 text-blue-600" />,
      title: "Expert Consultation",
      description: "Get personalized advice from our property experts at every step"
    }
  ];

  const zones = [
    { name: "North Bengaluru", count: "50+ Properties", popular: "Hebbal, Yelahanka" },
    { name: "South Bengaluru", count: "75+ Properties", popular: "JP Nagar, BTM Layout" },
    { name: "East Bengaluru", count: "60+ Properties", popular: "Whitefield, Marathahalli" },
    { name: "West Bengaluru", count: "40+ Properties", popular: "Rajajinagar, Malleshwaram" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">PropertyFinder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/admin-panel')}>
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Home in
            <span className="text-primary block">Bengaluru</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the perfect property that matches your lifestyle and budget. 
            Get expert guidance throughout your home buying journey.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/find-property')}
            className="text-lg px-8 py-6 flex items-center space-x-2 mx-auto"
          >
            <Search className="h-5 w-5" />
            <span>Start Property Search</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>500+ Happy Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>RERA Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose PropertyFinder?
            </h3>
            <p className="text-lg text-gray-600">
              We make property hunting simple, transparent, and rewarding
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zones Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Properties by Zone
            </h3>
            <p className="text-lg text-gray-600">
              Find properties in your preferred area of Bengaluru
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zones.map((zone, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate('/find-property')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-2">{zone.count}</p>
                  <p className="text-sm text-gray-600">Popular: {zone.popular}</p>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">
                    View Properties <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Property?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Start your property search today and get personalized recommendations
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/find-property')}
              className="flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Find Properties</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/consultation')}
              className="flex items-center space-x-2 bg-transparent border-white text-white hover:bg-white hover:text-primary"
            >
              <Phone className="h-5 w-5" />
              <span>Consult Expert</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">PropertyFinder</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner in finding the perfect property in Bengaluru.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Search Properties</a></li>
                <li><a href="#" className="hover:text-white">Expert Consultation</a></li>
                <li><a href="#" className="hover:text-white">Property Zones</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 95603 66601</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@propertyfinder.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Bengaluru, Karnataka</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PropertyFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}