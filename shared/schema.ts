import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json, decimal, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: varchar("type", { enum: ["apartment", "villa", "plot"] }).notNull(),
  developer: text("developer").notNull(),
  status: varchar("status", { enum: ["pre-launch", "active", "under-construction", "completed", "sold-out"] }).notNull(),
  
  // Location details
  area: text("area").notNull(),
  zone: varchar("zone", { enum: ["north", "south", "east", "west", "central"] }).notNull(),
  address: text("address").notNull(),
  
  // Property specifications (simplified - detailed configs in separate table)
  possessionDate: text("possession_date"), // YYYY-MM format
  
  // Legal and regulatory
  reraNumber: text("rera_number"),
  reraApproved: boolean("rera_approved").default(false),
  
  // Infrastructure and zoning
  infrastructureVerdict: text("infrastructure_verdict"),
  zoningInfo: text("zoning_info"),
  
  // Tags and flags
  tags: json("tags").$type<string[]>().notNull().default([]),
  
  // Media
  images: json("images").$type<string[]>().notNull().default([]),
  videos: json("videos").$type<string[]>().notNull().default([]),
  youtubeVideoUrl: text("youtube_video_url"), // YouTube video URL for property overview
  

  
  // Widget Data - Property Scoring
  locationScore: integer("location_score").default(0), // 1-5
  amenitiesScore: integer("amenities_score").default(0), // 1-5
  valueScore: integer("value_score").default(0), // 1-5
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }).default("0.0"), // calculated average
  
  // Widget Data - Price Comparison
  areaAvgPriceMin: integer("area_avg_price_min"), // in lakhs
  areaAvgPriceMax: integer("area_avg_price_max"), // in lakhs
  cityAvgPriceMin: integer("city_avg_price_min"), // in lakhs
  cityAvgPriceMax: integer("city_avg_price_max"), // in lakhs
  priceComparison: text("price_comparison"), // e.g., "12% below area average"

  // Legal Due Diligence Metadata
  titleClearanceStatus: text("title_clearance_status"), // Clear, Pending, Disputed
  ownershipType: text("ownership_type"), // Freehold, Leasehold, Joint Development
  legalOpinionProvidedBy: text("legal_opinion_provided_by"), // Lawyer/firm name
  titleFlowSummary: text("title_flow_summary"), // Summary of title chain
  encumbranceStatus: text("encumbrance_status"), // No encumbrance as per EC
  ecExtractLink: text("ec_extract_link"), // URL to EC PDF
  mutationStatus: text("mutation_status"), // Mutation completed status
  conversionCertificate: boolean("conversion_certificate").default(false), // DC conversion done
  reraRegistered: boolean("rera_registered").default(false), // RERA compliance
  reraID: text("rera_id"), // RERA project ID
  reraLink: text("rera_link"), // Direct link to RERA record
  litigationStatus: text("litigation_status"), // Any known litigation
  approvingAuthorities: json("approving_authorities").$type<string[]>().default([]), // Authority approvals
  layoutSanctionCopyLink: text("layout_sanction_copy_link"), // PDF/Image of approval
  legalComments: text("legal_comments"), // Lawyer's custom comment
  legalVerdictBadge: text("legal_verdict_badge"), // Tagline or summary badge

  // CIVIL+MEP Report System
  hasCivilMepReport: boolean("has_civil_mep_report").default(false), // Does this property have a report
  civilMepReportPrice: decimal("civil_mep_report_price", { precision: 10, scale: 2 }).default("2999.00"), // Price in INR
  civilMepReportStatus: varchar("civil_mep_report_status", { enum: ["draft", "completed", "reviewing"] }).default("draft"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CIVIL+MEP Reports table for comprehensive property analysis
export const civilMepReports = pgTable("civil_mep_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  
  // Report Meta
  reportType: varchar("report_type", { enum: ["civil", "mep", "combined"] }).notNull().default("combined"),
  reportVersion: text("report_version").default("1.0"),
  generatedBy: text("generated_by"), // Engineer/consultant name
  reportDate: timestamp("report_date").defaultNow(),
  
  // Civil Engineering Analysis
  structuralAnalysis: json("structural_analysis").$type<{
    foundationType: string;
    structuralSystem: string;
    materialQuality: string;
    loadBearingCapacity: string;
    seismicCompliance: string;
    structuralSafety: number; // 1-10 score
  }>(),
  
  materialBreakdown: json("material_breakdown").$type<{
    concrete: { grade: string; quantity: string; cost: number };
    steel: { grade: string; quantity: string; cost: number };
    bricks: { type: string; quantity: string; cost: number };
    cement: { brand: string; quantity: string; cost: number };
    aggregates: { type: string; quantity: string; cost: number };
    otherMaterials: Array<{ name: string; quantity: string; cost: number }>;
  }>(),
  
  costBreakdown: json("cost_breakdown").$type<{
    civilWork: number;
    mepWork: number;
    finishingWork: number;
    laborCosts: number;
    materialCosts: number;
    overheadCosts: number;
    contingency: number;
    totalEstimatedCost: number;
  }>(),
  
  qualityAssessment: json("quality_assessment").$type<{
    workmanshipGrade: string; // A+, A, B+, B, C
    materialGrade: string;
    finishingQuality: string;
    overallQuality: number; // 1-10 score
    certifications: string[];
  }>(),
  
  // MEP (Mechanical, Electrical, Plumbing) Analysis
  mepSystems: json("mep_systems").$type<{
    electrical: {
      loadCapacity: string;
      wiringStandard: string;
      safetyCompliance: string;
      backupSystems: string[];
      energyEfficiency: number; // 1-10 score
    };
    plumbing: {
      waterSupplySystem: string;
      drainageSystem: string;
      sewageTreatment: string;
      waterQuality: string;
      pressureRating: string;
    };
    hvac: {
      ventilationSystem: string;
      airQuality: string;
      temperatureControl: string;
      energyRating: string;
    };
    fireSuppressionSystem: {
      fireDetection: string;
      sprinklerSystem: string;
      emergencyExits: string;
      compliance: string;
    };
  }>(),
  
  // Compliance and Standards
  complianceChecklist: json("compliance_checklist").$type<{
    buildingCodes: { compliant: boolean; details: string };
    fireNOC: { status: string; validUntil: string };
    environmentalClearance: { status: string; details: string };
    structuralCertificate: { available: boolean; issuer: string };
    electricalApproval: { status: string; authority: string };
    plumbingApproval: { status: string; details: string };
  }>(),
  
  // Snag Report
  snagReport: json("snag_report").$type<{
    criticalIssues: Array<{
      category: string;
      description: string;
      severity: "high" | "medium" | "low";
      location: string;
      recommendedAction: string;
      estimatedCost: number;
    }>;
    minorIssues: Array<{
      category: string;
      description: string;
      location: string;
      recommendedAction: string;
    }>;
    overallCondition: string;
    immediateActions: string[];
    futureMaintenanceSchedule: Array<{
      task: string;
      frequency: string;
      estimatedCost: number;
    }>;
  }>(),
  
  // Executive Summary
  executiveSummary: text("executive_summary"),
  overallScore: decimal("overall_score", { precision: 3, scale: 1 }).default("0.0"), // 1-10
  investmentRecommendation: varchar("investment_recommendation", { 
    enum: ["highly-recommended", "recommended", "conditional", "not-recommended"] 
  }),
  estimatedMaintenanceCost: decimal("estimated_maintenance_cost", { precision: 10, scale: 2 }),
  
  // Report Files
  reportPdfUrl: text("report_pdf_url"), // Generated PDF report
  supportingDocuments: json("supporting_documents").$type<string[]>().default([]),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment tracking for CIVIL+MEP reports
export const reportPayments = pgTable("report_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => civilMepReports.id),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  
  // Customer Information
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  
  // Payment Details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  paymentMethod: varchar("payment_method", { enum: ["card", "upi", "net-banking", "pay-later"] }).notNull(),
  paymentStatus: varchar("payment_status", { 
    enum: ["pending", "processing", "completed", "failed", "refunded", "pay-later-pending"] 
  }).default("pending"),
  
  // Stripe Integration
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCustomerId: text("stripe_customer_id"),
  
  // Pay Later System
  payLaterDueDate: timestamp("pay_later_due_date"), // 7 days from access
  payLaterRemindersSent: integer("pay_later_reminders_sent").default(0),
  accessGrantedAt: timestamp("access_granted_at"), // When user got access
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog posts table for content management
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  
  // SEO and metadata
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  tags: json("tags").$type<string[]>().notNull().default([]),
  category: varchar("category", { enum: ["market-insights", "property-guide", "investment-tips", "legal-updates", "company-news"] }).notNull(),
  
  // Publishing
  status: varchar("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  
  // Content media
  featuredImage: text("featured_image"),
  images: json("images").$type<string[]>().notNull().default([]),
  
  // Author and attribution
  author: text("author").notNull(),
  
  // Engagement metrics
  readingTime: integer("reading_time").default(5), // estimated reading time in minutes
  views: integer("views").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property configurations table for multiple unit types per project
export const propertyConfigurations = pgTable("property_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  configuration: text("configuration").notNull(), // 1BHK, 2BHK, 3BHK, 4BHK, Villa, Plot
  pricePerSqft: decimal("price_per_sqft", { precision: 10, scale: 2 }).notNull(),
  builtUpArea: integer("built_up_area").notNull(), // in sqft (BUA)
  plotSize: integer("plot_size"), // in sqft, optional for apartments
  availabilityStatus: varchar("availability_status", { 
    enum: ["available", "sold-out", "coming-soon", "limited"] 
  }).notNull(),
  totalUnits: integer("total_units"),
  availableUnits: integer("available_units"),
  price: integer("price").notNull(), // calculated total price in lakhs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyConfigurationSchema = createInsertSchema(propertyConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type PropertyConfiguration = typeof propertyConfigurations.$inferSelect;
export type InsertPropertyConfiguration = z.infer<typeof insertPropertyConfigurationSchema>;

export interface PropertyWithConfigurations extends Property {
  configurations: PropertyConfiguration[];
}

// Bookings table for site visits and consultations
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().unique(), // User-facing booking ID
  propertyId: varchar("property_id").references(() => properties.id),
  propertyName: text("property_name").notNull(),
  bookingType: varchar("booking_type", { enum: ["site-visit", "consultation"] }).notNull(),
  
  // Customer details
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  
  // Visit specific details
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  visitType: varchar("visit_type", { enum: ["site-visit", "virtual-tour"] }),
  numberOfVisitors: text("number_of_visitors"),
  
  // Consultation specific details
  consultationType: varchar("consultation_type", { enum: ["financing", "legal", "property-advice", "investment"] }),
  preferredContactTime: text("preferred_contact_time"),
  urgency: varchar("urgency", { enum: ["immediate", "within-24hrs", "within-week", "flexible"] }),
  
  // Common fields
  questions: text("questions"),
  specialRequests: text("special_requests"),
  status: varchar("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCivilMepReportSchema = createInsertSchema(civilMepReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportPaymentSchema = createInsertSchema(reportPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type CivilMepReport = typeof civilMepReports.$inferSelect;
export type InsertCivilMepReport = z.infer<typeof insertCivilMepReportSchema>;
export type ReportPayment = typeof reportPayments.$inferSelect;
export type InsertReportPayment = z.infer<typeof insertReportPaymentSchema>;

// Lead management tables for processing customer submissions
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().unique(), // User-facing lead ID like LD1754081800724
  
  // Lead source and type
  source: varchar("source", { enum: ["site-visit", "consultation", "property-inquiry"] }).notNull(),
  leadType: varchar("lead_type", { enum: ["hot", "warm", "cold"] }).notNull().default("warm"),
  priority: varchar("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  
  // Customer information
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  
  // Property interest
  propertyId: varchar("property_id").references(() => properties.id),
  propertyName: text("property_name").notNull(),
  interestedConfiguration: text("interested_configuration"), // Specific BHK/configuration
  budgetRange: text("budget_range"), // e.g., "50L-1Cr", "1Cr-2Cr"
  
  // Lead details
  leadDetails: json("lead_details").$type<{
    visitType?: string;
    numberOfVisitors?: string;
    preferredDate?: string;
    preferredTime?: string;
    consultationType?: string;
    urgency?: string;
    questions?: string;
    specialRequests?: string;
  }>().notNull().default({}),
  
  // Lead scoring and qualification
  leadScore: integer("lead_score").default(0), // 0-100 scoring
  qualificationNotes: text("qualification_notes"),
  
  // Lead status and assignment
  status: varchar("status", { 
    enum: ["new", "contacted", "qualified", "demo-scheduled", "proposal-sent", "negotiation", "closed-won", "closed-lost", "follow-up"] 
  }).notNull().default("new"),
  assignedTo: text("assigned_to"), // Sales person/agent
  
  // Follow-up and communication
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  communicationPreference: varchar("communication_preference", { enum: ["phone", "email", "whatsapp"] }).default("phone"),
  
  // Conversion tracking
  expectedCloseDate: timestamp("expected_close_date"),
  dealValue: integer("deal_value"), // Expected deal value in lakhs
  
  // Timestamps and tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead activities for tracking all interactions
export const leadActivities = pgTable("lead_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  
  // Activity details
  activityType: varchar("activity_type", { 
    enum: ["call", "email", "meeting", "site-visit", "proposal", "follow-up", "note"] 
  }).notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  
  // Activity outcome
  outcome: varchar("outcome", { enum: ["positive", "neutral", "negative", "no-response"] }),
  nextAction: text("next_action"),
  
  // Scheduling
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  
  // Assignment
  performedBy: text("performed_by").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead notes for additional context
export const leadNotes = pgTable("lead_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  
  note: text("note").notNull(),
  noteType: varchar("note_type", { enum: ["general", "qualification", "objection", "requirement"] }).default("general"),
  isPrivate: boolean("is_private").default(false),
  
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas for lead management
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes).omit({
  id: true,
  createdAt: true,
});

// Lead types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;

// Enhanced lead with activities and notes
export interface LeadWithDetails extends Lead {
  activities: LeadActivity[];
  notes: LeadNote[];
  propertyDetails?: Property;
}

// Lead statistics
export type LeadStats = {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  conversionRate: number;
  avgLeadScore: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
};

// Property statistics type
export type PropertyStats = {
  totalProperties: number;
  activeProjects: number;
  reraApproved: number;
  avgPrice: number;
};

// Blog schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
