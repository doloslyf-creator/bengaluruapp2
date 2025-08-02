import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, Download, Eye, Calendar, User, Building,
  CheckCircle, AlertCircle, Clock, FileText, Calculator,
  Wrench, Zap, Droplets, ShieldCheck, Settings, Star,
  TrendingUp, Award, Shield, Target, BarChart3, 
  MapPin, Home, Layers, Construction, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type CivilMepReport, type Property } from "@shared/schema";

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  portfolioValue: 2850000
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function UserCivilMepReports() {
  const [selectedReport, setSelectedReport] = useState<CivilMepReport | null>(null);
  const { toast } = useToast();

  // Fetch CIVIL+MEP reports
  const { data: reports = [], isLoading } = useQuery<CivilMepReport[]>({
    queryKey: ["/api/civil-mep-reports"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch properties for reference
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/user-panel">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <div className="text-2xl font-black tracking-tight text-gray-900">
                  My Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                </div>
                <p className="text-sm text-gray-600">Curated Properties • CIVIL+MEP Engineering Reports</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header Box */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {mockUser.name}!</h1>
              <p className="text-gray-600 mt-1">Your comprehensive CIVIL+MEP engineering reports</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {mockUser.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  Portfolio Value: {formatCurrency(mockUser.portfolioValue)}
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-full p-4">
              <Building className="h-12 w-12 text-orange-600" />
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          /* No Reports State */
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="bg-orange-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Building className="h-12 w-12 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No CIVIL+MEP Reports Available</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  You don't have any CIVIL+MEP engineering reports yet. These comprehensive reports provide detailed 
                  structural analysis, material breakdown, and MEP systems evaluation for your properties.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border border-orange-200 rounded-lg p-6">
                    <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Structural Analysis</h4>
                    <p className="text-sm text-gray-600">Foundation assessment, load capacity, seismic compliance</p>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-lg p-6">
                    <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cost Breakdown</h4>
                    <p className="text-sm text-gray-600">Material costs, labor estimation, quality analysis</p>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-lg p-6">
                    <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">MEP Systems</h4>
                    <p className="text-sm text-gray-600">Electrical, plumbing, HVAC evaluation</p>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-lg p-6">
                    <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compliance</h4>
                    <p className="text-sm text-gray-600">Building codes, fire safety, certifications</p>
                  </div>
                </div>
                <Link href="/find-property">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Building className="h-4 w-4 mr-2" />
                    Explore Properties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Reports List */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My CIVIL+MEP Engineering Reports</h2>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {reports.map((report) => {
                const property = properties.find(p => p.id === report.propertyId);
                const overallScore = typeof report.overallScore === 'number' ? report.overallScore : 0;
                const getScoreColor = (score: number) => {
                  if (score >= 8.5) return "text-green-600 bg-green-50 border-green-200";
                  if (score >= 7.0) return "text-blue-600 bg-blue-50 border-blue-200";
                  if (score >= 5.0) return "text-yellow-600 bg-yellow-50 border-yellow-200";
                  return "text-red-600 bg-red-50 border-red-200";
                };
                
                return (
                  <Card key={report.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-t-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold mb-2">
                            {property?.name || 'Property Report'}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-orange-100">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              <span className="text-sm">{property?.developer}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{property?.zone}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`${getScoreColor(overallScore)} border-2 rounded-xl p-3 bg-white text-center min-w-[80px]`}>
                          <div className="text-2xl font-bold">{overallScore.toFixed(1)}</div>
                          <div className="text-xs font-medium">Overall</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                      {/* Report Meta Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Report Type</p>
                          <p className="font-bold text-gray-900 capitalize mt-1">{report.reportType}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Generated By</p>
                          <p className="font-bold text-gray-900 mt-1">{report.generatedBy || 'Engineering Team'}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Report Date</p>
                          <p className="font-bold text-gray-900 mt-1">{formatDate(report.reportDate?.toString() || report.createdAt?.toString() || '')}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
                          <p className="font-bold text-gray-900 mt-1">{report.reportVersion}</p>
                        </div>
                      </div>

                      {/* Key Metrics Dashboard */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                          Key Performance Metrics
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {report.structuralAnalysis && (
                            <div className="bg-white p-3 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Structural</p>
                                  <p className="text-lg font-bold text-green-600">{report.structuralAnalysis.structuralSafety || 'N/A'}</p>
                                </div>
                                <Shield className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          )}
                          
                          {report.qualityAssessment && (
                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Quality</p>
                                  <p className="text-lg font-bold text-blue-600">{report.qualityAssessment.overallQuality || 'N/A'}</p>
                                </div>
                                <Star className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                          )}
                          
                          {report.mepSystems && (
                            <div className="bg-white p-3 rounded-lg border border-yellow-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">MEP Score</p>
                                  <p className="text-lg font-bold text-yellow-600">{report.mepSystems.electrical?.energyEfficiency || 'N/A'}</p>
                                </div>
                                <Zap className="h-5 w-5 text-yellow-600" />
                              </div>
                            </div>
                          )}
                          
                          {report.costBreakdown && (
                            <div className="bg-white p-3 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Cost</p>
                                  <p className="text-sm font-bold text-orange-600">{formatCurrency(report.costBreakdown.totalEstimatedCost || 0)}</p>
                                </div>
                                <Calculator className="h-5 w-5 text-orange-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Quality Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Report Complete
                        </Badge>
                        {report.qualityAssessment?.workmanshipGrade && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            <Award className="h-3 w-3 mr-1" />
                            Grade {report.qualityAssessment.workmanshipGrade}
                          </Badge>
                        )}
                        {report.reportType && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <Construction className="h-3 w-3 mr-1" />
                            {report.reportType.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      {/* Enhanced Actions */}
                      <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white border-0"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Report
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          onClick={() => {
                            toast({
                              title: "Download Started",
                              description: "Your CIVIL+MEP report is being prepared for download.",
                            });
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Report Detail Dialog */}
        {selectedReport && (
          <Dialog>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader className="space-y-4 pb-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                      CIVIL+MEP Engineering Report
                    </DialogTitle>
                    <p className="text-lg text-gray-700 mt-1">
                      {properties.find(p => p.id === selectedReport.propertyId)?.name || 'Property Report'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Generated on {formatDate(selectedReport.reportDate?.toString() || selectedReport.createdAt?.toString() || '')} • Version {selectedReport.reportVersion}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-blue-600 text-white rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold">{(typeof selectedReport.overallScore === 'number' ? selectedReport.overallScore : 0).toFixed(1)}</div>
                    <div className="text-xs font-medium">Overall Score</div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8 py-6">
                {/* Executive Summary Header */}
                <div className="bg-gradient-to-r from-orange-50 via-white to-blue-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center mb-2">
                        <Building className="h-4 w-4 mr-2 text-orange-600" />
                        Property Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        {properties.find(p => p.id === selectedReport.propertyId)?.name || 'Property Report'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {properties.find(p => p.id === selectedReport.propertyId)?.developer} • {properties.find(p => p.id === selectedReport.propertyId)?.zone}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center mb-2">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        Report Type
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{selectedReport.reportType}</p>
                      <p className="text-xs text-gray-500 mt-1">Comprehensive Analysis</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center mb-2">
                        <User className="h-4 w-4 mr-2 text-green-600" />
                        Engineering Team
                      </h3>
                      <p className="text-sm text-gray-600">{selectedReport.generatedBy || 'Senior Engineers'}</p>
                      <p className="text-xs text-gray-500 mt-1">Certified Professionals</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                        Report Status
                      </h3>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified & Complete
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Enhanced Structural Analysis Section */}
                {selectedReport.structuralAnalysis && (
                  <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border-0 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-3 mr-4">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        Structural Engineering Analysis
                      </h3>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{selectedReport.structuralAnalysis.structuralSafety || 'N/A'}</div>
                        <div className="text-xs">Safety Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 flex items-center mb-3">
                          <Layers className="h-4 w-4 mr-2 text-orange-600" />
                          Foundation Analysis
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">Foundation Type</p>
                        <p className="font-semibold text-gray-900">{selectedReport.structuralAnalysis.foundationType}</p>
                      </div>
                      
                      <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 flex items-center mb-3">
                          <Construction className="h-4 w-4 mr-2 text-blue-600" />
                          Structural Framework
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">System Type</p>
                        <p className="font-semibold text-gray-900">{selectedReport.structuralAnalysis.structuralSystem}</p>
                      </div>
                      
                      <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 flex items-center mb-3">
                          <Award className="h-4 w-4 mr-2 text-green-600" />
                          Material Assessment
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">Quality Grade</p>
                        <p className="font-semibold text-gray-900">{selectedReport.structuralAnalysis.materialQuality}</p>
                      </div>
                      
                      <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 flex items-center mb-3">
                          <Shield className="h-4 w-4 mr-2 text-purple-600" />
                          Seismic Compliance
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">Safety Standard</p>
                        <p className="font-semibold text-gray-900">{selectedReport.structuralAnalysis.seismicCompliance}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-6 w-6 mr-3" />
                          <div>
                            <p className="font-bold text-lg">Structural Assessment Complete</p>
                            <p className="text-green-100 text-sm">Comprehensive analysis verified by certified engineers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">{selectedReport.structuralAnalysis.structuralSafety}/10</p>
                          <p className="text-green-100 text-sm">Safety Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced MEP Systems Analysis */}
                {selectedReport.mepSystems && (
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border-0 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 mr-4">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        MEP Systems Analysis
                      </h3>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-3 text-center">
                        <div className="text-xl font-bold">{selectedReport.mepSystems.electrical?.energyEfficiency || 'N/A'}</div>
                        <div className="text-xs">Efficiency Score</div>
                      </div>
                    </div>
                    
                    {/* Electrical Systems */}
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-6">
                        <h4 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                          <Zap className="h-5 w-5 mr-3 text-yellow-600" />
                          Electrical Systems Assessment
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Load Capacity</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.electrical.loadCapacity}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Wiring Standard</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.electrical.wiringStandard}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Energy Efficiency</p>
                            <p className="text-lg font-bold text-yellow-600">{selectedReport.mepSystems.electrical.energyEfficiency}/10</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Safety Compliance</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.electrical.safetyCompliance}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plumbing Systems */}
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-6">
                        <h4 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                          <Droplets className="h-5 w-5 mr-3 text-blue-600" />
                          Plumbing & Water Systems
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Water Supply System</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.plumbing.waterSupplySystem}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Drainage System</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.plumbing.drainageSystem}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Water Quality</p>
                            <p className="text-lg font-bold text-blue-600">{selectedReport.mepSystems.plumbing.waterQuality}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Pressure Rating</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.plumbing.pressureRating}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HVAC Systems */}
                    <div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                        <h4 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                          <Settings className="h-5 w-5 mr-3 text-green-600" />
                          HVAC & Climate Control
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Ventilation System</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.hvac.ventilationSystem}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Air Quality</p>
                            <p className="text-lg font-bold text-green-600">{selectedReport.mepSystems.hvac.airQuality}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Temperature Control</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.hvac.temperatureControl}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Energy Rating</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mepSystems.hvac.energyRating}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Cost Analysis Section */}
                {selectedReport.costBreakdown && (
                  <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg border-0 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-3 mr-4">
                          <Calculator className="h-6 w-6 text-white" />
                        </div>
                        Comprehensive Cost Analysis
                      </h3>
                      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-3 text-center">
                        <div className="text-sm font-bold">{formatCurrency(selectedReport.costBreakdown.totalEstimatedCost)}</div>
                        <div className="text-xs">Total Cost</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg mb-1">CIVIL Engineering Work</h4>
                            <p className="text-gray-200 text-sm">Structural & Foundation</p>
                          </div>
                          <Building className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-3xl font-bold mt-4">{formatCurrency(selectedReport.costBreakdown.civilWork)}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg mb-1">MEP Systems Work</h4>
                            <p className="text-blue-100 text-sm">Electrical, Plumbing & HVAC</p>
                          </div>
                          <Zap className="h-8 w-8 text-blue-200" />
                        </div>
                        <p className="text-3xl font-bold mt-4">{formatCurrency(selectedReport.costBreakdown.mepWork)}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg mb-1">Material Costs</h4>
                            <p className="text-green-100 text-sm">Premium Quality Materials</p>
                          </div>
                          <Layers className="h-8 w-8 text-green-200" />
                        </div>
                        <p className="text-3xl font-bold mt-4">{formatCurrency(selectedReport.costBreakdown.materialCosts)}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg mb-1">Labor Costs</h4>
                            <p className="text-orange-100 text-sm">Skilled Workforce</p>
                          </div>
                          <User className="h-8 w-8 text-orange-200" />
                        </div>
                        <p className="text-3xl font-bold mt-4">{formatCurrency(selectedReport.costBreakdown.laborCosts)}</p>
                      </div>
                    </div>
                    
                    {/* Cost Summary */}
                    <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-8 rounded-2xl">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold mb-2">Total Project Investment</h4>
                        <p className="text-5xl font-bold mb-4">{formatCurrency(selectedReport.costBreakdown.totalEstimatedCost)}</p>
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 mr-2" />
                          <span className="text-lg">Comprehensive Engineering Analysis Complete</span>
                        </div>
                        <p className="text-green-100 mt-2 text-sm">All costs verified by certified quantity surveyors</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Actions Footer */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-3 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Report Verified & Complete</h4>
                        <p className="text-sm text-gray-600">All sections reviewed by certified engineers</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          toast({
                            title: "Download Started",
                            description: "Your comprehensive CIVIL+MEP report is being prepared.",
                          });
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}