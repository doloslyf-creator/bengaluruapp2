import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Heart, 
  Search,
  ChevronRight,
  Phone,
  MessageCircle,
  Calendar,
  Home,
  Star,
  Clock
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactThankYou() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50" style={{ paddingTop: '100px' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white/95 backdrop-blur border-b border-green-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600">Your home buying journey with Priti has officially begun</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Hi! This is Priti</h2>
              </div>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                I'm so excited to help you find your perfect home! I've received all your preferences and I'm already working on curating the best properties that match exactly what you're looking for.
              </p>
              <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 font-medium">
                  You'll hear from me within the next 2 hours with handpicked properties and next steps!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What Happens Next?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Call</h4>
                  <p className="text-sm text-gray-600">I'll call you to understand your needs better and answer any questions</p>
                  <div className="mt-2 flex items-center justify-center text-xs text-blue-600">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Within 2 hours</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Curated Properties</h4>
                  <p className="text-sm text-gray-600">Receive 3-5 handpicked properties that perfectly match your criteria</p>
                  <div className="mt-2 flex items-center justify-center text-xs text-green-600">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Today evening</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Site Visits</h4>
                  <p className="text-sm text-gray-600">Schedule visits to your favorite properties with my personal guidance</p>
                  <div className="mt-2 flex items-center justify-center text-xs text-purple-600">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>This weekend</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-blue-600/5">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Want to Explore Properties Right Now?</h3>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                While you wait for my call, feel free to browse our curated property collection. You might find something you love!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => setLocation("/find-property")}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg text-white px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Properties
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  Back to Home
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Curated Selection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span>Expert Guidance</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Personal Touch</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="border-0 shadow-sm bg-white/80">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Need to Reach Me Immediately?</h4>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Phone className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-gray-900">Call Directly</span>
                  <span className="text-sm text-gray-600">+91 98765 43210</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-gray-900">WhatsApp</span>
                  <span className="text-sm text-gray-600">Quick responses</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-gray-900">Schedule Call</span>
                  <span className="text-sm text-gray-600">Book a time slot</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </main>
    </div>
  );
}