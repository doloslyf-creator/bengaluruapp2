import { notifications, notificationTemplates, notificationPreferences, type Notification, type InsertNotification, type NotificationTemplate, type InsertNotificationTemplate, type NotificationPreferences, type InsertNotificationPreferences } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, and, desc, asc, or, sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Email service integration (using SendGrid)
interface EmailConfig {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

class NotificationService {
  private apiKeys: Record<string, any> = {};

  constructor() {
    // Load API keys from file
    this.loadApiKeys();
  }

  private loadApiKeys() {
    try {
      const apiKeysFile = path.join(process.cwd(), 'api-keys.json');
      if (fs.existsSync(apiKeysFile)) {
        const data = fs.readFileSync(apiKeysFile, 'utf8');
        this.apiKeys = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading API keys for notifications:', error);
    }
  }

  // Create a notification
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    
    // If user has email preferences enabled, send email
    if (data.userId) {
      await this.checkAndSendEmail(notification);
    }
    
    return notification;
  }

  // Create multiple notifications (bulk)
  async createBulkNotifications(dataArray: InsertNotification[]): Promise<Notification[]> {
    const createdNotifications = await db.insert(notifications).values(dataArray).returning();
    
    // Send emails for notifications that require them
    for (const notification of createdNotifications) {
      if (notification.userId) {
        await this.checkAndSendEmail(notification);
      }
    }
    
    return createdNotifications;
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    category?: string;
    priority?: string;
  } = {}): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const { limit = 20, offset = 0, unreadOnly = false, category, priority } = options;

