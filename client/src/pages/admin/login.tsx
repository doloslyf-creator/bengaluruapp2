import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone, Key } from "lucide-react";

const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),
});

const otpSchema = z.object({
  otp: z.string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function AdminLogin() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { sendOtp, login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onPhoneSubmit = async (data: PhoneForm) => {
    try {
      await sendOtp(data.phoneNumber);
      setPhoneNumber(data.phoneNumber);
      setStep("otp");
      // Clear OTP field after step change
      setTimeout(() => {
        otpForm.reset({ otp: "" });
      }, 100);
      toast({
        title: "OTP Sent",
        description: "OTP has been generated. Check server console in development mode.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clear OTP field when step changes to otp
  useEffect(() => {
    if (step === "otp") {
      otpForm.reset({ otp: "" });
    }
  }, [step, otpForm]);

  const onOtpSubmit = async (data: OtpForm) => {
    try {
      await login(phoneNumber, data.otp);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      navigate("/admin-panel");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-violet-600" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            {step === "phone" 
              ? "Enter your registered admin phone number to receive an OTP"
              : "Enter the 6-digit OTP (check server console in development)"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="9876543210"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                  Send OTP
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 justify-center">
                        <Key className="w-4 h-4 text-violet-600" />
                        Enter 6-Digit OTP
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="gap-3"
                            autoFocus
                            pattern={'^\\d+$'}
                          >
                            <InputOTPGroup className="gap-3">
                              <InputOTPSlot 
                                index={0} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 hover:border-violet-300" 
                              />
                              <InputOTPSlot 
                                index={1} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 hover:border-violet-300" 
                              />
                              <InputOTPSlot 
                                index={2} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 hover:border-violet-300" 
                              />
                              <InputOTPSlot 
                                index={3} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 hover:border-violet-300" 
                              />
                              <InputOTPSlot 
                                index={4} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 hover:border-violet-300" 
                              />
                              <InputOTPSlot 
                                index={5} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 hover:border-violet-300" 
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-sm text-center text-gray-600 mb-4 space-y-1">
                  <p>OTP sent to +91 {phoneNumber}</p>
                  <p className="text-xs text-violet-600">Check the server console for the OTP code</p>
                </div>
                
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                  Verify & Login
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("phone");
                    otpForm.reset({ otp: "" }); // Explicitly clear OTP field
                  }}
                >
                  Change phone number
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}