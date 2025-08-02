import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, Download, Eye, Calendar, User, Building,
  CheckCircle, AlertCircle, Clock, FileText, Calculator,
  Wrench, Zap, Droplets, ShieldCheck, Settings
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => {
                const property = properties.find(p => p.id === report.propertyId);
                return (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-gray-900">
                            {property?.name || 'Property Report'}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {property?.developer} • {property?.zone}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-full p-2">
                          <Building className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Report Meta Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Report Type</p>
                          <p className="font-medium capitalize">{report.reportType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Generated By</p>
                          <p className="font-medium">{report.generatedBy || 'Engineering Team'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Report Date</p>
                          <p className="font-medium">{formatDate(report.reportDate?.toString() || report.createdAt?.toString() || '')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Version</p>
                          <p className="font-medium">{report.reportVersion}</p>
                        </div>
                      </div>

                      {/* Key Highlights */}
                      {report.qualityAssessment && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Quality Assessment</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Workmanship:</span>
                              <span className="ml-1 font-medium">{report.qualityAssessment.workmanshipGrade}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Overall Score:</span>
                              <span className="ml-1 font-medium">{report.qualityAssessment.overallQuality}/10</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Report Detail Dialog */}
        {selectedReport && (
          <Dialog>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-orange-600" />
                  CIVIL+MEP Engineering Report
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Property Details</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {properties.find(p => p.id === selectedReport.propertyId)?.name || 'Property Report'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Report Type</h3>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{selectedReport.reportType}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Generated By</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedReport.generatedBy || 'Engineering Team'}</p>
                    </div>
                  </div>
                </div>

                {/* Structural Analysis */}
                {selectedReport.structuralAnalysis && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-orange-600" />
                      Structural Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Foundation Type</h4>
                        <p className="text-sm text-gray-600">{selectedReport.structuralAnalysis.foundationType}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Structural System</h4>
                        <p className="text-sm text-gray-600">{selectedReport.structuralAnalysis.structuralSystem}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Material Quality</h4>
                        <p className="text-sm text-gray-600">{selectedReport.structuralAnalysis.materialQuality}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Seismic Compliance</h4>
                        <p className="text-sm text-gray-600">{selectedReport.structuralAnalysis.seismicCompliance}</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">
                          Structural Safety Score: {selectedReport.structuralAnalysis.structuralSafety}/10
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* MEP Systems */}
                {selectedReport.mepSystems && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-blue-600" />
                      MEP Systems Analysis
                    </h3>
                    
                    {/* Electrical */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                        Electrical Systems
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Load Capacity:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.electrical.loadCapacity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Wiring Standard:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.electrical.wiringStandard}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Energy Efficiency:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.electrical.energyEfficiency}/10</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Safety Compliance:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.electrical.safetyCompliance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Plumbing */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                        Plumbing Systems
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Water Supply:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.plumbing.waterSupplySystem}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Drainage:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.plumbing.drainageSystem}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Water Quality:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.plumbing.waterQuality}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pressure Rating:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.plumbing.pressureRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* HVAC */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-green-600" />
                        HVAC Systems
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Ventilation:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.hvac.ventilationSystem}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Air Quality:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.hvac.airQuality}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Temperature Control:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.hvac.temperatureControl}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Energy Rating:</span>
                          <span className="ml-2 font-medium">{selectedReport.mepSystems.hvac.energyRating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                {selectedReport.costBreakdown && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-green-600" />
                      Cost Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">CIVIL Work</h4>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedReport.costBreakdown.civilWork)}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">MEP Work</h4>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedReport.costBreakdown.mepWork)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">Material Costs</h4>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedReport.costBreakdown.materialCosts)}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">Labor Costs</h4>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedReport.costBreakdown.laborCosts)}</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 border p-4 rounded-lg">
                      <div className="text-center">
                        <h4 className="font-medium text-gray-900">Total Estimated Cost</h4>
                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(selectedReport.costBreakdown.totalEstimatedCost)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}