import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocation } from "wouter";
import { firebaseOTPService } from "@/lib/firebase";
import { Loader2, Phone, Shield, RefreshCw } from "lucide-react";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
});

type OTPFormData = z.infer<typeof otpSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ""
    }
  });

  // Initialize reCAPTCHA on component mount
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        const success = await firebaseOTPService.initializeRecaptcha('recaptcha-container');
        setRecaptchaLoaded(success);
        if (!success) {
          toast({
            title: "Setup Error",
            description: "Failed to initialize security verification",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
        setRecaptchaLoaded(false);
      }
    };

    initRecaptcha();

    // Cleanup on unmount
    return () => {
      firebaseOTPService.cleanup();
    };
  }, [toast]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!recaptchaLoaded) {
      toast({
        title: "Error",
        description: "Security verification not ready. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await firebaseOTPService.sendOTP();
      
      if (result.success) {
        setStep('otp');
        setCountdown(60); // 60 second countdown
        toast({
          title: "OTP Sent",
          description: "Verification code sent to admin phone number",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    setIsLoading(true);
    
    try {
      const result = await firebaseOTPService.verifyOTP(data.otp);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Admin authentication successful",
        });
        
        // Refetch auth state and redirect
        await refetch();
        setLocation("/admin-panel");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      const result = await firebaseOTPService.sendOTP();
      
      if (result.success) {
        setCountdown(60);
        toast({
          title: "OTP Resent",
          description: "New verification code sent",
        });
      } else {
        toast({
          title: "Error", 
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    form.reset();
    firebaseOTPService.cleanup();
    setRecaptchaLoaded(false);
    
    // Re-initialize reCAPTCHA
    setTimeout(async () => {
      const success = await firebaseOTPService.initializeRecaptcha('recaptcha-container');
      setRecaptchaLoaded(success);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            {step === 'phone' 
              ? 'Secure Firebase OTP Authentication' 
              : 'Enter the verification code sent to your phone'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Admin Phone</p>
                    <p className="text-xs text-blue-700">+91 95603 66601</p>
                  </div>
                </div>

                <div id="recaptcha-container" className="flex justify-center"></div>

                <Button 
                  onClick={handleSendOTP}
                  disabled={isLoading || !recaptchaLoaded}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleVerifyOTP)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Verification Code</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter 6-digit OTP"
                            className="text-center text-lg tracking-widest font-mono h-12 border-2 focus:border-blue-500"
                            maxLength={6}
                            autoComplete="one-time-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify & Login
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                  className="w-full"
                >
                  {countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend OTP
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleBackToPhone}
                  disabled={isLoading}
                  className="w-full"
                >
                  Back to Phone Verification
                </Button>
              </div>
            </>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secured by Firebase Authentication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}