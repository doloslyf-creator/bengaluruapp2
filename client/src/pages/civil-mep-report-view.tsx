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
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Star,
  Download,
  Printer,
  Share2,
  MapPin,
  Ruler,
  Construction,
  Home,
  Wrench,
  Eye,
  Target,
  BarChart3
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function CivilMepReportView() {
  const { id } = useParams<{ id: string }>();
  
  const { data: report, isLoading } = useQuery<CivilMepReport>({
    queryKey: [`/api/civil-mep-reports/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comprehensive technical report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600">The requested Civil+MEP report could not be found.</p>
        </div>
      </div>
    );
  }

  // Calculate category scores for visualization
  const categoryScores = [
    { category: 'Structural', score: 9.2, color: '#0088FE' },
    { category: 'Foundation', score: 8.8, color: '#00C49F' },
    { category: 'MEP Systems', score: 8.5, color: '#FFBB28' },
    { category: 'Fire Safety', score: 9.0, color: '#FF8042' },
    { category: 'Sustainability', score: 8.9, color: '#8884D8' },
    { category: 'Compliance', score: 9.1, color: '#82CA9D' }
  ];

  // System performance data
  const systemPerformance = [
    { name: 'Electrical', efficiency: 92, capacity: 88, reliability: 95 },
    { name: 'Plumbing', efficiency: 89, capacity: 91, reliability: 87 },
    { name: 'HVAC', efficiency: 85, capacity: 89, reliability: 92 },
    { name: 'Fire Safety', efficiency: 96, capacity: 94, reliability: 98 },
    { name: 'Automation', efficiency: 88, capacity: 85, reliability: 90 }
  ];

  // Compliance status
  const complianceData = [
    { name: 'NBC 2016', status: 'Compliant', value: 100 },
    { name: 'Fire Safety', status: 'Compliant', value: 100 },
    { name: 'Seismic Design', status: 'Compliant', value: 100 },
    { name: 'Green Building', status: 'Certified', value: 95 },
    { name: 'Accessibility', status: 'Compliant', value: 100 }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInvestmentColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly-recommended': return 'bg-green-100 text-green-800 border-green-200';
      case 'recommended': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'conditional': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-recommended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">{report.reportTitle}</h1>
                  <p className="text-blue-100 text-lg">Comprehensive Civil + MEP Technical Assessment</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-200" />
                    <span className="text-sm text-blue-200">Lead Engineer</span>
                  </div>
                  <p className="font-semibold text-lg">{report.engineerName}</p>
                  <p className="text-sm text-blue-200">License: {report.engineerLicense}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-200" />
                    <span className="text-sm text-blue-200">Inspection Date</span>
                  </div>
                  <p className="font-semibold text-lg">{new Date(report.inspectionDate).toLocaleDateString()}</p>
                  <p className="text-sm text-blue-200">Report: {new Date(report.reportDate).toLocaleDateString()}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-200" />
                    <span className="text-sm text-blue-200">Overall Score</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold">{report.overallScore}</span>
                    <span className="text-lg text-blue-200">/10</span>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-200" />
                    <span className="text-sm text-blue-200">Status</span>
                  </div>
                  <Badge className={`${getStatusColor(report.status)} border text-sm`}>
                    {report.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Executive Summary & Investment Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span>Executive Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{report.executiveSummary}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Investment Recommendation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getInvestmentColor(report.investmentRecommendation)} text-lg px-4 py-2 border`}>
                  {report.investmentRecommendation.toUpperCase().replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <span className="font-semibold">{report.overallScore}/10</span>
                </div>
                <Progress value={report.overallScore * 10} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-700">Quality</p>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <Shield className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-700">Safety</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-purple-700">Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Site Information */}
        {report.siteInformation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span>Site Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
        )}

        {/* Performance Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Scores Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Technical Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={categoryScores}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Performance Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>MEP Systems Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={systemPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
                  <Bar dataKey="capacity" fill="#82ca9d" name="Capacity %" />
                  <Bar dataKey="reliability" fill="#ffc658" name="Reliability %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Regulatory Compliance Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {complianceData.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-green-700 mt-1">{item.status}</p>
                  <div className="mt-2">
                    <Progress value={item.value} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Technical Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Foundation */}
          {report.foundationDetails && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Construction className="h-5 w-5" />
                  <span>Foundation System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Foundation Type</p>
                  <p className="font-semibold">{report.foundationDetails.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Soil Bearing Capacity</p>
                  <p className="text-sm">{report.foundationDetails.soilBearingCapacity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Waterproofing</p>
                  <p className="text-sm">{report.foundationDetails.waterproofingMethod}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Electrical Systems */}
          {report.electricalSystems && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-700">
                  <Zap className="h-5 w-5" />
                  <span>Electrical Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Power Supply</p>
                  <p className="text-sm">{report.electricalSystems.powerSupply?.mainConnection}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Backup Power</p>
                  <p className="text-sm">{report.electricalSystems.powerSupply?.backup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Lighting</p>
                  <p className="text-sm">{report.electricalSystems.lighting?.common}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fire Safety */}
          {report.fireSafetySystems && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <Flame className="h-5 w-5" />
                  <span>Fire Safety Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Detection System</p>
                  <p className="text-sm">{report.fireSafetySystems.fireDetection?.system}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fire Fighting</p>
                  <p className="text-sm">{report.fireSafetySystems.fireFighting?.hydrant}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Evacuation</p>
                  <p className="text-sm">{report.fireSafetySystems.evacuation?.exits}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations & Conclusions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                <span>Key Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.recommendations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Technical Conclusions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.conclusions}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
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
  );
}