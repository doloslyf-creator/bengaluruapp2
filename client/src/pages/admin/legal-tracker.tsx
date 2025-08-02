import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Clock, FileText, Plus, Eye } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

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

const LEGAL_STEPS: Omit<LegalStep, "status" | "dateVerified" | "notes">[] = [
  {
    id: 1,
    title: "Property Title Verification",
    description: "Ensures the seller holds a clear and marketable title to the property.",
    action: "Confirm that the seller has valid ownership and that the title is free from any encumbrances (e.g., loans, disputes).",
    documentsNeeded: ["Title deed", "Previous sale deeds"]
  },
  {
    id: 2,
    title: "Property Encumbrance Check",
    description: "Verifies that the property is not mortgaged or involved in any legal dispute.",
    action: "Check if there's a mortgage, lien, or any encumbrance listed in the encumbrance certificate.",
    documentsNeeded: ["Encumbrance certificate (EC)"]
  },
  {
    id: 3,
    title: "Zoning and Land Use Check",
    description: "Ensures the land is zoned correctly for the intended purpose (residential, commercial, etc.).",
    action: "Confirm that the property is located in a residential zone or within legal boundaries for the intended use.",
    documentsNeeded: ["Zoning certificate", "Land use approval from local municipal authority"]
  },
  {
    id: 4,
    title: "Building Plan Approval",
    description: "Ensures that the construction complies with local municipal and legal regulations.",
    action: "Verify that the builder has received approval from the local authority for the building's layout and design.",
    documentsNeeded: ["Building approval plan"]
  },
  {
    id: 5,
    title: "Occupancy Certificate (OC)",
    description: "A certificate issued by the local municipal authority stating the building is fit for occupation.",
    action: "Confirm that the property has been issued an OC for legal occupation.",
    documentsNeeded: ["Occupancy certificate"]
  },
  {
    id: 6,
    title: "No Objection Certificates (NOCs)",
    description: "Verifies that the required NOCs have been obtained from relevant authorities (fire, water, electricity, etc.).",
    action: "Ensure the developer has obtained NOCs for utilities and other essential services.",
    documentsNeeded: ["NOCs from relevant authorities"]
  },
  {
    id: 7,
    title: "RERA Registration",
    description: "Ensures that the property/project is registered with the Real Estate Regulatory Authority (RERA).",
    action: "Verify that the builder has registered the project with RERA and is compliant with its regulations.",
    documentsNeeded: ["RERA registration number"]
  },
  {
    id: 8,
    title: "Tax Payment and Land Revenue Records",
    description: "Ensures that the property taxes have been paid and there are no arrears or disputes.",
    action: "Verify that the seller has cleared all dues with the local municipality.",
    documentsNeeded: ["Property tax receipts"]
  },
  {
    id: 9,
    title: "Legal Title Verification of Developer/Builder",
    description: "Ensures the developer has the legal right to develop and sell the property.",
    action: "Check that the builder/developer is authorized to sell and construct on the land.",
    documentsNeeded: ["Developer's title deed", "Authorization from landowner"]
  },
  {
    id: 10,
    title: "Clearance from Other Authorities",
    description: "Ensures that there are no pending environmental clearances or issues with land use.",
    action: "Verify that the property is free from environmental restrictions, forest land disputes, etc.",
    documentsNeeded: ["Environmental clearance certificate", "Forest land certificate (if applicable)"]
  },
  {
    id: 11,
    title: "Legal Opinion",
    description: "A professional legal opinion to confirm that the property is free from litigation.",
    action: "Hire a property lawyer to provide a legal opinion after reviewing all the documents.",
    documentsNeeded: ["Lawyer's opinion letter"]
  },
  {
    id: 12,
    title: "Final Verification",
    description: "A final check to ensure that all due diligence steps have been completed satisfactorily.",
    action: "Ensure that there are no red flags, and everything is in order.",
    documentsNeeded: ["Summary of all verified documents"]
  }
];

export default function LegalTracker() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const { data: legalTrackers = [] } = useQuery<PropertyLegalTracker[]>({
    queryKey: ["/api/legal-trackers"],
  });

  const createTrackerMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      const trackerData = {
        propertyId,
        propertyName: property?.name || "Unknown Property",
        steps: LEGAL_STEPS.map(step => ({
          ...step,
          status: "not-verified" as const
        })),
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      };
      
      return apiRequest("POST", "/api/legal-trackers", trackerData);
    },
    onSuccess: () => {
      toast({
        title: "Legal tracker created",
        description: "Legal due diligence tracker has been set up for the property.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-trackers"] });
      setSelectedProperty("");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating tracker",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ trackerId, stepId, status, notes }: {
      trackerId: string;
      stepId: number;
      status: "verified" | "not-verified" | "pending";
      notes?: string;
    }) => {
      return apiRequest("PATCH", `/api/legal-trackers/${trackerId}/steps/${stepId}`, {
        status,
        notes,
        dateVerified: status === "verified" ? new Date().toISOString() : undefined
      });
    },
    onSuccess: () => {
      toast({
        title: "Step updated",
        description: "Legal verification step has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-trackers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating step",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

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
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Not Verified</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Legal Due Diligence Tracker</h2>
              <p className="text-sm text-gray-600 mt-1">Track legal verification progress for properties</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="border border-border rounded-lg px-3 py-2"
              >
                <option value="">Select property to track</option>
                {properties.filter(p => !legalTrackers.find(t => t.propertyId === p.id)).map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => selectedProperty && createTrackerMutation.mutate(selectedProperty)}
                disabled={!selectedProperty || createTrackerMutation.isPending}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createTrackerMutation.isPending ? "Creating..." : "Create Tracker"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {legalTrackers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Legal Trackers</h3>
              <p className="text-gray-600 mb-6">Create your first legal due diligence tracker to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {legalTrackers.map((tracker) => (
                <Card key={tracker.propertyId} className="p-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{tracker.propertyName}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Last updated: {new Date(tracker.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {tracker.overallProgress}%
                        </div>
                        <Progress value={tracker.overallProgress} className="w-32" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tracker.steps.map((step) => (
                        <Card key={step.id} className="p-4 border border-border">
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
                              <strong>Documents needed:</strong>
                              <ul className="list-disc list-inside mt-1 text-gray-600">
                                {step.documentsNeeded.map((doc, index) => (
                                  <li key={index}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant={step.status === "verified" ? "default" : "outline"}
                                onClick={() => updateStepMutation.mutate({
                                  trackerId: tracker.propertyId,
                                  stepId: step.id,
                                  status: "verified"
                                })}
                                className="flex-1 text-xs"
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant={step.status === "pending" ? "default" : "outline"}
                                onClick={() => updateStepMutation.mutate({
                                  trackerId: tracker.propertyId,
                                  stepId: step.id,
                                  status: "pending"
                                })}
                                className="flex-1 text-xs"
                              >
                                Pending
                              </Button>
                            </div>
                            
                            {step.dateVerified && (
                              <p className="text-xs text-green-600">
                                Verified: {new Date(step.dateVerified).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}