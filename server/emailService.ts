import Mailgun from 'mailgun.js';
import formData from 'form-data';

interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

interface MailgunConfig {
  apiKey: string;
  domain: string;
  from: string;
}

export class EmailService {
  private mg: any;
  private config: MailgunConfig | null = null;

  constructor() {
    this.mg = new Mailgun(formData);
  }

  // Initialize Mailgun with API credentials
  updateKeys(apiKey: string, domain: string, from: string) {
    try {
      this.config = { apiKey, domain, from };
      this.mg = new Mailgun(formData);
      console.log("Mailgun email service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Mailgun:", error);
      throw error;
    }
  }

  // Check if email service is configured
  isConfigured(): boolean {
    return this.config !== null && 
           !!this.config.apiKey && 
           !!this.config.domain && 
           !!this.config.from;
  }

  // Send email using Mailgun
  async sendEmail(emailData: EmailData): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("Mailgun email service not configured. Please add API keys.");
    }

    try {
      const client = this.mg.client({ 
        username: 'api', 
        key: this.config!.apiKey 
      });

      const messageData = {
        from: emailData.from || this.config!.from,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };

      const response = await client.messages.create(this.config!.domain, messageData);
      console.log("Email sent successfully:", response.id);
      return response;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(booking: any): Promise<any> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmation - OwnItRight</h2>
        <p>Dear ${booking.name},</p>
        <p>Thank you for booking a ${booking.bookingType} with OwnItRight. Here are your booking details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Property:</strong> ${booking.propertyName}</p>
          <p><strong>Type:</strong> ${booking.bookingType}</p>
          ${booking.preferredDate ? `<p><strong>Date:</strong> ${booking.preferredDate}</p>` : ''}
          ${booking.preferredTime ? `<p><strong>Time:</strong> ${booking.preferredTime}</p>` : ''}
          ${booking.numberOfVisitors ? `<p><strong>Visitors:</strong> ${booking.numberOfVisitors}</p>` : ''}
        </div>
        
        <p>Our team will contact you soon to confirm the details.</p>
        <p>For any questions, please contact us at <a href="mailto:contact@ownitright.com">contact@ownitright.com</a> or call +91 9560366601.</p>
        
        <p>Best regards,<br>OwnItRight Team</p>
      </div>
    `;

    return this.sendEmail({
      to: booking.email,
      subject: `Booking Confirmation - ${booking.propertyName}`,
      html,
      text: `Dear ${booking.name}, Your booking for ${booking.propertyName} has been confirmed. Booking ID: ${booking.bookingId}. Our team will contact you soon.`
    });
  }

  // Send lead notification email
  async sendLeadNotification(lead: any): Promise<any> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Lead Alert - OwnItRight</h2>
        <p>A new lead has been generated on the platform:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Lead Details</h3>
          <p><strong>Lead ID:</strong> ${lead.leadId}</p>
          <p><strong>Customer:</strong> ${lead.customerName}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Source:</strong> ${lead.source}</p>
          <p><strong>Property:</strong> ${lead.propertyName}</p>
          <p><strong>Lead Type:</strong> ${lead.leadType}</p>
          <p><strong>Priority:</strong> ${lead.priority}</p>
          <p><strong>Score:</strong> ${lead.leadScore}</p>
        </div>
        
        <p>Please follow up with this lead promptly.</p>
      </div>
    `;

    return this.sendEmail({
      to: 'contact@ownitright.com', // Internal notification
      subject: `New Lead Alert - ${lead.customerName}`,
      html,
      text: `New lead generated: ${lead.leadId} - ${lead.customerName} (${lead.phone}) interested in ${lead.propertyName}`
    });
  }

  // Send password reset email
  async sendPasswordReset(email: string, resetToken: string): Promise<any> {
    const resetUrl = `https://your-domain.com/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset - OwnItRight</h2>
        <p>You requested a password reset for your OwnItRight account.</p>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
        
        <p>This link will expire in 24 hours. If you didn't request this reset, please ignore this email.</p>
        
        <p>Best regards,<br>OwnItRight Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset - OwnItRight',
      html,
      text: `Password reset requested. Visit: ${resetUrl}`
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();