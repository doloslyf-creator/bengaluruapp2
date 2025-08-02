import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, CreditCard, Clock, CheckCircle, Lock, AlertCircle, ShieldCheck, Wrench, Zap, Download, ExternalLink } from "lucide-react";
import { type Property } from "@shared/schema";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CivilMepSectionProps {
  property: Property;
}

const CivilMepSection = ({ property }: CivilMepSectionProps) => {
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
        // Initialize Razorpay payment
        const options = {
          key: "rzp_test_1DP5mmOlF5G5ag", // Test key for demo
          amount: reportPrice * 100, // Amount in paise
          currency: "INR",
          name: "PropertyHub",
          description: `CIVIL+MEP Report for ${property.name}`,
          handler: function (response: any) {
            toast({
              title: "Payment Successful",
              description: `Payment ID: ${response.razorpay_payment_id}. Your CIVIL+MEP report access has been activated!`
            });
            setShowPaymentDialog(false);
            setIsProcessing(false);
          },
          prefill: {
            name: customerInfo.name,
            email: customerInfo.email,
            contact: customerInfo.phone
          },
          theme: {
            color: "#3B82F6"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast({
            title: "Payment Error",
            description: "Payment gateway not loaded. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      } else {
        // Pay later option
        const response = await fetch('/api/civil-mep-reports/pay-later', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId: property.id,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            propertyId: property.id
          })
        });

        if (response.ok) {
          toast({
            title: "Request Submitted",
            description: "We'll contact you within 24 hours to complete the payment process."
          });
        } else {
          throw new Error("Failed to submit pay later request");
        }
      }

      setShowPaymentDialog(false);
      setIsProcessing(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCustomerInfo({ name: "", email: "", phone: "", requirements: "" });
    setPaymentMethod("immediate");
  };

  if (!hasReport) {
    return null; // Don't show the section if CIVIL+MEP is not available
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Wrench className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CIVIL+MEP Engineering Reports</h2>
          <p className="text-gray-600">Professional structural and MEP analysis for informed decisions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Report Information */}
        <div className="bg-white p-6 rounded-lg space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Available for this Property</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Comprehensive structural analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Electrical & plumbing systems review</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Quality certification & recommendations</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900">Report Price</span>
              <span className="text-2xl font-bold text-blue-600">₹{reportPrice.toLocaleString()}</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">One-time fee • Detailed PDF report</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white p-6 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Get Your Report</h3>
          <p className="text-sm text-gray-600">
            Get a professional assessment of this property's structural integrity and MEP systems.
          </p>

          <div className="space-y-3">
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              <Clock className="h-3 w-3 mr-1" />
              Ready in 3-5 business days
            </Badge>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              <ExternalLink className="h-3 w-3 mr-1" />
              PDF + Email delivery
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Order Report - ₹{reportPrice.toLocaleString()}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Order CIVIL+MEP Report</DialogTitle>
                  <DialogDescription>
                    Get a comprehensive engineering analysis for {property.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 xxxxx xxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Specific Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={customerInfo.requirements}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="Any specific areas you'd like us to focus on..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: "immediate" | "pay-later") => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Pay Now (Razorpay)</SelectItem>
                        <SelectItem value="pay-later">Pay Later (We'll call you)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">₹{reportPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {paymentMethod === "immediate" ? "Secure payment via Razorpay" : "Payment on delivery"}
                    </p>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {paymentMethod === "immediate" ? (
                          <CreditCard className="h-4 w-4 mr-2" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2" />
                        )}
                        {paymentMethod === "immediate" ? "Pay Now" : "Submit Request"}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              View Sample Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Features */}
      <div className="bg-white p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">What's Included in the Report</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium">Structural Analysis</h4>
            <p className="text-sm text-gray-600">Foundation, columns, beams, and slab quality assessment</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-medium">MEP Systems</h4>
            <p className="text-sm text-gray-600">Electrical, plumbing, and HVAC system evaluation</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium">Quality Report</h4>
            <p className="text-sm text-gray-600">Detailed findings with recommendations and photos</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CivilMepSection;