    let whereConditions = [
      or(
        eq(notifications.userId, userId),
        and(eq(notifications.userType, "all"), sql`${notifications.userId} IS NULL`)
      )
    ];

    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }

    if (category) {
      whereConditions.push(eq(notifications.category, category as any));
    }

    if (priority) {
      whereConditions.push(eq(notifications.priority, priority as any));
    }

    // Get notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(notifications)
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]);

    // Get unread count
    const [{ count: unreadCount }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(notifications)
      .where(and(
        or(
          eq(notifications.userId, userId),
          and(eq(notifications.userType, "all"), sql`${notifications.userId} IS NULL`)
        ),
        eq(notifications.isRead, false)
      ));

    return {
      notifications: userNotifications,
      total,
      unreadCount
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId?: string): Promise<boolean> {
    let whereCondition = eq(notifications.id, notificationId);
    
    if (userId) {
      whereCondition = and(
        eq(notifications.id, notificationId),
        or(
          eq(notifications.userId, userId),
          eq(notifications.userType, "all")
        )
      );
    }

    const [updated] = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();

    return !!updated;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          or(
            eq(notifications.userId, userId),
            and(eq(notifications.userType, "all"), sql`${notifications.userId} IS NULL`)
          ),
          eq(notifications.isRead, false)
        )
      );

    return result.rowCount || 0;
  }

  // Archive notification
  async archiveNotification(notificationId: string, userId?: string): Promise<boolean> {
    let whereCondition = eq(notifications.id, notificationId);
    
    if (userId) {
      whereCondition = and(
        eq(notifications.id, notificationId),
        or(
          eq(notifications.userId, userId),
          eq(notifications.userType, "all")
        )
      );
    }

    const [updated] = await db
      .update(notifications)
      .set({ 
        isArchived: true,
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();

    return !!updated;
  }

  // Create notification from template
  async createNotificationFromTemplate(
    templateKey: string, 
    userId: string | null, 
    variables: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<Notification | null> {
    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.templateKey, templateKey),
        eq(notificationTemplates.isActive, true)
      ));

    if (!template) {
      console.error(`Notification template not found: ${templateKey}`);
      return null;
    }

    // Replace variables in templates
    const title = this.replaceVariables(template.titleTemplate, variables);
    const message = this.replaceVariables(template.messageTemplate, variables);

    const notificationData: InsertNotification = {
      userId,
      userType: userId ? "user" : "all",
      title,
      message,
      type: template.type,
      category: template.category,
      priority: template.priority,
      metadata,
      relatedEntityType: variables.entityType || null,
      relatedEntityId: variables.entityId || null,
      actionUrl: variables.actionUrl || null,
      actionText: variables.actionText || null,
    };

    const notification = await this.createNotification(notificationData);

    // Send email if template requires it
    if (template.requiresEmail && userId && template.emailSubjectTemplate && template.emailBodyTemplate) {
      await this.sendEmailFromTemplate(template, userId, variables);
    }

    return notification;
  }

  // Helper method to replace variables in templates
  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Send email from template
  private async sendEmailFromTemplate(
    template: NotificationTemplate,
    userId: string,
    variables: Record<string, any>
  ): Promise<boolean> {
    if (!template.emailSubjectTemplate || !template.emailBodyTemplate) {
      return false;
    }

    const subject = this.replaceVariables(template.emailSubjectTemplate, variables);
    const htmlBody = this.replaceVariables(template.emailBodyTemplate, variables);

    return await this.sendEmail({
      to: variables.userEmail || userId, // Assume userId is email or pass userEmail in variables
      subject,
      htmlBody
    });
  }

  // Check user preferences and send email if enabled
  private async checkAndSendEmail(notification: Notification): Promise<void> {
    if (!notification.userId) return;

    try {
      // Get user preferences
      const [preferences] = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, notification.userId));

      // Default to sending emails if no preferences set
      const shouldSendEmail = !preferences || preferences.emailNotifications;
      
      // Check category-specific preferences
      if (preferences) {
        const categoryPrefs = {
          property: preferences.propertyUpdates,
          report: preferences.reportNotifications,
          booking: preferences.bookingNotifications,
          payment: preferences.paymentNotifications,
          lead: preferences.leadNotifications,
          system: preferences.systemNotifications,
          promotion: preferences.promotionalNotifications,
        };

        if (notification.category && !categoryPrefs[notification.category as keyof typeof categoryPrefs]) {
          return; // Don't send email for this category
        }
      }

      if (shouldSendEmail) {
        await this.sendNotificationEmail(notification);
      }
    } catch (error) {
      console.error('Error checking email preferences:', error);
    }
  }

  // Send notification email
  private async sendNotificationEmail(notification: Notification): Promise<void> {
    if (!notification.userId) return;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">OwnItRight</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Property Advisory Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-top: 0;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">${notification.message}</p>
          
          ${notification.actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${notification.actionUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                ${notification.actionText || 'View Details'}
              </a>
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This is an automated notification from OwnItRight. 
              You can manage your notification preferences in your dashboard.
            </p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: notification.userId, // Assuming userId is email
      subject: `OwnItRight: ${notification.title}`,
      htmlBody: emailBody
    });

    // Mark as email sent
    await db
      .update(notifications)
      .set({ 
        emailSent: true, 
        emailSentAt: new Date() 
      })
      .where(eq(notifications.id, notification.id));
  }

  // Send email using SendGrid
  private async sendEmail(config: EmailConfig): Promise<boolean> {
    if (!this.apiKeys.sendgridApiKey) {
      console.warn('SendGrid API key not configured');
      return false;
    }

    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKeys.sendgridApiKey);

      const msg = {
        to: config.to,
        from: this.apiKeys.sendgridFromEmail || 'notifications@ownitright.com',
        subject: config.subject,
        html: config.htmlBody,
        text: config.textBody || config.htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      await sgMail.send(msg);
      console.log(`📧 Email sent to ${config.to}: ${config.subject}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Notification Templates Management
  async createTemplate(data: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const [template] = await db.insert(notificationTemplates).values(data).returning();
    return template;
  }

  async getTemplate(templateKey: string): Promise<NotificationTemplate | null> {
    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.templateKey, templateKey));
    
    return template || null;
  }

  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return await db
      .select()
      .from(notificationTemplates)
      .orderBy(asc(notificationTemplates.name));
  }

  // User Preferences Management
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    
    return preferences || null;
  }

  async updateUserPreferences(userId: string, data: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    // Check if preferences exist
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(notificationPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(notificationPreferences)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }

  // Utility methods for common notification scenarios
  async notifyReportReady(userId: string, reportType: string, reportId: string): Promise<void> {
    await this.createNotificationFromTemplate('REPORT_READY', userId, {
      reportType,
      reportId,
      entityType: 'report',
      entityId: reportId,
      actionUrl: `/user-dashboard/reports/${reportId}`,
      actionText: 'View Report'
    });
  }

  async notifyBookingConfirmed(userId: string, bookingId: string, propertyName: string): Promise<void> {
    await this.createNotificationFromTemplate('BOOKING_CONFIRMED', userId, {
      bookingId,
      propertyName,
      entityType: 'booking',
      entityId: bookingId,
      actionUrl: `/user-dashboard/bookings/${bookingId}`,
      actionText: 'View Booking'
    });
  }

  async notifyPaymentReceived(userId: string, amount: number, service: string): Promise<void> {
    await this.createNotificationFromTemplate('PAYMENT_RECEIVED', userId, {
      amount: `₹${amount}`,
      service,
      entityType: 'payment',
      actionUrl: '/user-dashboard/payments',
      actionText: 'View Payments'
    });
  }

  async notifySystemMessage(title: string, message: string, priority: "low" | "medium" | "high" | "urgent" = "medium"): Promise<void> {
    await this.createNotification({
      userId: null, // System-wide
      userType: "all",
      title,
      message,
      type: "system",
      category: "system",
      priority
    });
  }
}

export const notificationService = new NotificationService();