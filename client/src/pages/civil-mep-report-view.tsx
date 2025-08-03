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
                <p className="text-gray-700 leading-relaxed">{report.executiveSummary || 'Executive summary not available'}</p>
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
                <Badge className={`${getInvestmentColor(report.investmentRecommendation || 'conditional')} text-lg px-4 py-2 border`}>
                  {(report.investmentRecommendation || 'conditional').toUpperCase().replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <span className="font-semibold">{report.overallScore || 0}/10</span>
                </div>
                <Progress value={(report.overallScore || 0) * 10} className="h-2" />
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
                    <p className="font-semibold text-lg">{report.foundationDetails.type || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Depth & Footing</p>
                    <p className="text-sm">{report.foundationDetails.depthAndFooting || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Soil Bearing Capacity</p>
                    <p className="text-sm">{report.foundationDetails.soilBearingCapacity || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Anti-Termite Treatment</p>
                    <p className="text-sm">{report.foundationDetails.antiTermiteTreatment || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Waterproofing</p>
                    <p className="text-sm">{report.foundationDetails.waterproofingMethod || 'Not specified'}</p>
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
                    <p className="font-semibold text-lg">{report.structuralDetails.structuralType || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Concrete Grade</p>
                    <p className="text-sm">{report.structuralDetails.concreteGrade || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Steel Grade</p>
                    <p className="text-sm">{report.structuralDetails.steelGrade || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Column Spacing</p>
                    <p className="text-sm">{report.structuralDetails.columnSpacing || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Slab Thickness</p>
                    <p className="text-sm">{report.structuralDetails.slabThickness || 'Not specified'}</p>
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
                    <p className="text-sm font-medium text-gray-500">LT Panel Design</p>
                    <p className="text-sm">{report.electricalSystems.ltPanelDesign || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Power Distribution</p>
                    <p className="text-sm">{report.electricalSystems.powerDistribution || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wiring Type</p>
                    <p className="text-sm">{report.electricalSystems.wiringType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cable Standards</p>
                    <p className="text-sm">{report.electricalSystems.cableSizesStandards || 'Not specified'}</p>
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
                    <p className="text-sm">{report.plumbingSystems.waterSupply || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pipe Material & Diameter</p>
                    <p className="text-sm">{report.plumbingSystems.pipeMaterialDiameter || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Underground Tank Specs</p>
                    <p className="text-sm">{report.plumbingSystems.undergroundTankSpecs || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">STP Layout</p>
                    <p className="text-sm">{report.plumbingSystems.stpLayout || 'Not specified'}</p>
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
                    <p className="text-sm font-medium text-gray-500">Hydrant System Layout</p>
                    <p className="text-sm">{report.fireSafetySystems.hydrantSystemLayout || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sprinkler System</p>
                    <p className="text-sm">{report.fireSafetySystems.sprinklerSystem || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Smoke Detector Layout</p>
                    <p className="text-sm">{report.fireSafetySystems.smokeDetectorLayout || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fire Alarm & PA</p>
                    <p className="text-sm">{report.fireSafetySystems.fireAlarmPA || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Exit Signage</p>
                    <p className="text-sm">{report.fireSafetySystems.exitSignage || 'Not specified'}</p>
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
                    <p className="text-sm font-medium text-gray-500">Air Conditioning Design</p>
                    <p className="text-sm">{report.hvacSystems.airConditioningDesign || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ventilation</p>
                    <p className="text-sm">{report.hvacSystems.ventilation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duct Layout</p>
                    <p className="text-sm">{report.hvacSystems.ductLayout || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Energy Efficiency</p>
                    <p className="text-sm">{report.hvacSystems.energyEfficiency || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional MEP Systems - Vertical Transportation & Communication */}
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
                    <p className="text-sm font-medium text-gray-500">Elevator Systems</p>
                    <p className="text-sm">{report.verticalTransportation.elevatorSystems || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Elevator Specifications</p>
                    <p className="text-sm">{report.verticalTransportation.elevatorSpecifications || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lift Capacity</p>
                    <p className="text-sm">{report.verticalTransportation.liftCapacity || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Machine Room</p>
                    <p className="text-sm">{report.verticalTransportation.machineRoom || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Communication Systems */}
          {report.communicationSystems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Communication Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Security Systems</p>
                    <p className="text-sm">{report.communicationSystems.securitySystems || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Intercom System</p>
                    <p className="text-sm">{report.communicationSystems.intercomSystem || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cable TV & Internet</p>
                    <p className="text-sm">{report.communicationSystems.cableTvInternet || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Building Management</p>
                    <p className="text-sm">{report.communicationSystems.buildingManagement || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Systems - Sustainability & Quality Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sustainability Systems */}
          {report.sustainabilitySystems && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span>Sustainability Systems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Green Building Features</p>
                    <p className="text-sm">{report.sustainabilitySystems.greenBuildingFeatures || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Renewable Energy</p>
                    <p className="text-sm">{report.sustainabilitySystems.renewableEnergy || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Water Conservation</p>
                    <p className="text-sm">{report.sustainabilitySystems.waterConservation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Waste Management</p>
                    <p className="text-sm">{report.sustainabilitySystems.wasteManagement || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Control */}
          {report.qualityControlMeasures && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Quality Control Measures</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Testing Protocols</p>
                    <p className="text-sm">{report.qualityControlMeasures.testingProtocols || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Material Standards</p>
                    <p className="text-sm">{report.qualityControlMeasures.materialStandards || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inspection Schedule</p>
                    <p className="text-sm">{report.qualityControlMeasures.inspectionSchedule || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compliance Reports</p>
                    <p className="text-sm">{report.qualityControlMeasures.complianceReports || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Safety & Documentation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Safety Standards */}
          {report.safetyStandards && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span>Safety Standards</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Safety Compliance</p>
                    <p className="text-sm">{report.safetyStandards.safetyCompliance || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Emergency Procedures</p>
                    <p className="text-sm">{report.safetyStandards.emergencyProcedures || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Risk Assessment</p>
                    <p className="text-sm">{report.safetyStandards.riskAssessment || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Occupational Health</p>
                    <p className="text-sm">{report.safetyStandards.occupationalHealth || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Documentation */}
          {report.documentationAndCertification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Documentation & Certification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Technical Drawings</p>
                    <p className="text-sm">{report.documentationAndCertification.technicalDrawings || 'Not specified'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certification Status</p>
                    <p className="text-sm">{report.documentationAndCertification.certificationStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Regulatory Approvals</p>
                    <p className="text-sm">{report.documentationAndCertification.regulatoryApprovals || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">As-Built Documentation</p>
                    <p className="text-sm">{report.documentationAndCertification.asBuiltDocumentation || 'Not specified'}</p>
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