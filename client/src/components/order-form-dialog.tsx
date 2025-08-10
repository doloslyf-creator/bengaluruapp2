import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Building, FileText, User, Mail, Phone, MessageCircle, CreditCard, Lock, BarChart3 } from 'lucide-react';

const orderFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  reportType: z.enum(['civil-mep', 'valuation', 'both']),
  additionalRequirements: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: OrderFormData) => void;
  property: {
    id: string;
    name: string;
    area: string;
    zone: string;
    developer?: string;
    type: string;
  };
  reportType: 'civil-mep' | 'valuation';
  isProcessing?: boolean;
}

const reportTypeDetails = {
  'civil-mep': {
    title: 'Civil & MEP Analysis Report',
    description: 'Comprehensive analysis of construction quality, structural integrity, and MEP systems',
    price: 2499,
    deliveryTime: 'Within 24 hours',
    features: [
      'Foundation & Structural Analysis',
      'Electrical Systems Review',
      'Plumbing & MEP Assessment',
      'Quality Standards Verification',
      'Compliance Check',
      'Risk Assessment Report'
    ],
    sampleData: [
      { label: 'Foundation Quality Score', value: '8.5/10', status: 'good' },
      { label: 'Structural Integrity Rating', value: 'A-Grade', status: 'excellent' },
      { label: 'Electrical Load Capacity', value: '45 KVA', status: 'adequate' },
      { label: 'Water Pressure (Ground Floor)', value: '2.8 Bar', status: 'good' },
      { label: 'Fire Safety Compliance', value: '95% Compliant', status: 'excellent' },
      { label: 'Ventilation Efficiency', value: '7.2/10', status: 'good' },
      { label: 'Plumbing Grade', value: 'Premium Grade', status: 'excellent' },
      { label: 'Construction Quality Index', value: '82/100', status: 'good' },
      { label: 'MEP Systems Integration', value: 'Fully Integrated', status: 'excellent' },
      { label: 'Overall Engineering Score', value: '8.1/10', status: 'good' },
      { label: 'Safety Standards Compliance', value: '98%', status: 'excellent' },
      { label: 'Material Quality Rating', value: 'Grade A', status: 'excellent' }
    ]
  },
  'valuation': {
    title: 'Property Valuation Report',
    description: 'Professional property valuation with market analysis and investment insights',
    price: 2499,
    deliveryTime: 'Within 24 hours',
    features: [
      'Market Value Assessment',
      'Comparative Market Analysis',
      'Investment Grade Rating',
      'Rental Yield Calculation',
      'Appreciation Projection',
      'Risk Analysis Report'
    ],
    sampleData: [
      { label: 'Current Market Value', value: '₹2.45 Cr', status: 'assessed' },
      { label: 'Price Per Sq Ft', value: '₹12,250', status: 'competitive' },
      { label: 'Expected Annual Appreciation', value: '8.5%', status: 'good' },
      { label: 'Rental Yield Potential', value: '3.2%', status: 'good' },
      { label: 'Investment Grade Rating', value: 'A-', status: 'excellent' },
      { label: 'Market Liquidity Index', value: '7.8/10', status: 'good' },
      { label: 'Capital Gains Forecast (5Y)', value: '45-52%', status: 'good' },
      { label: 'Comparable Sales Price Range', value: '₹2.1-2.8 Cr', status: 'verified' },
      { label: 'Location Premium Factor', value: '15%', status: 'premium' },
      { label: 'Risk Assessment Score', value: 'Low Risk', status: 'excellent' },
      { label: 'Market Demand Index', value: '8.3/10', status: 'good' },
      { label: 'Investment Recommendation', value: 'Strong Buy', status: 'excellent' }
    ]
  }
};

// Remove urgency options - delivery is always within 24 hours

export default function OrderFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  property, 
  reportType, 
  isProcessing = false 
}: OrderFormDialogProps) {
  const report = reportTypeDetails[reportType];
  const totalAmount = report.price;

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      reportType: reportType,
      additionalRequirements: '',
    },
  });

  const handleSubmit = (data: OrderFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order {report.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Details
              </h3>
              
              <div className="space-y-3 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Property Name</Label>
                  <div className="font-semibold">{property.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{property.area}, {property.zone}</span>
                  </div>
                </div>
                {property.developer && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Developer</Label>
                    <div>{property.developer}</div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Property Type</Label>
                  <Badge variant="outline">{property.type}</Badge>
                </div>
              </div>

              <Separator className="my-4" />

              <h4 className="font-semibold mb-3">Report Details</h4>
              <div className="space-y-3">
                <div>
                  <div className="font-medium">{report.title}</div>
                  <div className="text-sm text-gray-600">{report.description}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Delivery Time</Label>
                  <div className="text-sm">{report.deliveryTime}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">What's Included</Label>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mt-1">
                    {report.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Sample Data Preview */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Sample Report Data
                </h4>
                <div className="text-xs text-gray-600 mb-3">
                  Preview of actual data points you'll receive in your report
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {report.sampleData.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.value}</span>
                        <Badge 
                          variant={
                            item.status === 'excellent' ? 'default' :
                            item.status === 'good' ? 'secondary' :
                            item.status === 'adequate' ? 'outline' :
                            'secondary'
                          }
                          className={`text-xs h-5 ${
                            item.status === 'excellent' ? 'bg-green-100 text-green-700' :
                            item.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            item.status === 'adequate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {report.sampleData.length > 8 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-500">
                        +{report.sampleData.length - 8} more data points in full report
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Report Price</span>
                  <span>₹{report.price.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-green-600 mt-2">
                  ✓ Delivery within 24 hours
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </h3>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>



                <Card>
                  <CardContent className="p-6">
                    <FormField
                      control={form.control}
                      name="additionalRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Requirements (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific requirements or questions regarding the report"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : `Proceed to Payment - ₹${totalAmount.toLocaleString()}`}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}