import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, CreditCard, Clock, CheckCircle, Lock, AlertCircle, ShieldCheck, Wrench, Zap } from "lucide-react";
import { type Property } from "@shared/schema";

interface CivilMepWidgetProps {
  property: Property;
}

const CivilMepWidget = ({ property }: CivilMepWidgetProps) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"immediate" | "pay-later">("immediate");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    requirements: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  // Check if property has CIVIL+MEP report available
  const hasReport = property.hasCivilMepReport;
  const reportPrice = Number(property.civilMepReportPrice || 2999);

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      if (paymentMethod === "immediate") {
        // For development, simulate successful payment
        toast({
          title: "Payment Successful",
          description: "Your CIVIL+MEP report access has been activated!"
        });
      } else {
        // Pay later option
        const response = await fetch("/api/civil-mep-reports/pay-later", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: `report_${property.id}`,
            propertyId: property.id,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone
          })
        });

        if (response.ok) {
          toast({
            title: "Access Granted",
            description: "You have 7 days to access the report. Payment due within 7 days."
          });
        } else {
          throw new Error("Payment processing failed");
        }
      }
      
      setShowPaymentDialog(false);
      setCustomerInfo({ name: "", email: "", phone: "", requirements: "" });
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!hasReport) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">CIVIL+MEP Report</h3>
          <p className="text-gray-600 mb-4">
            Comprehensive property analysis report not available for this property yet.
          </p>
          <Badge variant="outline" className="text-gray-600">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <FileText className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">CIVIL+MEP Analysis Report</CardTitle>
              <p className="text-sm text-gray-600">Comprehensive property engineering assessment</p>
            </div>
          </div>
          <Badge className="bg-violet-600 text-white">
            Premium
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Report Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Structural Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">MEP Systems</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Electrical Safety</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Compliance Check</span>
          </div>
        </div>

        {/* Report Contents Preview */}
        <div className="bg-white rounded-lg p-4 border border-violet-200">
          <h4 className="font-semibold text-gray-900 mb-3">Report Contents</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Complete structural integrity assessment</li>
            <li>• Mechanical, Electrical & Plumbing analysis</li>
            <li>• Material quality evaluation and cost breakdown</li>
            <li>• Building code compliance verification</li>
            <li>• Snag report with issue categorization</li>
            <li>• Investment recommendation with risk analysis</li>
            <li>• Future maintenance schedule and cost estimates</li>
          </ul>
        </div>

        {/* Pricing and CTA */}
        <div className="bg-white rounded-lg p-4 border border-violet-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatPrice(reportPrice)}</div>
              <div className="text-sm text-gray-600">One-time access fee</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">✓ Instant access</div>
              <div className="text-sm text-gray-600">PDF download included</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-violet-600 hover:bg-violet-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Get Report Now
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Get CIVIL+MEP Report</DialogTitle>
                  <DialogDescription>
                    Access comprehensive property analysis for {property.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Customer Information */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="requirements">Specific Requirements (Optional)</Label>
                      <Textarea
                        id="requirements"
                        value={customerInfo.requirements}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, requirements: e.target.value })}
                        placeholder="Any specific areas you'd like us to focus on..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <Label>Payment Option</Label>
                    <Select value={paymentMethod} onValueChange={(value: "immediate" | "pay-later") => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Pay Now - {formatPrice(reportPrice)}
                          </div>
                        </SelectItem>
                        <SelectItem value="pay-later">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pay Later (7-day access)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method Info */}
                  {paymentMethod === "pay-later" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium text-yellow-800">Pay Later Option</div>
                          <div className="text-yellow-700">
                            Get immediate access for 7 days. Payment of {formatPrice(reportPrice)} due within 7 days.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {paymentMethod === "immediate" ? (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay {formatPrice(reportPrice)}
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Get Access Now
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="px-6">
              <FileText className="h-4 w-4 mr-2" />
              Sample
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-violet-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            Secure Payment
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4" />
            Instant Access
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            PDF Download
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivilMepWidget;