import Razorpay from "razorpay";
import crypto from "crypto";

// Payment interfaces
export interface PaymentOrderData {
  amount: number; // in paise (INR)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// In-memory storage for API keys (in production, use database with encryption)
interface ApiKeysStorage {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayTestMode?: boolean;
  googleMapsApiKey?: string;
  googleAnalyticsId?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  sendgridApiKey?: string;
  sendgridFromEmail?: string;
  surepassApiKey?: string;
}

class ApiKeysManager {
  private apiKeys: ApiKeysStorage = {};

  setKeys(keys: Partial<ApiKeysStorage>) {
    this.apiKeys = { ...this.apiKeys, ...keys };
    console.log("API keys updated in storage:", Object.keys(keys));
  }

  getKeys(): ApiKeysStorage {
    return this.apiKeys;
  }

  getAllKeys(): ApiKeysStorage {
    return this.apiKeys;
  }

  hasRazorpayKeys(): boolean {
    return !!(this.apiKeys.razorpayKeyId && this.apiKeys.razorpayKeySecret);
  }
}

const apiKeysManager = new ApiKeysManager();

export class PaymentService {
  private razorpay: Razorpay | null = null;
  private initialized = false;

  constructor() {
    // Initialize with environment variables if available
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.initializeWithKeys(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
    }
  }

  private initializeWithKeys(keyId: string, keySecret: string) {
    try {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.initialized = true;
      console.log("Razorpay initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Razorpay:", error);
      this.initialized = false;
    }
  }

  async reinitialize() {
    const keys = apiKeysManager.getKeys();
    if (keys.razorpayKeyId && keys.razorpayKeySecret) {
      this.initializeWithKeys(keys.razorpayKeyId, keys.razorpayKeySecret);
    }
  }

  updateKeys(keyId: string, keySecret: string) {
    apiKeysManager.setKeys({ razorpayKeyId: keyId, razorpayKeySecret: keySecret });
    this.initializeWithKeys(keyId, keySecret);
  }

  /**
   * Create a payment order
   */
  async createOrder(orderData: PaymentOrderData): Promise<any> {
    if (!this.initialized || !this.razorpay) {
      throw new Error("Payment service not initialized. Please configure Razorpay keys in admin settings.");
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        receipt: orderData.receipt,
        notes: orderData.notes,
      });

      return order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new Error("Failed to create payment order");
    }
  }

  /**
   * Verify payment signature
   */
  verifyPayment(verificationData: PaymentVerificationData): boolean {
    if (!this.initialized || !this.razorpay) {
      throw new Error("Payment service not initialized");
    }

    const keys = apiKeysManager.getKeys();
    if (!keys.razorpayKeySecret) {
      throw new Error("Razorpay key secret not available");
    }

    try {
      const body = verificationData.razorpay_order_id + "|" + verificationData.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keys.razorpayKeySecret)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === verificationData.razorpay_signature;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
    }
  }

  isReady(): boolean {
    return this.initialized && !!this.razorpay;
  }
}

// Export singleton instance and API keys manager
export const paymentService = new PaymentService();
export { apiKeysManager };