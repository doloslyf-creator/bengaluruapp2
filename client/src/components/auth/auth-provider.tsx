import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { auth, firebaseOTPService } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface User {
  phoneNumber: string;
  isAdmin: boolean;
  firebaseUser?: FirebaseUser;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  firebaseUser: FirebaseUser | null;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_PHONE = "+919560366601";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setFirebaseLoading(false);
      
      // Set user state based on Firebase user
      if (fbUser && fbUser.phoneNumber === ADMIN_PHONE) {
        setUser({
          phoneNumber: fbUser.phoneNumber,
          isAdmin: true,
          firebaseUser: fbUser
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase-based authentication functions
  const sendOtp = async (phoneNumber: string = ADMIN_PHONE) => {
    // This is handled directly by Firebase in the login component
    throw new Error("Use Firebase OTP service directly");
  };

  const login = async (phoneNumber: string, otp: string) => {
    // This is handled directly by Firebase in the login component
    throw new Error("Use Firebase OTP service directly");
  };

  const logout = async () => {
    try {
      await firebaseOTPService.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refetch = () => {
    // Refresh auth state - Firebase handles this automatically
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser && currentFirebaseUser.phoneNumber === ADMIN_PHONE) {
      setUser({
        phoneNumber: currentFirebaseUser.phoneNumber,
        isAdmin: true,
        firebaseUser: currentFirebaseUser
      });
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: firebaseLoading,
      login,
      sendOtp,
      logout,
      firebaseUser,
      refetch,
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