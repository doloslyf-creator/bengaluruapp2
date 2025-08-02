import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  MessageCircle, 
  Upload,
  FileText,
  Scale,
  Calendar,
  User,
  Building,
  HelpCircle,
  Info,
  Shield,
  Home,
  BookOpen,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LegalStep {
  id: number;
  title: string;
  description: string;
  action: string;
  documentsNeeded: string[];
  status: "verified" | "pending" | "not-verified";
  dateVerified?: string;
  notes?: string;
  importance: "critical" | "high" | "medium";
  whyImportant: string;
  howToVerify: string;
  riskLevel: "low" | "medium" | "high";
}

interface LegalTracker {
  propertyId: string;
  propertyName: string;
  steps: LegalStep[];
  overallProgress: number;
  lastUpdated: string;
}

const enhancedLegalSteps: LegalStep[] = [
  {
    id: 1,
    title: "Property Title Verification",
    description: "Ensures the seller holds a clear and marketable title to the property.",
    action: "Confirm that the seller has valid ownership and that the title is free from any encumbrances (e.g., loans, disputes).",
    documentsNeeded: ["Title deed", "Previous sale deeds", "Chain of title documents"],
    status: "not-verified",
    importance: "critical",
    whyImportant: "This is the foundation of your ownership. Without clear title, you may face legal disputes or lose your investment entirely.",
    howToVerify: "Our legal team examines all ownership documents, checks for any liens, mortgages, or legal disputes. We verify the seller's right to sell the property.",
    riskLevel: "high"
  },
  {
    id: 2,
    title: "Property Encumbrance Check",
    description: "Verifies that the property is not mortgaged or involved in any legal dispute.",
    action: "Check if there's a mortgage, lien, or any encumbrance listed in the encumbrance certificate.",
    documentsNeeded: ["Encumbrance certificate (EC)", "Revenue records"],
    status: "not-verified",
    importance: "critical",
    whyImportant: "Hidden debts or mortgages on the property could become your responsibility after purchase.",
    howToVerify: "We obtain and analyze the encumbrance certificate from sub-registrar office for the past 30 years to ensure no hidden liabilities.",
    riskLevel: "high"
  },
  {
    id: 3,
    title: "Zoning and Land Use Check",
    description: "Ensures the land is zoned correctly for the intended purpose (residential, commercial, etc.).",
    action: "Confirm that the property is located in a residential zone or within legal boundaries for the intended use.",
    documentsNeeded: ["Zoning certificate", "Land use approval from local municipal authority", "Master plan documents"],
    status: "not-verified",
    importance: "high",
    whyImportant: "Incorrect zoning can prevent you from using the property as intended and may lead to demolition orders.",
    howToVerify: "We check with local municipal authorities and verify against the city's master plan to ensure residential use is permitted.",
    riskLevel: "medium"
  },
  {
    id: 4,
    title: "Building Plan Approval",
    description: "Ensures that the construction complies with local municipal and legal regulations.",
    action: "Verify that the builder has received approval from the local authority for the building's layout and design.",
    documentsNeeded: ["Building approval plan", "Sanctioned building plan", "Deviation certificates if any"],
    status: "not-verified",
    importance: "high",
    whyImportant: "Unapproved construction can lead to penalties, demolition notices, and difficulty in getting loans or selling later.",
    howToVerify: "We verify the sanctioned plan matches actual construction and check for any deviations that need regularization.",
    riskLevel: "medium"
  },
  {
    id: 5,
    title: "Occupancy Certificate (OC)",
    description: "A certificate issued by the local municipal authority stating the building is fit for occupation.",
    action: "Confirm that the property has been issued an OC for legal occupation.",
    documentsNeeded: ["Occupancy certificate", "Completion certificate"],
    status: "not-verified",
    importance: "critical",
    whyImportant: "Without OC, you cannot legally occupy the property, get utilities connected, or register the property.",
    howToVerify: "We verify the OC is genuine and covers your specific unit/floor, ensuring legal occupancy rights.",
    riskLevel: "high"
  },
  {
    id: 6,
    title: "No Objection Certificates (NOCs)",
    description: "Verifies that the required NOCs have been obtained from relevant authorities (fire, water, electricity, etc.).",
    action: "Ensure the developer has obtained NOCs for utilities and other essential services.",
    documentsNeeded: ["Fire NOC", "Water NOC", "Electricity NOC", "Sewerage NOC"],
    status: "not-verified",
    importance: "high",
    whyImportant: "Missing NOCs can delay utility connections and may indicate safety or infrastructure issues.",
    howToVerify: "We check all essential NOCs are in place and valid for your building and unit.",
    riskLevel: "medium"
  },
  {
    id: 7,
    title: "RERA Registration",
    description: "Ensures that the property/project is registered with the Real Estate Regulatory Authority (RERA).",
    action: "Verify that the builder has registered the project with RERA and is compliant with its regulations.",
    documentsNeeded: ["RERA registration number", "RERA certificate", "Project details on RERA website"],
    status: "not-verified",
    importance: "critical",
    whyImportant: "RERA registration protects your rights as a buyer and ensures project compliance with delivery timelines.",
    howToVerify: "We verify RERA registration status, check project details, and ensure no pending complaints or violations.",
    riskLevel: "medium"
  },
  {
    id: 8,
    title: "Tax Payment and Land Revenue Records",
    description: "Ensures that the property taxes have been paid and there are no arrears or disputes.",
    action: "Verify that the seller has cleared all dues with the local municipality.",
    documentsNeeded: ["Property tax receipts", "Land revenue records", "No dues certificate"],
    status: "not-verified",
    importance: "medium",
    whyImportant: "Outstanding taxes become your liability after purchase and can lead to property attachment.",
    howToVerify: "We verify all property taxes are paid up to date and obtain no-dues certificate from relevant authorities.",
    riskLevel: "low"
  },
  {
    id: 9,
    title: "Legal Title Verification of Developer/Builder",
    description: "Ensures the developer has the legal right to develop and sell the property.",
    action: "Check that the builder/developer is authorized to sell and construct on the land.",
    documentsNeeded: ["Developer's title deed", "Authorization from landowner", "Joint venture agreement if applicable"],
    status: "not-verified",
    importance: "critical",
    whyImportant: "If the developer doesn't have clear rights, your purchase could be invalid and you may lose your investment.",
    howToVerify: "We verify the developer's ownership or authorization chain and check for any disputes or legal issues.",
    riskLevel: "high"
  },
  {
    id: 10,
    title: "Clearance from Other Authorities",
    description: "Ensures that there are no pending environmental clearances or issues with land use.",
    action: "Verify that the property is free from environmental restrictions, forest land disputes, etc.",
    documentsNeeded: ["Environmental clearance certificate", "Forest land certificate (if applicable)", "Pollution control board NOC"],
    status: "not-verified",
    importance: "high",
    whyImportant: "Environmental violations can lead to project stoppage, demolition, or heavy penalties.",
    howToVerify: "We check for all required environmental clearances and ensure no violations or pending cases.",
    riskLevel: "medium"
  },
  {
    id: 11,
    title: "Legal Opinion",
    description: "A professional legal opinion to confirm that the property is free from litigation.",
    action: "Hire a property lawyer to provide a legal opinion after reviewing all the documents.",
    documentsNeeded: ["Lawyer's opinion letter", "Legal due diligence report"],
    status: "not-verified",
    importance: "high",
    whyImportant: "Professional legal review catches issues that might be missed and provides liability protection.",
    howToVerify: "Our empaneled lawyers review all documents and provide a comprehensive legal opinion on the purchase.",
    riskLevel: "low"
  },
  {
    id: 12,
    title: "Final Verification",
    description: "A final check to ensure that all due diligence steps have been completed satisfactorily.",
    action: "Ensure that there are no red flags, and everything is in order.",
    documentsNeeded: ["Summary of all verified documents", "Final clearance certificate"],
    status: "not-verified",
    importance: "high",
    whyImportant: "Final verification ensures nothing is missed and you're ready to proceed with confidence.",
    howToVerify: "We conduct a final review of all verifications and provide a comprehensive clearance report.",
    riskLevel: "low"
  }
];

