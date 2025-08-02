import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, Target, CheckCircle, Clock, ExternalLink, Shield, FileText, BarChart3, DollarSign, Home, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface Property {
  id: string;
  name: string;
  hasValuationReport: boolean;
  valuationReportPrice: string;
}

interface ValuationReportSectionProps {
  property: Property;
}

export function ValuationReportSection({ property }: ValuationReportSectionProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const reportPrice = parseFloat(property.valuationReportPrice);

  const handleGetReport = () => {
    setShowPaymentDialog(true);
  };

  const handlePayLater = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/valuation-reports/pay-later", {
        propertyId: property.id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Access Granted! 🎉",
          description: "Your Property Valuation Report access has been granted for 7 days. Payment due within 7 days.",
          variant: "default"
        });
        
        setShowPaymentDialog(false);
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      } else {
        throw new Error(data.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing pay later request:", error);
      toast({
        title: "Request Failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Valuation Report</h2>
            <p className="text-gray-600">Comprehensive cost breakdown and investment analysis</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Report Information */}
          <div className="bg-white p-6 rounded-lg space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Available for this Property</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">Complete cost breakdown analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Market analysis & appreciation projections</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm">ROI analysis & investment recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">Rental yield & financing options</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Report Price</span>
                <span className="text-2xl font-bold text-emerald-600">₹{reportPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">One-time fee • Detailed PDF report</p>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-white p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">Get Your Valuation Report</h3>
            <p className="text-sm text-gray-600">
              Get a professional valuation with complete cost breakdown, market analysis, and investment recommendations.
            </p>

            <div className="space-y-3">
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                Ready in 5-7 business days
              </Badge>
              
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                <ExternalLink className="h-3 w-3 mr-1" />
                PDF + Email delivery
              </Badge>
            </div>

            <div className="space-y-3 pt-2">
              <Button onClick={handleGetReport} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Calculator className="h-4 w-4 mr-2" />
                Get Valuation Report
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">Professional property valuation by certified experts</p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Included Section */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">What's Included in Your Report</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Cost Analysis</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 ml-6">
                <li>• Land value assessment</li>
                <li>• Construction cost breakdown</li>
                <li>• Registration & stamp duty</li>
                <li>• Hidden costs identification</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Market Intelligence</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 ml-6">
                <li>• Current market trends</li>
                <li>• Competitor analysis</li>
                <li>• Growth projections</li>
                <li>• Area demand-supply ratio</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Investment Analysis</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 ml-6">
                <li>• ROI calculations</li>
                <li>• Rental yield analysis</li>
                <li>• Risk assessment</li>
                <li>• Investment recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              <span>Property Valuation Report</span>
            </DialogTitle>
            <DialogDescription>
              Get comprehensive property valuation for <strong>{property.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-emerald-900">Total Cost</span>
                <span className="text-xl font-bold text-emerald-600">₹{reportPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">One-time payment • 5-7 day delivery</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Pay Later Option</p>
                  <p className="text-blue-700">Get instant access now, pay within 7 days</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayLater}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />}
              Get Report Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}