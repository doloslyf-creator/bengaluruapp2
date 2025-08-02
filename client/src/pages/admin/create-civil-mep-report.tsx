import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Save, ArrowLeft, Building, CheckCircle, AlertTriangle,
  Wrench, Zap, Shield, Home, Upload, Eye, Plus, X
} from "lucide-react";
import { FormSkeleton } from "@/components/ui/skeleton";

interface ReportSection {
  id: string;
  title: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  findings: string[];
  recommendations: string[];
}

const CreateCivilMepReport = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [reportData, setReportData] = useState({
    reportTitle: "",
    engineerName: "",
    engineerLicense: "",
    inspectionDate: "",
    reportDate: "",
    executiveSummary: "",
    overallScore: 8.5,
    structuralScore: 8.5,
    mepScore: 9.0,
    complianceScore: 8.7,
    recommendations: "",
    conclusions: ""
  });
  
  const [reportSections, setReportSections] = useState<ReportSection[]>([
    {
      id: 'foundation',
      title: 'Foundation & Structural Elements',
      score: 8.5,
      status: 'excellent',
      findings: ['High-quality concrete used in foundation', 'Proper reinforcement placement verified'],
      recommendations: ['Continue regular maintenance schedule']
    },
    {
      id: 'electrical',
      title: 'Electrical Systems',
      score: 9.0,
      status: 'excellent',
      findings: ['Modern wiring throughout', 'Proper earthing system in place'],
      recommendations: ['No immediate actions required']
    },
    {
      id: 'plumbing',
      title: 'Plumbing Infrastructure',
      score: 8.0,
      status: 'good',
      findings: ['Quality pipes and fittings', 'Good water pressure throughout'],
      recommendations: ['Minor leak repairs in basement area']
    },
    {
      id: 'hvac',
      title: 'HVAC Systems',
      score: 8.7,
      status: 'excellent',
      findings: ['Efficient air circulation', 'Modern HVAC units installed'],
      recommendations: ['Regular filter maintenance']
    },
    {
      id: 'fire-safety',
      title: 'Fire Safety Systems',
      score: 9.2,
      status: 'excellent',
      findings: ['Comprehensive sprinkler system', 'Multiple emergency exits'],
      recommendations: ['Annual fire system inspection']
    }
  ]);

  const [attachments, setAttachments] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    }
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch("/api/civil-mep-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error("Failed to create report");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CIVIL+MEP report created successfully"
      });
      // Reset form
      setSelectedPropertyId("");
      setReportData({
        reportTitle: "",
        engineerName: "",
        engineerLicense: "",
        inspectionDate: "",
        reportDate: "",
        executiveSummary: "",
        overallScore: 8.5,
        structuralScore: 8.5,
        mepScore: 9.0,
        complianceScore: 8.7,
        recommendations: "",
        conclusions: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create CIVIL+MEP report",
        variant: "destructive"
      });
    }
  });

  const handleSectionUpdate = (sectionId: string, field: string, value: any) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, [field]: value }
        : section
    ));
  };

  const addFinding = (sectionId: string) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, findings: [...section.findings, ""] }
        : section
    ));
  };

  const updateFinding = (sectionId: string, index: number, value: string) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            findings: section.findings.map((finding, i) => i === index ? value : finding)
          }
        : section
    ));
  };

  const removeFinding = (sectionId: string, index: number) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            findings: section.findings.filter((_, i) => i !== index)
          }
        : section
    ));
  };

  const handleSubmit = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Validation Error",
        description: "Please select a property for this report",
        variant: "destructive"
      });
      return;
    }

    if (!reportData.reportTitle || !reportData.engineerName) {
      toast({
        title: "Validation Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const completeReportData = {
      propertyId: selectedPropertyId,
      ...reportData,
      sections: reportSections,
      attachments,
      createdAt: new Date().toISOString(),
      reportId: `CMEP_${Date.now()}`
    };

    createReportMutation.mutate(completeReportData);
  };

  const selectedProperty = properties.find((p: any) => p.id === selectedPropertyId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">PropertyPro Admin</h1>
          <nav className="flex space-x-4">
            <a href="/admin-panel" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/admin-panel/leads" className="text-gray-600 hover:text-gray-900">Leads</a>
            <a href="/admin-panel/blog" className="text-gray-600 hover:text-gray-900">Blog</a>
            <a href="/admin-panel/civil-mep-reports" className="text-violet-600 font-medium">CIVIL+MEP Reports</a>
          </nav>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-violet-600" />
                  Create CIVIL+MEP Report
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate comprehensive engineering analysis report for a property
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={createReportMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {createReportMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Report
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Property Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="property">Select Property *</Label>
                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a property..." />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property: any) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - {property.area}, {property.zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProperty && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">{selectedProperty.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Developer:</span>
                          <p className="font-medium">{selectedProperty.developer}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <p className="font-medium capitalize">{selectedProperty.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <p className="font-medium">{selectedProperty.area}, {selectedProperty.zone}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className="font-medium capitalize">{selectedProperty.status.replace('-', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportTitle">Report Title *</Label>
                    <Input
                      id="reportTitle"
                      value={reportData.reportTitle}
                      onChange={(e) => setReportData(prev => ({ ...prev, reportTitle: e.target.value }))}
                      placeholder="e.g., Comprehensive CIVIL+MEP Analysis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineerName">Lead Engineer *</Label>
                    <Input
                      id="engineerName"
                      value={reportData.engineerName}
                      onChange={(e) => setReportData(prev => ({ ...prev, engineerName: e.target.value }))}
                      placeholder="Engineer Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineerLicense">Engineer License No.</Label>
                    <Input
                      id="engineerLicense"
                      value={reportData.engineerLicense}
                      onChange={(e) => setReportData(prev => ({ ...prev, engineerLicense: e.target.value }))}
                      placeholder="License Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inspectionDate">Inspection Date</Label>
                    <Input
                      id="inspectionDate"
                      type="date"
                      value={reportData.inspectionDate}
                      onChange={(e) => setReportData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="executiveSummary">Executive Summary</Label>
                  <Textarea
                    id="executiveSummary"
                    value={reportData.executiveSummary}
                    onChange={(e) => setReportData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                    placeholder="Brief overview of the property's condition and key findings..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Overall Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="structuralScore">Structural Score (0-10)</Label>
                    <Input
                      id="structuralScore"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={reportData.structuralScore}
                      onChange={(e) => setReportData(prev => ({ ...prev, structuralScore: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mepScore">MEP Score (0-10)</Label>
                    <Input
                      id="mepScore"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={reportData.mepScore}
                      onChange={(e) => setReportData(prev => ({ ...prev, mepScore: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complianceScore">Compliance Score (0-10)</Label>
                    <Input
                      id="complianceScore"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={reportData.complianceScore}
                      onChange={(e) => setReportData(prev => ({ ...prev, complianceScore: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overallScore">Overall Score (0-10)</Label>
                    <Input
                      id="overallScore"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={reportData.overallScore}
                      onChange={(e) => setReportData(prev => ({ ...prev, overallScore: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Assessment Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reportSections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{section.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={section.score}
                          onChange={(e) => handleSectionUpdate(section.id, 'score', parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <Select
                          value={section.status}
                          onValueChange={(value) => handleSectionUpdate(section.id, 'status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Key Findings</Label>
                      <div className="space-y-2">
                        {section.findings.map((finding, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={finding}
                              onChange={(e) => updateFinding(section.id, index, e.target.value)}
                              placeholder="Enter finding..."
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFinding(section.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addFinding(section.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Finding
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Final Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Final Recommendations & Conclusions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recommendations">Key Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={reportData.recommendations}
                    onChange={(e) => setReportData(prev => ({ ...prev, recommendations: e.target.value }))}
                    placeholder="List the main recommendations for property improvement..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="conclusions">Overall Conclusions</Label>
                  <Textarea
                    id="conclusions"
                    value={reportData.conclusions}
                    onChange={(e) => setReportData(prev => ({ ...prev, conclusions: e.target.value }))}
                    placeholder="Summarize the overall assessment and final verdict..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-violet-50 rounded-lg">
                  <div className="text-2xl font-bold text-violet-600">
                    {reportData.overallScore.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-violet-800">Overall Score</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Structural:</span>
                    <span className="font-medium">{reportData.structuralScore.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>MEP Systems:</span>
                    <span className="font-medium">{reportData.mepScore.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compliance:</span>
                    <span className="font-medium">{reportData.complianceScore.toFixed(1)}/10</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    {reportSections.length} sections • {reportData.engineerName || 'Engineer TBD'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Report
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCivilMepReport;