import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  phoneNumber: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const sendOtpMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", { phoneNumber });
      return response.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { phoneNumber, otp });
      return response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
    },
  });

  const sendOtp = async (phoneNumber: string) => {
    await sendOtpMutation.mutateAsync(phoneNumber);
  };

  const login = async (phoneNumber: string, otp: string) => {
    await loginMutation.mutateAsync({ phoneNumber, otp });
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      sendOtp,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}