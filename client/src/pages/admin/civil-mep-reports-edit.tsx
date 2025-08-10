import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, FileText, Building, Wrench, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Property, CivilMepReport } from "@shared/schema";

interface SectionField {
  label: string;
  key: string;
  type: "text" | "select" | "rating";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ReportSection {
  title: string;
  key: string;
  fields: SectionField[];
}

// Define all the sections for the Civil+MEP report
const civilSections: ReportSection[] = [
  {
    title: "Site Information",
    key: "siteInformation",
    fields: [
      { label: "Project Name", key: "projectName", type: "text", placeholder: "Enter project name" },
      { label: "Location", key: "location", type: "text", placeholder: "Enter location" },
      { label: "Plot Area (sq.ft)", key: "plotArea", type: "text", placeholder: "Enter plot area" },
      { label: "Built-up Area (sq.ft)", key: "builtUpArea", type: "text", placeholder: "Enter built-up area" },
      { 
        label: "Soil Type", 
        key: "soilType", 
        type: "select",
        options: [
          { value: "rocky", label: "Rocky" },
          { value: "sandy", label: "Sandy" },
          { value: "clayey", label: "Clayey" },
          { value: "loamy", label: "Loamy" },
          { value: "mixed", label: "Mixed" }
        ]
      },
      { 
        label: "Site Condition", 
        key: "siteCondition", 
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "poor", label: "Poor" }
        ]
      }
    ]
  },
  {
    title: "Foundation Details",
    key: "foundationDetails",
    fields: [
      { 
        label: "Foundation Type", 
        key: "foundationType", 
        type: "select",
        options: [
          { value: "isolated", label: "Isolated Footing" },
          { value: "combined", label: "Combined Footing" },
          { value: "raft", label: "Raft Foundation" },
          { value: "pile", label: "Pile Foundation" },
          { value: "strip", label: "Strip Foundation" }
        ]
      },
      { label: "Foundation Depth (ft)", key: "foundationDepth", type: "text", placeholder: "Enter depth" },
      { 
        label: "Concrete Grade", 
        key: "concreteGrade", 
        type: "select",
        options: [
          { value: "M15", label: "M15" },
          { value: "M20", label: "M20" },
          { value: "M25", label: "M25" },
          { value: "M30", label: "M30" },
          { value: "M35", label: "M35" }
        ]
      },
      { 
        label: "Foundation Condition", 
        key: "foundationCondition", 
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "needs_repair", label: "Needs Repair" }
        ]
      },
      { label: "Waterproofing", key: "waterproofing", type: "text", placeholder: "Describe waterproofing" }
    ]
  },
  {
    title: "Superstructure Details",
    key: "superstructureDetails",
    fields: [
      { 
        label: "Structure Type", 
        key: "structureType", 
        type: "select",
        options: [
          { value: "rcc_framed", label: "RCC Framed" },
          { value: "load_bearing", label: "Load Bearing" },
          { value: "steel_framed", label: "Steel Framed" },
          { value: "composite", label: "Composite" }
        ]
      },
      { label: "Number of Floors", key: "numberOfFloors", type: "text", placeholder: "Enter number of floors" },
      { label: "Floor Height (ft)", key: "floorHeight", type: "text", placeholder: "Enter floor height" },
      { label: "Column Size", key: "columnSize", type: "text", placeholder: "e.g., 12x18 inches" },
      { label: "Beam Size", key: "beamSize", type: "text", placeholder: "e.g., 9x12 inches" },
      { label: "Slab Thickness (inches)", key: "slabThickness", type: "text", placeholder: "Enter thickness" },
      { 
        label: "Structural Condition", 
        key: "structuralCondition", 
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "needs_repair", label: "Needs Repair" }
        ]
      }
    ]
  }
];

