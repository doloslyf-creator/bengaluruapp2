import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Save, ArrowLeft, Building, CheckCircle, AlertTriangle,
  Wrench, Zap, Shield, Home, Upload, Eye, Plus, X, Camera, Image, Download
} from "lucide-react";
import { FormSkeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/layout/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from '@uppy/core';

interface Finding {
  id: string;
  text: string;
  images: string[];
}

interface ReportSection {
  id: string;
  title: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  findings: Finding[];
  recommendations: string[];
}

const CreateCivilMepReport = () => {
  const [location] = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  
  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const propertyId = urlParams.get('propertyId');
    const editMode = urlParams.get('edit') === 'true';
    
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
    if (editMode) {
      setIsEditMode(true);
    }
  }, [location]);
  
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
      findings: [
        { id: '1', text: 'High-quality concrete used in foundation', images: [] },
        { id: '2', text: 'Proper reinforcement placement verified', images: [] }
      ],
      recommendations: ['Continue regular maintenance schedule']
    },
    {
      id: 'electrical',
      title: 'Electrical Systems',
      score: 9.0,
      status: 'excellent',
      findings: [
        { id: '3', text: 'Modern wiring throughout', images: [] },
        { id: '4', text: 'Proper earthing system in place', images: [] }
      ],
      recommendations: ['No immediate actions required']
    },
    {
      id: 'plumbing',
      title: 'Plumbing Infrastructure',
      score: 8.0,
      status: 'good',
      findings: [
        { id: '5', text: 'Quality pipes and fittings', images: [] },
        { id: '6', text: 'Good water pressure throughout', images: [] }
      ],
      recommendations: ['Minor leak repairs in basement area']
    },
    {
      id: 'hvac',
      title: 'HVAC Systems',
      score: 8.7,
      status: 'excellent',
      findings: [
        { id: '7', text: 'Efficient air circulation', images: [] },
        { id: '8', text: 'Modern HVAC units installed', images: [] }
      ],
      recommendations: ['Regular filter maintenance']
    },
    {
      id: 'fire-safety',
      title: 'Fire Safety Systems',
      score: 9.2,
      status: 'excellent',
      findings: [
        { id: '9', text: 'Comprehensive sprinkler system', images: [] },
        { id: '10', text: 'Multiple emergency exits', images: [] }
      ],
      recommendations: ['Annual fire system inspection']
    }
  ]);

  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{id: string, name: string, url: string}>>([]);
  const [showPreview, setShowPreview] = useState(false);
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

  // Fetch existing report data when in edit mode
  const { data: existingReport } = useQuery({
    queryKey: [`/api/civil-mep-reports/property/${selectedPropertyId}`],
    enabled: isEditMode && !!selectedPropertyId,
    queryFn: async () => {
      const response = await fetch(`/api/civil-mep-reports/property/${selectedPropertyId}`);
      if (!response.ok) throw new Error("Failed to fetch existing report");
      return response.json();
    }
  });

  // Populate form when existing report data is loaded
  useEffect(() => {
    if (existingReport && isEditMode) {
      setReportData({
        reportTitle: existingReport.reportTitle || "",
        engineerName: existingReport.engineerName || "",
        engineerLicense: existingReport.engineerLicense || "",
        inspectionDate: existingReport.inspectionDate || "",
        reportDate: existingReport.reportDate || "",
        executiveSummary: existingReport.executiveSummary || "",
        overallScore: existingReport.overallScore || 8.5,
        structuralScore: existingReport.structuralScore || 8.5,
        mepScore: existingReport.mepScore || 9.0,
        complianceScore: existingReport.complianceScore || 8.7,
        recommendations: existingReport.recommendations || "",
        conclusions: existingReport.conclusions || ""
      });
      
      if (existingReport.sections) {
        setReportSections(existingReport.sections);
      }
    }
  }, [existingReport, isEditMode]);

  // Handle document upload
  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/documents/upload", {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to get upload parameters");
    const { uploadURL } = await response.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const newDocuments = result.successful.map((file) => ({
        id: file.id || Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: file.uploadURL || ""
      }));
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      toast({
        title: "Documents uploaded",
        description: `${newDocuments.length} document(s) uploaded successfully`,
      });
    }
  };

  // Handle template loading
  const handleLoadTemplate = () => {
    const templateData = {
      reportTitle: "Standard CIVIL+MEP Inspection Report",
      engineerName: "Chief Inspector",
      engineerLicense: "CE-2024-001",
      inspectionDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      executiveSummary: "Comprehensive inspection of civil and MEP systems conducted as per industry standards.",
      overallScore: 8.5,
      structuralScore: 8.5,
      mepScore: 9.0,
      complianceScore: 8.7,
      recommendations: "Continue regular maintenance schedule for optimal performance.",
      conclusions: "Property shows excellent structural integrity and MEP system performance."
    };
    setReportData(templateData);
    toast({
      title: "Template loaded",
      description: "Standard template has been applied to the form",
    });
  };

  // Create/Update report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const url = isEditMode 
        ? `/api/civil-mep-reports/property/${selectedPropertyId}`
        : "/api/civil-mep-reports";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} report`);
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
        ? { 
            ...section, 
            findings: [...section.findings, { id: Date.now().toString(), text: "", images: [] }]
          }
        : section
    ));
  };

  const updateFinding = (sectionId: string, findingId: string, field: 'text' | 'images', value: string | string[]) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            findings: section.findings.map(finding => 
              finding.id === findingId 
                ? { ...finding, [field]: value }
                : finding
            )
          }
        : section
    ));
  };

  const removeFinding = (sectionId: string, findingId: string) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            findings: section.findings.filter(finding => finding.id !== findingId)
          }
        : section
    ));
  };

  const handleImageUpload = (sectionId: string, findingId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const imageUrls: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageUrls.push(e.target.result as string);
          if (imageUrls.length === files.length) {
            updateFinding(sectionId, findingId, 'images', imageUrls);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (sectionId: string, findingId: string, imageIndex: number) => {
    setReportSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            findings: section.findings.map(finding => 
              finding.id === findingId 
                ? { 
                    ...finding, 
                    images: finding.images.filter((_, i) => i !== imageIndex)
                  }
                : finding
            )
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
    <AdminLayout 
      title={isEditMode ? "Edit CIVIL+MEP Report" : "Create CIVIL+MEP Report"} 
      subtitle={isEditMode ? "Update comprehensive property engineering analysis" : "Generate comprehensive property engineering analysis"}
    >
      <div className="p-6 max-w-6xl mx-auto">
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
                  {isEditMode ? "Edit CIVIL+MEP Report" : "Create CIVIL+MEP Report"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isEditMode 
                    ? "Update comprehensive engineering analysis report for the property" 
                    : "Generate comprehensive engineering analysis report for a property"
                  }
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
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Report" : "Create Report"}
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
                    <Select 
                      value={selectedPropertyId} 
                      onValueChange={setSelectedPropertyId}
                      disabled={isEditMode}
                    >
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
                    {isEditMode && (
                      <p className="text-sm text-gray-500 mt-1">
                        Property selection is locked when editing an existing report
                      </p>
                    )}
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
                      <div className="space-y-4">
                        {section.findings.map((finding) => (
                          <div key={finding.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start space-x-2">
                              <Input
                                value={finding.text}
                                onChange={(e) => updateFinding(section.id, finding.id, 'text', e.target.value)}
                                placeholder="Enter finding..."
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFinding(section.id, finding.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Image Upload Section */}
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Label className="text-sm">Supporting Images</Label>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(section.id, finding.id, e)}
                                  className="hidden"
                                  id={`image-upload-${section.id}-${finding.id}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(`image-upload-${section.id}-${finding.id}`)?.click()}
                                >
                                  <Camera className="h-4 w-4 mr-1" />
                                  Add Images
                                </Button>
                              </div>
                              
                              {/* Image Preview Grid */}
                              {finding.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {finding.images.map((image, imageIndex) => (
                                    <div key={imageIndex} className="relative group">
                                      <img
                                        src={image}
                                        alt={`Finding evidence ${imageIndex + 1}`}
                                        className="w-full h-20 object-cover rounded border"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(section.id, finding.id, imageIndex)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
                <ObjectUploader
                  maxNumberOfFiles={10}
                  maxFileSize={52428800}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </ObjectUploader>
                
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Report Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold">{reportData.reportTitle || "Untitled Report"}</h1>
                        <p className="text-sm text-gray-600 mt-2">CIVIL+MEP Engineering Report</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Engineer:</strong> {reportData.engineerName}</div>
                        <div><strong>License:</strong> {reportData.engineerLicense}</div>
                        <div><strong>Inspection Date:</strong> {reportData.inspectionDate}</div>
                        <div><strong>Report Date:</strong> {reportData.reportDate}</div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Executive Summary</h3>
                        <p className="text-sm">{reportData.executiveSummary}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-green-600">{reportData.overallScore}</div>
                          <div className="text-xs text-gray-600">Overall Score</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-blue-600">{reportData.structuralScore}</div>
                          <div className="text-xs text-gray-600">Structural</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-2xl font-bold text-purple-600">{reportData.mepScore}</div>
                          <div className="text-xs text-gray-600">MEP Systems</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Sections Overview</h3>
                        <div className="space-y-2">
                          {reportSections.map((section) => (
                            <div key={section.id} className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm">{section.title}</span>
                              <Badge className={
                                section.status === 'excellent' ? 'bg-green-100 text-green-800' :
                                section.status === 'good' ? 'bg-blue-100 text-blue-800' :
                                section.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {section.score}/10
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full" onClick={handleLoadTemplate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </CardContent>
            </Card>

            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate">{doc.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUploadedDocuments(prev => prev.filter(d => d.id !== doc.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateCivilMepReport;