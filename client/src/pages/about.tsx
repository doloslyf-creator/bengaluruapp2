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
  Star,
  AlertTriangle,
  TrendingUp,
  Search,
  Eye,
  FileText,
  Phone,
  Mail
} from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">
              🏡 Our Story
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Built From the Ground,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                For the People
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We didn't start with a sales target. We started with a frustration.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                After helping friends and family navigate the chaos of buying homes — delayed projects, shady titles, 
                drainage issues, and false promises — we realized something painfully clear:
              </p>
              <p className="text-xl font-semibold text-primary mt-4">
                👉 Buying a property in Bengaluru wasn't hard because of lack of options.<br/>
                It was hard because no one was truly on the buyer's side.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate('/consultation')}
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Shield className="h-5 w-5 mr-2" />
                Meet Our Founders
              </Button>
              
              <Button
                onClick={() => navigate('/find-property')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2"
              >
                <Eye className="h-5 w-5 mr-2" />
                See Our Approach
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Journey Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🌱 From Landscapers to Problem-Solvers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We began in the most grounded way possible — quite literally. For 3+ years, we worked hands-on in villa landscaping and post-handover maintenance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full bg-red-50 border-red-200">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="h-8 w-8 text-red-600 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What We Witnessed</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>Water pooling in ₹4 Cr homes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>Poor quality RCC in "premium" villas</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>OC delays despite "100% compliance" claims</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>Builder silence once full payment was done</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full bg-blue-50 border-blue-200">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <Shield className="h-8 w-8 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Our Realization</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This wasn't just poor service. It was a systematic gap in buyer protection and guidance.
                      </p>
                      <p className="text-lg font-semibold text-blue-600">
                        That's when we stepped in.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🛠️ So We Built the Bridge We Wish We Had
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              We combined our on-ground experience with deep research into legal, civil, MEP, and infrastructure risks. 
              From that, we launched a new kind of real estate service — not one that just lists properties, but one that questions, verifies, and protects.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: "Legal Standing",
                description: "RERA, EC, Khata, encumbrance verification",
                color: "text-green-600 bg-green-100"
              },
              {
                icon: Building,
                title: "Civil & MEP Quality", 
                description: "Drainage, design defects, slope failures analysis",
                color: "text-blue-600 bg-blue-100"
              },
              {
                icon: Home,
                title: "Infrastructure Readiness",
                description: "Water source, UDS, zoning risks assessment",
                color: "text-purple-600 bg-purple-100"
              },
              {
                icon: TrendingUp,
                title: "Builder Track Record",
                description: "Financial stability — not just marketing gloss",
                color: "text-orange-600 bg-orange-100"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full text-center p-6 border-0 shadow-lg">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Not Agents, Advisors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              💡 Not Agents. Advisors.
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We're not here to convince you to buy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">We're here to show you:</h3>
              <div className="space-y-4">
                {[
                  "✅ What the builder won't tell you",
                  "✅ What the brochure hides",
                  "✅ What most buyers regret finding out too late"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-lg text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <p className="text-lg text-gray-700 mb-6">
                  You won't see "hot deals" or sales pressure here.
                </p>
                <h4 className="text-xl font-bold text-gray-900 mb-4">What you'll see is:</h4>
                <ul className="space-y-3">
                  {[
                    "Civil/MEP audit reports",
                    "Legal clarity checklists", 
                    "Custom 'buyer-fit' reports",
                    "Property walkthroughs with zero bias"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white border-0 shadow-xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  💬 Why This Matters
                </h2>
                <p className="text-xl text-gray-600">
                  In an unregulated ocean of agents and portals, buyers need a compass — not just a map.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Heart,
                    title: "Young Couples",
                    description: "Buying your first villa with confidence"
                  },
                  {
                    icon: Users,
                    title: "NRI Investors", 
                    description: "Planning a safe retirement home investment"
                  },
                  {
                    icon: Target,
                    title: "Cautious Investors",
                    description: "Wondering if the ROI is actually real"
                  }
                ].map((buyer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <buyer.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{buyer.title}</h3>
                    <p className="text-gray-600">{buyer.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-xl font-semibold text-primary mb-6">
                  We exist for you. To make homebuying clear, grounded, and safe.
                </p>
                <Button
                  onClick={() => navigate('/first-time-buyer')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg text-white px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Start Your Protected Home Search
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🚀 The Impact So Far
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                number: "₹100+ Cr",
                title: "Worth of Real Estate Decisions",
                description: "Helped families make informed property investments"
              },
              {
                icon: Shield,
                number: "20+",
                title: "Unsafe Projects Flagged",
                description: "Identified legally risky or structurally unsafe projects"
              },
              {
                icon: Users,
                number: "Growing",
                title: "Community of Trust",
                description: "Buyers who refer us because we tell the truth, not because we sell"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center p-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{stat.title}</h3>
                  <p className="text-gray-600">{stat.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Buyer-First Property Advisory?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of families who chose truth over sales pitches
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/consultation')}
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Phone className="h-5 w-5 mr-2" />
                Schedule a Call
              </Button>
              
              <Button
                onClick={() => navigate('/find-property')}
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-primary"
              >
                <Search className="h-5 w-5 mr-2" />
                Start Property Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}