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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{report.reportTitle}</h1>
                  <p className="text-gray-500 text-sm">Comprehensive Civil + MEP Technical Assessment</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border-0 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                    Certified
                  </Badge>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{report.engineerName}</div>
                <div className="text-sm text-gray-500">License: {report.engineerLicense}</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border-0 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    Recent
                  </Badge>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{new Date(report.inspectionDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-500">Report: {new Date(report.reportDate).toLocaleDateString()}</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border-0 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                    Score
                  </Badge>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">{report.overallScore}/10</div>
                <div className="text-sm text-gray-500">Overall Rating</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border-0 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {report.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">Ready</div>
                <div className="text-sm text-gray-500">Report Status</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium">
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
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100">
                      <IconComponent className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">{section.title}</span>
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
            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
                </div>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {report.executiveSummary}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Investment Recommendation</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Overall Score</span>
                    <span className="text-2xl font-bold text-gray-900">{report.overallScore}/10</span>
                  </div>
                  <Progress value={report.overallScore * 10} className="h-2" />
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {report.investmentRecommendation}
                </div>
              </div>
            </div>
          </div>

          {/* Site Information */}
          {report.siteInformation && (
            <div id="site-information" className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">1. Site Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Project Name</div>
                    <div className="text-lg font-semibold text-gray-900">{report.siteInformation.project_name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Location</div>
                    <div className="text-lg font-semibold text-gray-900">{report.siteInformation.location}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Plot Area</div>
                    <div className="text-lg font-semibold text-gray-900">{report.siteInformation.plot_area}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Built-up Area</div>
                    <div className="text-lg font-semibold text-gray-900">{report.siteInformation.built_up_area}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Foundation & Superstructure */}
          <div id="foundation-details" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Construction className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">2. Foundation Details</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Foundation Type</div>
                  <div className="font-semibold text-gray-900">{report.foundationDetails?.type || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Depth & Grade Beam</div>
                  <div className="font-semibold text-gray-900">{report.foundationDetails?.depth || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Soil Bearing Capacity</div>
                  <div className="font-semibold text-gray-900">{report.foundationDetails?.soil_bearing_capacity || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {report.foundationDetails?.status || 'Good'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">3. Superstructure Details</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Structural System</div>
                  <div className="font-semibold text-gray-900">{report.superstructureDetails?.structural_system || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Concrete Grade</div>
                  <div className="font-semibold text-gray-900">{report.superstructureDetails?.concrete_grade || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Steel Grade</div>
                  <div className="font-semibold text-gray-900">{report.superstructureDetails?.steel_grade || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {report.superstructureDetails?.status || 'Excellent'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* MEP Systems */}
          <div id="electrical-systems" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Electrical Systems</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Load Capacity</div>
                  <div className="font-semibold text-gray-900">{report.electricalSystems?.load_capacity || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Backup Power</div>
                  <div className="font-semibold text-gray-900">{report.electricalSystems?.backup_power || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Safety Compliance</div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {report.electricalSystems?.safety || 'Excellent'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Plumbing Systems</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Water Supply</div>
                  <div className="font-semibold text-gray-900">{report.plumbingSystems?.water_supply || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Water Pressure</div>
                  <div className="font-semibold text-gray-900">{report.plumbingSystems?.pressure || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Drainage System</div>
                  <div className="font-semibold text-gray-900">{report.plumbingSystems?.drainage || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Flame className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Fire Safety</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Sprinkler System</div>
                  <div className="font-semibold text-gray-900">{report.fireSafetySystems?.sprinkler_system || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Fire Extinguishers</div>
                  <div className="font-semibold text-gray-900">{report.fireSafetySystems?.fire_extinguishers || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Fire NOC</div>
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {report.fireSafetySystems?.fire_NOC || 'Obtained'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations & Conclusions */}
          <div id="recommendations" className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border-0 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recommendations & Conclusions</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Recommendations</h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {report.recommendations}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Final Conclusions</h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {report.conclusions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
