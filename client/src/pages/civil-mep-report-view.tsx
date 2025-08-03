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
  Target
} from "lucide-react";

export function CivilMepReportView() {
  const { id } = useParams<{ id: string }>();
  
  const { data: report, isLoading } = useQuery<CivilMepReport>({
    queryKey: [`/api/civil-mep-reports/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600">The requested Civil+MEP report could not be found.</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-6 py-8">
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

      <div className="mx-auto px-6 py-8 space-y-6" style={{ maxWidth: '900px' }}>
        {/* Executive Summary & Investment Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
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
          
          <Card>
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

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Foundation Details */}
          {report.foundationDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Construction className="h-5 w-5 text-orange-600" />
                  <span>Foundation System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Foundation Type</p>
                    <p className="font-semibold text-lg">{report.foundationDetails.type}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Soil Bearing Capacity</p>
                    <p className="text-sm">{report.foundationDetails.soilBearingCapacity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Soil Investigation</p>
                    <p className="text-sm">{report.foundationDetails.soilInvestigation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Settlement Analysis</p>
                    <p className="text-sm">{report.foundationDetails.settlementAnalysis}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Waterproofing</p>
                    <p className="text-sm">{report.foundationDetails.waterproofingMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Structural Details */}
          {report.structuralDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Structural System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Structural Type</p>
                    <p className="font-semibold text-lg">{report.structuralDetails.structuralType}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Concrete Grade</p>
                    <p className="text-sm">{report.structuralDetails.concreteGrade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Steel Grade</p>
                    <p className="text-sm">{report.structuralDetails.steelGrade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Column Spacing</p>
                    <p className="text-sm">{report.structuralDetails.columnSpacing}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Slab Thickness</p>
                    <p className="text-sm">{report.structuralDetails.slabThickness}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MEP Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Electrical Systems */}
          {report.electricalSystems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>Electrical Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Power Supply</p>
                    <p className="text-sm">{report.electricalSystems.powerSupply?.mainConnection}</p>
                    <p className="text-xs text-gray-400">Backup: {report.electricalSystems.powerSupply?.backup}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lighting Systems</p>
                    <p className="text-sm">Common: {report.electricalSystems.lighting?.common}</p>
                    <p className="text-xs text-gray-400">Emergency: {report.electricalSystems.lighting?.emergency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Distribution</p>
                    <p className="text-sm">Panels: {report.electricalSystems.distribution?.panels}</p>
                    <p className="text-xs text-gray-400">Cable Type: {report.electricalSystems.distribution?.cableType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plumbing Systems */}
          {report.plumbingSystems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <span>Plumbing Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Water Supply</p>
                    <p className="text-sm">Source: {report.plumbingSystems.waterSupply?.source}</p>
                    <p className="text-xs text-gray-400">Storage: {report.plumbingSystems.waterSupply?.storage}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Drainage System</p>
                    <p className="text-sm">Type: {report.plumbingSystems.drainage?.system}</p>
                    <p className="text-xs text-gray-400">STP: {report.plumbingSystems.drainage?.stpCapacity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hot Water</p>
                    <p className="text-sm">{report.plumbingSystems.hotWater?.system}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fire Safety & HVAC Systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fire Safety Systems */}
          {report.fireSafetySystems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-red-600" />
                  <span>Fire Safety Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fire Detection</p>
                    <p className="text-sm">System: {report.fireSafetySystems.fireDetection?.system}</p>
                    <p className="text-xs text-gray-400">Coverage: {report.fireSafetySystems.fireDetection?.coverage}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fire Fighting</p>
                    <p className="text-sm">Hydrant: {report.fireSafetySystems.fireFighting?.hydrant}</p>
                    <p className="text-xs text-gray-400">Sprinkler: {report.fireSafetySystems.fireFighting?.sprinkler}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Evacuation</p>
                    <p className="text-sm">Exits: {report.fireSafetySystems.evacuation?.exits}</p>
                    <p className="text-xs text-gray-400">Staircase: {report.fireSafetySystems.evacuation?.staircase}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* HVAC Systems */}
          {report.hvacSystems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-green-600" />
                  <span>HVAC Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">System Type</p>
                    <p className="text-sm">{report.hvacSystems.systemType}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ventilation</p>
                    <p className="text-sm">Natural: {report.hvacSystems.ventilation?.natural}</p>
                    <p className="text-xs text-gray-400">Mechanical: {report.hvacSystems.ventilation?.mechanical}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Exhaust System</p>
                    <p className="text-sm">{report.hvacSystems.exhaustSystem}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional MEP Systems - Vertical Transportation & Smart Systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vertical Transportation */}
          {report.verticalTransportation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  <span>Vertical Transportation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Elevators</p>
                    <p className="text-sm">Type: {report.verticalTransportation.elevators?.type}</p>
                    <p className="text-xs text-gray-400">Capacity: {report.verticalTransportation.elevators?.capacity}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Escalators</p>
                    <p className="text-sm">{report.verticalTransportation.escalators}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Emergency Access</p>
                    <p className="text-sm">{report.verticalTransportation.emergencyAccess}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Smart Building & Automation */}
          {report.smartBuildingFeatures && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Smart Building & Automation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Automation Level</p>
                    <p className="text-sm">{report.smartBuildingFeatures.automationLevel}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Energy Management</p>
                    <p className="text-sm">{report.smartBuildingFeatures.energyManagement}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Security Systems</p>
                    <p className="text-sm">{report.smartBuildingFeatures.securitySystems}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">IoT Integration</p>
                    <p className="text-sm">{report.smartBuildingFeatures.iotIntegration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sustainability & Compliance Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sustainability Features */}
          {report.sustainabilityFeatures && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span>Sustainability Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Energy Efficiency</p>
                    <p className="text-sm">{report.sustainabilityFeatures.energyEfficiency}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Water Conservation</p>
                    <p className="text-sm">{report.sustainabilityFeatures.waterConservation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Waste Management</p>
                    <p className="text-sm">{report.sustainabilityFeatures.wasteManagement}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Green Building Rating</p>
                    <p className="text-sm">{report.sustainabilityFeatures.greenBuildingRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance & Documentation */}
          {(report.complianceDocuments || report.certifications) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Compliance & Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {report.complianceDocuments && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Compliance Documents</p>
                      <div className="space-y-1">
                        <p className="text-sm">Building Plan: {report.complianceDocuments.buildingPlanApproval}</p>
                        <p className="text-xs text-gray-400">Fire NOC: {report.complianceDocuments.fireNOC}</p>
                        <p className="text-xs text-gray-400">Structural Drawings: {report.complianceDocuments.structuralDrawings}</p>
                      </div>
                    </div>
                  )}
                  {report.certifications && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Certifications</p>
                        <div className="space-y-1">
                          <p className="text-sm">Occupancy: {report.certifications.occupancyCertificate}</p>
                          <p className="text-xs text-gray-400">Completion: {report.certifications.completionCertificate}</p>
                          <p className="text-xs text-gray-400">RERA: {report.certifications.reraRegistration}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quality Control & Safety Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Control */}
          {report.qualityControl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Quality Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Testing Procedures</p>
                    <p className="text-sm">{report.qualityControl.testingProcedures}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Material Standards</p>
                    <p className="text-sm">{report.qualityControl.materialStandards}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inspection Protocols</p>
                    <p className="text-sm">{report.qualityControl.inspectionProtocols}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
                    <p className="text-sm">{report.qualityControl.complianceRate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Measures */}
          {report.safetyMeasures && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span>Safety Measures</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Construction Safety</p>
                    <p className="text-sm">{report.safetyMeasures.constructionSafety}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Occupancy Safety</p>
                    <p className="text-sm">{report.safetyMeasures.occupancySafety}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Emergency Protocols</p>
                    <p className="text-sm">{report.safetyMeasures.emergencyProtocols}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Risk Assessment</p>
                    <p className="text-sm">{report.safetyMeasures.riskAssessment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Inspection & Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inspection Logs */}
          {report.inspectionLogs && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span>Inspection Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Initial Inspection</p>
                    <p className="text-sm">Date: {report.inspectionLogs.initialInspection?.date}</p>
                    <p className="text-xs text-gray-400">Findings: {report.inspectionLogs.initialInspection?.findings}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Follow-up Inspections</p>
                    <p className="text-sm">{report.inspectionLogs.followUpInspections}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Final Assessment</p>
                    <p className="text-sm">{report.inspectionLogs.finalAssessment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Documentation */}
          {report.technicalDocumentation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Technical Documentation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Drawings & Plans</p>
                    <p className="text-sm">{report.technicalDocumentation.drawingsAndPlans}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Specifications</p>
                    <p className="text-sm">{report.technicalDocumentation.specifications}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Test Reports</p>
                    <p className="text-sm">{report.technicalDocumentation.testReports}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">As-Built Drawings</p>
                    <p className="text-sm">{report.technicalDocumentation.asBuiltDrawings}</p>
                  </div>
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
  );
}