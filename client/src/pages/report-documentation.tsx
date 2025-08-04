import { useState } from "react";
import { Link } from "wouter";
import {
  FileText,
  ArrowLeft,
  Building,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Eye,
  BarChart3,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportDocumentation() {
  const [activeSection, setActiveSection] = useState("overview");

  const reportSections = [
    {
      id: "overview",
      title: "Report Overview",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Understanding Your Reports</h3>
            <p className="text-gray-700 leading-relaxed">
              OwnItRight provides two main types of reports: Civil & MEP Engineering Reports and Property Valuation Reports. 
              Each report is designed to give you comprehensive insights into different aspects of your property investment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Building className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-green-800">Civil & MEP Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Structural integrity assessment</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Electrical systems evaluation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Plumbing and water systems</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />HVAC systems analysis</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Fire safety compliance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-purple-800">Valuation Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Market value assessment</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Comparative market analysis</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Investment potential evaluation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Risk assessment</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Growth projections</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "reading",
      title: "Reading Your Reports",
      icon: Eye,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Report Structure</h4>
            </div>
            <p className="text-yellow-700 text-sm">
              All reports follow a consistent structure to help you find information quickly and understand key findings.
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Header Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Project/Property Name</p>
                      <p className="text-sm text-gray-600">Primary identifier for the property</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Report Date</p>
                      <p className="text-sm text-gray-600">When the assessment was conducted</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 mb-2">Completed</Badge>
                    <p className="text-sm text-gray-600">Report is finalized</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">In Progress</Badge>
                    <p className="text-sm text-gray-600">Assessment ongoing</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-yellow-100 text-yellow-800 mb-2">Pending</Badge>
                    <p className="text-sm text-gray-600">Awaiting information</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-gray-100 text-gray-800 mb-2">Draft</Badge>
                    <p className="text-sm text-gray-600">Preliminary findings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "metrics",
      title: "Understanding Metrics",
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <Tabs defaultValue="civil" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="civil">Civil & MEP Metrics</TabsTrigger>
              <TabsTrigger value="valuation">Valuation Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="civil" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Overall Score</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-900">8.5/10</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Composite score based on all assessment criteria. Higher scores indicate better condition.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Compliance Status</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Indicates whether the property meets current building codes and safety standards.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Priority Issues</span>
                      </div>
                      <span className="text-lg font-semibold text-orange-900">2 Medium</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Issues requiring attention, categorized by urgency: High, Medium, Low.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">System Ratings</span>
                      </div>
                      <span className="text-lg font-semibold text-purple-900">Good</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Individual ratings for structural, electrical, plumbing, and HVAC systems.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="valuation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        <span className="font-medium">Market Value</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-900">₹2.5Cr</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Current estimated market value based on comparable sales and property condition.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Growth Potential</span>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">High</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Expected appreciation potential based on location, infrastructure, and market trends.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Investment Grade</span>
                      </div>
                      <span className="text-lg font-semibold text-blue-900">A+</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Overall investment recommendation grade from A+ (excellent) to D (poor).
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Risk Level</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Investment risk assessment considering market volatility, legal issues, and location factors.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )
    },
    {
      id: "actions",
      title: "Taking Action",
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Next Steps After Receiving Your Report</h3>
            <p className="text-green-700 leading-relaxed">
              Your report is designed to be actionable. Here's how to use the findings to make informed decisions about your property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-800">For Civil & MEP Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-red-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Address High Priority Issues</p>
                      <p className="text-sm text-gray-600">Start with safety-critical items that require immediate attention.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-yellow-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Plan Medium Priority Repairs</p>
                      <p className="text-sm text-gray-600">Schedule these within 3-6 months to prevent deterioration.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Monitor Low Priority Items</p>
                      <p className="text-sm text-gray-600">Keep an eye on these during regular maintenance.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">For Valuation Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Review Investment Recommendations</p>
                      <p className="text-sm text-gray-600">Consider the grade and risk assessment for your decision.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Compare Market Analysis</p>
                      <p className="text-sm text-gray-600">Use comparable sales data to validate the valuation.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Plan Your Investment Strategy</p>
                      <p className="text-sm text-gray-600">Factor in growth potential and risk tolerance.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Need Help Interpreting Your Report?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                We provide 30 days of free consultation after report delivery. Our experts can help you understand findings and plan next steps.
              </p>
              <div className="flex space-x-3">
                <Button asChild>
                  <Link href="/contact">Schedule Consultation</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/faq">View FAQ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const currentSection = reportSections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-account">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Account
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold">Report Documentation</h1>
              </div>
            </div>
            <Button asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Documentation Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {reportSections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {currentSection && <currentSection.icon className="h-6 w-6 text-blue-600" />}
                  <CardTitle className="text-xl">{currentSection?.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {currentSection?.content}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}