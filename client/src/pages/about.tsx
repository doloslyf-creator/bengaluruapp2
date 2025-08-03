import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  Shield, 
  Target, 
  Award, 
  CheckCircle, 
  Home,
  Building,
  Handshake,
  Star
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function About() {
  const [, navigate] = useLocation();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-white">
                <Heart className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Priti & Zaki
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The dream team behind OwnItRight - where your property dreams meet our expertise, 
              and where we always put buyers first, no matter what.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founders Story */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Priti's Story */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg h-full">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-pink-100 rounded-xl">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Priti</h3>
                      <p className="text-pink-600 font-medium">Customer Experience Expert</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      "I believe finding your dream home shouldn't feel like a battle. Every family deserves 
                      someone who truly listens to their needs and guides them with genuine care."
                    </p>
                    
                    <p className="leading-relaxed">
                      With years of experience in understanding what makes a house feel like home, 
                      Priti specializes in translating your dreams into reality. She takes the time to 
                      understand your lifestyle, preferences, and budget to find properties that truly match your vision.
                    </p>
                    
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Priti's Expertise:</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-pink-600" />
                          <span>Customer needs analysis & lifestyle matching</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-pink-600" />
                          <span>Property search strategy & personalized recommendations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-pink-600" />
                          <span>Buyer advocacy & negotiation support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Zaki's Story */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg h-full">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Zaki</h3>
                      <p className="text-blue-600 font-medium">Technical Operations & Quality Expert</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      "Every property has a story written in its structure, compliance, and construction quality. 
                      My job is to read that story and make sure it's one our clients want to be part of."
                    </p>
                    
                    <p className="leading-relaxed">
                      Zaki brings deep technical expertise in construction, vendor management, and team operations. 
                      He ensures every property recommendation is backed by thorough technical evaluation and 
                      manages the complex network of inspectors, legal experts, and industry professionals.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Zaki's Expertise:</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>Civil engineering insights & structural analysis</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>Vendor network management & quality control</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>Team coordination & operational excellence</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How OwnItRight Began
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              A shared frustration with the property industry led to a revolutionary approach.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg max-w-none text-gray-700"
          >
            <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-lg">
              <p className="text-lg leading-relaxed mb-6">
                It started with a simple observation: <strong>the property industry was broken</strong>. 
                Builders focused on selling, agents focused on commissions, and buyers? They were left 
                to navigate a maze of information, hidden costs, and biased advice.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Priti, with her deep understanding of customer psychology and needs, kept seeing families 
                make expensive mistakes because they didn't have someone truly advocating for them. 
                Meanwhile, Zaki, with his technical background and industry connections, witnessed how 
                crucial technical details were being overlooked in property decisions.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                <strong>That's when we decided to flip the script.</strong> What if there was a service 
                that worked exclusively for buyers? What if technical expertise and customer care could 
                come together to create something genuinely different?
              </p>
              
              <p className="text-lg leading-relaxed">
                OwnItRight was born from this vision - a place where Priti's customer-first approach 
                meets Zaki's technical excellence, where we critique builder properties not to sell them, 
                but to help you make the right decision for your family's future.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why We're Different
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We don't work for builders. We don't work for developers. We work for you - the buyer.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg h-full text-center">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 rounded-xl">
                      <Shield className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Buyer-First Philosophy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We're not here to sell you a property. We're here to help you find the right one. 
                    Our loyalty is to you, not to builders or developers.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg h-full text-center">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-xl">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Critical Analysis</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We critique every property with the same scrutiny we'd use for our own family's purchase. 
                    No sugar-coating, no hidden agendas.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg h-full text-center">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-purple-100 rounded-xl">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Excellence</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every recommendation is backed by thorough technical evaluation, legal verification, 
                    and market analysis. No guesswork.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What Drives Us Every Day
            </h2>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Handshake className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Transparency First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every property analysis, every cost breakdown, every recommendation comes with 
                    complete transparency. You know exactly what you're getting and why.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Touch</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We treat every client like family. Your dreams become our mission, 
                    and your success is our greatest reward.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence Always</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We don't compromise on quality - not in our analysis, not in our service, 
                    and not in our recommendations. You deserve nothing less.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Long-term Partnership</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We're not just here for the transaction. We're here for your entire property journey, 
                    providing support and guidance whenever you need it.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let Priti and Zaki guide you to your perfect property. Because when you own it right, 
              you own it with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/find-property')}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white px-8 py-3 text-lg font-semibold rounded-xl"
                data-testid="button-find-property"
              >
                <Home className="h-5 w-5 mr-2" />
                Find Your Dream Home
              </Button>
              
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg font-semibold rounded-xl"
                data-testid="button-contact-us"
              >
                <Users className="h-5 w-5 mr-2" />
                Talk to Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}