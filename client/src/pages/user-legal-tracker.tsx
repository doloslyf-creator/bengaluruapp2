import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, FileText, Download, MessageCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LegalStep {
  id: number;
  title: string;
  description: string;
  action: string;
  documentsNeeded: string[];
  status: "verified" | "not-verified" | "pending";
  dateVerified?: string;
  notes?: string;
}

interface PropertyLegalTracker {
  propertyId: string;
  propertyName: string;
  steps: LegalStep[];
  overallProgress: number;
  lastUpdated: string;
}

export default function UserLegalTracker() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const { data: legalTrackers = [] } = useQuery<PropertyLegalTracker[]>({
    queryKey: ["/api/legal-trackers"],
  });

  const selectedTracker = legalTrackers.find(t => t.propertyId === selectedPropertyId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Not Started</Badge>;
    }
  };

  const downloadChecklist = () => {
    if (!selectedTracker) return;
    
    const checklistContent = `
# Legal Due Diligence Checklist - ${selectedTracker.propertyName}

${selectedTracker.steps.map(step => `
## ${step.id}. ${step.title}
**Status:** ${step.status === "verified" ? "✅ Verified" : step.status === "pending" ? "⏳ Pending" : "❌ Not Verified"}
**Description:** ${step.description}
**Action Required:** ${step.action}
**Documents Needed:**
${step.documentsNeeded.map(doc => `- ${doc}`).join('\n')}
${step.dateVerified ? `**Verified Date:** ${new Date(step.dateVerified).toLocaleDateString()}` : ''}
${step.notes ? `**Notes:** ${step.notes}` : ''}
`).join('\n')}

**Overall Progress:** ${selectedTracker.overallProgress}%
**Last Updated:** ${new Date(selectedTracker.lastUpdated).toLocaleDateString()}
    `;

    const blob = new Blob([checklistContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-checklist-${selectedTracker.propertyName.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="css-wordmark text-3xl font-bold mb-2">
                  <span className="text-blue-600">Own</span>
                  <span className="text-orange-500">It</span>
                  <span className="text-purple-600">Right</span>
                </div>
                <p className="text-gray-600">Legal Due Diligence Tracker</p>
              </div>
              <nav className="flex space-x-8">
                <a href="/find-property" className="text-gray-600 hover:text-blue-600 transition-colors">Find Property</a>
                <a href="/user-panel" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="#" className="text-blue-600 font-medium">Legal Tracker</a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal Due Diligence Tracker</h1>
          <p className="text-gray-600">Track the legal verification process for your property investment</p>
        </div>

        <div className="mb-6">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md"
          >
            <option value="">Select a property to view legal status</option>
            {properties.filter(p => legalTrackers.find(t => t.propertyId === p.id)).map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedTracker ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Property</h3>
            <p className="text-gray-600">Choose a property from the dropdown to view its legal due diligence status.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedTracker.propertyName}</h2>
                  <p className="text-gray-600">Legal Due Diligence Progress</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedTracker.overallProgress}%
                  </div>
                  <Progress value={selectedTracker.overallProgress} className="w-48" />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={downloadChecklist} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download Checklist
                </Button>
                
                <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Legal Documents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Document Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>Select document type</option>
                          <option>Title Deed</option>
                          <option>Encumbrance Certificate</option>
                          <option>Building Approval</option>
                          <option>Occupancy Certificate</option>
                          <option>RERA Registration</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload File</label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <Textarea placeholder="Add any notes about this document" />
                      </div>
                      <Button className="w-full">Upload Document</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={chatModalOpen} onOpenChange={setChatModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Legal Advisor Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Legal Advisor Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto">
                        <div className="text-sm text-gray-600">
                          Chat with our legal experts about your property's due diligence process. 
                          Ask questions about documentation, legal requirements, or clarify any concerns.
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Input placeholder="Type your legal question here..." className="flex-1" />
                        <Button>Send</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            {/* Legal Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTracker.steps.map((step) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(step.status)}
                      <span className="font-medium text-sm">Step {step.id}</span>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-2">{step.title}</h4>
                  <p className="text-xs text-gray-600 mb-3">{step.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Required Action:</strong>
                      <p className="text-gray-600 mt-1">{step.action}</p>
                    </div>
                    
                    <div className="text-xs">
                      <strong>Documents needed:</strong>
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        {step.documentsNeeded.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {step.dateVerified && (
                      <p className="text-xs text-green-600 font-medium">
                        ✅ Verified: {new Date(step.dateVerified).toLocaleDateString()}
                      </p>
                    )}
                    
                    {step.notes && (
                      <div className="text-xs">
                        <strong>Notes:</strong>
                        <p className="text-gray-600 mt-1">{step.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progress Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedTracker.steps.filter(s => s.status === "verified").length}
                  </div>
                  <p className="text-sm text-gray-600">Verified</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedTracker.steps.filter(s => s.status === "pending").length}
                  </div>
                  <p className="text-sm text-gray-600">Under Review</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedTracker.steps.filter(s => s.status === "not-verified").length}
                  </div>
                  <p className="text-sm text-gray-600">Remaining</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-gray-600">Total Steps</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(selectedTracker.lastUpdated).toLocaleDateString()}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}