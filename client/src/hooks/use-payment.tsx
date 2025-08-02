import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
}

// Declare global Razorpay
declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function usePayment() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData): Promise<RazorpayOrder> => {
      return apiRequest('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create payment order',
        variant: 'destructive',
      });
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (verificationData: PaymentVerificationData) => {
      return apiRequest('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Payment Verification Failed',
        description: error.message || 'Payment verification failed',
        variant: 'destructive',
      });
    },
  });

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (
    orderData: CreateOrderData,
    options: Partial<RazorpayOptions> = {}
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);

      // Load Razorpay SDK
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const order = await createOrderMutation.mutateAsync(orderData);

      // Setup Razorpay options
      const razorpayOptions: RazorpayOptions = {
        key: process.env.VITE_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'OwnItRight',
        description: 'Property Advisory Services',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
          }
        },
        theme: {
          color: '#2563eb',
        },
        ...options,
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(razorpayOptions);
      
      rzp.on('payment.failed', (response: any) => {
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Payment failed. Please try again.',
          variant: 'destructive',
        });
      });

      rzp.open();
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Payment processing failed',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const createOrder = async (orderData: CreateOrderData): Promise<RazorpayOrder | null> => {
    try {
      return await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Create order error:', error);
      return null;
    }
  };

  const verifyPayment = async (verificationData: PaymentVerificationData): Promise<boolean> => {
    try {
      await verifyPaymentMutation.mutateAsync(verificationData);
      return true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  };

  return {
    processPayment,
    createOrder,
    verifyPayment,
    isProcessing,
    isCreatingOrder: createOrderMutation.isPending,
    isVerifyingPayment: verifyPaymentMutation.isPending,
  };
}