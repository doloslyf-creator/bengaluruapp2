
import { apiKeysManager } from "./paymentService";

interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, any>;
}

interface WhatsAppContact {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
}

export class WhatsAppService {
  private baseUrl = "https://api.interakt.ai/v1";
  private apiKey: string;

  constructor() {
    // Try to get from environment first, then from global API keys storage
    this.apiKey = process.env.INTERAKT_API_KEY || global.globalApiKeys?.interaktApiKey || "";
  }

  private getHeaders() {
    if (!this.apiKey) {
      console.warn("⚠️ Interakt API key not configured. WhatsApp messages will be simulated.");
    }
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json"
    };
  }

  private isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== "";
  }

  // Send text message
  async sendTextMessage(phoneNumber: string, message: string) {
    try {
      // If API key not configured, simulate the message
      if (!this.isConfigured()) {
        console.log(`📱 [SIMULATED] WhatsApp message to ${phoneNumber}: ${message.substring(0, 50)}...`);
        return { 
          success: true, 
          messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          simulated: true 
        };
      }

      const cleanPhoneNumber = phoneNumber.replace(/^\+91/, "").replace(/\D/g, "");
      
      const response = await fetch(`${this.baseUrl}/integrations/whatsapp/generic/messages`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          countryCode: "+91",
          phoneNumber: cleanPhoneNumber,
          callbackData: "text_message",
          type: "text",
          data: { message }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ WhatsApp message sent to ${phoneNumber}:`, result.id || result.messageId);
        return { success: true, messageId: result.id || result.messageId };
      } else {
        const errorText = await response.text();
        console.error(`❌ WhatsApp message failed for ${phoneNumber}:`, response.status, errorText);
        return { success: false, error: `API Error: ${response.status} - ${errorText}` };
      }
    } catch (error) {
      console.error("WhatsApp service error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // Send template message
  async sendTemplateMessage(phoneNumber: string, templateName: string, params: Record<string, any> = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/integrations/whatsapp/generic/messages`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          countryCode: "+91",
          phoneNumber: phoneNumber.replace(/^\+91/, ""),
          callbackData: "template_message",
          type: "template",
          data: {
            templateName,
            templateHeader: params.header || {},
            templateBody: params.body || {},
            templateButtons: params.buttons || []
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ WhatsApp template sent to ${phoneNumber}:`, result.id);
        return { success: true, messageId: result.id };
      } else {
        const error = await response.text();
        console.error(`❌ WhatsApp template failed for ${phoneNumber}:`, error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("WhatsApp template error:", error);
      return { success: false, error: error.message };
    }
  }

  // Track contact engagement
  async trackEvent(phoneNumber: string, eventName: string, properties: Record<string, any> = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/integrations/whatsapp/generic/events`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/^\+91/, ""),
          countryCode: "+91",
          event: eventName,
          traits: properties
        })
      });

      if (response.ok) {
        console.log(`📊 Event tracked for ${phoneNumber}: ${eventName}`);
        return { success: true };
      } else {
        const error = await response.text();
        console.error(`❌ Event tracking failed for ${phoneNumber}:`, error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("Event tracking error:", error);
      return { success: false, error: error.message };
    }
  }

  // Bulk messaging
  async sendBulkMessages(contacts: Array<{phoneNumber: string, message: string}>) {
    const results = [];
    for (const contact of contacts) {
      const result = await this.sendTextMessage(contact.phoneNumber, contact.message);
      results.push({ phoneNumber: contact.phoneNumber, ...result });
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return results;
  }

  // Pre-defined message templates for common scenarios
  getPropertyInquiryMessage(customerName: string, propertyName: string) {
    return `Hi ${customerName}! 👋

Thank you for your interest in *${propertyName}*. 

Our property advisor will contact you within 2 hours to:
🏡 Share detailed property information
📅 Schedule a site visit
💰 Discuss pricing and offers
📋 Answer all your questions

Need immediate assistance? Reply to this message or call us at +91 98765 43210.

Best regards,
OwnItRight Team`;
  }

  getSiteVisitConfirmationMessage(customerName: string, propertyName: string, visitDate: string, visitTime: string) {
    return `Hi ${customerName}! ✅

Your site visit for *${propertyName}* has been confirmed:

📅 Date: ${visitDate}
🕐 Time: ${visitTime}
📍 Meeting Point: Property location (exact address will be shared 1 hour before)

What to bring:
📄 ID proof
👥 All decision makers
📝 List of questions

Need to reschedule? Reply to this message.

See you soon!
OwnItRight Team`;
  }

  getReportReadyMessage(customerName: string, reportType: string, accessLink: string) {
    return `Hi ${customerName}! 📋

Great news! Your *${reportType}* is ready for download.

🔗 Access your report: ${accessLink}

Your report includes:
✅ Detailed analysis
✅ Expert recommendations  
✅ Risk assessment
✅ Investment insights

Questions about your report? Reply here or call +91 98765 43210.

Happy investing!
OwnItRight Team`;
  }

  getFollowUpMessage(customerName: string, propertyName: string, daysSinceInquiry: number) {
    return `Hi ${customerName}! 👋

Hope you're doing well! It's been ${daysSinceInquiry} days since you showed interest in *${propertyName}*.

📈 Recent updates:
• Price might change soon
• Limited units available
• New amenities announced

Would you like to:
🏡 Schedule a site visit?
📞 Speak with our advisor?
📋 Get the latest pricing?

Just reply with your preference!

Best regards,
OwnItRight Team`;
  }
}

export const whatsappService = new WhatsAppService();
