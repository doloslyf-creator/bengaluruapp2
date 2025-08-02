import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Admin phone number for verification
const ADMIN_PHONE = "+919560366601"; // Your admin phone number

export class FirebaseOTPService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private verificationId: string | null = null;
  private developmentOTP: string | null = null;

  async initializeRecaptcha(containerId: string) {
    try {
      // In development, use invisible reCAPTCHA to avoid billing issues
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
      
      // For development, enable test phone numbers
      if (import.meta.env.DEV) {
        // Configure test phone number for development
        auth.settings.appVerificationDisabledForTesting = true;
      }
      
      await this.recaptchaVerifier.render();
      return true;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      
      // Fallback for development without reCAPTCHA
      if (import.meta.env.DEV) {
        console.log('Development mode: reCAPTCHA disabled');
        return true;
      }
      
      return false;
    }
  }

  async sendOTP(phoneNumber: string = ADMIN_PHONE): Promise<{ success: boolean; message: string }> {
    try {
      // Development mode fallback - generate local OTP
      if (import.meta.env.DEV) {
        this.developmentOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`🔐 Development OTP for ${phoneNumber}: ${this.developmentOTP}`);
        
        return {
          success: true,
          message: 'Development OTP generated (check console)'
        };
      }

      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);
      this.verificationId = confirmationResult.verificationId;
      
      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Development fallback for Firebase billing issues
      if (import.meta.env.DEV && error.code === 'auth/billing-not-enabled') {
        this.developmentOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`🔐 Development OTP (Firebase billing not enabled) for ${phoneNumber}: ${this.developmentOTP}`);
        
        return {
          success: true,
          message: 'Development OTP generated (Firebase billing not enabled)'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  async verifyOTP(otp: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      // Development mode verification
      if (import.meta.env.DEV && this.developmentOTP) {
        if (otp === this.developmentOTP) {
          // Create a mock user for development
          const mockUser = {
            uid: 'dev-admin-user',
            phoneNumber: ADMIN_PHONE,
            isAnonymous: false
          };
          
          // Store in localStorage for persistence
          localStorage.setItem('firebase-auth-dev', JSON.stringify(mockUser));
          
          return {
            success: true,
            message: 'Development authentication successful',
            user: mockUser
          };
        } else {
          return {
            success: false,
            message: 'Invalid development OTP'
          };
        }
      }

      if (!this.verificationId) {
        throw new Error('No verification ID found. Please request OTP first.');
      }

      const credential = PhoneAuthProvider.credential(this.verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      
      // Check if the authenticated phone number matches admin number
      if (result.user.phoneNumber === ADMIN_PHONE) {
        return {
          success: true,
          message: 'Authentication successful',
          user: result.user
        };
      } else {
        // Sign out if not admin
        await auth.signOut();
        return {
          success: false,
          message: 'Unauthorized phone number'
        };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Invalid OTP'
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth.signOut();
      this.verificationId = null;
      this.developmentOTP = null;
      
      // Clear development auth
      if (import.meta.env.DEV) {
        localStorage.removeItem('firebase-auth-dev');
      }
      
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.verificationId = null;
    this.developmentOTP = null;
  }

  // Check for development auth on page load
  checkDevelopmentAuth() {
    if (import.meta.env.DEV) {
      const devAuth = localStorage.getItem('firebase-auth-dev');
      if (devAuth) {
        try {
          return JSON.parse(devAuth);
        } catch {
          localStorage.removeItem('firebase-auth-dev');
        }
      }
    }
    return null;
  }
}

export const firebaseOTPService = new FirebaseOTPService();