import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReportSampleDialog } from "@/components/report-sample-dialog";
import Header from "@/components/layout/header";
import { ExpertCredentials } from "@/components/expert-credentials";
import Footer from "@/components/layout/footer";
import OrderFormDialog from "@/components/order-form-dialog";
import { usePayment } from "@/hooks/use-payment";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  Building2, 
  Star,
  CheckCircle,
  Filter,
  Users,
  Award,
  FileText,
  TrendingUp,
  Shield,
  Clock,
  FileCheck,
  BarChart3,
  Home,
  Gavel,
  Compass,
  Zap,
  Calculator,
  Eye,
  ChevronRight,
  ArrowRight,
  Play,
  Download,
  Calendar
} from "lucide-react";

// Report Type Definitions
interface ReportType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: any;
  color: string;
  price: number;
  deliveryTime: string;
  features: string[];
  sampleAvailable: boolean;
  popular?: boolean;
  badge?: string;
}

const reportTypes: ReportType[] = [
  {
    id: "property-valuation",
    name: "Property Valuation Report",
    shortName: "Valuation",
    description: "Comprehensive market valuation with investment analysis, rental yield calculations, and price benchmarking",
    icon: Calculator,
    color: "blue",
    price: 2499,
    deliveryTime: "3-5 business days",
    features: [
      "Current Market Valuation",
      "Investment Grade Analysis", 
      "Rental Yield Projections",
      "Price Appreciation Forecast",
      "Location Premium Analysis",
      "Risk Assessment & Recommendations"
    ],
    sampleAvailable: true,
    popular: true,
    badge: "Most Popular"
  },
  {
    id: "civil-mep",
    name: "Civil + MEP Assessment", 
    shortName: "Civil+MEP",
    description: "Technical assessment of structural integrity, electrical systems, plumbing, and construction quality",
    icon: Building2,
    color: "green",
    price: 3499,
    deliveryTime: "5-7 business days",
    features: [
      "Structural Integrity Analysis",
      "Electrical Systems Assessment",
      "Plumbing Quality Check",
      "Fire Safety Compliance", 
      "Ventilation System Review",
      "Construction Quality Grading"
    ],
    sampleAvailable: true
  },
  {
    id: "legal-due-diligence",
    name: "Legal Due Diligence",
    shortName: "Legal",
    description: "Complete legal verification including title verification, approvals, and compliance checks",
    icon: Gavel,
    color: "purple",
    price: 1999,
    deliveryTime: "7-10 business days", 
    features: [
      "Title Deed Verification",
      "RERA Compliance Check",
      "Approvals & Clearances",
      "Encumbrance Certificate",
      "Legal Risk Assessment",
      "Documentation Review"
    ],
    sampleAvailable: false,
    badge: "New"
  },
  {
    id: "vastu-compliance",
    name: "Vastu Compliance Report",
    shortName: "Vastu",
    description: "Traditional Vastu Shastra analysis with modern architectural recommendations for positive energy flow",
    icon: Compass,
    color: "orange",
    price: 1499,
    deliveryTime: "2-3 business days",
    features: [
      "Direction & Layout Analysis",
      "Room Positioning Review",
      "Energy Flow Assessment",
      "Vastu Defect Identification",
      "Remedial Suggestions", 
      "Auspicious Timing Guidance"
    ],
    sampleAvailable: true,
    badge: "Coming Soon"
  }
];

interface Property {
  id: string;
  name: string;
  developer: string;
  location: string;
  locality: string;
  priceRange: string;
  configurations: string[];
  images: string[];
  amenities: string[];
  reraRegistered: boolean;
  qualityScore: number;
  possessionDate: string;
  totalUnits: number;
  availableUnits: number;
}

