
import { storage } from "./storage";
import { whatsappService } from "./whatsappService";
import { eq, and, lt, gte, sql } from "drizzle-orm";
import { leads, leadActivities } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface NurturingRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: "time_based" | "behavior_based" | "status_based";
    condition: string;
    value: any;
  };
  action: {
    type: "whatsapp" | "email" | "task" | "status_update";
    template: string;
    delay?: number; // minutes
  };
  filters: {
    leadTypes?: string[];
    sources?: string[];
    priorities?: string[];
    minScore?: number;
    maxScore?: number;
  };
}

export class LeadNurturingService {
  private nurturingRules: NurturingRule[] = [
    {
      id: "immediate_followup",
      name: "Immediate Follow-up",
      description: "Contact new leads within 15 minutes",
      trigger: {
        type: "time_based",
        condition: "created_since_minutes",
        value: 15
      },
      action: {
        type: "whatsapp",
        template: "immediate_followup",
        delay: 0
      },
      filters: {
        leadTypes: ["hot", "warm"],
        minScore: 50
      }
    },
    {
      id: "24_hour_followup",
      name: "24-Hour Follow-up",
      description: "Follow up if no response in 24 hours",
      trigger: {
        type: "time_based",
        condition: "no_response_hours",
        value: 24
      },
      action: {
        type: "whatsapp",
        template: "24_hour_followup",
        delay: 0
      },
      filters: {
        leadTypes: ["hot", "warm"],
        minScore: 40
      }
    },
    {
      id: "weekly_nurture",
      name: "Weekly Nurture",
      description: "Weekly check-in for warm leads",
      trigger: {
        type: "time_based",
        condition: "last_contact_days",
        value: 7
      },
      action: {
        type: "whatsapp",
        template: "weekly_nurture",
        delay: 0
      },
      filters: {
        leadTypes: ["warm"],
        minScore: 30
      }
    },
    {
      id: "property_price_alert",
      name: "Property Price Change Alert",
      description: "Notify when interested property price changes",
      trigger: {
        type: "behavior_based",
        condition: "property_price_changed",
        value: true
      },
      action: {
        type: "whatsapp",
        template: "price_change_alert",
        delay: 30
      },
      filters: {
        leadTypes: ["hot", "warm"],
        minScore: 50
      }
    },
    {
      id: "site_visit_reminder",
      name: "Site Visit Reminder",
      description: "Remind about scheduled site visits",
      trigger: {
        type: "time_based",
        condition: "site_visit_in_hours",
        value: 2
      },
      action: {
        type: "whatsapp",
        template: "site_visit_reminder",
        delay: 0
      },
      filters: {}
    },
    {
      id: "cold_lead_reactivation",
      name: "Cold Lead Reactivation",
      description: "Try to reactivate cold leads after 30 days",
      trigger: {
        type: "time_based",
        condition: "last_contact_days",
        value: 30
      },
      action: {
        type: "whatsapp",
        template: "reactivation_offer",
        delay: 0
      },
      filters: {
        leadTypes: ["cold"],
        maxScore: 40
      }
    }
  ];

  async processNurturingRules() {
    console.log("🤖 Starting lead nurturing automation cycle...");
    
    for (const rule of this.nurturingRules) {
      try {
        await this.processRule(rule);
      } catch (error) {
        console.error(`Error processing nurturing rule ${rule.id}:`, error);
      }
    }
    
    console.log("✅ Lead nurturing cycle completed");
  }

  private async processRule(rule: NurturingRule) {
    const eligibleLeads = await this.findEligibleLeads(rule);
    console.log(`📋 Rule "${rule.name}": Found ${eligibleLeads.length} eligible leads`);

    for (const lead of eligibleLeads) {
      try {
        await this.executeAction(rule, lead);
        await this.logNurturingActivity(rule, lead);
      } catch (error) {
        console.error(`Error executing action for lead ${lead.leadId}:`, error);
      }
    }
  }