const mepSections: ReportSection[] = [
  {
    title: "Electrical Systems",
    key: "electricalSystems",
    fields: [
      { label: "Connected Load (KW)", key: "connectedLoad", type: "text", placeholder: "Enter connected load" },
      { label: "Sanctioned Load (KW)", key: "sanctionedLoad", type: "text", placeholder: "Enter sanctioned load" },
      { 
        label: "Power Backup", 
        key: "powerBackup", 
        type: "select",
        options: [
          { value: "100%", label: "100% Backup" },
          { value: "partial", label: "Partial Backup" },
          { value: "none", label: "No Backup" }
        ]
      },
      { label: "DG Capacity (KVA)", key: "dgCapacity", type: "text", placeholder: "Enter DG capacity" },
      { 
        label: "Electrical Safety", 
        key: "electricalSafety", 
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "poor", label: "Poor" }
        ]
      },
      { label: "Earthing System", key: "earthingSystem", type: "text", placeholder: "Describe earthing system" }
    ]
  },
  {
    title: "Plumbing Systems",
    key: "plumbingSystems",
    fields: [
      { 
        label: "Water Source", 
        key: "waterSource", 
        type: "select",
        options: [
          { value: "municipal", label: "Municipal Supply" },
          { value: "borewell", label: "Borewell" },
          { value: "tanker", label: "Tanker Supply" },
          { value: "mixed", label: "Mixed Sources" }
        ]
      },
      { label: "Water Storage Capacity (Liters)", key: "waterStorage", type: "text", placeholder: "Enter capacity" },
      { 
        label: "Drainage System", 
        key: "drainageSystem", 
        type: "select",
        options: [
          { value: "underground", label: "Underground Drainage" },
          { value: "septic_tank", label: "Septic Tank" },
          { value: "stp", label: "STP" }
        ]
      },
      { 
        label: "Plumbing Condition", 
        key: "plumbingCondition", 
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "needs_repair", label: "Needs Repair" }
        ]
      },
      { label: "Water Quality", key: "waterQuality", type: "text", placeholder: "Describe water quality" }
    ]
  },
  {
    title: "HVAC Systems",
    key: "mechanicalSystems",
    fields: [
      { 
        label: "AC Type", 
        key: "acType", 
        type: "select",
        options: [
          { value: "central", label: "Central AC" },
          { value: "split", label: "Split AC" },
          { value: "vrf", label: "VRF System" },
          { value: "none", label: "No AC" }
        ]
      },
      { label: "AC Capacity (Tons)", key: "acCapacity", type: "text", placeholder: "Enter AC capacity" },
      { 
        label: "Ventilation System", 
        key: "ventilationSystem", 
        type: "select",
        options: [
          { value: "natural", label: "Natural Ventilation" },
          { value: "mechanical", label: "Mechanical Ventilation" },
          { value: "mixed", label: "Mixed Mode" }
        ]
      },
      { 
        label: "HVAC Condition", 
        key: "hvacCondition", 
        type: "select",
        options: [
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "needs_repair", label: "Needs Repair" }
        ]
      }
    ]
  },
  {
    title: "Fire Safety Systems",
    key: "fireSafetySystems",
    fields: [
      { 
        label: "Fire Detection System", 
        key: "fireDetection", 
        type: "select",
        options: [
          { value: "addressable", label: "Addressable System" },
          { value: "conventional", label: "Conventional System" },
          { value: "none", label: "Not Installed" }
        ]
      },
      { 
        label: "Fire Fighting System", 
        key: "fireFighting", 
        type: "select",
        options: [
          { value: "sprinkler", label: "Sprinkler System" },
          { value: "hydrant", label: "Hydrant System" },
          { value: "extinguishers", label: "Fire Extinguishers Only" },
          { value: "none", label: "Not Installed" }
        ]
      },
      { 
        label: "Fire NOC Status", 
        key: "fireNocStatus", 
        type: "select",
        options: [
          { value: "obtained", label: "Obtained" },
          { value: "in_process", label: "In Process" },
          { value: "not_obtained", label: "Not Obtained" }
        ]
      },
      { label: "Emergency Exits", key: "emergencyExits", type: "text", placeholder: "Number and condition" }
    ]
  }
];

