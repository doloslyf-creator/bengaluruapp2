import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Building, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Star,
  Download,
  Edit
} from "lucide-react";

interface LegalAuditReportViewProps {
  params: {
    id: string;
  };
}

export function LegalAuditReportView({ params }: LegalAuditReportViewProps) {
  const [, setLocation] = useLocation();
  const reportId = params.id;

  const { data: report, isLoading } = useQuery<any>({
    queryKey: [`/api/legal-audit-reports/${reportId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
          <p className="text-muted-foreground mb-4">The legal audit report you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/admin-panel/legal-audit-reports")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft", icon: Clock },
      "in-progress": { variant: "default" as const, label: "In Progress", icon: Clock },
      completed: { variant: "default" as const, label: "Completed", icon: CheckCircle },
      approved: { variant: "default" as const, label: "Approved", icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      low: { variant: "default" as const, label: "Low Risk", className: "bg-green-100 text-green-800", icon: CheckCircle },
      medium: { variant: "secondary" as const, label: "Medium Risk", className: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      high: { variant: "destructive" as const, label: "High Risk", className: "bg-orange-100 text-orange-800", icon: AlertTriangle },
      critical: { variant: "destructive" as const, label: "Critical Risk", className: "bg-red-100 text-red-800", icon: XCircle },
    };
    
    const config = riskConfig[riskLevel as keyof typeof riskConfig] || riskConfig.medium;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const parseJSON = (jsonString: string | object) => {
    if (typeof jsonString === 'object') return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  const currentOwnership = parseJSON(report.currentOwnership || '{}');
  const titleVerification = parseJSON(report.titleVerification || '{}');
  const statutoryApprovals = parseJSON(report.statutoryApprovals || '{}');
  const taxCompliance = parseJSON(report.taxCompliance || '{}');
  const litigationHistory = parseJSON(report.litigationHistory || '{}');
  const complianceStatus = parseJSON(report.complianceStatus || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/admin-panel/legal-audit-reports")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{report.reportTitle}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {report.lawyerName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(report.reportDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Property ID: {report.propertyId}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(report.status)}
              {getRiskBadge(report.riskLevel)}
              <Button 
                onClick={() => setLocation(`/admin-panel/legal-audit-reports/${report.id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Legal Audit Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">Overall Score</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-blue-900">{report.overallScore || 0}/100</span>
                  </div>
                </div>
                
                <nav className="space-y-1 mt-4">
                  <a href="#executive-summary" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    Executive Summary
                  </a>
                  <a href="#ownership-title" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    Ownership & Title
                  </a>
                  <a href="#legal-documentation" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    Legal Documentation
                  </a>
                  <a href="#compliance-status" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    Compliance Status
                  </a>
                  <a href="#risk-assessment" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    Risk Assessment
                  </a>
                  <a href="#recommendations" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    Recommendations
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Executive Summary */}
            <Card id="executive-summary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.executiveSummary ? (
                  <p className="text-slate-700 leading-relaxed">{report.executiveSummary}</p>
                ) : (
                  <p className="text-slate-500 italic">No executive summary provided.</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Audit Date</div>
                    <div className="font-semibold text-slate-900">{formatDate(report.auditDate)}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Lawyer Bar Number</div>
                    <div className="font-semibold text-slate-900">{report.lawyerBarNumber}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Risk Level</div>
                    <div className="font-semibold text-slate-900 capitalize">{report.riskLevel} Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Ownership & Title */}
            <Card id="ownership-title">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Property Ownership & Title Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Current Ownership</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Owner Name</div>
                      <div className="font-medium text-slate-900">{currentOwnership.ownerName || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Ownership Type</div>
                      <div className="font-medium text-slate-900">{currentOwnership.ownershipType || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Acquisition Date</div>
                      <div className="font-medium text-slate-900">
                        {currentOwnership.acquisitionDate ? formatDate(currentOwnership.acquisitionDate) : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Acquisition Mode</div>
                      <div className="font-medium text-slate-900">{currentOwnership.acquisitionMode || 'Not specified'}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Title Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Title Deed Number</div>
                      <div className="font-medium text-slate-900">{titleVerification.titleDeedNumber || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Registration Date</div>
                      <div className="font-medium text-slate-900">
                        {titleVerification.registrationDate ? formatDate(titleVerification.registrationDate) : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Registrar Office</div>
                      <div className="font-medium text-slate-900">{titleVerification.registrarOffice || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Title Clarity</div>
                      <div className="font-medium text-slate-900 capitalize">
                        {titleVerification.titleClarity || 'Not assessed'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Documentation */}
            <Card id="legal-documentation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Legal Documentation & Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Statutory Approvals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">RERA Registration</span>
                      {statutoryApprovals.reraRegistration ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">Plan Approval</span>
                      {statutoryApprovals.planApproval ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">Completion Certificate</span>
                      {statutoryApprovals.completionCertificate ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">Occupancy Certificate</span>
                      {statutoryApprovals.occupancyCertificate ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  {statutoryApprovals.reraNumber && (
                    <div className="mt-4">
                      <div className="text-sm text-slate-600">RERA Number</div>
                      <div className="font-medium text-slate-900">{statutoryApprovals.reraNumber}</div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Tax Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Property Tax Status</div>
                      <div className="font-medium text-slate-900 capitalize">
                        {taxCompliance.propertyTaxStatus || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Khata Status</div>
                      <div className="font-medium text-slate-900 uppercase">
                        {taxCompliance.khataStatus || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Survey Number</div>
                      <div className="font-medium text-slate-900">{taxCompliance.surveyNumber || 'Not specified'}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">DC Conversion</span>
                      {taxCompliance.dcConversion ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card id="compliance-status">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Municipal Compliance</span>
                    {complianceStatus.municipalCompliance ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Fire NOC</span>
                    {complianceStatus.fireNocStatus ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Pollution Clearance</span>
                    {complianceStatus.pollutionClearance ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Legal Water Connection</span>
                    {complianceStatus.waterConnectionLegal ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Legal Electricity Connection</span>
                    {complianceStatus.electricityConnectionLegal ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card id="risk-assessment">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  Legal Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {litigationHistory.pendingCases && litigationHistory.pendingCases.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Pending Cases</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {litigationHistory.pendingCases.map((caseItem: string, index: number) => (
                        <li key={index}>{caseItem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {litigationHistory.pastDisputes && litigationHistory.pastDisputes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Past Disputes</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {litigationHistory.pastDisputes.map((dispute: string, index: number) => (
                        <li key={index}>{dispute}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!litigationHistory.pendingCases || litigationHistory.pendingCases.length === 0) &&
                 (!litigationHistory.pastDisputes || litigationHistory.pastDisputes.length === 0) && (
                  <p className="text-slate-500 italic">No litigation history recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Key Findings & Recommendations */}
            <Card id="recommendations">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Key Findings & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Key Findings</h3>
                  {report.keyFindings ? (
                    <p className="text-slate-700 leading-relaxed">{report.keyFindings}</p>
                  ) : (
                    <p className="text-slate-500 italic">No key findings documented.</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Recommendations</h3>
                  {report.recommendations ? (
                    <p className="text-slate-700 leading-relaxed">{report.recommendations}</p>
                  ) : (
                    <p className="text-slate-500 italic">No recommendations provided.</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Legal Conclusion</h3>
                  {report.legalConclusion ? (
                    <p className="text-slate-700 leading-relaxed">{report.legalConclusion}</p>
                  ) : (
                    <p className="text-slate-500 italic">No legal conclusion provided.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}