  private async findEligibleLeads(rule: NurturingRule) {
    let query = db.select().from(leads);
    const conditions = [];

    // Apply filters
    if (rule.filters.leadTypes?.length) {
      conditions.push(sql`${leads.leadType} = ANY(${rule.filters.leadTypes})`);
    }
    
    if (rule.filters.sources?.length) {
      conditions.push(sql`${leads.source} = ANY(${rule.filters.sources})`);
    }
    
    if (rule.filters.priorities?.length) {
      conditions.push(sql`${leads.priority} = ANY(${rule.filters.priorities})`);
    }
    
    if (rule.filters.minScore !== undefined) {
      conditions.push(gte(leads.leadScore, rule.filters.minScore));
    }
    
    if (rule.filters.maxScore !== undefined) {
      conditions.push(lt(leads.leadScore, rule.filters.maxScore));
    }

    // Apply trigger conditions
    switch (rule.trigger.condition) {
      case "created_since_minutes":
        conditions.push(
          gte(leads.createdAt, 
            sql`NOW() - INTERVAL '${rule.trigger.value} minutes'`
          )
        );
        break;
        
      case "no_response_hours":
        conditions.push(
          lt(leads.updatedAt, 
            sql`NOW() - INTERVAL '${rule.trigger.value} hours'`
          )
        );
        break;
        
      case "last_contact_days":
        conditions.push(
          lt(leads.updatedAt, 
            sql`NOW() - INTERVAL '${rule.trigger.value} days'`
          )
        );
        break;
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const eligibleLeads = await query;
    
    // Filter out leads that have already been processed by this rule today
    const finalLeads = [];
    for (const lead of eligibleLeads) {
      const hasRecentActivity = await this.hasRecentNurturingActivity(rule.id, lead.id);
      if (!hasRecentActivity) {
        finalLeads.push(lead);
      }
    }

    return finalLeads;
  }

  private async hasRecentNurturingActivity(ruleId: string, leadId: string): Promise<boolean> {
    const activities = await db.select()
      .from(leadActivities)
      .where(
        and(
          eq(leadActivities.leadId, leadId),
          eq(leadActivities.activityType, "nurturing"),
          gte(leadActivities.createdAt, sql`NOW() - INTERVAL '1 day'`),
          sql`${leadActivities.description} LIKE '%${ruleId}%'`
        )
      )
      .limit(1);

    return activities.length > 0;
  }

  private async executeAction(rule: NurturingRule, lead: any) {
    switch (rule.action.type) {
      case "whatsapp":
        await this.sendWhatsAppMessage(rule, lead);
        break;
      case "task":
        await this.createFollowUpTask(rule, lead);
        break;
      case "status_update":
        await this.updateLeadStatus(rule, lead);
        break;
    }
  }

  private async sendWhatsAppMessage(rule: NurturingRule, lead: any) {
    if (!lead.phone) {
      console.log(`⚠️ No phone number for lead ${lead.leadId}`);
      return;
    }

    const message = this.generateMessage(rule.action.template, lead);
    const result = await whatsappService.sendTextMessage(lead.phone, message);
    
    if (result.success) {
      console.log(`📱 Sent nurturing message to ${lead.customerName} (${lead.phone})`);
    } else {
      console.error(`❌ Failed to send message to ${lead.phone}:`, result.error);
    }
  }

  private async createFollowUpTask(rule: NurturingRule, lead: any) {
    // Create a follow-up task/reminder
    await storage.addLeadActivity({
      leadId: lead.id,
      activityType: "follow-up",
      subject: `Automated Task: ${rule.name}`,
      description: `System-generated follow-up task based on nurturing rule: ${rule.description}`,
      outcome: "neutral",
      nextAction: "Contact customer and assess current interest level",
      performedBy: "system-nurturing",
      scheduledAt: new Date(Date.now() + (rule.action.delay || 0) * 60 * 1000)
    });
  }

  private async updateLeadStatus(rule: NurturingRule, lead: any) {
    // Update lead status based on rule
    await storage.updateLead(lead.leadId, {
      status: "nurturing",
      updatedAt: new Date()
    });
  }

  private async logNurturingActivity(rule: NurturingRule, lead: any) {
    await storage.addLeadActivity({
      leadId: lead.id,
      activityType: "nurturing",
      subject: `Automated Nurturing: ${rule.name}`,
      description: `System executed nurturing rule: ${rule.id}. ${rule.description}`,
      outcome: "positive",
      nextAction: "Monitor customer response and engagement",
      performedBy: "system-nurturing"
    });
  }

  private generateMessage(template: string, lead: any): string {
    const customerName = lead.customerName || "Customer";
    const propertyName = lead.propertyName || "your property of interest";
    const daysSinceContact = Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

    switch (template) {
      case "immediate_followup":
        return `Hi ${customerName}! 👋

Thank you for your interest in ${propertyName}. 

I'm reaching out within 15 minutes as promised! Our property advisor is ready to assist you with:
🏡 Detailed property information
📅 Site visit scheduling
💰 Current pricing & offers
📋 Answering all your questions

Would you prefer a call now or should I schedule a convenient time? Reply with your preference!

Best regards,
OwnItRight Team`;

      case "24_hour_followup":
        return `Hi ${customerName}! 

I hope you're doing well. I reached out yesterday about ${propertyName} and wanted to follow up.

📈 Quick updates:
• Property still available
• Current market trends favor buyers
• Special financing options available

Questions I can help with:
🔍 Property details & amenities
📊 Market analysis & pricing
🏦 Loan assistance & documentation
📅 Site visit arrangements

When would be a good time for a quick 10-minute call?

Best regards,
OwnItRight Team`;

      case "weekly_nurture":
        return `Hi ${customerName}! 

Hope you're having a great week! It's been ${daysSinceContact} days since we last connected about ${propertyName}.

🏡 Property Update:
• Market conditions remain favorable
• New amenities/features added
• Limited inventory in this location

Would you like to:
📞 Schedule a quick consultation?
🏡 Arrange a site visit this weekend?
📋 Receive updated pricing information?

Just reply with what interests you most!

Best regards,
OwnItRight Team`;

      case "price_change_alert":
        return `Hi ${customerName}! 🚨

PRICE ALERT for ${propertyName}!

The property you showed interest in has a price update. This could be your opportunity to secure a better deal.

💰 What's Changed:
• Updated pricing available
• Market conditions affecting rates
• Limited time opportunity

Interested in the latest details? I can share:
📊 Current pricing breakdown
📈 Market comparison analysis
⏰ Timeline for decision making

Reply "DETAILS" for immediate pricing information!

Best regards,
OwnItRight Team`;

      case "site_visit_reminder":
        return `Hi ${customerName}! 📅

Friendly reminder about your site visit for ${propertyName} scheduled for today.

⏰ Meeting Details:
• Time: In 2 hours
• Location: Property site
• Duration: ~1 hour guided tour

What to bring:
📄 ID proof
👥 Decision makers
📝 Your questions list

Running late or need to reschedule? Reply immediately.

Looking forward to showing you around!

Best regards,
OwnItRight Team`;

      case "reactivation_offer":
        return `Hi ${customerName}! 

It's been a month since we last connected about your property search in Bengaluru.

🎯 Market Update:
• New properties in your preferred areas
• Interest rates remain attractive
• Inventory levels changing fast

Special Reactivation Offer:
🎁 Complimentary property consultation
📊 Free market analysis report
🏡 Priority access to new listings

Ready to restart your property journey? 

Reply "RESTART" for immediate assistance!

Best regards,
OwnItRight Team`;

      default:
        return `Hi ${customerName}! Hope you're doing well. Just wanted to check in about ${propertyName}. Let me know if you have any questions or need assistance. Best regards, OwnItRight Team`;
    }
  }

  // Manual trigger methods for specific scenarios
  async triggerPropertyPriceAlert(propertyId: string, oldPrice: number, newPrice: number) {
    const interestedLeads = await db.select()
      .from(leads)
      .where(eq(leads.propertyId, propertyId));

    for (const lead of interestedLeads) {
      const rule = this.nurturingRules.find(r => r.id === "property_price_alert");
      if (rule) {
        await this.executeAction(rule, lead);
        await this.logNurturingActivity(rule, lead);
      }
    }
  }

  async triggerSiteVisitReminder(bookingId: string) {
    // Find lead associated with booking and send reminder
    const rule = this.nurturingRules.find(r => r.id === "site_visit_reminder");
    if (rule) {
      // Implementation would depend on booking-lead relationship
      console.log("Site visit reminder triggered for booking:", bookingId);
    }
  }

  // Statistics and reporting
  async getNurturingStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await db.select()
      .from(leadActivities)
      .where(
        and(
          eq(leadActivities.activityType, "nurturing"),
          gte(leadActivities.createdAt, today)
        )
      );

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = await db.select()
      .from(leadActivities)
      .where(
        and(
          eq(leadActivities.activityType, "nurturing"),
          gte(leadActivities.createdAt, last7Days)
        )
      );

    return {
      todayNurtured: todayActivities.length,
      weeklyNurtured: weeklyActivities.length,
      activeRules: this.nurturingRules.length,
      lastRunTime: new Date()
    };
  }
}

export const leadNurturingService = new LeadNurturingService();
