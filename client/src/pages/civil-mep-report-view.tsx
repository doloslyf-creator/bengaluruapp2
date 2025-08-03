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

        {/* Section 1: Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>1. Site Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Project Name</p>
                <p className="text-sm">{report.siteInformation?.projectName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-sm">{report.siteInformation?.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plot Area</p>
                <p className="text-sm">{report.siteInformation?.plotArea || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Survey Number</p>
                <p className="text-sm">{report.siteInformation?.surveyNumber || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Zoning Classification</p>
                <p className="text-sm">{report.siteInformation?.zoningClassification || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Soil Test Report</p>
                <p className="text-sm">{report.siteInformation?.soilTestReport || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 & 3: Foundation & Superstructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 2: Foundation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Construction className="h-5 w-5 text-orange-600" />
                <span>2. Foundation Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Section 3: Superstructure Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>3. Superstructure Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
        </div>

        {/* Sections 4, 5, 6: Walls, Roofing, Doors & Windows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 4: Walls & Finishes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-green-600" />
                <span>4. Walls & Finishes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Section 5: Roofing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-blue-600" />
                <span>5. Roofing Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Section 6: Doors & Windows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-purple-600" />
                <span>6. Doors & Windows</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.doorsWindows?.entries && report.doorsWindows.entries.length > 0 ? (
                report.doorsWindows.entries.map((entry, index) => (
                  <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
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
                ))
              ) : (
                <p className="text-sm text-gray-500">No door/window entries available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sections 7, 8, 9: Flooring, Staircases, External Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 7: Flooring Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-indigo-600" />
                <span>7. Flooring Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Section 8: Staircases & Elevators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span>8. Staircases & Elevators</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Section 9: External Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span>9. External Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <div>
                <p className="text-sm font-medium text-gray-500">Signage & Outdoor Furniture</p>
                <p className="text-sm">{report.externalWorks?.signageOutdoorFurniture || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MEP Sections 10, 11, 12: Mechanical, Electrical, Plumbing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 10: Mechanical Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-green-600" />
                <span>10. Mechanical Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">HVAC Design</p>
                <p className="text-sm">{report.mechanicalSystems?.hvacDesign || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ducting Layout</p>
                <p className="text-sm">{report.mechanicalSystems?.ductingLayout || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ventilation Type</p>
                <p className="text-sm">{report.mechanicalSystems?.ventilationType || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Heat Load Calculations</p>
                <p className="text-sm">{report.mechanicalSystems?.heatLoadCalculations || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Energy Efficiency Rating</p>
                <p className="text-sm">{report.mechanicalSystems?.energyEfficiencyRating || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 11: Electrical Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>11. Electrical Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">LT Panel Design</p>
                <p className="text-sm">{report.electricalSystems?.ltPanelDesign || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Power Distribution</p>
                <p className="text-sm">{report.electricalSystems?.powerDistribution || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Wiring Type</p>
                <p className="text-sm">{report.electricalSystems?.wiringType || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cable Sizes & Standards</p>
                <p className="text-sm">{report.electricalSystems?.cableSizesStandards || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Earthing Resistance</p>
                <p className="text-sm">{report.electricalSystems?.earthingResistance || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Light Fixtures</p>
                <p className="text-sm">{report.electricalSystems?.lightFixtures || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 12: Plumbing Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <span>12. Plumbing Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Water Supply</p>
                {report.plumbingSystems?.waterSupply && typeof report.plumbingSystems.waterSupply === 'object' ? (
                  <div className="text-sm space-y-1">
                    {typeof report.plumbingSystems.waterSupply === 'object' && 'source' in report.plumbingSystems.waterSupply && (
                      <div><span className="font-medium">Source:</span> {report.plumbingSystems.waterSupply.source}</div>
                    )}
                    {typeof report.plumbingSystems.waterSupply === 'object' && 'storage' in report.plumbingSystems.waterSupply && (
                      <div><span className="font-medium">Storage:</span> {report.plumbingSystems.waterSupply.storage}</div>
                    )}
                    {typeof report.plumbingSystems.waterSupply === 'object' && 'distribution' in report.plumbingSystems.waterSupply && (
                      <div><span className="font-medium">Distribution:</span> {report.plumbingSystems.waterSupply.distribution}</div>
                    )}
                    {typeof report.plumbingSystems.waterSupply === 'object' && 'quality' in report.plumbingSystems.waterSupply && (
                      <div><span className="font-medium">Quality:</span> {report.plumbingSystems.waterSupply.quality}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{report.plumbingSystems?.waterSupply || 'Not specified'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pipe Material & Diameter</p>
                <p className="text-sm">{report.plumbingSystems?.pipeMaterialDiameter || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Underground Tank Specs</p>
                <p className="text-sm">{report.plumbingSystems?.undergroundTankSpecs || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">STP Layout</p>
                <p className="text-sm">{report.plumbingSystems?.stpLayout || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Water Pump Automation</p>
                <p className="text-sm">{report.plumbingSystems?.waterPumpAutomation || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rainwater Outlets</p>
                <p className="text-sm">{report.plumbingSystems?.rainwaterOutlets || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MEP Sections 13, 14, 15: Fire Safety, BMS Automation, Green Sustainability */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 13: Fire Safety Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-red-600" />
                <span>13. Fire Safety Systems</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Section 14: BMS Automation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span>14. BMS Automation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              {report.bmsAutomation?.sensors && report.bmsAutomation.sensors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Sensors</p>
                  <div className="text-sm">
                    {report.bmsAutomation.sensors.map((sensor, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {sensor.type} - {sensor.location}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 15: Green Sustainability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span>15. Green Sustainability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              {report.greenSustainability?.solarPanels && report.greenSustainability.solarPanels.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Solar Panels</p>
                  <div className="text-sm">
                    {report.greenSustainability.solarPanels.map((panel, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {panel.capacity} - {panel.brand}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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