export default function UserLegalTrackerEnhanced() {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trackers = [], isLoading } = useQuery<LegalTracker[]>({
    queryKey: ["/api/legal-trackers"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
    staleTime: 10 * 60 * 1000,
  });

  const currentTracker = trackers.find(t => t.propertyId === selectedProperty);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Not Verified</Badge>;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case "high":
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Medium</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case "medium":
        return <Badge className="text-xs bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      default:
        return <Badge className="text-xs bg-green-100 text-green-800">Low Risk</Badge>;
    }
  };

  const downloadChecklist = () => {
    const checklist = `# Legal Due Diligence Checklist
## Property: ${currentTracker?.propertyName || 'Selected Property'}

${enhancedLegalSteps.map((step, index) => `
### ${index + 1}. ${step.title}
**Status:** ${currentTracker?.steps.find(s => s.id === step.id)?.status || 'Not Started'}
**Importance:** ${step.importance}
**Description:** ${step.description}
**Why Important:** ${step.whyImportant}
**How We Verify:** ${step.howToVerify}
**Documents Needed:**
${step.documentsNeeded.map(doc => `- ${doc}`).join('\n')}
**Action Required:** ${step.action}
---
`).join('')}

Generated on: ${new Date().toLocaleDateString()}
OwnItRight Legal Due Diligence System
    `;
    
    const blob = new Blob([checklist], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-checklist-${currentTracker?.propertyName?.replace(/\s+/g, '-') || 'property'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Checklist Downloaded",
      description: "Your legal due diligence checklist has been downloaded successfully.",
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Our legal advisor will respond within 24 hours.",
    });
    setChatMessage("");
    setShowChat(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading your legal verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/user-panel">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Legal Due Diligence Tracker</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={downloadChecklist}>
                <Download className="h-4 w-4 mr-2" />
                Download Checklist
              </Button>
              <Dialog open={showChat} onOpenChange={setShowChat}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask Legal Advisor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ask Our Legal Advisor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Ask any questions about the legal verification process..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <Button onClick={handleSendMessage} className="w-full">
                      Send Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <Card className="mb-8 border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">What is Legal Due Diligence?</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Legal due diligence is a comprehensive verification process that ensures your property investment is legally sound. 
                  Our 12-step verification process protects you from legal disputes, hidden liabilities, and regulatory issues.
                </p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-blue-700">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Risk Protection</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Document Verification</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Legal Expert Support</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedProperty ? (
          /* Property Selection */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Property to Track</h2>
              <p className="text-gray-600">Choose a property to view its legal verification status and start the due diligence process.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property: any) => {
                const tracker = trackers.find(t => t.propertyId === property.id);
                return (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProperty(property.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{property.name}</h3>
                          <p className="text-sm text-gray-600">{property.area}</p>
                          <p className="text-xs text-gray-500">{property.developer}</p>
                        </div>
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {tracker ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Legal Verification</span>
                            <span className="text-sm font-medium text-gray-900">{tracker.overallProgress}% Complete</span>
                          </div>
                          <Progress value={tracker.overallProgress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{tracker.steps.filter(s => s.status === 'verified').length} of {tracker.steps.length} steps verified</span>
                            <span>Updated {new Date(tracker.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Legal verification not started</p>
                          <Button size="sm" className="mt-2">Start Verification</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* Legal Tracker Details */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Button variant="ghost" onClick={() => setSelectedProperty("")} className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Properties
                </Button>
                <h2 className="text-2xl font-semibold text-gray-900">{currentTracker?.propertyName}</h2>
                <p className="text-gray-600">Legal Due Diligence Progress</p>
              </div>
            </div>

            {currentTracker && (
              <>
                {/* Progress Overview */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {currentTracker.steps.filter(s => s.status === 'verified').length}
                        </div>
                        <div className="text-sm text-gray-600">Verified Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">
                          {currentTracker.steps.filter(s => s.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending Review</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-1">
                          {currentTracker.steps.filter(s => s.status === 'not-verified').length}
                        </div>
                        <div className="text-sm text-gray-600">Not Started</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{currentTracker.overallProgress}%</div>
                        <div className="text-sm text-gray-600">Overall Progress</div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Progress value={currentTracker.overallProgress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Steps</h3>
                  {enhancedLegalSteps.map((step) => {
                    const currentStep = currentTracker.steps.find(s => s.id === step.id);
                    const isExpanded = expandedStep === step.id;
                    
                    return (
                      <Card key={step.id} className={`transition-all ${currentStep?.status === 'verified' ? 'border-green-200 bg-green-50' : currentStep?.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                        <Collapsible open={isExpanded} onOpenChange={() => setExpandedStep(isExpanded ? null : step.id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(currentStep?.status || 'not-verified')}
                                  <div>
                                    <CardTitle className="text-base">{step.title}</CardTitle>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {getImportanceBadge(step.importance)}
                                      {getRiskBadge(step.riskLevel)}
                                      {getStatusBadge(currentStep?.status || 'not-verified')}
                                    </div>
                                  </div>
                                </div>
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent>
                              <div className="space-y-4">
                                <p className="text-gray-700">{step.description}</p>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    Why This Matters
                                  </h5>
                                  <p className="text-sm text-blue-800">{step.whyImportant}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                  <h5 className="font-medium text-green-900 mb-2 flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    How We Verify
                                  </h5>
                                  <p className="text-sm text-green-800">{step.howToVerify}</p>
                                </div>

                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Required Documents</h5>
                                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {step.documentsNeeded.map((doc, index) => (
                                      <li key={index}>{doc}</li>
                                    ))}
                                  </ul>
                                </div>

                                {currentStep?.dateVerified && (
                                  <div className="flex items-center space-x-2 text-sm text-green-700">
                                    <Calendar className="h-4 w-4" />
                                    <span>Verified on {new Date(currentStep.dateVerified).toLocaleDateString()}</span>
                                  </div>
                                )}

                                {currentStep?.notes && (
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                                    <p className="text-sm text-gray-700">{currentStep.notes}</p>
                                  </div>
                                )}

                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Documents
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Ask Question
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>

                {/* Contact Legal Team */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Need Help?</h3>
                      <p className="text-purple-800 mb-4">Our legal experts are here to guide you through the verification process.</p>
                      <div className="flex items-center justify-center space-x-4">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Legal Team
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Support
                        </Button>
                        <Button size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Live Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}