export default function PropertyReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReportType, setSelectedReportType] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [viewingSampleType, setViewingSampleType] = useState<"property-valuation" | "civil-mep" | "legal-due-diligence" | "vastu-compliance">("property-valuation");
  const { toast } = useToast();
  
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;
    
    const searchLower = searchTerm.toLowerCase();
    return properties.filter((property: Property) =>
      property.name?.toLowerCase().includes(searchLower) ||
      property.developer?.toLowerCase().includes(searchLower) ||
      property.locality?.toLowerCase().includes(searchLower) ||
      property.location?.toLowerCase().includes(searchLower)
    );
  }, [properties, searchTerm]);

  const handleOrderReport = (property: Property, reportType: ReportType) => {
    setSelectedProperty(property);
    setSelectedReport(reportType);
    setIsOrderDialogOpen(true);
  };

  const handleViewSample = (reportType: ReportType) => {
    const sampleTypeMapping: { [key: string]: "property-valuation" | "civil-mep" | "legal-due-diligence" | "vastu-compliance" } = {
      "property-valuation": "property-valuation",
      "civil-mep": "civil-mep", 
      "legal-due-diligence": "legal-due-diligence",
      "vastu-compliance": "vastu-compliance"
    };
    setViewingSampleType(sampleTypeMapping[reportType.id] || "property-valuation");
    setSampleDialogOpen(true);
  };

  const ReportTypeCard = ({ report }: { report: ReportType }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-${report.color}-500 relative overflow-hidden`}>
      {report.badge && (
        <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
          report.popular ? 'bg-blue-100 text-blue-700' : 
          report.badge === 'New' ? 'bg-green-100 text-green-700' : 
          'bg-orange-100 text-orange-700'
        }`}>
          {report.badge}
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg bg-${report.color}-50`}>
            <report.icon className={`h-6 w-6 text-${report.color}-600`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {report.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {report.description}
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">₹{report.price.toLocaleString()}</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {report.deliveryTime}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {report.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                  {feature}
                </div>
              ))}
              {report.features.length > 3 && (
                <div className="text-sm text-gray-500 ml-5">
                  +{report.features.length - 3} more features
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {report.sampleAvailable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => handleViewSample(report)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Sample
                </Button>
              )}
              <Button 
                size="sm" 
                className={`flex items-center bg-${report.color}-600 hover:bg-${report.color}-700`}
                disabled={report.badge === 'Coming Soon'}
              >
                {report.badge === 'Coming Soon' ? 'Coming Soon' : (
                  <>
                    Get Report <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Property Image */}
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-blue-400" />
        </div>
        
        {/* Property Details */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {property.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">by {property.developer}</p>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {property.locality}, {property.location}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{property.qualityScore}/10</span>
              </div>
              {property.reraRegistered && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  RERA Certified
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-xl font-bold text-blue-600 mb-2">
              {property.priceRange}
            </div>
            <div className="flex flex-wrap gap-1">
              {property.configurations?.slice(0, 3).map((config, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {config}
                </Badge>
              ))}
            </div>
          </div>

          {/* Report Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 mb-2">Available Reports:</div>
            {reportTypes.filter(r => r.badge !== 'Coming Soon').map((report) => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <report.icon className={`h-4 w-4 mr-2 text-${report.color}-600`} />
                  <div>
                    <div className="text-sm font-medium">{report.shortName}</div>
                    <div className="text-xs text-gray-500">₹{report.price.toLocaleString()}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleOrderReport(property, report)}
                  className="text-xs px-3 py-1"
                >
                  Order
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Professional Property 
              <span className="block text-blue-200">Intelligence Reports</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Make informed property decisions with comprehensive reports from certified experts. 
              Get detailed analysis, risk assessment, and investment insights.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-300" />
                680+ Properties Analyzed
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-300" />
                RERA Certified Experts
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-300" />
                100% Data Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Types Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Report Type
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each report is crafted by certified professionals with years of experience 
              in the Indian real estate market
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {reportTypes.map((report) => (
              <ReportTypeCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </section>

      {/* Property Search & Selection */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Select Your Property
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our verified property database to generate your report
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by property name, builder, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="w-48 h-12">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    {reportTypes.filter(r => r.badge !== 'Coming Soon').map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.shortName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg">
                  {filteredProperties.length} properties available
                </div>
              </div>
            </div>
          </div>

          {/* Property Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'No properties available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expert Credentials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExpertCredentials reportType="valuation" />
        </div>
      </section>

      {/* Order Dialog */}
      {selectedProperty && selectedReport && (
        <OrderFormDialog
          isOpen={isOrderDialogOpen}
          onClose={() => {
            setIsOrderDialogOpen(false);
            setSelectedProperty(null);
            setSelectedReport(null);
          }}
          propertyName={selectedProperty.name}
          reportType={selectedReport.shortName as "civil-mep" | "valuation"}
          amount={selectedReport.price}
        />
      )}

      {/* Sample Report Dialog */}
      <ReportSampleDialog
        isOpen={sampleDialogOpen}
        onClose={() => setSampleDialogOpen(false)}
        reportType={viewingSampleType}
      />

      <Footer />
    </div>
  );
}