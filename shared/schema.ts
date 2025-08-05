import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json, decimal, real, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Property Scoring System - Comprehensive scoring with detailed criteria
export const propertyScores = pgTable("property_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull(),
  
  // Scoring metadata
  scoringVersion: text("scoring_version").default("1.0"),
  scoredBy: text("scored_by"), // Admin user who created the score
  scoringDate: timestamp("scoring_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  
  // Location Score (25 points total)
  transportConnectivity: integer("transport_connectivity").default(0), // 0-8 points
  transportNotes: text("transport_notes"),
  infrastructureDevelopment: integer("infrastructure_development").default(0), // 0-7 points
  infrastructureNotes: text("infrastructure_notes"),
  socialInfrastructure: integer("social_infrastructure").default(0), // 0-5 points
  socialNotes: text("social_notes"),
  employmentHubs: integer("employment_hubs").default(0), // 0-5 points
  employmentNotes: text("employment_notes"),
  
  // Amenities & Features Score (20 points total)
  basicAmenities: integer("basic_amenities").default(0), // 0-8 points
  basicAmenitiesNotes: text("basic_amenities_notes"),
  lifestyleAmenities: integer("lifestyle_amenities").default(0), // 0-7 points
  lifestyleAmenitiesNotes: text("lifestyle_amenities_notes"),
  modernFeatures: integer("modern_features").default(0), // 0-5 points
  modernFeaturesNotes: text("modern_features_notes"),
  
  // Legal & Compliance Score (20 points total)
  reraCompliance: integer("rera_compliance").default(0), // 0-8 points
  reraComplianceNotes: text("rera_compliance_notes"),
  titleClarity: integer("title_clarity").default(0), // 0-7 points
  titleClarityNotes: text("title_clarity_notes"),
  approvals: integer("approvals").default(0), // 0-5 points
  approvalsNotes: text("approvals_notes"),
  
  // Value Proposition Score (15 points total)
  priceCompetitiveness: integer("price_competitiveness").default(0), // 0-8 points
  priceCompetitivenessNotes: text("price_competitiveness_notes"),
  appreciationPotential: integer("appreciation_potential").default(0), // 0-4 points
  appreciationPotentialNotes: text("appreciation_potential_notes"),
  rentalYield: integer("rental_yield").default(0), // 0-3 points
  rentalYieldNotes: text("rental_yield_notes"),
  
  // Developer Credibility Score (10 points total)
  trackRecord: integer("track_record").default(0), // 0-5 points
  trackRecordNotes: text("track_record_notes"),
  financialStability: integer("financial_stability").default(0), // 0-3 points
  financialStabilityNotes: text("financial_stability_notes"),
  customerSatisfaction: integer("customer_satisfaction").default(0), // 0-2 points
  customerSatisfactionNotes: text("customer_satisfaction_notes"),
  
  // Construction Quality Score (10 points total)
  structuralQuality: integer("structural_quality").default(0), // 0-5 points
  structuralQualityNotes: text("structural_quality_notes"),
  finishingStandards: integer("finishing_standards").default(0), // 0-3 points
  finishingStandardsNotes: text("finishing_standards_notes"),
  maintenanceStandards: integer("maintenance_standards").default(0), // 0-2 points
  maintenanceStandardsNotes: text("maintenance_standards_notes"),
  
  // Calculated scores
  locationScoreTotal: integer("location_score_total").default(0), // max 25
  amenitiesScoreTotal: integer("amenities_score_total").default(0), // max 20
  legalScoreTotal: integer("legal_score_total").default(0), // max 20
  valueScoreTotal: integer("value_score_total").default(0), // max 15
  developerScoreTotal: integer("developer_score_total").default(0), // max 10
  constructionScoreTotal: integer("construction_score_total").default(0), // max 10
  overallScoreTotal: integer("overall_score_total").default(0), // max 100
  overallGrade: varchar("overall_grade", { enum: ["A+", "A", "B+", "B", "C+", "C", "D"] }),
  
  // Additional insights
  keyStrengths: json("key_strengths").$type<string[]>().default([]),
  areasOfConcern: json("areas_of_concern").$type<string[]>().default([]),
  recommendationSummary: text("recommendation_summary"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  

  
  // Property Scoring (linked to propertyScores table)
  propertyScoreId: varchar("property_score_id").references(() => propertyScores.id),
  
  // Widget Data - Legacy scoring (kept for backward compatibility)
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
  
  // Property Valuation Report System
  hasValuationReport: boolean("has_valuation_report").default(false),
  valuationReportPrice: decimal("valuation_report_price", { precision: 10, scale: 2 }).default("15000.00"),
  valuationReportStatus: varchar("valuation_report_status", { 
    enum: ["draft", "in-progress", "completed", "archived"] 
  }).default("draft"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RERA Data Integration - Store verified RERA project information
export const reraData = pgTable("rera_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reraId: text("rera_id").notNull().unique(), // RERA project registration ID
  propertyId: varchar("property_id").references(() => properties.id), // Link to property if applicable
  
  // Basic Project Information
  projectName: text("project_name").notNull(),
  promoterName: text("promoter_name").notNull(),
  location: text("location").notNull(),
  district: text("district").notNull(),
  state: text("state").default("Karnataka"),
  
  // Project Details
  projectType: varchar("project_type", { 
    enum: ["residential", "commercial", "mixed", "plotted-development", "other"] 
  }).default("residential"),
  totalUnits: integer("total_units"),
  projectArea: text("project_area"), // in acres/sq ft
  builtUpArea: text("built_up_area"), // total built-up area
  
  // Legal and Compliance Status
  registrationDate: text("registration_date"), // RERA registration date
  approvalDate: text("approval_date"), // Initial approval date  
  completionDate: text("completion_date"), // Expected/actual completion
  registrationValidTill: text("registration_valid_till"), // RERA validity
  projectStatus: varchar("project_status", {
    enum: ["under-construction", "completed", "delayed", "cancelled", "approved"]
  }).default("under-construction"),
  complianceStatus: varchar("compliance_status", {
    enum: ["active", "non-compliant", "suspended", "cancelled"]
  }).default("active"),
  
  // Financial Information  
  projectCost: text("project_cost"), // Total project cost
  amountCollected: text("amount_collected"), // Amount collected from buyers
  percentageCollected: real("percentage_collected"), // Calculated percentage
  
  // Contact and Additional Info
  website: text("website"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  promoterAddress: text("promoter_address"),
  
  // RERA Portal Links
  reraPortalLink: text("rera_portal_link"), // Direct link to RERA record
  
  // Verification and Sync Status
  verificationStatus: varchar("verification_status", {
    enum: ["verified", "pending", "failed", "outdated"] 
  }).default("pending"),
  lastVerifiedAt: timestamp("last_verified_at"),
  lastSyncAt: timestamp("last_sync_at"),
  syncFailureReason: text("sync_failure_reason"),
  
  // Raw API Response (for debugging and future enhancement)
  rawApiResponse: json("raw_api_response").$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});





// Payment tracking for reports (CIVIL+MEP and Legal Due Diligence)
export const reportPayments = pgTable("report_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id"), // Can be null for general service orders
  reportType: varchar("report_type", { enum: ["civil-mep", "property-valuation"] }).notNull().default("civil-mep"),
  propertyId: varchar("property_id").references(() => properties.id), // Can be null for general service orders
  
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

export const insertPropertyScoreSchema = createInsertSchema(propertyScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type PropertyConfiguration = typeof propertyConfigurations.$inferSelect;
export type InsertPropertyConfiguration = z.infer<typeof insertPropertyConfigurationSchema>;
export type PropertyScore = typeof propertyScores.$inferSelect;
export type InsertPropertyScore = z.infer<typeof insertPropertyScoreSchema>;

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



export const insertReportPaymentSchema = createInsertSchema(reportPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type ReportPayment = typeof reportPayments.$inferSelect;
export type InsertReportPayment = z.infer<typeof insertReportPaymentSchema>;

// Lead management tables for processing customer submissions
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().unique(), // User-facing lead ID like LD1754081800724
  
  // Lead source and type
  source: varchar("source", { enum: ["site-visit", "consultation", "property-inquiry", "referral", "social-media", "walk-in", "advertisement"] }).notNull(),
  leadType: varchar("lead_type", { enum: ["hot", "warm", "cold"] }).notNull().default("warm"),
  priority: varchar("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  
  // Customer information
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  preferredContactTime: text("preferred_contact_time"), // Morning, Afternoon, Evening
  referredBy: text("referred_by"), // Source of referral
  
  // Buyer Persona Information
  buyerPersona: varchar("buyer_persona", { 
    enum: ["end-user-family", "nri-investor", "first-time-buyer", "senior-buyer", "working-couple", "research-oriented"] 
  }),
  buyingFor: varchar("buying_for", { enum: ["self", "parents", "investment", "resale-flip"] }),
  urgency: varchar("urgency", { enum: ["immediate", "3-6-months", "6-12-months", "exploratory"] }),
  
  // Budget & Financing Details
  budgetMin: integer("budget_min"), // In lakhs
  budgetMax: integer("budget_max"), // In lakhs
  financing: varchar("financing", { enum: ["own-funds", "bank-loan", "inheritance", "mixed"] }),
  preferredLoanPartner: text("preferred_loan_partner"),
  hasPreApproval: boolean("has_pre_approval").default(false),
  
  // Location Preferences
  preferredAreas: json("preferred_areas").$type<string[]>().default([]), // Array of preferred locations
  commuteRequirements: text("commute_requirements"), // Specific commute needs
  schoolWorkplaceConsiderations: text("school_workplace_considerations"),
  
  // Property Type & Layout Preferences
  propertyType: varchar("property_type", { enum: ["villa", "apartment", "plot", "duplex"] }),
  bhkPreference: varchar("bhk_preference", { enum: ["1bhk", "2bhk", "3bhk", "4bhk", "5bhk+"] }),
  floorPreference: text("floor_preference"), // Ground floor, top floor, etc.
  gatedPreference: varchar("gated_preference", { enum: ["gated", "standalone", "no-preference"] }),
  
  // Lifestyle Preferences
  amenitiesNeeded: json("amenities_needed").$type<string[]>().default([]), // Pool, park, EV charging, solar, etc.
  vastuFacingRequirements: text("vastu_facing_requirements"),
  seniorCitizenFriendly: boolean("senior_citizen_friendly").default(false),
  petsChildrenConsideration: text("pets_children_consideration"),
  greenZonesPreference: boolean("green_zones_preference").default(false),
  
  // Legal & Documentation Needs
  wantsLegalSupport: boolean("wants_legal_support").default(false),
  interestedInReports: json("interested_in_reports").$type<string[]>().default([]), // valuation, civil-mep, legal, infra
  
  // Investment Criteria (For Investors)
  preferredRentalYield: real("preferred_rental_yield"), // Percentage
  exitHorizon: varchar("exit_horizon", { enum: ["2-years", "5-years", "10-years"] }),
  legalStatusFocus: varchar("legal_status_focus", { enum: ["rera-only", "oc", "a-khata", "clear-title"] }),
  
  // Legacy fields for backward compatibility
  propertyId: varchar("property_id").references(() => properties.id),
  propertyName: text("property_name"),
  interestedConfiguration: text("interested_configuration"), // Specific BHK/configuration
  budgetRange: text("budget_range"), // e.g., "50L-1Cr", "1Cr-2Cr" - legacy field
  
  // Lead details (expanded)
  leadDetails: json("lead_details").$type<{
    visitType?: string;
    numberOfVisitors?: string;
    preferredDate?: string;
    preferredTime?: string;
    consultationType?: string;
    urgency?: string;
    questions?: string;
    specialRequests?: string;
    personalizedNotes?: string;
    keyNonNegotiables?: string[];
  }>().notNull().default({}),
  
  // Lead scoring and qualification
  leadScore: integer("lead_score").default(0), // 0-100 scoring
  qualificationNotes: text("qualification_notes"),
  
  // Smart Tags for Quick Filtering
  smartTags: json("smart_tags").$type<string[]>().default([]), // hot-lead, ready-to-visit, needs-legal-handholding, first-time-buyer
  
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
    enum: ["call", "email", "meeting", "site-visit", "proposal", "follow-up", "note", "whatsapp", "document-shared", "report-sent"] 
  }).notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  
  // Activity outcome
  outcome: varchar("outcome", { enum: ["positive", "neutral", "negative", "no-response", "rescheduled", "interested", "not-interested"] }),
  nextAction: text("next_action"),
  
  // Enhanced tracking
  duration: integer("duration"), // Duration in minutes for calls/meetings
  attendees: json("attendees").$type<string[]>().default([]), // People involved
  attachments: json("attachments").$type<string[]>().default([]), // File URLs or names
  
  // Scheduling
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  
  // Assignment
  performedBy: text("performed_by").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead notes for detailed customer insights
export const leadNotes = pgTable("lead_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  
  // Note details
  title: text("title"),
  content: text("content").notNull(),
  noteType: varchar("note_type", { 
    enum: ["general", "important", "follow-up", "concern", "opportunity", "persona-insight", "non-negotiable", "preference"] 
  }).default("general"),
  
  // Note metadata
  isPinned: boolean("is_pinned").default(false),
  isPrivate: boolean("is_private").default(false),
  tags: json("tags").$type<string[]>().default([]),
  
  // Enhanced categorization
  category: varchar("category", { 
    enum: ["budget", "location", "timeline", "family", "lifestyle", "legal", "investment", "concerns", "opportunities"] 
  }),
  sentiment: varchar("sentiment", { enum: ["positive", "neutral", "negative", "mixed"] }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by"),
});

// Lead timeline milestones
export const leadTimeline = pgTable("lead_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  
  // Milestone details
  milestone: varchar("milestone", {
    enum: ["first-contact", "qualified", "site-visit-scheduled", "site-visit-completed", "proposal-presented", 
           "negotiation-started", "legal-docs-shared", "financing-approved", "booking-confirmed", "closed-won", "closed-lost"]
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Milestone metadata
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  
  // Associated data
  attachments: json("attachments").$type<string[]>().default([]),
  relatedActivityId: varchar("related_activity_id").references(() => leadActivities.id),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by"),
});

// Lead documents and attachments
export const leadDocuments = pgTable("lead_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  
  // Document details
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { enum: ["pdf", "image", "document", "spreadsheet", "presentation"] }),
  fileSize: integer("file_size"), // In bytes
  
  // Document categorization
  category: varchar("category", {
    enum: ["property-brochure", "floor-plan", "legal-document", "financial-document", "site-photos", 
           "valuation-report", "civil-mep-report", "loan-documents", "booking-form", "agreement"]
  }),
  
  // Document metadata
  isPublic: boolean("is_public").default(false), // Can be shared with customer
  tags: json("tags").$type<string[]>().default([]),
  description: text("description"),
  
  // Timestamps
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: text("uploaded_by"),
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

export const insertLeadTimelineSchema = createInsertSchema(leadTimeline).omit({
  id: true,
  createdAt: true,
});

export const insertLeadDocumentSchema = createInsertSchema(leadDocuments).omit({
  id: true,
  uploadedAt: true,
});

// Lead types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;
export type LeadTimeline = typeof leadTimeline.$inferSelect;
export type InsertLeadTimeline = z.infer<typeof insertLeadTimelineSchema>;
export type LeadDocument = typeof leadDocuments.$inferSelect;
export type InsertLeadDocument = z.infer<typeof insertLeadDocumentSchema>;

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



// Customer notes for CRM
export const customerNotes = pgTable("customer_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  content: text("content").notNull(),
  createdBy: text("created_by").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerNoteSchema = createInsertSchema(customerNotes);
export type InsertCustomerNote = z.infer<typeof insertCustomerNoteSchema>;
export type CustomerNote = typeof customerNotes.$inferSelect;

// Valuation Requests table
export const valuationRequests = pgTable("valuation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Property details
  propertyType: text("property_type").notNull(),
  location: text("location").notNull(),
  area: integer("area").notNull(),
  age: integer("age").notNull(),
  bedrooms: text("bedrooms").notNull(),
  amenities: json("amenities").$type<string[]>().default([]),
  additionalInfo: text("additional_info"),
  
  // Contact details
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  
  // Status and processing
  status: varchar("status", { enum: ["pending", "in-progress", "completed", "cancelled"] }).default("pending"),
  requestSource: text("request_source").default("website"),
  
  // Valuation results (filled after processing)
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  valueRange: json("value_range").$type<{ min: number; max: number }>(),
  confidenceLevel: varchar("confidence_level", { enum: ["high", "medium", "low"] }),
  
  // Report generation
  reportGenerated: boolean("report_generated").default(false),
  reportUrl: text("report_url"),
  reportNotes: text("report_notes"),
  
  // Processing details
  assignedTo: text("assigned_to"),
  processedAt: timestamp("processed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// App Settings table for general application configuration
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // General Branding Settings
  businessName: text("business_name").default("OwnItRight – Curated Property Advisors"),
  logoUrl: text("logo_url"), // PNG/SVG logo for navbar and reports
  faviconUrl: text("favicon_url"), // Favicon file URL
  
  // Contact Information
  contactEmail: text("contact_email").default("contact@ownitright.com"),
  phoneNumber: text("phone_number").default("+91 98765 43210"),
  whatsappNumber: text("whatsapp_number").default("+91 98765 43210"),
  officeAddress: text("office_address").default("Bengaluru, Karnataka, India"),
  
  // Localization Settings
  defaultCurrency: varchar("default_currency", { enum: ["INR", "USD", "EUR"] }).default("INR"),
  currencySymbol: text("currency_symbol").default("₹"),
  timezone: text("timezone").default("Asia/Kolkata"),
  dateFormat: varchar("date_format", { enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] }).default("DD/MM/YYYY"),
  
  // Application Behavior
  maintenanceMode: boolean("maintenance_mode").default(false),
  maintenanceMessage: text("maintenance_message").default("We are currently performing maintenance. Please check back later."),
  
  // Theme and UI Settings (for future expansion)
  primaryColor: text("primary_color").default("#2563eb"), // Default blue
  secondaryColor: text("secondary_color").default("#64748b"), // Default slate
  
  // SEO Settings
  metaTitle: text("meta_title").default("OwnItRight - Property Discovery Platform"),
  metaDescription: text("meta_description").default("Discover your perfect property in Bengaluru with our advanced property discovery platform"),
  
  // Feature Toggles
  enableBookings: boolean("enable_bookings").default(true),
  enableConsultations: boolean("enable_consultations").default(true),
  enableReports: boolean("enable_reports").default(true),

  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys Settings table for secure storage of third-party integrations
export const apiKeysSettings = pgTable("api_keys_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Payment Integration
  razorpayKeyId: text("razorpay_key_id"),
  razorpayKeySecret: text("razorpay_key_secret"), // Encrypted
  razorpayWebhookSecret: text("razorpay_webhook_secret"), // Encrypted
  razorpayTestMode: boolean("razorpay_test_mode").default(true),
  
  // Google Services
  googleMapsApiKey: text("google_maps_api_key"), // Encrypted
  googleAnalyticsId: text("google_analytics_id"),
  
  // Communication APIs
  twilioAccountSid: text("twilio_account_sid"),
  twilioAuthToken: text("twilio_auth_token"), // Encrypted
  twilioPhoneNumber: text("twilio_phone_number"),
  
  // WhatsApp Business
  whatsappBusinessApiKey: text("whatsapp_business_api_key"), // Encrypted
  whatsappPhoneNumberId: text("whatsapp_phone_number_id"),
  
  // Email Services
  sendgridApiKey: text("sendgrid_api_key"), // Encrypted
  sendgridFromEmail: text("sendgrid_from_email"),
  
  // Government Verification APIs
  surepassApiKey: text("surepass_api_key"), // Encrypted
  signzyApiKey: text("signzy_api_key"), // Encrypted
  
  // Real Estate Data APIs
  magicbricksApiKey: text("magicbricks_api_key"), // Encrypted
  acres99ApiKey: text("acres_99_api_key"), // Encrypted
  
  // Status tracking
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: text("updated_by").default("admin"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add API Keys Settings type exports
export const insertApiKeysSettingsSchema = createInsertSchema(apiKeysSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ApiKeysSettings = typeof apiKeysSettings.$inferSelect;
export type InsertApiKeysSettings = z.infer<typeof insertApiKeysSettingsSchema>;

// Google Analytics Configuration
export const googleAnalyticsConfig = pgTable("google_analytics_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  measurementId: text("measurement_id").notNull(),
  trackingEnabled: boolean("tracking_enabled").default(true),
  trackPageViews: boolean("track_page_views").default(true),
  trackEvents: boolean("track_events").default(true),
  trackEcommerce: boolean("track_ecommerce").default(true),
  trackFormSubmissions: boolean("track_form_submissions").default(true),
  trackScrollDepth: boolean("track_scroll_depth").default(false),
  trackFileDownloads: boolean("track_file_downloads").default(true),
  trackOutboundLinks: boolean("track_outbound_links").default(true),
  anonymizeIp: boolean("anonymize_ip").default(true),
  cookieConsent: boolean("cookie_consent").default(true),
  dataRetentionMonths: integer("data_retention_months").default(26),
  customDimensions: json("custom_dimensions").$type<Array<{
    index: number;
    name: string;
    scope: "hit" | "session" | "user" | "product";
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGoogleAnalyticsConfigSchema = createInsertSchema(googleAnalyticsConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GoogleAnalyticsConfig = typeof googleAnalyticsConfig.$inferSelect;
export type InsertGoogleAnalyticsConfig = z.infer<typeof insertGoogleAnalyticsConfigSchema>;

// User Roles and Permissions System
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleName: text("role_name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  level: integer("level").notNull().default(1), // 1-10, higher = more access
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permissionKey: text("permission_key").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  category: varchar("category", { 
    enum: ["properties", "leads", "customers", "reports", "analytics", "settings", "team", "system", "billing"] 
  }).notNull(),
  isSystemLevel: boolean("is_system_level").default(false), // System admin only
  createdAt: timestamp("created_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull().references(() => userRoles.id, { onDelete: "cascade" }),
  permissionId: varchar("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  canRead: boolean("can_read").default(false),
  canWrite: boolean("can_write").default(false),
  canDelete: boolean("can_delete").default(false),
  canAdmin: boolean("can_admin").default(false), // Full admin access to this permission
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Reference to your team member ID
  roleId: varchar("role_id").notNull().references(() => userRoles.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by").notNull(), // Admin who assigned this role
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // Optional expiration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleAssignmentSchema = createInsertSchema(userRoleAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect;
export type InsertUserRoleAssignment = z.infer<typeof insertUserRoleAssignmentSchema>;

// Enhanced types with relations
export interface UserRoleWithPermissions extends UserRole {
  permissions: Array<RolePermission & { permission: Permission }>;
}

export interface UserWithRoles {
  userId: string;
  userName: string;
  roles: Array<UserRoleAssignment & { role: UserRoleWithPermissions }>;
}

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;

// Valuation request schemas
export const insertValuationRequestSchema = createInsertSchema(valuationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  reportGenerated: true,
});

export type ValuationRequest = typeof valuationRequests.$inferSelect;
export type InsertValuationRequest = z.infer<typeof insertValuationRequestSchema>;

// Property Valuation Reports Schema - Comprehensive Bengaluru Edition
export const propertyValuationReports = pgTable("property_valuation_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull(),
  customerId: varchar("customer_id"), // Optional - can be assigned to customers
  
  // Report metadata
  reportTitle: text("report_title").notNull(),
  reportStatus: varchar("report_status", { enum: ["draft", "in_progress", "completed", "delivered"] }).default("draft"),
  createdBy: text("created_by").notNull(), // Admin who created
  assignedTo: text("assigned_to"), // Customer assigned to
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  
  // 1. Executive Summary (new fields)
  projectName: text("project_name"), // e.g., "Assetz Marq 3.0, 3BHK, Tower B"  
  towerUnit: text("tower_unit"),
  ratePerSqftSbaUds: text("rate_per_sqft_sba_uds"), // ₹10,200/sqft
  // Keep existing field for market value
  estimatedMarketValue: decimal("estimated_market_value", { precision: 12, scale: 2 }),
  buyerFit: varchar("buyer_fit", { enum: ["end_use", "investor", "both"] }),
  valuationVerdict: text("valuation_verdict"), // Slightly Overpriced (₹1,000/sqft above resale)
  appreciationOutlook: text("appreciation_outlook"), // Moderate – 7% CAGR expected
  riskScore: integer("risk_score").default(0), // 0-10 scale (3 = Low)
  recommendation: text("recommendation"), // ✅ Buy if negotiated ~₹10L lower
  
  // 2. Property Profile (mix of existing and new fields)
  unitType: varchar("unit_type", { enum: ["apartment", "villa", "rowhouse", "plot"] }),
  configuration: text("configuration"), // 3BHK, 1550 sq.ft
  undividedLandShare: text("undivided_land_share"), // UDS - new field
  udsArea: decimal("uds_area", { precision: 8, scale: 2 }), // Keep existing
  facing: text("facing"), // e.g., East
  vastuCompliance: boolean("vastu_compliance").default(false),
  ocCcStatus: text("oc_cc_status"), // OC/CC Status - new field
  occcStatus: text("occc_status"), // Keep existing field for compatibility
  possessionStatus: varchar("possession_status", { enum: ["ready", "under_construction", "completed"] }),
  khataType: varchar("khata_type", { enum: ["A", "B", "E"] }),
  landTitleStatus: text("land_title_status"),
  builderReputationScore: integer("builder_reputation_score").default(0), // Keep existing numeric
  builderReputationScoreText: text("builder_reputation_score_text"), // New text field
  
  // 3. Market Valuation Estimate
  builderQuotedPrice: text("builder_quoted_price"), // vs Actual Market Value
  totalEstimatedValue: text("total_estimated_value"),
  pricePerSqftAnalysis: text("price_per_sqft_analysis"), // Carpet, SBA, UDS
  landShareValue: text("land_share_value"), // vs Construction Component
  constructionValue: text("construction_value"),
  guidanceValueZoneRate: text("guidance_value_zone_rate"), // BDA/BBMP/BIAPPA
  marketPremiumDiscount: text("market_premium_discount"), // Unit is priced 14% above average resale
  
  // 4. Comparable Sales Analysis
  comparableSales: json("comparable_sales"), // Array of {project, config, area, date, rate, source}
  benchmarkingSources: text("benchmarking_sources"), // MagicBricks, 99acres, local brokers
  volatilityIndex: text("volatility_index"), // 6-month price trend
  averageDaysOnMarket: integer("average_days_on_market"), // 72 days for resale units nearby
  
  // 5. Location & Infrastructure Assessment
  // Zoning & Authority
  planningAuthority: varchar("planning_authority", { enum: ["BDA", "BBMP", "BMRDA", "BIAPPA"] }),
  zonalClassification: varchar("zonal_classification", { enum: ["residential", "mixed", "green", "commercial"] }),
  landUseStatus: varchar("land_use_status", { enum: ["converted", "dc_converted", "bda_approved"] }),
  // Physical & Social Infrastructure
  connectivity: text("connectivity"), // Distance to Metro, ORR, Whitefield Station
  waterSupply: varchar("water_supply", { enum: ["bwssb", "borewell", "tanker", "mixed"] }),
  drainage: varchar("drainage", { enum: ["underground", "open", "none"] }),
  socialInfrastructure: text("social_infrastructure"), // Schools, Hospitals, Malls within 5 km
  // Future Developments
  futureInfrastructure: json("future_infrastructure"), // PRR Plan, Metro Phase 3, SEZs/Tech Parks
  
  // 6. Legal & Compliance Snapshot
  reraRegistration: text("rera_registration"), // PRM/KA/RERA/xxx
  khataVerification: text("khata_verification"), // A (verified from BBMP)
  titleClearance: text("title_clearance"), // Clear (no encumbrance)
  dcConversion: varchar("dc_conversion", { enum: ["yes", "no", "in_progress", "not_required"] }),
  planApproval: text("plan_approval"), // From BDA/BMRDA
  loanApproval: json("loan_approval"), // HDFC, ICICI, SBI confirmed
  titleClarityNotes: text("title_clarity_notes"), // No ongoing disputes / pending litigations
  
  // 7. Rental & Yield Potential
  expectedMonthlyRent: text("expected_monthly_rent"), // ₹45,000–₹48,000
  grossRentalYield: text("gross_rental_yield"), // ~2.5% p.a.
  tenantDemand: varchar("tenant_demand", { enum: ["high", "moderate", "low"] }), // High in 3–4 km radius
  exitLiquidity: text("exit_liquidity"), // Moderate, 3–6 months
  yieldScore: text("yield_score"), // 6.5/10
  
  // 8. Cost Sheet Breakdown
  baseUnitCost: text("base_unit_cost"), // ₹1.95 Cr
  amenitiesCharges: text("amenities_charges"), // Clubhouse + Amenities + Corpus ₹5.5 L
  floorRiseCharges: text("floor_rise_charges"), // ₹2.4 L
  gstAmount: text("gst_amount"), // GST @5% ₹9.75 L
  stampDutyRegistration: text("stamp_duty_registration"), // ₹13 L (approx)
  totalAllInPrice: text("total_all_in_price"), // ₹2.26 Cr
  khataTransferCosts: text("khata_transfer_costs"), // ₹30–50K
  
  // 9. Pros & Cons Summary
  pros: json("pros"), // Array of pros
  cons: json("cons"), // Array of cons
  
  // 10. Final Recommendation
  buyerTypeFit: text("buyer_type_fit"), // Ideal for End Users prioritizing legal clarity
  negotiationAdvice: text("negotiation_advice"), // Ask builder for ₹1,000/sqft discount
  riskSummary: text("risk_summary"), // Low legal risk, moderate infra dependency
  appreciationOutlook5yr: text("appreciation_outlook_5yr"), // ₹2.6–2.8 Cr expected
  exitPlan: text("exit_plan"), // Hold minimum 5–6 years for ROI
  overallScore: text("overall_score"),
  
  // Additional Optional Fields
  appendices: json("appendices"), // Optional additional documents/data
  customNotes: text("custom_notes"),
});

// Site Visit Bookings System
export const siteVisitBookings = pgTable("site_visit_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Customer Information
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 15 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  
  // Property Information
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  // configurationId: varchar("configuration_id").references(() => propertyConfigurations.id), // Optional field, removed from actual DB
  
  // Visit Details
  visitType: varchar("visit_type", { enum: ["site-visit", "virtual-tour", "model-unit"] }).notNull().default("site-visit"),
  preferredDate: date("preferred_date").notNull(),
  preferredTime: varchar("preferred_time", { length: 20 }).notNull(),
  numberOfVisitors: integer("number_of_visitors").default(1),
  
  // Booking Status
  status: varchar("status", { 
    enum: ["pending", "confirmed", "rescheduled", "completed", "cancelled", "no-show"] 
  }).notNull().default("pending"),
  
  // Additional Information
  specialRequests: text("special_requests"),
  source: varchar("source", { 
    enum: ["website", "phone", "email", "walk-in", "referral", "social-media"] 
  }).default("website"),
  
  // Admin Management Fields
  assignedTo: varchar("assigned_to"), // Staff member assigned
  confirmedDate: date("confirmed_date"),
  confirmedTime: varchar("confirmed_time", { length: 20 }),
  meetingPoint: text("meeting_point"), // Where to meet at the site
  staffNotes: text("staff_notes"), // Internal notes
  customerNotes: text("customer_notes"), // Notes from customer interaction
  
  // Follow-up tracking
  followUpRequired: boolean("follow_up_required").default(true),
  followUpDate: date("follow_up_date"),
  followUpStatus: varchar("follow_up_status", { 
    enum: ["pending", "completed", "not-required"] 
  }).default("pending"),
  
  // Lead conversion tracking
  // leadId: varchar("lead_id").references(() => leads.id), // Commented out as this column doesn't exist in DB
  convertedToLead: boolean("converted_to_lead").default(false),
  // conversionDate: timestamp("conversion_date"), // Commented out as this column doesn't exist in DB
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
});

// Booking Time Slots Management
export const bookingTimeSlots = pgTable("booking_time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Time slot details
  timeSlot: varchar("time_slot", { length: 20 }).notNull(), // "09:00 AM", "02:30 PM"
  displayName: varchar("display_name", { length: 50 }).notNull(), // "Morning 9:00 AM"
  
  // Availability
  isActive: boolean("is_active").default(true),
  dayOfWeek: varchar("day_of_week", { 
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] 
  }),
  
  // Capacity management
  maxBookings: integer("max_bookings").default(5), // Max bookings per time slot per day
  
  // Created/Updated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff/Team Members for booking assignments
export const bookingStaff = pgTable("booking_staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Staff details
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).default("Site Visit Coordinator"),
  
  // Availability
  isActive: boolean("is_active").default(true),
  workingDays: json("working_days").$type<string[]>().default([]), // ["monday", "tuesday", ...]
  workingHours: json("working_hours").$type<{start: string, end: string}>(),
  
  // Contact preferences
  preferredContact: varchar("preferred_contact", { enum: ["phone", "email", "whatsapp"] }).default("phone"),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking system insert schemas and types
export const insertSiteVisitBookingSchema = createInsertSchema(siteVisitBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  cancelledAt: true,
  conversionDate: true,
});

export const insertBookingTimeSlotSchema = createInsertSchema(bookingTimeSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingStaffSchema = createInsertSchema(bookingStaff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Booking system types
export type SiteVisitBooking = typeof siteVisitBookings.$inferSelect;
export type InsertSiteVisitBooking = z.infer<typeof insertSiteVisitBookingSchema>;
export type BookingTimeSlot = typeof bookingTimeSlots.$inferSelect;
export type InsertBookingTimeSlot = z.infer<typeof insertBookingTimeSlotSchema>;
export type BookingStaff = typeof bookingStaff.$inferSelect;
export type InsertBookingStaff = z.infer<typeof insertBookingStaffSchema>;

// Enhanced booking with property and staff details
export interface SiteVisitBookingWithDetails extends SiteVisitBooking {
  property?: Property;
  configuration?: PropertyConfiguration;
  assignedStaff?: BookingStaff;
}

// Booking statistics
export type BookingStats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  conversionRate: number;
  bookingsByStatus: Record<string, number>;
  bookingsBySource: Record<string, number>;
  monthlyBookings: Array<{month: string, count: number}>;
};

// Export types for Valuation Reports
export type PropertyValuationReport = typeof propertyValuationReports.$inferSelect;

// Property Valuation Report Customers (Many-to-Many relationship)
export const propertyValuationReportCustomers = pgTable("property_valuation_report_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => propertyValuationReports.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by").notNull(),
}, (table) => [
  index("idx_report_customer").on(table.reportId, table.customerId),
]);

export const insertPropertyValuationReportCustomerSchema = createInsertSchema(propertyValuationReportCustomers).omit({
  id: true,
  assignedAt: true,
});
export type InsertPropertyValuationReportCustomer = z.infer<typeof insertPropertyValuationReportCustomerSchema>;
export type PropertyValuationReportCustomer = typeof propertyValuationReportCustomers.$inferSelect;

// Property Valuation Report Configurations - Multiple configurations per report
export const propertyValuationReportConfigurations = pgTable("property_valuation_report_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => propertyValuationReports.id, { onDelete: "cascade" }),
  
  // Configuration Details
  configurationType: text("configuration_type").notNull(), // 3BHK, 4BHK, 5BHK, Villa, Plot, etc.
  configurationName: text("configuration_name"), // Custom name like "3BHK Premium", "Garden Villa"
  isPrimary: boolean("is_primary").default(false), // Mark one as primary configuration
  
  // Area Details
  builtUpArea: decimal("built_up_area", { precision: 8, scale: 2 }), // BUA in sq.ft
  superBuiltUpArea: decimal("super_built_up_area", { precision: 8, scale: 2 }), // Super BUA in sq.ft
  carpetArea: decimal("carpet_area", { precision: 8, scale: 2 }), // Carpet area in sq.ft
  plotArea: decimal("plot_area", { precision: 8, scale: 2 }), // Plot area in sq.ft
  balconyArea: decimal("balcony_area", { precision: 8, scale: 2 }), // Balcony area in sq.ft
  
  // UDS and Land Details
  udsShare: decimal("uds_share", { precision: 8, scale: 2 }), // Undivided share in sq.ft
  udsPercentage: decimal("uds_percentage", { precision: 5, scale: 2 }), // UDS as percentage
  landShareValue: decimal("land_share_value", { precision: 12, scale: 2 }), // Land share value in INR
  
  // Pricing Details
  basicPrice: decimal("basic_price", { precision: 12, scale: 2 }), // Basic unit price
  ratePerSqft: decimal("rate_per_sqft", { precision: 10, scale: 2 }), // Rate per sq.ft
  ratePerSqftBua: decimal("rate_per_sqft_bua", { precision: 10, scale: 2 }), // Rate per BUA sq.ft
  ratePerSqftSba: decimal("rate_per_sqft_sba", { precision: 10, scale: 2 }), // Rate per SBA sq.ft
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }), // Total configuration price
  
  // Additional Charges
  amenitiesCharges: decimal("amenities_charges", { precision: 10, scale: 2 }),
  maintenanceCharges: decimal("maintenance_charges", { precision: 10, scale: 2 }),
  parkingCharges: decimal("parking_charges", { precision: 10, scale: 2 }),
  floorRiseCharges: decimal("floor_rise_charges", { precision: 10, scale: 2 }),
  
  // Configuration Specific Details
  numberOfBedrooms: integer("number_of_bedrooms"),
  numberOfBathrooms: integer("number_of_bathrooms"),
  numberOfBalconies: integer("number_of_balconies"),
  facing: text("facing"), // North, South, East, West, North-East, etc.
  floorNumber: text("floor_number"), // Floor details
  
  // Availability
  totalUnits: integer("total_units"), // Total units of this configuration
  availableUnits: integer("available_units"), // Available units
  soldUnits: integer("sold_units"), // Sold units
  
  // Configuration Notes
  configurationNotes: text("configuration_notes"), // Additional notes for this configuration
  amenitiesIncluded: json("amenities_included").$type<string[]>().default([]), // Configuration specific amenities
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_report_config").on(table.reportId),
]);

export const insertPropertyValuationReportConfigurationSchema = createInsertSchema(propertyValuationReportConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPropertyValuationReportConfiguration = z.infer<typeof insertPropertyValuationReportConfigurationSchema>;
export type PropertyValuationReportConfiguration = typeof propertyValuationReportConfigurations.$inferSelect;

export type InsertPropertyValuationReport = typeof propertyValuationReports.$inferInsert;

export const insertPropertyValuationReportSchema = createInsertSchema(propertyValuationReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPropertyValuationReportWithValidation = z.infer<typeof insertPropertyValuationReportSchema>;

// Team members and role management
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  role: varchar("role", { enum: ["admin", "manager", "agent", "analyst", "intern"] }).notNull().default("agent"),
  department: varchar("department", { enum: ["sales", "legal", "technical", "finance", "operations"] }).notNull().default("sales"),
  permissions: json("permissions").default('[]'), // Array of permission strings
  status: varchar("status", { enum: ["active", "inactive", "suspended"] }).notNull().default("active"),
  joinDate: timestamp("join_date").defaultNow(),
  lastActive: timestamp("last_active"),
  profileImage: varchar("profile_image"),
  bio: varchar("bio"),
  specializations: json("specializations").default('[]'), // Array of specialization areas
  performanceScore: integer("performance_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: varchar("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RERA Data types
export const insertReraDataSchema = createInsertSchema(reraData);
export type InsertReraData = typeof reraData.$inferInsert;
export type ReraData = typeof reraData.$inferSelect;

// User types - keeping existing ones
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Notifications System
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // If null, it's a system-wide notification
  userType: varchar("user_type", { enum: ["admin", "user", "all"] }).notNull().default("user"),
  
  // Notification content
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { 
    enum: ["info", "success", "warning", "error", "report", "booking", "payment", "system"] 
  }).notNull().default("info"),
  category: varchar("category", { 
    enum: ["property", "report", "booking", "payment", "lead", "system", "promotion"] 
  }).notNull().default("system"),
  
  // Notification metadata
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
  actionUrl: varchar("action_url"), // Optional URL to navigate to
  actionText: varchar("action_text"), // Optional action button text
  
  // Status tracking
  isRead: boolean("is_read").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  readAt: timestamp("read_at"),
  
  // Email integration
  emailSent: boolean("email_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
  
  // Metadata for linking to other entities
  relatedEntityType: varchar("related_entity_type"), // 'property', 'report', 'booking', etc.
  relatedEntityId: varchar("related_entity_id"),
  metadata: json("metadata").default('{}'), // Additional data
  
  // Expiry and scheduling
  expiresAt: timestamp("expires_at"),
  scheduledFor: timestamp("scheduled_for"), // For future notifications
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Templates for consistent messaging
export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateKey: varchar("template_key").unique().notNull(), // e.g., "REPORT_READY", "BOOKING_CONFIRMED"
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Template content
  titleTemplate: varchar("title_template").notNull(),
  messageTemplate: text("message_template").notNull(),
  emailSubjectTemplate: varchar("email_subject_template"),
  emailBodyTemplate: text("email_body_template"),
  
  // Template settings
  type: varchar("type", { 
    enum: ["info", "success", "warning", "error", "report", "booking", "payment", "system"] 
  }).notNull().default("info"),
  category: varchar("category", { 
    enum: ["property", "report", "booking", "payment", "lead", "system", "promotion"] 
  }).notNull().default("system"),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
  
  // Template status
  isActive: boolean("is_active").notNull().default(true),
  requiresEmail: boolean("requires_email").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userType: varchar("user_type", { enum: ["admin", "user"] }).notNull().default("user"),
  
  // Notification type preferences
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
  
  // Category preferences
  propertyUpdates: boolean("property_updates").notNull().default(true),
  reportNotifications: boolean("report_notifications").notNull().default(true),
  bookingNotifications: boolean("booking_notifications").notNull().default(true),
  paymentNotifications: boolean("payment_notifications").notNull().default(true),
  leadNotifications: boolean("lead_notifications").notNull().default(true),
  systemNotifications: boolean("system_notifications").notNull().default(true),
  promotionalNotifications: boolean("promotional_notifications").notNull().default(false),
  
  // Frequency settings
  digestFrequency: varchar("digest_frequency", { 
    enum: ["immediate", "daily", "weekly", "never"] 
  }).notNull().default("immediate"),
  quietHoursStart: varchar("quiet_hours_start").default("22:00"), // 24-hour format
  quietHoursEnd: varchar("quiet_hours_end").default("08:00"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
  readAt: true,
  emailSent: true,
  emailSentAt: true,
});

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

// Civil+MEP Reports Schema - Fresh Implementation
export const civilMepReports = pgTable("civil_mep_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id),
  reportTitle: text("report_title").notNull(),
  engineerName: text("engineer_name").notNull(),
  engineerLicense: text("engineer_license").notNull(),
  inspectionDate: date("inspection_date").notNull(),
  reportDate: date("report_date").notNull(),
  status: varchar("status", { enum: ["draft", "in-progress", "completed", "approved"] }).notNull().default("draft"),
  overallScore: real("overall_score").default(0),
  
  // Civil Engineering Sections (1-9)
  siteInformation: json("site_information").$type<{
    projectName?: string;
    location?: string;
    plotArea?: string;
    surveyNumber?: string;
    zoningClassification?: string;
    soilTestReport?: string;
    landUsePermissions?: string;
    images?: string[];
  }>(),
  
  foundationDetails: json("foundation_details").$type<{
    type?: string;
    depthAndFooting?: string;
    soilBearingCapacity?: string;
    antiTermiteTreatment?: string;
    waterproofingMethod?: string;
    inspectionLogs?: Array<{
      date?: string;
      inspector?: string;
      findings?: string;
      images?: string[];
    }>;
  }>(),
  
  superstructureDetails: json("superstructure_details").$type<{
    structuralSystem?: string;
    columnBeamSlab?: string;
    floorToFloorHeight?: string;
    loadCalculations?: string;
    seismicDesignCode?: string;
    concreteGradeReinforcement?: string;
    images?: string[];
  }>(),
  
  wallsFinishes: json("walls_finishes").$type<{
    type?: string;
    plasteringType?: string;
    wallInsulation?: string;
    interiorExteriorFinishes?: string;
    waterproofingTests?: Array<{
      testType?: string;
      result?: string;
      date?: string;
      images?: string[];
    }>;
    paintSpecs?: string;
  }>(),
  
  roofingDetails: json("roofing_details").$type<{
    type?: string;
    roofTreatment?: string;
    drainageProvisions?: string;
    parapetHandrail?: string;
    thermalCoating?: string;
    images?: string[];
  }>(),
  
  doorsWindows: json("doors_windows").$type<{
    entries?: Array<{
      type?: string;
      size?: string;
      material?: string;
      glazingSpecs?: string;
      safetyFeatures?: string;
      acousticProperties?: string;
      images?: string[];
    }>;
  }>(),
  
  flooringDetails: json("flooring_details").$type<{
    finishType?: string;
    skirtingHeight?: string;
    expansionJoints?: string;
    slopeDrainage?: string;
    images?: string[];
  }>(),
  
  staircasesElevators: json("staircases_elevators").$type<{
    treadRiserDimensions?: string;
    handrailDetails?: string;
    elevatorSpecs?: Array<{
      brand?: string;
      capacity?: string;
      floors?: string;
      images?: string[];
    }>;
    fireExitCompliance?: string;
    accessibilityCompliance?: string;
  }>(),
  
  externalWorks: json("external_works").$type<{
    compoundWallGates?: string;
    landscaping?: string;
    externalPaving?: string;
    rainwaterHarvesting?: string;
    signageOutdoorFurniture?: string;
    images?: string[];
  }>(),
  
  // MEP Sections (10-15)
  mechanicalSystems: json("mechanical_systems").$type<{
    hvacDesign?: string;
    ductingLayout?: string;
    equipmentSpecs?: Array<{
      type?: string;
      brand?: string;
      capacity?: string;
      model?: string;
      images?: string[];
    }>;
    ventilationType?: string;
    heatLoadCalculations?: string;
    energyEfficiencyRating?: string;
  }>(),
  
  electricalSystems: json("electrical_systems").$type<{
    ltPanelDesign?: string;
    powerDistribution?: string;
    wiringType?: string;
    cableSizesStandards?: string;
    backupSystem?: Array<{
      type?: string;
      rating?: string;
      brand?: string;
      images?: string[];
    }>;
    earthingResistance?: string;
    lightFixtures?: string;
    energyMetering?: string;
    lightningProtection?: string;
  }>(),
  
  plumbingSystems: json("plumbing_systems").$type<{
    waterSupply?: string | {
      source?: string;
      storage?: string;
      distribution?: string;
      quality?: string;
    };
    pipeMaterialDiameter?: string;
    undergroundTankSpecs?: string;
    stpLayout?: string;
    waterPumpAutomation?: string;
    fixtures?: Array<{
      location?: string;
      brand?: string;
      model?: string;
      images?: string[];
    }>;
    pressureTestReports?: Array<{
      date?: string;
      pressure?: string;
      result?: string;
      images?: string[];
    }>;
    rainwaterOutlets?: string;
  }>(),
  
  fireSafetySystems: json("fire_safety_systems").$type<{
    hydrantSystemLayout?: string;
    sprinklerSystem?: string;
    smokeDetectorLayout?: string;
    fireAlarmPA?: string;
    exitSignage?: string;
    fireNOC?: string;
    equipmentList?: Array<{
      equipment?: string;
      location?: string;
      brand?: string;
      certificationNumber?: string;
      images?: string[];
    }>;
  }>(),
  
  bmsAutomation: json("bms_automation").$type<{
    homeAutomation?: string;
    cctvLayout?: string;
    accessControl?: string;
    sensors?: Array<{
      type?: string;
      location?: string;
      model?: string;
      images?: string[];
    }>;
    iotIntegration?: string;
  }>(),
  
  greenSustainability: json("green_sustainability").$type<{
    solarPanels?: Array<{
      capacity?: string;
      brand?: string;
      location?: string;
      images?: string[];
    }>;
    wasteSegregation?: string;
    waterRecycling?: string;
    daylightingStudies?: string;
    passiveCooling?: string;
    certificationStatus?: string;
  }>(),
  
  // Documentation & Appendices
  documentation: json("documentation").$type<{
    sitePhotos?: Array<{
      title?: string;
      description?: string;
      imageUrl?: string;
      date?: string;
    }>;
    testReports?: Array<{
      testType?: string;
      reportNumber?: string;
      date?: string;
      result?: string;
      imageUrl?: string;
    }>;
    warranties?: Array<{
      item?: string;
      vendor?: string;
      warrantyPeriod?: string;
      documentUrl?: string;
    }>;
    vendorBrandList?: Array<{
      category?: string;
      brand?: string;
      model?: string;
      vendor?: string;
    }>;
    complianceCertificates?: Array<{
      certificateType?: string;
      number?: string;
      issuingAuthority?: string;
      validUntil?: string;
      imageUrl?: string;
    }>;
    signOffSheet?: {
      architect?: string;
      pmc?: string;
      client?: string;
      signOffDate?: string;
      images?: string[];
    };
  }>(),
  
  executiveSummary: text("executive_summary"),
  recommendations: text("recommendations"),
  conclusions: text("conclusions"),
  investmentRecommendation: varchar("investment_recommendation", { 
    enum: ["highly-recommended", "recommended", "conditional", "not-recommended"] 
  }).default("conditional"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type CivilMepReport = typeof civilMepReports.$inferSelect;
export type NewCivilMepReport = typeof civilMepReports.$inferInsert;

export const insertCivilMepReportSchema = createInsertSchema(civilMepReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCivilMepReport = z.infer<typeof insertCivilMepReportSchema>;
