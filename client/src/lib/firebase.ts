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

  async initializeRecaptcha(containerId: string) {
    try {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
      
      await this.recaptchaVerifier.render();
      return true;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      return false;
    }
  }

  async sendOTP(phoneNumber: string = ADMIN_PHONE): Promise<{ success: boolean; message: string }> {
    try {
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
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  async verifyOTP(otp: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
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
  }
}

export const firebaseOTPService = new FirebaseOTPService();