export default function CivilMepReportsEdit() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<any>({});

  // Fetch existing report
  const { data: report, isLoading } = useQuery<CivilMepReport>({
    queryKey: [`/api/civil-mep-reports/${id}`],
    enabled: !!id,
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Load existing data when report is fetched
  useEffect(() => {
    if (report) {
      const sectionData: any = {};
      
      // Extract section data from report
      civilSections.forEach(section => {
        if (report[section.key as keyof CivilMepReport]) {
          sectionData[section.key] = report[section.key as keyof CivilMepReport];
        }
      });
      
      mepSections.forEach(section => {
        if (report[section.key as keyof CivilMepReport]) {
          sectionData[section.key] = report[section.key as keyof CivilMepReport];
        }
      });
      
      setFormData(sectionData);
    }
  }, [report]);

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch(`/api/civil-mep-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/civil-mep-reports"] });
      queryClient.invalidateQueries({ queryKey: [`/api/civil-mep-reports/${id}`] });
      toast({ title: "Civil+MEP report updated successfully" });
      navigate("/admin-panel/reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFieldChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    // Get basic fields
    const basicData = {
      propertyId: form.get("propertyId") as string,
      reportTitle: form.get("reportTitle") as string,
      engineerName: form.get("engineerName") as string,
      engineerLicense: form.get("engineerLicense") as string,
      inspectionDate: form.get("inspectionDate") as string,
      reportDate: form.get("reportDate") as string,
      status: form.get("status") as string || "draft",
      overallScore: parseFloat(form.get("overallScore") as string || "0"),
      executiveSummary: form.get("executiveSummary") as string,
      recommendations: form.get("recommendations") as string,
      conclusions: form.get("conclusions") as string,
      investmentRecommendation: form.get("investmentRecommendation") as string || "conditional",
    };

    // Combine with section data
    const reportData = {
      ...basicData,
      ...formData
    };

    updateReportMutation.mutate(reportData);
  };

  const renderSectionFields = (section: ReportSection) => {
    const sectionData = formData[section.key] || {};
    
    return section.fields.map((field) => (
      <div key={field.key}>
        <Label htmlFor={`${section.key}-${field.key}`}>{field.label}</Label>
        {field.type === "text" ? (
          <Input
            id={`${section.key}-${field.key}`}
            placeholder={field.placeholder}
            value={sectionData[field.key] || ""}
            onChange={(e) => handleFieldChange(section.key, field.key, e.target.value)}
          />
        ) : field.type === "select" ? (
          <Select 
            value={sectionData[field.key] || ""}
            onValueChange={(value) => handleFieldChange(section.key, field.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Report not found</p>
          <Button onClick={() => navigate("/admin-panel/reports")} className="mt-4">
            Back to Reports
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin-panel/reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Civil+MEP Report</h1>
              <p className="text-sm text-muted-foreground">
                Update engineering assessment report
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="civil">Civil</TabsTrigger>
              <TabsTrigger value="mep">MEP</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Report Information</CardTitle>
                  <CardDescription>Update the basic details for this report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyId">Property *</Label>
                      <Select name="propertyId" defaultValue={report.propertyId || ""} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name} - {property.area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reportTitle">Report Title *</Label>
                      <Input
                        name="reportTitle"
                        defaultValue={report.reportTitle}
                        placeholder="Enter report title"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="engineerName">Engineer Name *</Label>
                      <Input
                        name="engineerName"
                        defaultValue={report.engineerName}
                        placeholder="Enter engineer name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="engineerLicense">Engineer License *</Label>
                      <Input
                        name="engineerLicense"
                        defaultValue={report.engineerLicense}
                        placeholder="Enter license number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inspectionDate">Inspection Date *</Label>
                      <Input
                        type="date"
                        name="inspectionDate"
                        defaultValue={report.inspectionDate}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportDate">Report Date *</Label>
                      <Input
                        type="date"
                        name="reportDate"
                        defaultValue={report.reportDate}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={report.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="overallScore">Overall Score (0-10)</Label>
                      <Input
                        type="number"
                        name="overallScore"
                        min="0"
                        max="10"
                        step="0.1"
                        defaultValue={report.overallScore || 0}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Civil Engineering Tab */}
            <TabsContent value="civil" className="space-y-6">
              {civilSections.map((section) => (
                <Card key={section.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderSectionFields(section)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* MEP Systems Tab */}
            <TabsContent value="mep" className="space-y-6">
              {mepSections.map((section) => (
                <Card key={section.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderSectionFields(section)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>Update executive summary and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="executiveSummary">Executive Summary</Label>
                    <Textarea
                      name="executiveSummary"
                      defaultValue={report.executiveSummary || ""}
                      placeholder="Provide a comprehensive executive summary..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <Textarea
                      name="recommendations"
                      defaultValue={report.recommendations || ""}
                      placeholder="List key recommendations..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="conclusions">Conclusions</Label>
                    <Textarea
                      name="conclusions"
                      defaultValue={report.conclusions || ""}
                      placeholder="Provide final conclusions..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="investmentRecommendation">Investment Recommendation</Label>
                    <Select name="investmentRecommendation" defaultValue={report.investmentRecommendation || "conditional"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
                        <SelectItem value="recommended">Recommended</SelectItem>
                        <SelectItem value="conditional">Conditional</SelectItem>
                        <SelectItem value="not-recommended">Not Recommended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Review your updates before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Please review all the information you've updated in the previous tabs.
                      Make sure all required fields are filled and the data is accurate.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Basic Information</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Civil Engineering Details</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>MEP Systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Summary & Recommendations</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={updateReportMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateReportMutation.isPending ? "Updating Report..." : "Update Report"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
}