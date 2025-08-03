import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { CivilMepReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  User, 
  Calendar, 
  Award, 
  Shield, 
  Zap, 
  Droplets, 
  Flame, 
  Leaf, 
  FileText,
  CheckCircle,
  AlertTriangle,
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
  X
} from "lucide-react";
import { useState } from "react";

export function CivilMepReportView() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: report, isLoading } = useQuery<CivilMepReport>({
    queryKey: [`/api/civil-mep-reports/${id}`],
    enabled: !!id,
  });

  const sections = [
    { id: 'executive-summary', title: 'Executive Summary', icon: Eye },
    { id: 'site-information', title: '1. Site Information', icon: MapPin },
    { id: 'foundation-details', title: '2. Foundation Details', icon: Construction },
    { id: 'superstructure-details', title: '3. Superstructure Details', icon: Building2 },
    { id: 'walls-finishes', title: '4. Walls & Finishes', icon: Home },
    { id: 'roofing-details', title: '5. Roofing Details', icon: Home },
    { id: 'doors-windows', title: '6. Doors & Windows', icon: Home },
    { id: 'flooring-details', title: '7. Flooring Details', icon: Home },
    { id: 'staircases-elevators', title: '8. Staircases & Elevators', icon: Building2 },
    { id: 'external-works', title: '9. External Works', icon: Leaf },
    { id: 'mechanical-systems', title: '10. Mechanical Systems', icon: Wrench },
    { id: 'electrical-systems', title: '11. Electrical Systems', icon: Zap },
    { id: 'plumbing-systems', title: '12. Plumbing Systems', icon: Droplets },
    { id: 'fire-safety-systems', title: '13. Fire Safety Systems', icon: Flame },
    { id: 'bms-automation', title: '14. BMS Automation', icon: Zap },
    { id: 'green-sustainability', title: '15. Green Sustainability', icon: Leaf },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600">The requested Civil MEP report could not be found.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs improvement': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{report.reportTitle}</h1>
                  <p className="text-blue-100 text-lg">Comprehensive Civil + MEP Technical Assessment</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-blue-200" />
                  <span className="text-sm text-blue-200 font-medium">Lead Engineer</span>
                </div>
                <p className="font-semibold text-lg text-white">{report.engineerName}</p>
                <p className="text-sm text-blue-200">License: {report.engineerLicense}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-200" />
                  <span className="text-sm text-blue-200 font-medium">Inspection Date</span>
                </div>
                <p className="font-semibold text-lg text-white">{new Date(report.inspectionDate).toLocaleDateString()}</p>
                <p className="text-sm text-blue-200">Report: {new Date(report.reportDate).toLocaleDateString()}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-5 w-5 text-blue-200" />
                  <span className="text-sm text-blue-200 font-medium">Overall Score</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-white">{report.overallScore}</span>
                  <span className="text-lg text-blue-200">/10</span>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-200" />
                  <span className="text-sm text-blue-200 font-medium">Status</span>
                </div>
                <Badge className={`${getStatusColor(report.status)} border text-sm font-medium`}>
                  {report.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Table of Contents */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg md:shadow-none transition-transform duration-300 ease-in-out md:w-64 lg:w-72`}>
          <div className="h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6 md:justify-start">
              <h2 className="text-lg font-semibold text-gray-900">Table of Contents</h2>
              <Button 
                onClick={() => setSidebarOpen(false)}
                variant="ghost" 
                size="sm"
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <IconComponent className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm text-gray-700 group-hover:text-blue-600">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 px-6 py-8 space-y-8">
          {/* Executive Summary */}
          <div id="executive-summary" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">Executive Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.executiveSummary}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">Investment Recommendation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Overall Assessment</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Score</span>
                      <span className="text-2xl font-bold text-gray-900">{report.overallScore}/10</span>
                    </div>
                    <Progress value={report.overallScore * 10} className="h-2" />
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.investmentRecommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Site Information */}
          {report.siteInformation && (
            <div id="site-information" className="grid grid-cols-1 gap-6">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-orange-600 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">1. Site Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Project Name</p>
                      <p className="font-semibold">{report.siteInformation.projectName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="font-semibold">{report.siteInformation.location}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Plot Area</p>
                      <p className="font-semibold">{report.siteInformation.plotArea}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Zoning</p>
                      <p className="font-semibold">{report.siteInformation.zoningClassification}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Foundation & Superstructure */}
          <div id="foundation-details" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <Construction className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">2. Foundation Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Foundation Type</p>
                    <p className="text-sm">{report.foundationDetails?.type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Depth & Footing</p>
                    <p className="text-sm">{report.foundationDetails?.depthAndFooting || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Soil Bearing Capacity</p>
                    <p className="text-sm">{report.foundationDetails?.soilBearingCapacity || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Anti-Termite Treatment</p>
                    <p className="text-sm">{report.foundationDetails?.antiTermiteTreatment || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Waterproofing Method</p>
                    <p className="text-sm">{report.foundationDetails?.waterproofingMethod || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="superstructure-details">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">3. Superstructure Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Structural System</p>
                      <p className="text-sm">{report.superstructureDetails?.structuralSystem || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Column Beam Slab</p>
                      <p className="text-sm">{report.superstructureDetails?.columnBeamSlab || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Floor to Floor Height</p>
                      <p className="text-sm">{report.superstructureDetails?.floorToFloorHeight || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Load Calculations</p>
                      <p className="text-sm">{report.superstructureDetails?.loadCalculations || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Seismic Design Code</p>
                      <p className="text-sm">{report.superstructureDetails?.seismicDesignCode || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Concrete Grade & Reinforcement</p>
                      <p className="text-sm">{report.superstructureDetails?.concreteGradeReinforcement || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Walls & Roofing */}
          <div id="walls-finishes" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">4. Walls & Finishes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wall Type</p>
                    <p className="text-sm">{report.wallsFinishes?.type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Plastering Type</p>
                    <p className="text-sm">{report.wallsFinishes?.plasteringType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wall Insulation</p>
                    <p className="text-sm">{report.wallsFinishes?.wallInsulation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interior/Exterior Finishes</p>
                    <p className="text-sm">{report.wallsFinishes?.interiorExteriorFinishes || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paint Specifications</p>
                    <p className="text-sm">{report.wallsFinishes?.paintSpecs || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="roofing-details">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">5. Roofing Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Roof Type</p>
                      <p className="text-sm">{report.roofingDetails?.type || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Roof Treatment</p>
                      <p className="text-sm">{report.roofingDetails?.roofTreatment || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Drainage Provisions</p>
                      <p className="text-sm">{report.roofingDetails?.drainageProvisions || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Parapet & Handrail</p>
                      <p className="text-sm">{report.roofingDetails?.parapetHandrail || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Thermal Coating</p>
                      <p className="text-sm">{report.roofingDetails?.thermalCoating || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Doors & Windows */}
          <div id="doors-windows" className="grid grid-cols-1 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">6. Doors & Windows</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {report.doorsWindows?.entries && report.doorsWindows.entries.length > 0 ? (
                  <div className="space-y-4">
                    {report.doorsWindows.entries.map((entry, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="text-sm">{entry.type || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Size</p>
                            <p className="text-sm">{entry.size || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Material</p>
                            <p className="text-sm">{entry.material || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No door/window entries available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Flooring & Staircases */}
          <div id="flooring-details" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">7. Flooring Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Finish Type</p>
                    <p className="text-sm">{report.flooringDetails?.finishType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Skirting Height</p>
                    <p className="text-sm">{report.flooringDetails?.skirtingHeight || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expansion Joints</p>
                    <p className="text-sm">{report.flooringDetails?.expansionJoints || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Slope & Drainage</p>
                    <p className="text-sm">{report.flooringDetails?.slopeDrainage || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="staircases-elevators">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-orange-600 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">8. Staircases & Elevators</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tread Riser Dimensions</p>
                      <p className="text-sm">{report.staircasesElevators?.treadRiserDimensions || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Handrail Details</p>
                      <p className="text-sm">{report.staircasesElevators?.handrailDetails || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fire Exit Compliance</p>
                      <p className="text-sm">{report.staircasesElevators?.fireExitCompliance || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Accessibility Compliance</p>
                      <p className="text-sm">{report.staircasesElevators?.accessibilityCompliance || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* External Works */}
          <div id="external-works" className="grid grid-cols-1 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">9. External Works</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compound Wall & Gates</p>
                    <p className="text-sm">{report.externalWorks?.compoundWallGates || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Landscaping</p>
                    <p className="text-sm">{report.externalWorks?.landscaping || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">External Paving</p>
                    <p className="text-sm">{report.externalWorks?.externalPaving || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rainwater Harvesting</p>
                    <p className="text-sm">{report.externalWorks?.rainwaterHarvesting || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mechanical & Electrical */}
          <div id="mechanical-systems" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">10. Mechanical Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">HVAC System</p>
                    <p className="text-sm">{report.mechanicalSystems?.hvacSystem || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ventilation Design</p>
                    <p className="text-sm">{report.mechanicalSystems?.ventilationDesign || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duct Layout</p>
                    <p className="text-sm">{report.mechanicalSystems?.ductLayout || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Equipment Specifications</p>
                    <p className="text-sm">{report.mechanicalSystems?.equipmentSpecs || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="electrical-systems">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-yellow-600 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">11. Electrical Systems</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Power Distribution</p>
                      <p className="text-sm">{report.electricalSystems?.powerDistribution || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Lighting Design</p>
                      <p className="text-sm">{report.electricalSystems?.lightingDesign || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Earthing & Protection</p>
                      <p className="text-sm">{report.electricalSystems?.earthingProtection || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Emergency Backup</p>
                      <p className="text-sm">{report.electricalSystems?.emergencyBackup || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Plumbing */}
          <div id="plumbing-systems" className="grid grid-cols-1 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">12. Plumbing Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Water Supply</p>
                    <p className="text-sm">
                      {typeof report.plumbingSystems?.waterSupply === 'object' 
                        ? `${report.plumbingSystems.waterSupply?.source || ''} ${report.plumbingSystems.waterSupply?.storage || ''} ${report.plumbingSystems.waterSupply?.distribution || ''}`.trim() || 'Not specified'
                        : report.plumbingSystems?.waterSupply || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Drainage System</p>
                    <p className="text-sm">{report.plumbingSystems?.drainageSystem || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sanitary Fittings</p>
                    <p className="text-sm">{report.plumbingSystems?.sanitaryFittings || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hot Water System</p>
                    <p className="text-sm">{report.plumbingSystems?.hotWaterSystem || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fire Safety & BMS */}
          <div id="fire-safety-systems" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">13. Fire Safety Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hydrant System Layout</p>
                    <p className="text-sm">{report.fireSafetySystems?.hydrantSystemLayout || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sprinkler System</p>
                    <p className="text-sm">{report.fireSafetySystems?.sprinklerSystem || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Smoke Detector Layout</p>
                    <p className="text-sm">{report.fireSafetySystems?.smokeDetectorLayout || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fire Alarm & PA</p>
                    <p className="text-sm">{report.fireSafetySystems?.fireAlarmPA || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Exit Signage</p>
                    <p className="text-sm">{report.fireSafetySystems?.exitSignage || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fire NOC</p>
                    <p className="text-sm">{report.fireSafetySystems?.fireNOC || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="bms-automation">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">14. BMS Automation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Home Automation</p>
                      <p className="text-sm">{report.bmsAutomation?.homeAutomation || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">CCTV Layout</p>
                      <p className="text-sm">{report.bmsAutomation?.cctvLayout || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Access Control</p>
                      <p className="text-sm">{report.bmsAutomation?.accessControl || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">IoT Integration</p>
                      <p className="text-sm">{report.bmsAutomation?.iotIntegration || 'Not specified'}</p>
                    </div>
                  </div>
                  {report.bmsAutomation?.sensors && report.bmsAutomation.sensors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Sensors</p>
                      <div className="space-y-1">
                        {report.bmsAutomation.sensors.map((sensor, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {sensor.type} - {sensor.location}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Green Sustainability */}
          <div id="green-sustainability" className="grid grid-cols-1 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">15. Green Sustainability</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Waste Segregation</p>
                    <p className="text-sm">{report.greenSustainability?.wasteSegregation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Water Recycling</p>
                    <p className="text-sm">{report.greenSustainability?.waterRecycling || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Daylighting Studies</p>
                    <p className="text-sm">{report.greenSustainability?.daylightingStudies || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Passive Cooling</p>
                    <p className="text-sm">{report.greenSustainability?.passiveCooling || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certification Status</p>
                    <p className="text-sm">{report.greenSustainability?.certificationStatus || 'Not specified'}</p>
                  </div>
                </div>
                {report.greenSustainability?.solarPanels && report.greenSustainability.solarPanels.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Solar Panels</p>
                    <div className="space-y-1">
                      {report.greenSustainability.solarPanels.map((panel, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {panel.capacity} - {panel.brand}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conclusions */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-gray-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800 font-semibold">Conclusions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.conclusions}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">OwnItRight</span>
                </div>
                <p className="text-gray-600">Professional Civil + MEP Engineering Assessment Services</p>
                <p className="text-sm text-gray-500">
                  This report is prepared by licensed professional engineers and is intended for property evaluation purposes.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <span>Report ID: {report.id}</span>
                  <span>•</span>
                  <span>Generated: {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Version: 1.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}