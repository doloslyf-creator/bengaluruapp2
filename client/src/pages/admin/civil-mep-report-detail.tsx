import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Building,
  Award,
  IndianRupee,
  Home,
  Zap,
  Shield,
  Wrench,
  CheckCircle,
  ArrowLeft,
  Download,
  FileText,
} from "lucide-react";

const CivilMepReportDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useQuery({
    queryKey: [`/api/civil-mep-reports/${id}`],
  });

  const downloadPDFMutation = useMutation({
    mutationFn: () => apiRequest(`/api/civil-mep-reports/${id}/download-pdf`, {
      method: "POST",
    }),
    onSuccess: () => {
      toast({
        title: "PDF Downloaded",
        description: "The PDF report has been generated and downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateCertificateMutation = useMutation({
    mutationFn: () => apiRequest(`/api/civil-mep-reports/${id}/generate-certificate`, {
      method: "POST",
    }),
    onSuccess: () => {
      toast({
        title: "Certificate Generated",
        description: "The engineering certificate has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading report...</div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="p-6">Report not found</div>
      </AdminLayout>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
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
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin-panel/civil-mep-reports")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CIVIL+MEP Report #{report?.id}</h1>
              <p className="text-sm text-gray-500">Generated {new Date(report?.reportDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => downloadPDFMutation.mutate()}
              disabled={downloadPDFMutation.isPending}
            >
              <Download className="h-3 w-3 mr-1" />
              {downloadPDFMutation.isPending ? "Downloading..." : "PDF"}
            </Button>
            <Button 
              size="sm"
              onClick={() => generateCertificateMutation.mutate()}
              disabled={generateCertificateMutation.isPending}
            >
              <FileText className="h-3 w-3 mr-1" />
              {generateCertificateMutation.isPending ? "Generating..." : "Certificate"}
            </Button>
          </div>
        </div>

        {/* Compact Report Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Building className="h-4 w-4 mr-2" />
              Report Overview
              <Badge className={`ml-auto ${getScoreColor(report?.overallScore || 0)} bg-opacity-10`}>
                Score: {report?.overallScore}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Version</p>
                <p className="text-sm font-medium">v{report?.reportVersion}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{report?.reportType?.toUpperCase()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Recommendation</p>
                <Badge variant={report?.investmentRecommendation === 'recommended' ? 'default' : 'secondary'} className="text-xs">
                  {report?.investmentRecommendation}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Maintenance Cost</p>
                <p className="text-sm font-medium">₹{report?.estimatedMaintenanceCost?.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Executive Summary</p>
              <p className="text-sm leading-relaxed">{report?.executiveSummary}</p>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Generated by {report?.generatedBy}
            </div>
          </CardContent>
        </Card>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Structural Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <Home className="h-4 w-4 mr-2" />
                Structural Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Safety Score</p>
                  <p className="font-semibold">{report?.structuralAnalysis?.structuralSafety}/10</p>
                </div>
                <div>
                  <p className="text-gray-500">Foundation</p>
                  <p className="font-semibold truncate">{report?.structuralAnalysis?.foundationType?.split(' ')[0]}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <p className="text-gray-600 mb-1">System</p>
                <p>{report?.structuralAnalysis?.structuralSystem}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quality Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2" />
                Quality Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(report?.qualityAssessment?.overallQuality || 0)}`}>
                  {report?.qualityAssessment?.overallQuality}/10
                </div>
                <p className="text-xs text-gray-500">Overall Quality</p>
              </div>
              <div className="flex justify-between text-xs">
                <Badge className={`text-xs ${getGradeColor(report?.qualityAssessment?.workmanshipGrade || '')}`}>
                  Work: {report?.qualityAssessment?.workmanshipGrade}
                </Badge>
                <Badge className={`text-xs ${getGradeColor(report?.qualityAssessment?.materialGrade || '')}`}>
                  Material: {report?.qualityAssessment?.materialGrade}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <IndianRupee className="h-4 w-4 mr-2" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  ₹{((report?.costBreakdown?.totalEstimatedCost || 0) / 10000000).toFixed(1)}Cr
                </div>
                <p className="text-xs text-gray-500">Total Cost</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Civil Work</span>
                  <span>₹{((report?.costBreakdown?.civilWork || 0) / 1000000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span>MEP Work</span>
                  <span>₹{((report?.costBreakdown?.mepWork || 0) / 1000000).toFixed(1)}L</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact MEP Systems */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Zap className="h-4 w-4 mr-2" />
              MEP Systems Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium">Electrical</span>
                </div>
                <p className="text-xs text-gray-600">Load: {report?.mepSystems?.electrical?.loadCapacity}</p>
                <p className="text-xs text-gray-600">Efficiency: {report?.mepSystems?.electrical?.energyEfficiency}/10</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Home className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium">Plumbing</span>
                </div>
                <p className="text-xs text-gray-600">Supply: {report?.mepSystems?.plumbing?.waterSupplySystem?.split(' ')[0]}</p>
                <p className="text-xs text-gray-600">Pressure: {report?.mepSystems?.plumbing?.pressureRating}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Wrench className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm font-medium">HVAC</span>
                </div>
                <p className="text-xs text-gray-600">System: {report?.mepSystems?.hvac?.ventilationSystem?.split(' ')[0]}</p>
                <p className="text-xs text-gray-600">Rating: {report?.mepSystems?.hvac?.energyRating}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium">Fire Safety</span>
                </div>
                <p className="text-xs text-gray-600">Detection: {report?.mepSystems?.fireSuppressionSystem?.fireDetection?.split(' ')[0]}</p>
                <p className="text-xs text-gray-600">Exits: {report?.mepSystems?.fireSuppressionSystem?.emergencyExits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Compliance Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <CheckCircle className="h-4 w-4 mr-2" />
              Compliance & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className={`h-5 w-5 ${report?.complianceChecklist?.buildingCodes?.compliant ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <p className="text-xs font-medium">Building Codes</p>
                <Badge variant={report?.complianceChecklist?.buildingCodes?.compliant ? 'default' : 'destructive'} className="text-xs">
                  {report?.complianceChecklist?.buildingCodes?.compliant ? 'Compliant' : 'Non-Compliant'}
                </Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-xs font-medium">Fire NOC</p>
                <Badge variant="secondary" className="text-xs">
                  {report?.complianceChecklist?.fireNOC?.status}
                </Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs font-medium">Overall Rating</p>
                <Badge className={`text-xs ${report?.investmentRecommendation === 'recommended' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {report?.investmentRecommendation}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CivilMepReportDetail;