import Razorpay from "razorpay";
import { apiKeysSettings } from "@shared/schema";
import { db } from "./db";

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

export class PaymentService {
  private razorpay: Razorpay | null = null;
  private initialized = false;

  constructor() {
    this.initializeRazorpay();
  }

  private async initializeRazorpay() {
    try {
      const [apiKeys] = await db.select().from(apiKeysSettings).limit(1);
      
      if (apiKeys?.razorpayKeyId && apiKeys?.razorpayKeySecret) {
        this.razorpay = new Razorpay({
          key_id: apiKeys.razorpayKeyId,
          key_secret: apiKeys.razorpayKeySecret,
        });
        this.initialized = true;
        console.log("Razorpay initialized successfully");
      } else {
        console.warn("Razorpay keys not found in database. Payment functionality disabled.");
      }
    } catch (error) {
      console.error("Failed to initialize Razorpay:", error);
    }
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

    try {
      const crypto = require("crypto");
      const [apiKeys] = await db.select().from(apiKeysSettings).limit(1);
      
      if (!apiKeys?.razorpayKeySecret) {
        throw new Error("Razorpay secret key not found");
      }

      const expectedSignature = crypto
        .createHmac("sha256", apiKeys.razorpayKeySecret)
        .update(verificationData.razorpay_order_id + "|" + verificationData.razorpay_payment_id)
        .digest("hex");

      return expectedSignature === verificationData.razorpay_signature;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
    }
  }

  /**
   * Get payment details by ID
   */
  async getPayment(paymentId: string): Promise<any> {
    if (!this.initialized || !this.razorpay) {
      throw new Error("Payment service not initialized");
    }

    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw new Error("Failed to fetch payment details");
    }
  }

  /**
   * Create refund
   */
  async createRefund(paymentId: string, amount?: number): Promise<any> {
    if (!this.initialized || !this.razorpay) {
      throw new Error("Payment service not initialized");
    }

    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount, // If amount is not provided, full refund
      });
      return refund;
    } catch (error) {
      console.error("Error creating refund:", error);
      throw new Error("Failed to create refund");
    }
  }

  /**
   * Check if payment service is ready
   */
  isReady(): boolean {
    return this.initialized && this.razorpay !== null;
  }

  /**
   * Reinitialize the service (useful after API keys are updated)
   */
  async reinitialize(): Promise<void> {
    this.razorpay = null;
    this.initialized = false;
    await this.initializeRazorpay();
  }
}

export const paymentService = new PaymentService();