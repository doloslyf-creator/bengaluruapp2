import { notifications, notificationTemplates, notificationPreferences } from "../shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seedNotificationTemplates() {
  console.log("Seeding notification templates...");
  
  const templates = [
    {
      templateKey: 'REPORT_READY',
      name: 'Report Ready',
      description: 'Notification when a property report is ready for download',
      titleTemplate: '{{reportType}} Report Ready',
      messageTemplate: 'Your {{reportType}} report for property {{propertyName}} is now ready for download.',
      type: 'report' as const,
      category: 'report' as const,
      priority: 'medium' as const,
      requiresEmail: true,
      emailSubjectTemplate: 'OwnItRight: Your {{reportType}} Report is Ready',
      emailBodyTemplate: '<h2>Your {{reportType}} Report is Ready!</h2><p>Dear Customer,</p><p>Your {{reportType}} report for the property {{propertyName}} has been completed and is now ready for download.</p><p>You can access your report through your dashboard or by clicking the link below.</p><p>Thank you for choosing OwnItRight for your property advisory needs.</p>',
      isActive: true
    },
    {
      templateKey: 'BOOKING_CONFIRMED',
      name: 'Booking Confirmed',
      description: 'Notification when a site visit booking is confirmed',
      titleTemplate: 'Site Visit Booking Confirmed',
      messageTemplate: 'Your site visit for {{propertyName}} has been confirmed for {{visitDate}}.',
      type: 'booking' as const,
      category: 'booking' as const,
      priority: 'high' as const,
      requiresEmail: true,
      emailSubjectTemplate: 'OwnItRight: Site Visit Confirmed - {{propertyName}}',
      emailBodyTemplate: '<h2>Site Visit Booking Confirmed</h2><p>Dear Customer,</p><p>Your site visit for {{propertyName}} has been confirmed for {{visitDate}}.</p><p>Our representative will meet you at the property location. Please arrive on time for the best experience.</p><p>If you need to reschedule, please contact us at least 24 hours in advance.</p>',
      isActive: true
    },
    {
      templateKey: 'PAYMENT_RECEIVED',
      name: 'Payment Received',
      description: 'Notification when a payment is successfully received',
      titleTemplate: 'Payment Confirmation',
      messageTemplate: 'We have received your payment of {{amount}} for {{service}}. Thank you!',
      type: 'payment' as const,
      category: 'payment' as const,
      priority: 'medium' as const,
      requiresEmail: true,
      emailSubjectTemplate: 'OwnItRight: Payment Received - {{amount}}',
      emailBodyTemplate: '<h2>Payment Confirmation</h2><p>Dear Customer,</p><p>We have successfully received your payment of {{amount}} for {{service}}.</p><p>Transaction details:</p><ul><li>Amount: {{amount}}</li><li>Service: {{service}}</li><li>Date: {{paymentDate}}</li></ul><p>Thank you for your business!</p>',
      isActive: true
    },
    {
      templateKey: 'PROPERTY_MATCH',
      name: 'Property Match Found',
      description: 'Notification when a property matches user criteria',
      titleTemplate: 'New Property Match Found',
      messageTemplate: 'We found a property that matches your criteria: {{propertyName}} in {{location}}.',
      type: 'property' as const,
      category: 'property' as const,
      priority: 'medium' as const,
      requiresEmail: true,
      emailSubjectTemplate: 'OwnItRight: New Property Match - {{propertyName}}',
      emailBodyTemplate: '<h2>New Property Match Found!</h2><p>Dear Customer,</p><p>Great news! We found a property that matches your search criteria:</p><p><strong>{{propertyName}}</strong><br>Location: {{location}}<br>Price: {{price}}<br>Type: {{propertyType}}</p><p>View the property details and schedule a visit through your dashboard.</p>',
      isActive: true
    },
    {
      templateKey: 'WELCOME_USER',
      name: 'Welcome New User',
      description: 'Welcome message for new users',
      titleTemplate: 'Welcome to OwnItRight!',
      messageTemplate: 'Welcome to OwnItRight! We are here to help you find the perfect property with expert guidance.',
      type: 'info' as const,
      category: 'system' as const,
      priority: 'medium' as const,
      requiresEmail: true,
      emailSubjectTemplate: 'Welcome to OwnItRight - Your Property Advisory Partner',
      emailBodyTemplate: '<h2>Welcome to OwnItRight!</h2><p>Dear {{userName}},</p><p>Thank you for joining OwnItRight, your trusted property advisory platform.</p><p>We are here to help you:</p><ul><li>Find the perfect property</li><li>Get professional property valuations</li><li>Complete legal due diligence</li><li>Access CIVIL+MEP reports</li></ul><p>Start exploring properties and our services through your personalized dashboard.</p>',
      isActive: true
    }
  ];

  try {
    for (const template of templates) {
      await db.insert(notificationTemplates).values(template).onConflictDoNothing();
      console.log(`✓ Seeded template: ${template.name}`);
    }
    console.log("✅ Notification templates seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding notification templates:", error);
  }
}

async function createSampleNotifications() {
  console.log("Creating sample notifications...");
  
  const sampleNotifications = [
    {
      userId: "test@example.com",
      userType: "user" as const,
      title: "Welcome to OwnItRight!",
      message: "Thank you for joining OwnItRight. Explore our comprehensive property advisory services through your dashboard.",
      type: "info" as const,
      category: "system" as const,
      priority: "medium" as const,
      actionUrl: "/user-dashboard",
      actionText: "Explore Dashboard"
    },
    {
      userId: "test@example.com",
      userType: "user" as const,
      title: "Property Valuation Report Ready",
      message: "Your property valuation report for the 3 BHK apartment in Koramangala is now ready for download.",
      type: "report" as const,
      category: "report" as const,
      priority: "high" as const,
      actionUrl: "/user-dashboard/valuation-reports",
      actionText: "Download Report"
    },
    {
      userId: "test@example.com",
      userType: "user" as const,
      title: "Site Visit Scheduled",
      message: "Your site visit for the property in Whitefield has been scheduled for tomorrow at 2:00 PM.",
      type: "booking" as const,
      category: "booking" as const,
      priority: "high" as const,
      actionUrl: "/user-dashboard/bookings",
      actionText: "View Details"
    },
    {
      userId: null,
      userType: "all" as const,
      title: "New Feature: Legal Due Diligence Tracker",
      message: "Track your property legal verification process with our new 12-step legal due diligence tracker.",
      type: "info" as const,
      category: "system" as const,
      priority: "medium" as const,
      actionUrl: "/user-dashboard/legal-tracker",
      actionText: "Learn More"
    }
  ];

  try {
    for (const notification of sampleNotifications) {
      await db.insert(notifications).values(notification);
      console.log(`✓ Created notification: ${notification.title}`);
    }
    console.log("✅ Sample notifications created successfully!");
  } catch (error) {
    console.error("❌ Error creating sample notifications:", error);
  }
}

// Main seeding function
export async function seedNotifications() {
  try {
    await seedNotificationTemplates();
    await createSampleNotifications();
    console.log("🎉 All notification data seeded successfully!");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNotifications();
}