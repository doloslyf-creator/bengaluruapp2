import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

export default function ValuationReportsCreate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/valuation-reports", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/valuation-reports/stats"] });
      toast({
        title: "Success",
        description: "Valuation report created successfully",
      });
      navigate("/admin-panel/valuation-reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create valuation report",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const reportData = {
      propertyId: formData.get("propertyId") as string,
      customerId: "placeholder-customer", // In real app, get from auth/selection
      reportTitle: formData.get("reportTitle") as string,
      createdBy: "admin", // In a real app, this would come from auth
      reportStatus: "draft" as const,
      // Basic property profile data
      projectName: formData.get("projectName") as string,
      unitType: formData.get("unitType") as string,
      configuration: formData.get("configuration") as string,
      // Market valuation - convert string to number for existing decimal field
      estimatedMarketValue: formData.get("estimatedMarketValue") ? parseFloat(formData.get("estimatedMarketValue") as string) : null,
      ratePerSqftSbaUds: formData.get("ratePerSqftSbaUds") as string,
      // Basic fields for initial creation
      buyerFit: formData.get("buyerFit") as string,
      valuationVerdict: formData.get("valuationVerdict") as string,
      recommendation: formData.get("recommendation") as string,
    };

    createReportMutation.mutate(reportData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin-panel/valuation-reports")} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">Create Valuation Report</h1>
            <p className="text-sm text-muted-foreground">
              Create a comprehensive property valuation report
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
          {/* Basic Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-4 w-4 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-sm">
                Essential details for the valuation report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select name="propertyId" required>
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
                    placeholder="Property Valuation Report - [Property Name]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="projectName">Project Name & Unit</Label>
                <Input
                  name="projectName"
                  placeholder="e.g., Assetz Marq 3.0, 3BHK, Tower B"
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Profile</CardTitle>
              <CardDescription>
                Basic property characteristics and specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select name="unitType">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="rowhouse">Rowhouse</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="configuration">Configuration</Label>
                  <Input
                    name="configuration"
                    placeholder="e.g., 3BHK, 1550 sq.ft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedMarketValue">Estimated Market Value (₹)</Label>
                  <Input
                    name="estimatedMarketValue"
                    type="number"
                    step="0.01"
                    placeholder="22000000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ratePerSqftSbaUds">Rate per Sq.ft (SBA & UDS)</Label>
                  <Input
                    name="ratePerSqftSbaUds"
                    placeholder="₹10,200/sqft"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buyerFit">Buyer Fit</Label>
                <Select name="buyerFit">
                  <SelectTrigger>
                    <SelectValue placeholder="Select buyer fit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end_use">End Use</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Initial Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Initial Analysis</CardTitle>
              <CardDescription>
                Preliminary valuation findings and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="valuationVerdict">Valuation Verdict</Label>
                <Textarea
                  name="valuationVerdict"
                  placeholder="e.g., Slightly Overpriced (₹1,000/sqft above resale)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recommendation">Initial Recommendation</Label>
                <Textarea
                  name="recommendation"
                  placeholder="e.g., ✅ Buy if negotiated ~₹10L lower"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pb-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin-panel/valuation-reports")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createReportMutation.isPending}
              data-testid="button-create-report"
            >
              <Save className="h-4 w-4 mr-2" />
              {createReportMutation.isPending ? "Creating..." : "Create Report"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}