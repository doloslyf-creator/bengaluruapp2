import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  LogOut,
  User,
  Settings,
  Search,
  Calendar,
  FileText
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                OwnItRight
              </div>
              <Badge variant="secondary" className="text-xs">
                Curated Property Advisors
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.firstName || user.email}
                  </span>
                </div>
              )}
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Continue your property discovery journey with our expert guidance.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Search className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-lg">Search Properties</CardTitle>
                <CardDescription>
                  Find your perfect property in Bengaluru
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <CardTitle className="text-lg">Book Site Visit</CardTitle>
                <CardDescription>
                  Schedule a visit to your shortlisted properties
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-lg">Get Valuation</CardTitle>
                <CardDescription>
                  Professional property valuation reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <CardTitle className="text-lg">Consultation</CardTitle>
                <CardDescription>
                  Expert advice for your property decisions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <CardTitle>RERA Compliance</CardTitle>
                <CardDescription>
                  Complete legal due diligence for every property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Title verification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Approvals tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Compliance reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <CardTitle>Location Intelligence</CardTitle>
                <CardDescription>
                  Deep insights into Bengaluru's neighborhoods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Zone-based analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Connectivity scores
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Future development plans
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <CardTitle>Professional Valuation</CardTitle>
                <CardDescription>
                  Expert property valuation with market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Market comparison
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Investment analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Risk assessment
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help? We're Here for You
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our property experts are available to guide you through your property journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Call +91 9560366601
            </Button>
            <Button variant="outline">
              Email contact@ownitright.com
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}