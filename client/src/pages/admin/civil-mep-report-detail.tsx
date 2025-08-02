import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Download, FileText, Building, Calendar, User, 
  CheckCircle, AlertTriangle, Wrench, Zap, Shield, Home,
  IndianRupee, TrendingUp, Award, MapPin, Clock
} from "lucide-react";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/layout/admin-layout";

const CivilMepReportDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch report details
  const { data: report, isLoading, error } = useQuery({
    queryKey: ["/api/civil-mep-reports", id],
    queryFn: async () => {
      const response = await fetch(`/api/civil-mep-reports/${id}`);
      if (!response.ok) throw new Error("Failed to fetch report");
      return response.json();
    },
    enabled: !!id
  });

  // Download PDF mutation
  const downloadPDFMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/civil-mep-reports/${id}/download`);
      if (!response.ok) throw new Error("Failed to download PDF");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `civil-mep-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download PDF report",
        variant: "destructive",
      });
    }
  });

  // Generate Certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/civil-mep-reports/${id}/certificate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error("Failed to generate certificate");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-certificate-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Compliance certificate generated and downloaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate compliance certificate",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </AdminLayout>
    );
  }

  if (error || !report) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">The requested CIVIL+MEP report could not be found.</p>
          <Button onClick={() => navigate("/admin/civil-mep-reports")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600";
    if (score >= 7) return "text-blue-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+": case "A": return "bg-green-100 text-green-800";
      case "B+": case "B": return "bg-blue-100 text-blue-800";
      case "C+": case "C": return "bg-yellow-100 text-yellow-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/admin/civil-mep-reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CIVIL+MEP Engineering Report</h1>
              <p className="text-gray-600">Comprehensive technical analysis and assessment</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => downloadPDFMutation.mutate()}
              disabled={downloadPDFMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {downloadPDFMutation.isPending ? "Downloading..." : "Download PDF"}
            </Button>
            <Button 
              onClick={() => generateCertificateMutation.mutate()}
              disabled={generateCertificateMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              {generateCertificateMutation.isPending ? "Generating..." : "Generate Certificate"}
            </Button>
          </div>
        </div>

        {/* Report Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Report ID</p>
                  <p className="font-semibold">{report.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Version</p>
                  <p className="font-semibold">v{report.reportVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Generated By</p>
                  <p className="font-semibold">{report.generatedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Report Date</p>
                  <p className="font-semibold">{new Date(report.reportDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Executive Summary</p>
                <p className="text-sm leading-relaxed">{report.executiveSummary}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Overall Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(parseFloat(report.overallScore))}`}>
                  {parseFloat(report.overallScore).toFixed(1)}/10
                </div>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quality Rating</span>
                  <span>{(parseFloat(report.overallScore) * 10).toFixed(0)}%</span>
                </div>
                <Progress value={parseFloat(report.overallScore) * 10} className="h-2" />
              </div>
              
              <Badge className={`w-full justify-center ${
                report.investmentRecommendation === 'highly-recommended' ? 'bg-green-100 text-green-800' :
                report.investmentRecommendation === 'recommended' ? 'bg-blue-100 text-blue-800' :
                report.investmentRecommendation === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {report.investmentRecommendation.replace('-', ' ').toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Structural Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Structural Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Foundation Type</h4>
                <p className="text-sm text-gray-600">{report.structuralAnalysis?.foundationType}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Structural System</h4>
                <p className="text-sm text-gray-600">{report.structuralAnalysis?.structuralSystem}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Material Quality</h4>
                <p className="text-sm text-gray-600">{report.structuralAnalysis?.materialQuality}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Load Bearing Capacity</h4>
                <p className="text-sm text-gray-600">{report.structuralAnalysis?.loadBearingCapacity}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Seismic Compliance</h4>
                <p className="text-sm text-gray-600">{report.structuralAnalysis?.seismicCompliance}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Structural Safety Score</h4>
                <div className="flex items-center">
                  <span className={`text-lg font-bold ${getScoreColor(report.structuralAnalysis?.structuralSafety || 0)}`}>
                    {report.structuralAnalysis?.structuralSafety}/10
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MEP Systems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              MEP Systems Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Electrical */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Electrical Systems
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Load Capacity:</strong> {report.mepSystems?.electrical?.loadCapacity}</div>
                  <div><strong>Wiring Standard:</strong> {report.mepSystems?.electrical?.wiringStandard}</div>
                  <div><strong>Safety Compliance:</strong> {report.mepSystems?.electrical?.safetyCompliance}</div>
                  <div><strong>Energy Efficiency:</strong> 
                    <span className={`ml-1 font-semibold ${getScoreColor(report.mepSystems?.electrical?.energyEfficiency || 0)}`}>
                      {report.mepSystems?.electrical?.energyEfficiency}/10
                    </span>
                  </div>
                  <div><strong>Backup Systems:</strong></div>
                  <ul className="list-disc list-inside ml-4 text-gray-600">
                    {report.mepSystems?.electrical?.backupSystems?.map((system: string, index: number) => (
                      <li key={index}>{system}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Plumbing */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Wrench className="h-4 w-4 mr-2" />
                  Plumbing Systems
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Water Supply:</strong> {report.mepSystems?.plumbing?.waterSupplySystem}</div>
                  <div><strong>Drainage:</strong> {report.mepSystems?.plumbing?.drainageSystem}</div>
                  <div><strong>Sewage Treatment:</strong> {report.mepSystems?.plumbing?.sewageTreatment}</div>
                  <div><strong>Water Quality:</strong> {report.mepSystems?.plumbing?.waterQuality}</div>
                  <div><strong>Pressure Rating:</strong> {report.mepSystems?.plumbing?.pressureRating}</div>
                </div>
              </div>

              {/* HVAC */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  HVAC Systems
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Ventilation:</strong> {report.mepSystems?.hvac?.ventilationSystem}</div>
                  <div><strong>Air Quality:</strong> {report.mepSystems?.hvac?.airQuality}</div>
                  <div><strong>Temperature Control:</strong> {report.mepSystems?.hvac?.temperatureControl}</div>
                  <div><strong>Energy Rating:</strong> {report.mepSystems?.hvac?.energyRating}</div>
                </div>
              </div>

              {/* Fire Safety */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-red-500" />
                  Fire Safety Systems
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Fire Detection:</strong> {report.mepSystems?.fireSuppressionSystem?.fireDetection}</div>
                  <div><strong>Sprinkler System:</strong> {report.mepSystems?.fireSuppressionSystem?.sprinklerSystem}</div>
                  <div><strong>Emergency Exits:</strong> {report.mepSystems?.fireSuppressionSystem?.emergencyExits}</div>
                  <div><strong>Compliance:</strong> 
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {report.mepSystems?.fireSuppressionSystem?.compliance}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Civil Work</span>
                  <span className="font-semibold">{formatCurrency(report.costBreakdown?.civilWork || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>MEP Work</span>
                  <span className="font-semibold">{formatCurrency(report.costBreakdown?.mepWork || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Finishing Work</span>
                  <span className="font-semibold">{formatCurrency(report.costBreakdown?.finishingWork || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor Costs</span>
                  <span className="font-semibold">{formatCurrency(report.costBreakdown?.laborCosts || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material Costs</span>
                  <span className="font-semibold">{formatCurrency(report.costBreakdown?.materialCosts || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Estimated Cost</span>
                  <span className="text-blue-600">{formatCurrency(report.costBreakdown?.totalEstimatedCost || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Quality Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Workmanship Grade</p>
                    <Badge className={getGradeColor(report.qualityAssessment?.workmanshipGrade || "")}>
                      {report.qualityAssessment?.workmanshipGrade}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Material Grade</p>
                    <Badge className={getGradeColor(report.qualityAssessment?.materialGrade || "")}>
                      {report.qualityAssessment?.materialGrade}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Finishing Quality</p>
                  <p className="font-semibold">{report.qualityAssessment?.finishingQuality}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Quality Score</p>
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${getScoreColor(report.qualityAssessment?.overallQuality || 0)}`}>
                      {report.qualityAssessment?.overallQuality}/10
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {report.qualityAssessment?.certifications?.map((cert: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Compliance & Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Building Codes</p>
                  <p className="text-sm text-gray-600">{report.complianceChecklist?.buildingCodes?.details}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Fire NOC</p>
                  <p className="text-sm text-gray-600">Valid until {report.complianceChecklist?.fireNOC?.validUntil}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Environmental Clearance</p>
                  <p className="text-sm text-gray-600">{report.complianceChecklist?.environmentalClearance?.status}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Electrical Approval</p>
                  <p className="text-sm text-gray-600">{report.complianceChecklist?.electricalApproval?.authority}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Structural Certificate</p>
                  <p className="text-sm text-gray-600">{report.complianceChecklist?.structuralCertificate?.issuer}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Plumbing Approval</p>
                  <p className="text-sm text-gray-600">{report.complianceChecklist?.plumbingApproval?.status}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snag Report */}
        {report.snagReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Snag Report & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Critical Issues */}
                {report.snagReport.criticalIssues?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">Critical Issues</h4>
                    <div className="space-y-3">
                      {report.snagReport.criticalIssues.map((issue: any, index: number) => (
                        <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{issue.description}</p>
                              <p className="text-sm text-gray-600">Location: {issue.location}</p>
                              <p className="text-sm text-gray-600">Action: {issue.recommendedAction}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-red-100 text-red-800 mb-1">{issue.severity}</Badge>
                              <p className="text-sm font-semibold">{formatCurrency(issue.estimatedCost)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Minor Issues */}
                {report.snagReport.minorIssues?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-yellow-600">Minor Issues</h4>
                    <div className="space-y-2">
                      {report.snagReport.minorIssues.map((issue: any, index: number) => (
                        <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                          <p className="font-semibold">{issue.description}</p>
                          <p className="text-sm text-gray-600">Location: {issue.location}</p>
                          <p className="text-sm text-gray-600">Action: {issue.recommendedAction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overall Condition */}
                <div>
                  <h4 className="font-semibold mb-2">Overall Condition</h4>
                  <p className="text-sm text-gray-600">{report.snagReport.overallCondition}</p>
                </div>

                {/* Future Maintenance */}
                {report.snagReport.futureMaintenanceSchedule?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Future Maintenance Schedule</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Task</th>
                            <th className="text-left py-2">Frequency</th>
                            <th className="text-right py-2">Estimated Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.snagReport.futureMaintenanceSchedule.map((task: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{task.task}</td>
                              <td className="py-2">{task.frequency}</td>
                              <td className="py-2 text-right font-semibold">{formatCurrency(task.estimatedCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default CivilMepReportDetail;