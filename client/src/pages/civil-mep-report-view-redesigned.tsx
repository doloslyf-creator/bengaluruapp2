import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { CivilMepReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  User, 
  Calendar, 
  Award, 
  Zap, 
  Droplets, 
  Flame, 
  Leaf, 
  CheckCircle,
  Star,
  Download,
  Printer,
  Share2,
  MapPin,
  Construction,
  Home,
  Wrench,
  Eye,
  Target,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export function CivilMepReportViewRedesigned() {
  const { id } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { data: report, isLoading } = useQuery<CivilMepReport>({
    queryKey: [`/api/civil-mep-reports/${id}`],
    enabled: !!id,
  });

  // Navigation sections with enhanced structure
  const sections = [
    { 
      id: 'overview', 
      title: 'Overview', 
      icon: Eye, 
      color: 'blue',
      description: 'Executive summary and key metrics'
    },
    { 
      id: 'civil', 
      title: 'Civil Engineering', 
      icon: Construction, 
      color: 'orange',
      description: 'Structural and foundation analysis',
      subsections: [
        { id: 'site-info', title: 'Site Information' },
        { id: 'foundation', title: 'Foundation' },
        { id: 'superstructure', title: 'Superstructure' },
        { id: 'walls-finishes', title: 'Walls & Finishes' },
        { id: 'roofing', title: 'Roofing' },
        { id: 'doors-windows', title: 'Doors & Windows' },
        { id: 'flooring', title: 'Flooring' },
        { id: 'staircases', title: 'Staircases' },
        { id: 'external', title: 'External Works' }
      ]
    },
    { 
      id: 'mep', 
      title: 'MEP Systems', 
      icon: Zap, 
      color: 'purple',
      description: 'Mechanical, electrical & plumbing',
      subsections: [
        { id: 'mechanical', title: 'Mechanical Systems' },
        { id: 'electrical', title: 'Electrical Systems' },
        { id: 'plumbing', title: 'Plumbing Systems' },
        { id: 'fire-safety', title: 'Fire Safety' },
        { id: 'bms', title: 'BMS & Automation' }
      ]
    },
    { 
      id: 'sustainability', 
      title: 'Sustainability', 
      icon: Leaf, 
      color: 'green',
      description: 'Green features and compliance'
    },
    { 
      id: 'assessment', 
      title: 'Final Assessment', 
      icon: Target, 
      color: 'red',
      description: 'Conclusions and recommendations'
    }
  ];

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string | undefined, score?: number) => {
    if (!status && !score) return { className: 'bg-gray-100 text-gray-700', text: 'N/A' };
    
    if (score !== undefined) {
      if (score >= 8) return { className: 'bg-green-100 text-green-700', text: 'Excellent' };
      if (score >= 6) return { className: 'bg-blue-100 text-blue-700', text: 'Good' };
      if (score >= 4) return { className: 'bg-yellow-100 text-yellow-700', text: 'Fair' };
      return { className: 'bg-red-100 text-red-700', text: 'Poor' };
    }
    
    switch (status?.toLowerCase()) {
      case 'excellent': return { className: 'bg-green-100 text-green-700', text: 'Excellent' };
      case 'good': return { className: 'bg-blue-100 text-blue-700', text: 'Good' };
      case 'fair': case 'satisfactory': return { className: 'bg-yellow-100 text-yellow-700', text: 'Fair' };
      case 'poor': return { className: 'bg-red-100 text-red-700', text: 'Poor' };
      default: return { className: 'bg-gray-100 text-gray-700', text: status || 'N/A' };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Report</h3>
          <p className="text-gray-600">Fetching civil engineering analysis...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-6">The requested Civil+MEP report could not be found.</p>
          <Button asChild>
            <Link href="/admin-panel/civil-mep-reports">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin-panel/civil-mep-reports">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">{report.reportTitle}</h1>
                  <p className="text-sm text-gray-500">Civil + MEP Technical Assessment</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium">
                Score: {report.overallScore}/10
              </Badge>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Enhanced Sidebar Navigation */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 flex-shrink-0`}>
          <div className="sticky top-24 space-y-4">
            {/* Collapse Toggle */}
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>

            {/* Report Stats Card */}
            {!sidebarCollapsed && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">Overall Rating</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{report.overallScore}/10</div>
                      <Progress value={(report.overallScore || 0) * 10} className="h-2 mb-2" />
                      <Badge className={getStatusBadge('', report.overallScore).className}>
                        {getStatusBadge('', report.overallScore).text}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <User className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <div className="font-medium text-gray-900">{report.engineerName}</div>
                        <div className="text-xs text-gray-500">Engineer</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <div className="font-medium text-gray-900">{new Date(report.inspectionDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">Inspection</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Menu */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    const isActive = activeSection === section.id;
                    
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-all group
                            ${isActive 
                              ? `bg-${section.color}-50 border-r-4 border-${section.color}-500 text-${section.color}-700` 
                              : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                              ${isActive 
                                ? `bg-${section.color}-100` 
                                : 'bg-gray-100 group-hover:bg-gray-200'
                              }`}>
                              <IconComponent className={`h-4 w-4 ${isActive ? `text-${section.color}-600` : 'text-gray-500'}`} />
                            </div>
                            {!sidebarCollapsed && (
                              <div>
                                <div className="font-medium text-sm">{section.title}</div>
                                <div className="text-xs text-gray-500">{section.description}</div>
                              </div>
                            )}
                          </div>
                          {!sidebarCollapsed && section.subsections && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        
                        {/* Subsections */}
                        {!sidebarCollapsed && section.subsections && isActive && (
                          <div className="bg-gray-50 border-t">
                            {section.subsections.map((subsection) => (
                              <button
                                key={subsection.id}
                                onClick={() => scrollToSection(subsection.id)}
                                className="w-full flex items-center space-x-3 p-3 pl-12 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                              >
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span>{subsection.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Overview Section */}
          <section id="overview" className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Executive Overview</h2>
                <p className="text-gray-600">Comprehensive assessment summary and key findings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Executive Summary */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {report.executiveSummary || "No executive summary provided."}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Recommendation */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Investment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Overall Score</span>
                      <span className="text-2xl font-bold text-gray-900">{report.overallScore}/10</span>
                    </div>
                    <Progress value={(report.overallScore || 0) * 10} className="h-3 mb-3" />
                    <Badge className={getStatusBadge('', report.overallScore).className}>
                      {getStatusBadge('', report.overallScore).text} Investment
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {report.investmentRecommendation || "No investment recommendation provided."}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{new Date(report.inspectionDate).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600">Inspection Date</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{report.status}</div>
                  <div className="text-sm text-gray-600">Report Status</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">{report.engineerName}</div>
                  <div className="text-sm text-gray-600">Lead Engineer</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{report.engineerLicense}</div>
                  <div className="text-sm text-gray-600">License #</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Civil Engineering Section */}
          <section id="civil" className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Construction className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Civil Engineering Analysis</h2>
                <p className="text-gray-600">Structural integrity and construction quality assessment</p>
              </div>
            </div>

            {/* Site Information */}
            {report.siteInformation && (
              <Card id="site-info">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(report.siteInformation).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-base font-semibold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Foundation & Superstructure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Foundation Details */}
              {report.foundationDetails && (
                <Card id="foundation">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Construction className="h-5 w-5 text-orange-600" />
                      Foundation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(report.foundationDetails).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Superstructure Details */}
              {report.superstructureDetails && (
                <Card id="superstructure">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      Superstructure Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(report.superstructureDetails).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Civil Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Walls & Finishes */}
              {report.wallsFinishes && (
                <Card id="walls-finishes">
                  <CardHeader>
                    <CardTitle className="text-lg">Walls & Finishes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(report.wallsFinishes).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Roofing */}
              {report.roofingDetails && (
                <Card id="roofing">
                  <CardHeader>
                    <CardTitle className="text-lg">Roofing Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(report.roofingDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Doors & Windows */}
              {report.doorsWindows && (
                <Card id="doors-windows">
                  <CardHeader>
                    <CardTitle className="text-lg">Doors & Windows</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(report.doorsWindows).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* MEP Systems Section */}
          <section id="mep" className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">MEP Systems Analysis</h2>
                <p className="text-gray-600">Mechanical, electrical, and plumbing system evaluation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mechanical Systems */}
              {report.mechanicalSystems && (
                <Card id="mechanical">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      Mechanical Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(report.mechanicalSystems).map(([key, value]) => (
                      <div key={key} className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-900">{value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Electrical Systems */}
              {report.electricalSystems && (
                <Card id="electrical">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Electrical Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(report.electricalSystems).map(([key, value]) => (
                      <div key={key} className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-yellow-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-900">{value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Plumbing Systems */}
              {report.plumbingSystems && (
                <Card id="plumbing">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-cyan-600" />
                      Plumbing Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(report.plumbingSystems).map(([key, value]) => (
                      <div key={key} className="bg-cyan-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-cyan-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-900">{value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Fire Safety */}
              {report.fireSafetySystems && (
                <Card id="fire-safety">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-600" />
                      Fire Safety Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(report.fireSafetySystems).map(([key, value]) => (
                      <div key={key} className="bg-red-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-red-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-900">{value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Sustainability Section */}
          <section id="sustainability" className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sustainability & Green Features</h2>
                <p className="text-gray-600">Environmental compliance and sustainability assessment</p>
              </div>
            </div>

            {report.greenSustainability && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Green & Sustainability Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(report.greenSustainability).map(([key, value]) => (
                      <div key={key} className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-700 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Final Assessment Section */}
          <section id="assessment" className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Final Assessment</h2>
                <p className="text-gray-600">Professional conclusions and recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {report.recommendations || "No specific recommendations provided."}
                  </div>
                </CardContent>
              </Card>

              {/* Conclusions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Final Conclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {report.conclusions || "No final conclusions provided."}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investment Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center">
                  <Target className="h-6 w-6 text-blue-600" />
                  Investment Recommendation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-gray-900">{report.overallScore}/10</div>
                  <Progress value={(report.overallScore || 0) * 10} className="h-4 max-w-md mx-auto" />
                  <Badge className={`${getStatusBadge('', report.overallScore).className} text-lg px-6 py-2`}>
                    {getStatusBadge('', report.overallScore).text} Investment Opportunity
                  </Badge>
                  <p className="text-gray-700 max-w-2xl mx-auto">
                    {report.investmentRecommendation || "Investment analysis and recommendation details not available."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}