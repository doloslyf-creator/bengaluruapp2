import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  TrendingUp, 
  MapPin, 
  Building2, 
  Calculator,
  Shield,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  BarChart3,
  Award
} from "lucide-react";

interface ReportSampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: "property-valuation" | "civil-mep" | "legal-due-diligence" | "vastu-compliance";
}

const sampleData = {
  "property-valuation": {
    title: "Property Valuation Report - Sample",
    subtitle: "Godrej Park Retreat, Sarjapur Road",
    sections: [
      {
        title: "Market Valuation Summary",
        data: [
          { label: "Current Market Value", value: "₹1.85 - ₹2.1 Cr", status: "excellent" },
          { label: "Location Premium", value: "+18% vs Area Avg", status: "good" },
          { label: "Investment Grade", value: "A- (Excellent)", status: "excellent" },
          { label: "Rental Yield (Annual)", value: "3.8% - 4.2%", status: "good" },
          { label: "5-Year Appreciation", value: "62-75%", status: "excellent" }
        ]
      },
      {
        title: "Location & Connectivity Analysis",
        data: [
          { label: "Connectivity Score", value: "8.7/10", status: "excellent" },
          { label: "Social Infrastructure", value: "Excellent", status: "excellent" },
          { label: "Future Development Score", value: "9.1/10", status: "excellent" },
          { label: "Liquidity Factor", value: "High Demand Zone", status: "good" },
          { label: "Exit Strategy", value: "Multiple Options", status: "good" }
        ]
      }
    ]
  },
  "civil-mep": {
    title: "Civil + MEP Assessment - Sample",
    subtitle: "Prestige Lakeside Habitat, Whitefield",
    sections: [
      {
        title: "Structural Assessment",
        data: [
          { label: "Foundation Quality", value: "Grade A", status: "excellent" },
          { label: "Structural Integrity", value: "Premium Grade", status: "excellent" },
          { label: "Construction Quality", value: "Superior", status: "excellent" },
          { label: "Material Grade", value: "High Quality", status: "good" },
          { label: "Overall Structure", value: "9.2/10", status: "excellent" }
        ]
      },
      {
        title: "MEP Systems Analysis",
        data: [
          { label: "Electrical Systems", value: "BIS Compliant", status: "excellent" },
          { label: "Plumbing Quality", value: "Premium Grade", status: "excellent" },
          { label: "Fire Safety Systems", value: "Fully Installed", status: "excellent" },
          { label: "Ventilation Score", value: "8.9/10", status: "excellent" },
          { label: "MEP Compliance", value: "100% Certified", status: "excellent" }
        ]
      }
    ]
  },
  "legal-due-diligence": {
    title: "Legal Due Diligence - Sample",
    subtitle: "Brigade Cornerstone Utopia, Varthur",
    sections: [
      {
        title: "Title & Ownership Verification",
        data: [
          { label: "Title Deed Status", value: "Clear & Verified", status: "excellent" },
          { label: "RERA Registration", value: "Active & Compliant", status: "excellent" },
          { label: "Approvals Status", value: "All Obtained", status: "excellent" },
          { label: "Encumbrance Check", value: "Clean Record", status: "excellent" },
          { label: "Legal Risk Level", value: "Minimal", status: "excellent" }
        ]
      },
      {
        title: "Compliance & Clearances",
        data: [
          { label: "BBMP Approvals", value: "Obtained", status: "excellent" },
          { label: "Environmental Clearance", value: "Valid", status: "excellent" },
          { label: "Fire NOC", value: "Approved", status: "excellent" },
          { label: "Water & Sewage", value: "Connected", status: "good" },
          { label: "Documentation", value: "Complete", status: "excellent" }
        ]
      }
    ]
  },
  "vastu-compliance": {
    title: "Vastu Compliance Report - Sample",
    subtitle: "Sobha Dream Acres, Thanisandra",
    sections: [
      {
        title: "Direction & Layout Analysis",
        data: [
          { label: "Main Entrance", value: "Northeast (Ideal)", status: "excellent" },
          { label: "Living Area", value: "East Facing", status: "excellent" },
          { label: "Master Bedroom", value: "Southwest", status: "excellent" },
          { label: "Kitchen Placement", value: "Southeast", status: "excellent" },
          { label: "Overall Layout", value: "8.8/10", status: "excellent" }
        ]
      },
      {
        title: "Energy Flow Assessment",
        data: [
          { label: "Positive Energy Zones", value: "78%", status: "good" },
          { label: "Vastu Defects", value: "Minor (2)", status: "warning" },
          { label: "Remedial Required", value: "Simple Fixes", status: "good" },
          { label: "Auspicious Timing", value: "Recommended", status: "good" },
          { label: "Overall Vastu Score", value: "8.4/10", status: "excellent" }
        ]
      }
    ]
  }
};

export function ReportSampleDialog({ isOpen, onClose, reportType }: ReportSampleDialogProps) {
  const sample = sampleData[reportType];
  
  if (!sample) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {sample.title}
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            {sample.subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Sample Report Content */}
        <div className="space-y-8 py-6">
          {/* Header Info */}
          <div className="bg-blue-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sample Report Preview</h3>
                <p className="text-sm text-gray-600">This is a representative sample of the actual report you'll receive</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                <Award className="h-3 w-3 mr-1" />
                Certified Analysis
              </Badge>
            </div>
          </div>

          {/* Report Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sample.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg p-6 bg-white shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {reportType === 'property-valuation' && <Calculator className="h-5 w-5 mr-2 text-blue-600" />}
                  {reportType === 'civil-mep' && <Building2 className="h-5 w-5 mr-2 text-green-600" />}
                  {reportType === 'legal-due-diligence' && <Shield className="h-5 w-5 mr-2 text-purple-600" />}
                  {reportType === 'vastu-compliance' && <Star className="h-5 w-5 mr-2 text-orange-600" />}
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium text-gray-700 ml-2">
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${getStatusColor(item.status)}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sample Features */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">What You Get in the Full Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Detailed 15-20 page analysis
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Professional charts & graphs
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Market comparison data
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Risk assessment matrix
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Investment recommendations
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Site photographs & evidence
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Expert certification
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  PDF + digital dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div>
              <p className="text-sm text-gray-600">
                Interested in getting the complete report for your property?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Reports are delivered within 3-7 business days by certified experts
              </p>
            </div>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Get Full Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}