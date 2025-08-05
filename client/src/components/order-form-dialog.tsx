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
import { MapPin, Building, FileText, User, Mail, Phone, MessageCircle, CreditCard, Lock } from 'lucide-react';

const orderFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
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
      address: '',
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

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your complete address" {...field} />
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