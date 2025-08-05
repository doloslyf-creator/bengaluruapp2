import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerEnhancedLeadRoutes } from "./enhancedLeadRoutes";
import { registerBookingRoutes } from "./bookingRoutes";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertPropertySchema, insertPropertyConfigurationSchema, insertPropertyScoreSchema, insertBookingSchema, insertLeadSchema, insertLeadActivitySchema, insertLeadNoteSchema, insertCivilMepReportSchema, insertAppSettingsSchema, insertValuationRequestSchema, insertPropertyValuationReportSchema, insertPropertyValuationReportConfigurationSchema, leads, bookings, reportPayments, customerNotes, propertyConfigurations, valuationRequests, propertyValuationReportCustomers, propertyValuationReportConfigurations } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { or, eq, and, sql } from "drizzle-orm";

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Create aliases for cleaner code
const leadTable = leads;
const bookingTable = bookings;
import { z } from "zod";
import { getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost } from "./blog";
import { reraService } from "./reraService";
import { paymentService, apiKeysManager } from "./paymentService";
import { supabaseMigration } from "./supabaseMigration";
import { supabaseMigrator } from "./supabaseMigrator";
import { notificationService } from "./notificationService";
import { backupService } from "./backupService";
import * as fs from 'fs';
import * as path from 'path';

// Persistent API keys storage using file system
const API_KEYS_FILE = path.join(process.cwd(), 'api-keys.json');

// Load API keys from file on startup
function loadApiKeys(): Record<string, any> {
  try {
    if (fs.existsSync(API_KEYS_FILE)) {
      const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading API keys:', error);
  }
  return {};
}

// Save API keys to file
function saveApiKeys(keys: Record<string, any>) {
  try {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2));
    console.log('API keys saved to:', API_KEYS_FILE);
  } catch (error) {
    console.error('Error saving API keys:', error);
  }
}

// Global API keys storage with file persistence
const globalApiKeys: Record<string, any> = loadApiKeys();
console.log('Loaded API keys on startup:', Object.keys(globalApiKeys));

// Initialize services with stored keys on startup
if (globalApiKeys.razorpayKeyId && globalApiKeys.razorpayKeySecret) {
  try {
    paymentService.updateKeys(globalApiKeys.razorpayKeyId, globalApiKeys.razorpayKeySecret);
    console.log('Razorpay initialized with stored keys');
  } catch (error) {
    console.error('Failed to initialize Razorpay with stored keys:', error);
  }
}

// Helper function to calculate lead score from contact form
function calculateContactLeadScore(contactData: any): number {
  let score = 40; // Base score for contact form submission

  // Timeline scoring (20 points)
  if (contactData.timeline === "immediate") score += 20;
  else if (contactData.timeline === "1-3months") score += 15;
  else if (contactData.timeline === "3-6months") score += 10;
  else if (contactData.timeline === "6months+") score += 5;

  // Current stage scoring (15 points) 
  if (contactData.currentStage === "ready-to-buy") score += 15;
  else if (contactData.currentStage === "researching") score += 10;
  else if (contactData.currentStage === "exploring") score += 5;

  // Budget scoring (10 points)
  if (contactData.budget && contactData.budget !== "not-decided") score += 10;

  // Property type specificity (5 points)
  if (contactData.propertyType && contactData.propertyType !== "any") score += 5;

  // Location specificity (5 points)
  if (contactData.locations && contactData.locations.length > 0) score += 5;

  // Contact preference (5 points for phone/whatsapp - higher engagement)
  if (contactData.preferredContact === "phone" || contactData.preferredContact === "whatsapp") score += 5;

  return Math.min(score, 100); // Cap at 100
}



// Firebase authentication - all auth handled client-side
// No server-side session management needed

export async function registerRoutes(app: Express): Promise<Server> {
  // Firebase authentication - no server-side auth routes needed
  // Authentication is handled entirely by Firebase


  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // Get property statistics (place before :id route)
  app.get("/api/properties/stats", async (req, res) => {
    try {
      const stats = await storage.getPropertyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching property stats:", error);
      res.status(500).json({ error: "Failed to fetch property stats" });
    }
  });

  // Get property by ID
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  // Get property with configurations
  app.get("/api/properties/:id/with-configurations", async (req, res) => {
    try {
      const property = await storage.getPropertyWithConfigurations(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property with configurations:", error);
      res.status(500).json({ error: "Failed to fetch property with configurations" });
    }
  });

  // Create new property
  app.post("/api/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid property data", details: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  // Update property
  app.put("/api/properties/:id", async (req, res) => {
    try {
      const updates = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(req.params.id, updates);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid property data", details: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // Update property (PATCH method for partial updates)
  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const updates = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(req.params.id, updates);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid property data", details: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // Delete property
  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // Document upload endpoints
  app.post("/api/documents/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getDocumentUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/documents/:documentPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const documentFile = await objectStorageService.getDocumentFile(req.path);
      objectStorageService.downloadObject(documentFile, res);
    } catch (error) {
      console.error("Error downloading document:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Search properties
  app.get("/api/properties/search/:query", async (req, res) => {
    try {
      const properties = await storage.searchProperties(req.params.query);
      res.json(properties);
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ error: "Failed to search properties" });
    }
  });

  // Filter properties
  app.post("/api/properties/filter", async (req, res) => {
    try {
      const filters = req.body;
      const properties = await storage.filterProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error filtering properties:", error);
      res.status(500).json({ error: "Failed to filter properties" });
    }
  });

  // Get all configurations across all properties
  app.get("/api/property-configurations/all", async (req, res) => {
    try {
      console.log("Fetching all configurations...");
      const allConfigurations = await db.select().from(propertyConfigurations);
      console.log("Found configurations:", allConfigurations.length);
      res.json(allConfigurations);
    } catch (error) {
      console.error("Error fetching all configurations:", error);
      res.status(500).json({ error: "Failed to fetch all configurations" });
    }
  });

  // Property Configuration Routes
  app.get("/api/property-configurations/:propertyId", async (req, res) => {
    try {
      const configurations = await storage.getPropertyConfigurations(req.params.propertyId);
      res.json(configurations);
    } catch (error) {
      console.error("Error fetching property configurations:", error);
      res.status(500).json({ error: "Failed to fetch property configurations" });
    }
  });

  app.post("/api/property-configurations", async (req, res) => {
    try {
      const validatedData = insertPropertyConfigurationSchema.parse(req.body);
      const configuration = await storage.createPropertyConfiguration(validatedData);
      res.status(201).json(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating property configuration:", error);
      res.status(500).json({ error: "Failed to create property configuration" });
    }
  });

  app.patch("/api/property-configurations/:id", async (req, res) => {
    try {
      const validatedData = insertPropertyConfigurationSchema.partial().parse(req.body);
      const configuration = await storage.updatePropertyConfiguration(req.params.id, validatedData);
      if (!configuration) {
        return res.status(404).json({ error: "Property configuration not found" });
      }
      res.json(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating property configuration:", error);
      res.status(500).json({ error: "Failed to update property configuration" });
    }
  });

  app.delete("/api/property-configurations/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePropertyConfiguration(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property configuration not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property configuration:", error);
      res.status(500).json({ error: "Failed to delete property configuration" });
    }
  });

  // Property Scoring Routes
  app.get("/api/property-scores", async (req, res) => {
    try {
      const scores = await storage.getAllPropertyScores();
      res.json(scores);
    } catch (error) {
      console.error("Error fetching property scores:", error);
      res.status(500).json({ error: "Failed to fetch property scores" });
    }
  });

  app.get("/api/property-scores/:propertyId", async (req, res) => {
    try {
      const score = await storage.getPropertyScore(req.params.propertyId);
      if (!score) {
        return res.status(404).json({ error: "Property score not found" });
      }
      res.json(score);
    } catch (error) {
      console.error("Error fetching property score:", error);
      res.status(500).json({ error: "Failed to fetch property score" });
    }
  });

  app.post("/api/property-scores", async (req, res) => {
    try {
      const validatedData = insertPropertyScoreSchema.parse(req.body);
      const score = await storage.createPropertyScore(validatedData);
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating property score:", error);
      res.status(500).json({ error: "Failed to create property score" });
    }
  });

  app.patch("/api/property-scores/:id", async (req, res) => {
    try {
      const validatedData = insertPropertyScoreSchema.partial().parse(req.body);
      const score = await storage.updatePropertyScore(req.params.id, validatedData);
      if (!score) {
        return res.status(404).json({ error: "Property score not found" });
      }
      res.json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating property score:", error);
      res.status(500).json({ error: "Failed to update property score" });
    }
  });

  app.delete("/api/property-scores/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePropertyScore(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property score not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property score:", error);
      res.status(500).json({ error: "Failed to delete property score" });
    }
  });

  // Booking routes are now handled by registerBookingRoutes in bookingRoutes.ts

  app.post("/api/consultations", async (req, res) => {
    try {
      const consultationData = {
        ...req.body,
        bookingId: `CR${Date.now()}${Math.floor(Math.random() * 1000)}`,
        bookingType: "consultation"
      };
      
      const validatedData = insertBookingSchema.parse(consultationData);
      const booking = await storage.createBooking(validatedData);
      
      console.log("💬 New consultation request:", booking);
      
      // Automatically create a lead from the consultation
      const leadId = `LD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const lead = await storage.createLead({
        leadId,
        source: "consultation",
        customerName: booking.name,
        phone: booking.phone,
        email: booking.email,
        propertyName: booking.propertyName,
        propertyId: booking.propertyId,
        leadDetails: {
          consultationType: booking.consultationType,
          urgency: booking.urgency,
          questions: booking.questions,
        },
        leadType: "hot",
        priority: "high",
        leadScore: 75,
        status: "new",
      });

      // Add initial activity
      await storage.addLeadActivity({
        leadId: lead.id,
        activityType: "call",
        subject: `Consultation requested for ${booking.propertyName}`,
        description: `Customer ${booking.name} requested ${booking.consultationType} consultation for ${booking.propertyName}`,
        outcome: "positive",
        nextAction: `Call customer for ${booking.consultationType} consultation`,
        performedBy: "system",
      });

      console.log(`🎯 Auto-created lead: ${lead.leadId} from consultation ${booking.bookingId}`);
      
      res.status(201).json({ 
        success: true,
        consultationId: booking.bookingId,
        leadId: lead.leadId,
        message: "Consultation request submitted successfully" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid consultation data", details: error.errors });
      }
      console.error("Error creating consultation:", error);
      res.status(500).json({ error: "Failed to create consultation request" });
    }
  });

  // Get all property configurations endpoint for property matching
  app.get("/api/property-configurations/all", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      const allConfigurations: any[] = [];
      for (const property of properties) {
        const configurations = await storage.getPropertyConfigurations(property.id);
        allConfigurations.push(...configurations);
      }
      res.json(allConfigurations);
    } catch (error) {
      console.error("Error fetching all configurations:", error);
      res.status(500).json({ error: "Failed to fetch all configurations" });
    }
  });

  // Lead Management API Routes
  
  // Get lead statistics (must be first to avoid route conflicts)
  app.get("/api/leads/stats", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching lead stats:", error);
      res.status(500).json({ error: "Failed to fetch lead statistics" });
    }
  });

  // Get all leads with filtering
  app.get("/api/leads", async (req, res) => {
    try {
      const filters = req.query;
      const leads = Object.keys(filters).length > 0 
        ? await storage.filterLeads(filters as any)
        : await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Create lead from contact form
  app.post("/api/leads/contact", async (req, res) => {
    try {
      const leadData = {
        leadId: `LD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        source: "property-inquiry",
        customerName: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        propertyName: req.body.lookingFor || "General Property Inquiry",
        propertyId: null, // No specific property selected
        budgetRange: req.body.budget,
        leadDetails: {
          lookingFor: req.body.lookingFor,
          propertyType: req.body.propertyType,
          bhkPreference: req.body.bhkPreference,
          timeline: req.body.timeline,
          locations: req.body.locations,
          specialRequirements: req.body.specialRequirements,
          currentStage: req.body.currentStage,
          hasCurrentProperty: req.body.hasCurrentProperty,
          preferredContact: req.body.preferredContact,
          message: req.body.message
        },
        leadType: req.body.timeline === "immediate" ? "hot" : req.body.timeline === "1-3months" ? "warm" : "cold",
        priority: req.body.currentStage === "ready-to-buy" ? "high" : "medium",
        leadScore: calculateContactLeadScore(req.body),
        status: "new",
        communicationPreference: req.body.preferredContact === "whatsapp" ? "whatsapp" : req.body.preferredContact === "email" ? "email" : "phone"
      };

      const validatedData = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(validatedData);

      // Add initial activity
      await storage.addLeadActivity({
        leadId: lead.id,
        activityType: "note",
        subject: `Contact form submission from ${req.body.name}`,
        description: `Customer submitted contact form with interest in ${req.body.lookingFor}. Budget: ${req.body.budget}, Timeline: ${req.body.timeline}`,
        outcome: "positive",
        nextAction: `Call customer within 2 hours as promised`,
        performedBy: "system",
      });

      console.log(`📞 New contact lead created: ${lead.leadId} from ${req.body.name}`);
      
      res.status(201).json({ 
        success: true,
        leadId: lead.leadId,
        message: "Contact submitted successfully, lead created" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contact data", details: error.errors });
      }
      console.error("Error creating contact lead:", error);
      res.status(500).json({ error: "Failed to create contact lead" });
    }
  });

  // Get lead by ID with full details
  app.get("/api/leads/:leadId", async (req, res) => {
    try {
      const lead = await storage.getLeadWithDetails(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  // Create new lead manually
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = {
        ...req.body,
        leadId: `LD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      };
      const validatedData = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(validatedData);
      
      console.log(`🎯 Manual lead created: ${lead.leadId}`);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Update lead
  app.patch("/api/leads/:leadId", async (req, res) => {
    try {
      const updates = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.leadId, updates);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Update lead score
  app.post("/api/leads/:leadId/score", async (req, res) => {
    try {
      const { score, notes } = req.body;
      const lead = await storage.updateLeadScore(req.params.leadId, score, notes);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead score:", error);
      res.status(500).json({ error: "Failed to update lead score" });
    }
  });

  // Qualify/disqualify lead
  app.post("/api/leads/:leadId/qualify", async (req, res) => {
    try {
      const { qualified, notes } = req.body;
      const lead = await storage.qualifyLead(req.params.leadId, qualified, notes);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error qualifying lead:", error);
      res.status(500).json({ error: "Failed to qualify lead" });
    }
  });

  // Add lead activity
  app.post("/api/leads/:leadId/activities", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const activityData = {
        ...req.body,
        leadId: lead.id,
      };
      const validatedData = insertLeadActivitySchema.parse(activityData);
      const activity = await storage.addLeadActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid activity data", details: error.errors });
      }
      console.error("Error adding lead activity:", error);
      res.status(500).json({ error: "Failed to add lead activity" });
    }
  });

  // Get lead activities
  app.get("/api/leads/:leadId/activities", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      const activities = await storage.getLeadActivities(lead.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ error: "Failed to fetch lead activities" });
    }
  });

  // Add lead note
  app.post("/api/leads/:leadId/notes", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const noteData = {
        ...req.body,
        leadId: lead.id,
      };
      const validatedData = insertLeadNoteSchema.parse(noteData);
      const note = await storage.addLeadNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid note data", details: error.errors });
      }
      console.error("Error adding lead note:", error);
      res.status(500).json({ error: "Failed to add lead note" });
    }
  });

  // Get lead notes
  app.get("/api/leads/:leadId/notes", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      const notes = await storage.getLeadNotes(lead.id);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching lead notes:", error);
      res.status(500).json({ error: "Failed to fetch lead notes" });
    }
  });

  // Get all bookings (for admin review)
  // GET /api/bookings route handled by registerBookingRoutes in bookingRoutes.ts

  // Blog management routes
  app.get("/api/blog", getBlogPosts);
  app.get("/api/blog/:id", getBlogPost);
  app.post("/api/blog", createBlogPost);
  app.patch("/api/blog/:id", updateBlogPost);
  app.delete("/api/blog/:id", deleteBlogPost);









  // Property Valuation Report pay later endpoint
  app.post("/api/valuation-reports/pay-later", async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, propertyId } = req.body;
      
      // First, create a basic Valuation report record if it doesn't exist
      let report;
      try {
        // Check if report exists by property ID
        report = await storage.getValuationReport(propertyId);
        if (!report) {
          throw new Error("Report not found");
        }
      } catch (error) {
        // Report doesn't exist, create a placeholder report
        const property = await storage.getProperty(propertyId);
        if (!property) {
          return res.status(404).json({ error: "Property not found" });
        }

        const reportData = {
          propertyId: propertyId,
          reportVersion: "1.0",
          generatedBy: "System - Pay Later",
          reportDate: new Date(),
          marketAnalysis: {
            currentMarketTrend: "To be assessed",
            areaGrowthRate: 0,
            demandSupplyRatio: "To be assessed",
            marketSentiment: "To be assessed",
            competitorAnalysis: []
          },
          propertyAssessment: {
            structuralCondition: "To be assessed",
            ageOfProperty: 0,
            maintenanceLevel: "To be assessed",
            amenitiesRating: 0,
            locationAdvantages: [],
            locationDisadvantages: [],
            futureGrowthPotential: 0
          },
          costBreakdown: {
            landValue: 0,
            constructionCost: 0,
            developmentCharges: 0,
            registrationStampDuty: 0,
            gstOnConstruction: 0,
            parkingCharges: 0,
            clubhouseMaintenance: 0,
            interiorFittings: 0,
            movingCosts: 0,
            legalCharges: 0,
            totalEstimatedCost: 0,
            hiddenCosts: []
          },
          financialAnalysis: {
            currentValuation: 0,
            appreciationProjection: [],
            rentalYield: 0,
            monthlyRentalIncome: 0,
            roiAnalysis: {
              breakEvenPeriod: 0,
              totalRoi5Years: 0,
              totalRoi10Years: 0
            },
            loanEligibility: {
              maxLoanAmount: 0,
              suggestedDownPayment: 0,
              emiEstimate: 0
            }
          },
          investmentRecommendation: "hold" as const,
          riskAssessment: {
            overallRisk: "medium",
            riskFactors: [],
            mitigationStrategies: []
          },
          executiveSummary: "Report pending - Access granted via pay-later option",
          overallScore: "0.0",
          keyHighlights: [],
          reportPdfUrl: null,
          supportingDocuments: []
        };
        
        report = await storage.createValuationReport(reportData);
      }
      
      if (report) {
        const paymentData = {
          reportId: report.id,
          reportType: "valuation" as const,
          propertyId,
          customerName,
          customerEmail,
          customerPhone,
          amount: "15000.00",
          paymentMethod: "pay-later" as const,
          paymentStatus: "pay-later-pending" as const,
          payLaterDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          accessGrantedAt: new Date()
        };

        const payment = await storage.createReportPayment(paymentData);
        
        res.json({ 
          success: true, 
          paymentId: payment.id,
          reportId: report.id,
          reportType: "civil-mep",
          message: "Property Valuation Report access granted for 7 days. Payment due within 7 days.",
          amount: "15000.00"
        });
      } else {
        throw new Error("Failed to create or retrieve valuation report");
      }
    } catch (error) {
      console.error("Error processing valuation pay-later request:", error);
      res.status(500).json({ error: "Failed to process valuation pay-later request" });
    }
  });



  // Orders API - Get all orders with property details
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrdersWithDetails();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Orders API - Get order statistics
  app.get("/api/orders/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ error: "Failed to fetch order statistics" });
    }
  });

  // Orders API - Update payment status
  app.patch("/api/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      const updatedPayment = await storage.updatePaymentStatus(orderId, status);
      if (!updatedPayment) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  // Valuation Reports API - Get all valuation reports with customer assignments
  app.get("/api/valuation-reports", async (req, res) => {
    try {
      const reports = await storage.getAllValuationReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching valuation reports:", error);
      res.status(500).json({ error: "Failed to fetch valuation reports" });
    }
  });

  // Assign multiple customers to a valuation report
  app.post("/api/valuation-reports/:reportId/customers", async (req, res) => {
    try {
      const { reportId } = req.params;
      const { customerIds, assignedBy = "admin" } = req.body;

      if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json({ error: "Customer IDs array is required" });
      }

      // Insert customer assignments
      const assignments = customerIds.map(customerId => ({
        reportId,
        customerId,
        assignedBy
      }));

      for (const assignment of assignments) {
        await db.insert(propertyValuationReportCustomers)
          .values(assignment)
          .onConflictDoNothing(); // Prevent duplicate assignments
      }

      res.status(201).json({ success: true, assigned: customerIds.length });
    } catch (error) {
      console.error("Error assigning customers to report:", error);
      res.status(500).json({ error: "Failed to assign customers" });
    }
  });

  // Remove customers from a valuation report
  app.delete("/api/valuation-reports/:reportId/customers", async (req, res) => {
    try {
      const { reportId } = req.params;
      const { customerIds } = req.body;

      if (!customerIds || !Array.isArray(customerIds)) {
        return res.status(400).json({ error: "Customer IDs array is required" });
      }

      await db.delete(propertyValuationReportCustomers)
        .where(
          and(
            eq(propertyValuationReportCustomers.reportId, reportId),
            sql`${propertyValuationReportCustomers.customerId} = ANY(${customerIds})`
          )
        );

      res.json({ success: true, removed: customerIds.length });
    } catch (error) {
      console.error("Error removing customers from report:", error);
      res.status(500).json({ error: "Failed to remove customers" });
    }
  });

  // Get customers assigned to a specific report
  app.get("/api/valuation-reports/:reportId/customers", async (req, res) => {
    try {
      const { reportId } = req.params;
      
      const assignments = await db.select()
        .from(propertyValuationReportCustomers)
        .where(eq(propertyValuationReportCustomers.reportId, reportId));

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching report customers:", error);
      res.status(500).json({ error: "Failed to fetch report customers" });
    }
  });

  // Property Valuation Report Configurations API
  // Get all configurations for a report
  app.get("/api/valuation-reports/:reportId/configurations", async (req, res) => {
    try {
      const { reportId } = req.params;
      
      const configurations = await db.select()
        .from(propertyValuationReportConfigurations)
        .where(eq(propertyValuationReportConfigurations.reportId, reportId));
      
      res.json(configurations);
    } catch (error) {
      console.error("Error fetching report configurations:", error);
      res.status(500).json({ error: "Failed to fetch report configurations" });
    }
  });

  // Create a new configuration for a report
  app.post("/api/valuation-reports/:reportId/configurations", async (req, res) => {
    try {
      const { reportId } = req.params;
      const validation = insertPropertyValuationReportConfigurationSchema.safeParse({
        ...req.body,
        reportId
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid configuration data", 
          details: validation.error.format() 
        });
      }

      const [configuration] = await db.insert(propertyValuationReportConfigurations)
        .values(validation.data)
        .returning();

      console.log(`🏗️ New configuration added to report ${reportId}: ${configuration.configurationType}`);
      res.status(201).json(configuration);
    } catch (error) {
      console.error("Error creating report configuration:", error);
      res.status(500).json({ error: "Failed to create report configuration" });
    }
  });

  // Update a specific configuration
  app.put("/api/valuation-reports/:reportId/configurations/:configId", async (req, res) => {
    try {
      const { reportId, configId } = req.params;
      const validation = insertPropertyValuationReportConfigurationSchema.safeParse({
        ...req.body,
        reportId
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid configuration data", 
          details: validation.error.format() 
        });
      }

      const [configuration] = await db.update(propertyValuationReportConfigurations)
        .set({ ...validation.data, updatedAt: new Date() })
        .where(eq(propertyValuationReportConfigurations.id, configId))
        .returning();

      if (!configuration) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      console.log(`🏗️ Configuration updated: ${configuration.configurationType} for report ${reportId}`);
      res.json(configuration);
    } catch (error) {
      console.error("Error updating report configuration:", error);
      res.status(500).json({ error: "Failed to update report configuration" });
    }
  });

  // Delete a specific configuration
  app.delete("/api/valuation-reports/:reportId/configurations/:configId", async (req, res) => {
    try {
      const { configId } = req.params;
      
      await db.delete(propertyValuationReportConfigurations)
        .where(eq(propertyValuationReportConfigurations.id, configId));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting report configuration:", error);
      res.status(500).json({ error: "Failed to delete report configuration" });
    }
  });

  // Set primary configuration
  app.patch("/api/valuation-reports/:reportId/configurations/:configId/set-primary", async (req, res) => {
    try {
      const { reportId, configId } = req.params;
      
      // First, unset all primary flags for this report
      await db.update(propertyValuationReportConfigurations)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(eq(propertyValuationReportConfigurations.reportId, reportId));
      
      // Then set the selected configuration as primary
      const [configuration] = await db.update(propertyValuationReportConfigurations)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(eq(propertyValuationReportConfigurations.id, configId))
        .returning();

      if (!configuration) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      console.log(`🏗️ Primary configuration set: ${configuration.configurationType} for report ${reportId}`);
      res.json(configuration);
    } catch (error) {
      console.error("Error setting primary configuration:", error);
      res.status(500).json({ error: "Failed to set primary configuration" });
    }
  });

  // Civil+MEP Reports API - Complete CRUD operations
  app.post("/api/civil-mep-reports", async (req, res) => {
    try {
      const validation = insertCivilMepReportSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid report data", 
          details: validation.error.format() 
        });
      }

      const report = await storage.createCivilMepReport(validation.data);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating Civil+MEP report:", error);
      res.status(500).json({ error: "Failed to create Civil+MEP report" });
    }
  });

  app.get("/api/civil-mep-reports", async (req, res) => {
    try {
      const reports = await storage.getAllCivilMepReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching Civil+MEP reports:", error);
      res.status(500).json({ error: "Failed to fetch Civil+MEP reports" });
    }
  });

  app.get("/api/civil-mep-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getCivilMepReport(id);
      
      if (!report) {
        return res.status(404).json({ error: "Civil+MEP report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching Civil+MEP report:", error);
      res.status(500).json({ error: "Failed to fetch Civil+MEP report" });
    }
  });

  app.get("/api/civil-mep-reports/property/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const report = await storage.getCivilMepReportByProperty(propertyId);
      
      if (!report) {
        return res.status(404).json({ error: "Civil+MEP report not found for this property" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching Civil+MEP report by property:", error);
      res.status(500).json({ error: "Failed to fetch Civil+MEP report" });
    }
  });

  app.patch("/api/civil-mep-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const report = await storage.updateCivilMepReport(id, updates);
      
      if (!report) {
        return res.status(404).json({ error: "Civil+MEP report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error updating Civil+MEP report:", error);
      res.status(500).json({ error: "Failed to update Civil+MEP report" });
    }
  });

  app.delete("/api/civil-mep-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCivilMepReport(id);
      
      if (!success) {
        return res.status(404).json({ error: "Civil+MEP report not found" });
      }
      
      res.json({ success: true, message: "Civil+MEP report deleted successfully" });
    } catch (error) {
      console.error("Error deleting Civil+MEP report:", error);
      res.status(500).json({ error: "Failed to delete Civil+MEP report" });
    }
  });

  app.get("/api/civil-mep-reports-stats", async (req, res) => {
    try {
      const stats = await storage.getCivilMepReportStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching Civil+MEP report stats:", error);
      res.status(500).json({ error: "Failed to fetch Civil+MEP report statistics" });
    }
  });



  // Customer CRM API - Get all customers with unified data
  app.get("/api/customers", async (req, res) => {
    try {
      // Get all leads
      const leads = await db.select().from(leadTable);
      
      // Get all bookings 
      const bookings = await db.select().from(bookingTable);
      
      // Get all orders/payments
      const payments = await db.select().from(reportPayments);
      
      // Create unified customer profiles
      const customerMap = new Map();
      
      // Process leads
      for (const lead of leads) {
        const key = lead.email || lead.phone;
        if (key && !customerMap.has(key)) {
          customerMap.set(key, {
            id: key,
            name: lead.customerName,
            email: lead.email,
            phone: lead.phone,
            status: lead.leadType || "cold",
            leadScore: lead.leadScore || 0,
            source: lead.source || "website",
            lastActivity: lead.updatedAt || lead.createdAt,
            leads: [],
            bookings: [],
            orders: [],
            notes: [],
            totalOrders: 0,
            totalSpent: 0,
            interestedProperties: []
          });
        }
        if (key) customerMap.get(key).leads.push(lead);
      }
      
      // Process bookings
      for (const booking of bookings) {
        const key = booking.email || booking.phone;
        if (key && !customerMap.has(key)) {
          customerMap.set(key, {
            id: key,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            status: "warm",
            leadScore: 40,
            source: "booking",
            lastActivity: booking.updatedAt || booking.createdAt,
            leads: [],
            bookings: [],
            orders: [],
            notes: [],
            totalOrders: 0,
            totalSpent: 0,
            interestedProperties: []
          });
        }
        if (key) {
          customerMap.get(key).bookings.push(booking);
          const bookingDate = booking.updatedAt || booking.createdAt;
          if (bookingDate && new Date(bookingDate) > new Date(customerMap.get(key).lastActivity)) {
            customerMap.get(key).lastActivity = bookingDate;
          }
        }
      }
      
      // Process orders/payments
      for (const payment of payments) {
        const key = payment.customerEmail || payment.customerPhone;
        if (key && !customerMap.has(key)) {
          customerMap.set(key, {
            id: key,
            name: payment.customerName,
            email: payment.customerEmail,
            phone: payment.customerPhone,
            status: "converted",
            leadScore: 85,
            source: "order",
            lastActivity: payment.updatedAt || payment.createdAt,
            leads: [],
            bookings: [],
            orders: [],
            notes: [],
            totalOrders: 0,
            totalSpent: 0,
            interestedProperties: []
          });
        }
        if (key) {
          const customer = customerMap.get(key);
          customer.orders.push(payment);
          customer.totalOrders += 1;
          customer.totalSpent += parseFloat(payment.amount);
          customer.status = "converted";
          customer.leadScore = Math.max(customer.leadScore, 85);
          const paymentDate = payment.updatedAt || payment.createdAt;
          if (paymentDate && new Date(paymentDate) > new Date(customer.lastActivity)) {
            customer.lastActivity = paymentDate;
          }
        }
      }
      
      const customers = Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
      
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Customer CRM API - Get customer statistics
  app.get("/api/customers/stats", async (req, res) => {
    try {
      const leads = await db.select().from(leadTable);
      const bookings = await db.select().from(bookingTable);
      const payments = await db.select().from(reportPayments);
      
      const customerMap = new Map();
      
      // Process all data sources to get unique customers
      [...leads, ...bookings].forEach(item => {
        const key = item.email || item.phone;
        if (key && !customerMap.has(key)) {
          customerMap.set(key, { 
            status: "leadType" in item ? (item.leadType || "cold") : "cold", 
            totalSpent: 0 
          });
        }
      });
      
      payments.forEach(payment => {
        const key = payment.customerEmail || payment.customerPhone;
        if (key) {
          if (!customerMap.has(key)) {
            customerMap.set(key, { status: "converted", totalSpent: 0 });
          }
          customerMap.get(key).status = "converted";
          customerMap.get(key).totalSpent += parseFloat(payment.amount);
        }
      });
      
      const customers = Array.from(customerMap.values());
      const totalCustomers = customers.length;
      const hotLeads = customers.filter(c => c.status === "hot").length;
      const convertedCustomers = customers.filter(c => c.status === "converted").length;
      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgOrderValue = convertedCustomers > 0 ? totalRevenue / convertedCustomers : 0;
      
      res.json({
        totalCustomers,
        hotLeads,
        convertedCustomers,
        totalRevenue,
        avgOrderValue
      });
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      res.status(500).json({ error: "Failed to fetch customer statistics" });
    }
  });

  // Create new customer directly
  app.post("/api/customers", async (req, res) => {
    try {
      const { name, email, phone, source, notes } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone) {
        return res.status(400).json({ error: "Name, email, and phone are required" });
      }
      
      // Create a lead for this customer since our system is lead-based
      const leadData = {
        leadId: `LD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        source: "property-inquiry" as const, // Use valid enum value
        customerName: name,
        phone: phone,
        email: email,
        propertyName: "General Inquiry", // Required field
        leadType: "warm" as const,
        priority: "medium" as const,
        leadScore: 40,
        status: "new" as const,
        leadDetails: notes ? { customerNotes: notes } : {},
      };
      
      const validatedData = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(validatedData);
      
      // Add initial activity if notes were provided
      if (notes) {
        await storage.addLeadActivity({
          leadId: lead.id,
          activityType: "note",
          subject: "Customer created with initial notes",
          description: notes,
          outcome: "neutral",
          performedBy: "admin",
        });
      }
      
      console.log(`👤 Manual customer created: ${name} (${email})`);
      res.status(201).json({
        id: email,
        name,
        email,
        phone,
        status: "warm",
        leadId: lead.leadId,
        source: source || "manual",
        message: "Customer created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid customer data", details: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Customer CRM API - Add customer note
  app.post("/api/customers/:customerId/notes", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { note } = req.body;
      
      const [newNote] = await db.insert(customerNotes)
        .values({ customerId, content: note })
        .returning();
      
      res.json(newNote);
    } catch (error) {
      console.error("Error adding customer note:", error);
      res.status(500).json({ error: "Failed to add customer note" });
    }
  });

  // Customer CRM API - Update customer status
  app.patch("/api/customers/:customerId/status", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { status } = req.body;
      
      // Update lead status if customer has leads
      await db.update(leadTable)
        .set({ leadType: status as any, updatedAt: new Date() })
        .where(or(eq(leadTable.email, customerId), eq(leadTable.phone, customerId)));
      
      res.json({ success: true, customerId, status });
    } catch (error) {
      console.error("Error updating customer status:", error);
      res.status(500).json({ error: "Failed to update customer status" });
    }
  });

  // Zones API - Simple zones management
  app.get("/api/zones", async (req, res) => {
    try {
      // Return hardcoded zones for now - in production, would come from database
      const zones = [
        { id: "1", name: "North Bengaluru", description: "Areas like Hebbal, Yelahanka, Devanahalli" },
        { id: "2", name: "South Bengaluru", description: "Areas like Bannerghatta, Jayanagar, Koramangala" },
        { id: "3", name: "East Bengaluru", description: "Areas like Whitefield, Marathahalli, Sarjapur" },
        { id: "4", name: "West Bengaluru", description: "Areas like Rajajinagar, Vijayanagar, Kengeri" },
        { id: "5", name: "Central Bengaluru", description: "Areas like MG Road, Brigade Road, Commercial Street" }
      ];
      res.json(zones);
    } catch (error) {
      console.error("Error fetching zones:", error);
      res.status(500).json({ error: "Failed to fetch zones" });
    }
  });

  app.post("/api/zones", async (req, res) => {
    try {
      const zoneData = req.body;
      // In production, would save to database
      const newZone = {
        id: Date.now().toString(),
        ...zoneData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log("Zone created:", newZone);
      res.json(newZone);
    } catch (error) {
      console.error("Error creating zone:", error);
      res.status(500).json({ error: "Failed to create zone" });
    }
  });

  app.delete("/api/zones/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // In production, would delete from database
      console.log("Zone deleted:", id);
      res.json({ success: true, message: "Zone deleted successfully" });
    } catch (error) {
      console.error("Error deleting zone:", error);
      res.status(500).json({ error: "Failed to delete zone" });
    }
  });

  // Developers API - Simple developers management  
  app.get("/api/developers", async (req, res) => {
    try {
      // Return hardcoded developers for now - in production, would come from database
      const developers = [
        { 
          id: "1", 
          name: "Prestige Estates", 
          description: "Premium residential and commercial developments",
          phone: "+91 80 4933 0000",
          email: "info@prestigeconstructions.com",
          specialization: "Luxury Apartments & Villas"
        },
        { 
          id: "2", 
          name: "Brigade Group", 
          description: "Diversified real estate conglomerate",
          phone: "+91 80 4655 5000", 
          email: "contact@brigade.co.in",
          specialization: "Mixed-use Developments"
        },
        { 
          id: "3", 
          name: "Sobha Limited", 
          description: "Backward integrated real estate player",
          phone: "+91 80 4932 4050",
          email: "enquiry@sobha.com", 
          specialization: "Premium Residential"
        },
        { 
          id: "4", 
          name: "Embassy Group", 
          description: "Real estate and hospitality conglomerate",
          phone: "+91 80 4277 4000",
          email: "info@embassygroup.in",
          specialization: "Commercial & Residential"
        }
      ];
      res.json(developers);
    } catch (error) {
      console.error("Error fetching developers:", error);
      res.status(500).json({ error: "Failed to fetch developers" });
    }
  });

  app.post("/api/developers", async (req, res) => {
    try {
      const developerData = req.body;
      // In production, would save to database
      const newDeveloper = {
        id: Date.now().toString(),
        ...developerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log("Developer created:", newDeveloper);
      res.json(newDeveloper);
    } catch (error) {
      console.error("Error creating developer:", error);
      res.status(500).json({ error: "Failed to create developer" });
    }
  });

  app.delete("/api/developers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // In production, would delete from database
      console.log("Developer deleted:", id);
      res.json({ success: true, message: "Developer deleted successfully" });
    } catch (error) {
      console.error("Error deleting developer:", error);
      res.status(500).json({ error: "Failed to delete developer" });
    }
  });


  // Valuation Requests API
  app.post("/api/valuation-requests", async (req, res) => {
    try {
      const validation = insertValuationRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid valuation request data", 
          details: validation.error.format() 
        });
      }

      const [valuationRequest] = await db.insert(valuationRequests)
        .values(validation.data)
        .returning();

      console.log(`📊 New valuation request: ${valuationRequest.contactName} - ${valuationRequest.location}`);
      res.status(201).json(valuationRequest);
    } catch (error) {
      console.error("Error creating valuation request:", error);
      res.status(500).json({ error: "Failed to create valuation request" });
    }
  });

  app.get("/api/valuation-requests", async (req, res) => {
    try {
      const requests = await db.select().from(valuationRequests);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching valuation requests:", error);
      res.status(500).json({ error: "Failed to fetch valuation requests" });
    }
  });

  app.get("/api/valuation-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [request] = await db.select().from(valuationRequests).where(eq(valuationRequests.id, id));
      
      if (!request) {
        return res.status(404).json({ error: "Valuation request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching valuation request:", error);
      res.status(500).json({ error: "Failed to fetch valuation request" });
    }
  });

  app.patch("/api/valuation-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const [updatedRequest] = await db.update(valuationRequests)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(valuationRequests.id, id))
        .returning();
      
      if (!updatedRequest) {
        return res.status(404).json({ error: "Valuation request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating valuation request:", error);
      res.status(500).json({ error: "Failed to update valuation request" });
    }
  });

  // App Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await storage.getAppSettings();
      if (!settings) {
        settings = await storage.initializeAppSettings();
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ error: "Failed to fetch app settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const validation = insertAppSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid settings data", 
          details: validation.error.format() 
        });
      }

      const updatedSettings = await storage.updateAppSettings(validation.data);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating app settings:", error);
      res.status(500).json({ error: "Failed to update app settings" });
    }
  });

  // Create order from service page submissions
  app.post("/api/orders/service", async (req, res) => {
    try {
      const { serviceType, customerName, customerEmail, customerPhone, propertyId, propertyName, amount, requirements } = req.body;
      
      // Determine report type based on service
      let reportType: "civil-mep" | "legal-due-diligence" = "civil-mep";
      if (serviceType === "civil-mep-reports") reportType = "civil-mep";
      if (serviceType === "legal-due-diligence") reportType = "legal-due-diligence";
      
      const orderData = {
        reportId: null,
        reportType,
        propertyId: propertyId || null,
        customerName,
        customerEmail,
        customerPhone,
        amount: amount.toString(),
        paymentMethod: "pay-later" as const,
        paymentStatus: "pay-later-pending" as const,
        payLaterDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        accessGrantedAt: new Date()
      };
      
      const order = await storage.createReportPayment(orderData);
      
      console.log(`💼 New service order created: ${serviceType} for ${customerName}`);
      
      res.status(201).json({ 
        success: true,
        orderId: order.id,
        message: `Order created successfully for ${serviceType}` 
      });
    } catch (error) {
      console.error("Error creating service order:", error);
      res.status(500).json({ error: "Failed to create service order" });
    }
  });

  // Team member API routes
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team-members/:id", async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const member = await storage.createTeamMember(req.body);
      console.log(`👥 New team member added: ${member.name} as ${member.role}`);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.put("/api/team-members/:id", async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      console.log(`👥 Team member updated: ${member.name}`);
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/team-members/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTeamMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Team member not found" });
      }
      console.log(`👥 Team member deleted: ${req.params.id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  app.get("/api/team-members/department/:department", async (req, res) => {
    try {
      const members = await storage.getTeamMembersByDepartment(req.params.department);
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members by department:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team-members/active", async (req, res) => {
    try {
      const members = await storage.getActiveTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching active team members:", error);
      res.status(500).json({ error: "Failed to fetch active team members" });
    }
  });

  // RERA Data Integration API Routes
  // Get all RERA data with optional filtering
  app.get("/api/rera-data", async (req, res) => {
    try {
      const { verificationStatus, complianceStatus, projectStatus } = req.query;
      
      const filters: any = {};
      if (verificationStatus) filters.verificationStatus = verificationStatus;
      if (complianceStatus) filters.complianceStatus = complianceStatus;
      if (projectStatus) filters.projectStatus = projectStatus;
      
      const reraData = await reraService.getAllReraData(filters);
      res.json(reraData);
    } catch (error) {
      console.error("Error fetching RERA data:", error);
      res.status(500).json({ error: "Failed to fetch RERA data" });
    }
  });

  // Get RERA data for a specific property
  app.get("/api/properties/:propertyId/rera-data", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const reraData = await reraService.getReraDataForProperty(propertyId);
      res.json(reraData);
    } catch (error) {
      console.error("Error fetching property RERA data:", error);
      res.status(500).json({ error: "Failed to fetch property RERA data" });
    }
  });

  // Verify and sync RERA data for a specific RERA ID
  app.post("/api/rera-data/verify", async (req, res) => {
    try {
      const { reraId, propertyId } = req.body;
      
      if (!reraId) {
        return res.status(400).json({ error: "RERA ID is required" });
      }

      const reraData = await reraService.syncReraData(reraId, propertyId);
      res.json({
        success: true,
        message: "RERA data verified and synced successfully",
        data: reraData
      });
    } catch (error) {
      console.error("Error verifying RERA data:", error);
      res.status(500).json({ 
        error: "Failed to verify RERA data", 
        details: error.message 
      });
    }
  });

  // Auto-sync RERA data for all properties with RERA numbers
  app.post("/api/rera-data/auto-sync", async (req, res) => {
    try {
      const results = await reraService.autoSyncPropertiesWithReraNumbers();
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      res.json({
        success: true,
        message: `Auto-sync completed. ${successCount} properties synced successfully, ${failureCount} failed.`,
        results: results
      });
    } catch (error) {
      console.error("Error in auto-sync:", error);
      res.status(500).json({ 
        error: "Failed to auto-sync RERA data", 
        details: error.message 
      });
    }
  });

  // Bulk verify multiple RERA IDs
  app.post("/api/rera-data/bulk-verify", async (req, res) => {
    try {
      const { reraIds } = req.body;
      
      if (!Array.isArray(reraIds) || reraIds.length === 0) {
        return res.status(400).json({ error: "Array of RERA IDs is required" });
      }

      const results = await reraService.bulkSyncReraData(reraIds);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      res.json({
        success: true,
        message: `Bulk verification completed. ${successCount} RERA IDs verified successfully, ${failureCount} failed.`,
        results: results
      });
    } catch (error) {
      console.error("Error in bulk verification:", error);
      res.status(500).json({ 
        error: "Failed to bulk verify RERA data", 
        details: error.message 
      });
    }
  });

  // Get RERA verification status summary
  app.get("/api/rera-data/status-summary", async (req, res) => {
    try {
      const allRera = await reraService.getAllReraData();
      
      const summary = {
        total: allRera.length,
        verified: allRera.filter(r => r.verificationStatus === "verified").length,
        pending: allRera.filter(r => r.verificationStatus === "pending").length,
        failed: allRera.filter(r => r.verificationStatus === "failed").length,
        outdated: allRera.filter(r => r.verificationStatus === "outdated").length,
        byComplianceStatus: {
          active: allRera.filter(r => r.complianceStatus === "active").length,
          nonCompliant: allRera.filter(r => r.complianceStatus === "non-compliant").length,
          suspended: allRera.filter(r => r.complianceStatus === "suspended").length,
          cancelled: allRera.filter(r => r.complianceStatus === "cancelled").length,
        },
        byProjectStatus: {
          underConstruction: allRera.filter(r => r.projectStatus === "under-construction").length,
          completed: allRera.filter(r => r.projectStatus === "completed").length,
          delayed: allRera.filter(r => r.projectStatus === "delayed").length,
          cancelled: allRera.filter(r => r.projectStatus === "cancelled").length,
          approved: allRera.filter(r => r.projectStatus === "approved").length,
        }
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching RERA status summary:", error);
      res.status(500).json({ error: "Failed to fetch RERA status summary" });
    }
  });

  // API Keys Settings Routes
  app.get("/api/settings/api-keys", async (req, res) => {
    try {
      console.log("Global API keys stored:", Object.keys(globalApiKeys));
      
      const apiKeys = {
        id: "1",
        razorpayKeyId: globalApiKeys.razorpayKeyId || "",
        razorpayTestMode: globalApiKeys.razorpayTestMode || true,
        googleMapsApiKey: globalApiKeys.googleMapsApiKey || "",
        googleAnalyticsId: globalApiKeys.googleAnalyticsId || "",
        twilioAccountSid: globalApiKeys.twilioAccountSid || "",
        twilioAuthToken: "", // Never return sensitive tokens
        twilioPhoneNumber: globalApiKeys.twilioPhoneNumber || "",
        sendgridApiKey: globalApiKeys.sendgridApiKey ? "SG.***...***" : "", // Show masked version if exists
        sendgridFromEmail: globalApiKeys.sendgridFromEmail || "",
        surepassApiKey: "", // Never return sensitive keys
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin"
      };
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.put("/api/settings/api-keys", async (req, res) => {
    try {
      const apiKeysData = req.body;
      console.log("API keys update request received:", Object.keys(apiKeysData));
      
      // Store all API keys in global memory storage and save to file
      Object.assign(globalApiKeys, apiKeysData);
      saveApiKeys(globalApiKeys);
      console.log("Stored API keys:", Object.keys(globalApiKeys));
      
      // Also update the apiKeysManager for payment service
      apiKeysManager.setKeys(apiKeysData);
      
      // Update Razorpay service if keys are provided
      if (apiKeysData.razorpayKeyId && apiKeysData.razorpayKeySecret) {
        try {
          paymentService.updateKeys(apiKeysData.razorpayKeyId, apiKeysData.razorpayKeySecret);
          console.log("Razorpay payment service updated successfully");
        } catch (error) {
          console.error("Failed to update payment service:", error);
          return res.status(500).json({ error: "Failed to initialize Razorpay with provided keys" });
        }
      }
      
      res.json({ success: true, message: "API keys updated successfully" });
    } catch (error) {
      console.error("Error updating API keys:", error);
      res.status(500).json({ error: "Failed to update API keys" });
    }
  });

  app.post("/api/settings/test-connection/:service", async (req, res) => {
    try {
      const { service } = req.params;
      
      switch (service) {
        case "razorpay":
          if (!paymentService.isReady()) {
            return res.status(400).json({ error: "Razorpay not configured" });
          }
          // Test by creating a small test order
          try {
            const testOrder = await paymentService.createOrder({
              amount: 100, // 1 rupee
              currency: "INR",
              receipt: "test_" + Date.now(),
              notes: { test: "connection_test" }
            });
            res.json({ success: true, message: "Razorpay connection successful", orderId: testOrder.id });
          } catch (error) {
            res.status(400).json({ error: "Razorpay connection failed: " + error.message });
          }
          break;
          
        case "surepass":
          try {
            const testResult = await reraService.verifyReraProject("KA1234567890");
            res.json({ success: true, message: "Surepass connection successful" });
          } catch (error) {
            res.status(400).json({ error: "Surepass connection failed: " + error.message });
          }
          break;
          
        default:
          res.status(400).json({ error: "Unknown service: " + service });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  // Payment processing routes
  app.post("/api/payments/create-order", async (req, res) => {
    try {
      if (!paymentService.isReady()) {
        return res.status(503).json({ error: "Payment service not configured. Please set up Razorpay keys in admin settings." });
      }

      const { amount, currency = "INR", receipt, notes } = req.body;
      
      if (!amount || amount < 100) {
        return res.status(400).json({ error: "Amount must be at least 100 paise (1 INR)" });
      }

      const order = await paymentService.createOrder({
        amount,
        currency,
        receipt: receipt || `order_${Date.now()}`,
        notes
      });

      res.json(order);
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ error: error.message || "Failed to create payment order" });
    }
  });

  app.post("/api/payments/verify", async (req, res) => {
    try {
      if (!paymentService.isReady()) {
        return res.status(503).json({ error: "Payment service not configured" });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required payment verification parameters" });
      }

      const isValid = paymentService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (isValid) {
        // In production, update order status in database
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Report unlock payment routes
  app.post("/api/payments/reports/create-order", async (req, res) => {
    try {
      if (!paymentService.isReady()) {
        return res.status(503).json({ error: "Payment service not configured. Please set up Razorpay keys in admin settings." });
      }

      const { propertyId, reportType, customerName, customerEmail, customerPhone } = req.body;
      
      if (!propertyId || !reportType || !customerName || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields: propertyId, reportType, customerName, customerEmail" });
      }

      const amount = 249900; // ₹2,499 in paise
      const receipt = `${reportType}_${propertyId}_${Date.now()}`;
      
      const order = await paymentService.createOrder({
        amount,
        currency: "INR",
        receipt,
        notes: {
          reportType,
          propertyId,
          customerName,
          customerEmail,
          customerPhone: customerPhone || ""
        }
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        reportType,
        propertyId
      });
    } catch (error) {
      console.error("Error creating report payment order:", error);
      res.status(500).json({ error: error.message || "Failed to create report payment order" });
    }
  });

  app.post("/api/payments/reports/verify", async (req, res) => {
    try {
      if (!paymentService.isReady()) {
        return res.status(503).json({ error: "Payment service not configured" });
      }

      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        propertyId,
        reportType,
        customerName,
        customerEmail,
        customerPhone
      } = req.body;
      
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required payment verification parameters" });
      }

      const isValid = paymentService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (isValid) {
        // Create payment record in database
        const paymentData = {
          reportId: null, // Will be linked when report is created
          reportType: reportType === "valuation" ? "property-valuation" as const : "civil-mep" as const,
          propertyId,
          customerName,
          customerEmail,
          customerPhone: customerPhone || "",
          amount: "2499",
          currency: "INR",
          paymentMethod: "upi" as const, // Default to UPI for Razorpay
          paymentStatus: "completed" as const,
          accessGrantedAt: new Date()
        };

        const payment = await storage.createReportPayment(paymentData);
        
        console.log(`💳 Report payment verified: ${reportType} for property ${propertyId} by ${customerName}`);
        
        res.json({ 
          success: true, 
          message: "Payment verified and report unlocked successfully",
          paymentId: payment.id,
          accessGranted: true
        });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying report payment:", error);
      res.status(500).json({ error: "Failed to verify report payment" });
    }
  });

  // Check if user has paid for a specific report
  app.get("/api/payments/reports/access/:propertyId/:reportType", async (req, res) => {
    try {
      const { propertyId, reportType } = req.params;
      const { customerEmail } = req.query;

      if (!customerEmail) {
        return res.status(400).json({ error: "Customer email is required" });
      }

      // Check if payment exists for this customer, property, and report type
      const payment = await db.select()
        .from(reportPayments)
        .where(
          and(
            eq(reportPayments.propertyId, propertyId),
            eq(reportPayments.reportType, reportType as "civil-mep" | "property-valuation"),
            eq(reportPayments.customerEmail, customerEmail as string),
            eq(reportPayments.paymentStatus, "completed")
          )
        )
        .limit(1);

      res.json({ 
        hasAccess: payment.length > 0,
        paymentId: payment[0]?.id || null
      });
    } catch (error) {
      console.error("Error checking report access:", error);
      res.status(500).json({ error: "Failed to check report access" });
    }
  });

  // Supabase Migration API endpoints
  app.get("/api/supabase/status", async (req, res) => {
    try {
      const summary = await supabaseMigration.getDataSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error getting Supabase status:", error);
      res.status(500).json({ error: "Failed to get Supabase status" });
    }
  });

  app.post("/api/supabase/migrate", async (req, res) => {
    try {
      await supabaseMigration.migrateAll();
      res.json({ 
        success: true, 
        message: "Migration completed successfully" 
      });
    } catch (error) {
      console.error("Error during migration:", error);
      res.status(500).json({ 
        error: "Migration failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/supabase/migrate/properties", async (req, res) => {
    try {
      await supabaseMigration.migrateProperties();
      res.json({ 
        success: true, 
        message: "Properties migration completed successfully" 
      });
    } catch (error) {
      console.error("Error during properties migration:", error);
      res.status(500).json({ 
        error: "Properties migration failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/supabase/migrate/leads", async (req, res) => {
    try {
      await supabaseMigration.migrateLeads();
      res.json({ 
        success: true, 
        message: "Leads migration completed successfully" 
      });
    } catch (error) {
      console.error("Error during leads migration:", error);
      res.status(500).json({ 
        error: "Leads migration failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Enhanced Supabase Migration Routes
  app.get("/api/supabase/migration-status", async (req, res) => {
    try {
      const connectionStatus = await supabaseMigrator.checkSupabaseConnection();
      const verification = await supabaseMigrator.verifyMigration();
      
      res.json({
        supabaseConnected: connectionStatus,
        migrationStatus: verification,
        message: connectionStatus ? "Supabase ready for migration" : "Supabase connection failed"
      });
    } catch (error) {
      console.error("Error checking migration status:", error);
      res.status(500).json({ 
        error: "Failed to check migration status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/supabase/migrate-all-data", async (req, res) => {
    try {
      console.log("Starting comprehensive Supabase migration...");
      const migrationResult = await supabaseMigrator.migrateAllData();
      
      res.json({
        success: migrationResult.success,
        message: migrationResult.success 
          ? `Migration completed! ${migrationResult.totalMigrated} records migrated.`
          : "Migration completed with some errors",
        details: migrationResult.results
      });
    } catch (error) {
      console.error("Error during comprehensive migration:", error);
      res.status(500).json({ 
        error: "Comprehensive migration failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/supabase/verify-migration", async (req, res) => {
    try {
      const verification = await supabaseMigrator.verifyMigration();
      res.json(verification);
    } catch (error) {
      console.error("Error verifying migration:", error);
      res.status(500).json({ 
        error: "Migration verification failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // ==============================
  // NOTIFICATIONS API ENDPOINTS
  // ==============================

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const options = {
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
        unreadOnly: req.query.unreadOnly === 'true',
        category: req.query.category as string,
        priority: req.query.priority as string,
      };

      const result = await notificationService.getUserNotifications(userId, options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Create a notification
  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = req.body;
      const notification = await notificationService.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Create notification from template
  app.post("/api/notifications/from-template", async (req, res) => {
    try {
      const { templateKey, userId, variables, metadata } = req.body;
      
      if (!templateKey) {
        return res.status(400).json({ error: "templateKey is required" });
      }

      const notification = await notificationService.createNotificationFromTemplate(
        templateKey, 
        userId || null, 
        variables || {}, 
        metadata || {}
      );

      if (!notification) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification from template:", error);
      res.status(500).json({ error: "Failed to create notification from template" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.body.userId as string;
      
      const success = await notificationService.markAsRead(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read for a user
  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const userId = req.body.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const count = await notificationService.markAllAsRead(userId);
      res.json({ success: true, message: `${count} notifications marked as read` });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Archive notification
  app.patch("/api/notifications/:id/archive", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.body.userId as string;
      
      const success = await notificationService.archiveNotification(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json({ success: true, message: "Notification archived" });
    } catch (error) {
      console.error("Error archiving notification:", error);
      res.status(500).json({ error: "Failed to archive notification" });
    }
  });

  // ==============================
  // NOTIFICATION TEMPLATES API
  // ==============================

  // Get all notification templates
  app.get("/api/notification-templates", async (req, res) => {
    try {
      const templates = await notificationService.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching notification templates:", error);
      res.status(500).json({ error: "Failed to fetch notification templates" });
    }
  });

  // Get specific notification template
  app.get("/api/notification-templates/:templateKey", async (req, res) => {
    try {
      const { templateKey } = req.params;
      const template = await notificationService.getTemplate(templateKey);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching notification template:", error);
      res.status(500).json({ error: "Failed to fetch notification template" });
    }
  });

  // Create notification template
  app.post("/api/notification-templates", async (req, res) => {
    try {
      const templateData = req.body;
      const template = await notificationService.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating notification template:", error);
      res.status(500).json({ error: "Failed to create notification template" });
    }
  });

  // Update notification template
  app.put("/api/notification-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const templateData = req.body;
      const template = await notificationService.updateTemplate(id, templateData);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error updating notification template:", error);
      res.status(500).json({ error: "Failed to update notification template" });
    }
  });

  // ==============================
  // NOTIFICATION PREFERENCES API
  // ==============================

  // Get user notification preferences
  app.get("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = await notificationService.getUserPreferences(userId);
      
      // Return default preferences if none exist
      if (!preferences) {
        const defaultPreferences = {
          userId,
          userType: "user",
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          propertyUpdates: true,
          reportNotifications: true,
          bookingNotifications: true,
          paymentNotifications: true,
          leadNotifications: true,
          systemNotifications: true,
          promotionalNotifications: false,
          digestFrequency: "immediate",
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
        };
        res.json(defaultPreferences);
      } else {
        res.json(preferences);
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ error: "Failed to fetch notification preferences" });
    }
  });

  // Update user notification preferences
  app.put("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferencesData = req.body;
      
      const preferences = await notificationService.updateUserPreferences(userId, preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  // ==============================
  // QUICK NOTIFICATION HELPERS
  // ==============================

  // Send system notification to all users
  app.post("/api/notifications/system-broadcast", async (req, res) => {
    try {
      const { title, message, priority = "medium" } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({ error: "title and message are required" });
      }

      await notificationService.notifySystemMessage(title, message, priority);
      res.json({ success: true, message: "System notification broadcasted" });
    } catch (error) {
      console.error("Error broadcasting system notification:", error);
      res.status(500).json({ error: "Failed to broadcast system notification" });
    }
  });

  // Test notification (for development)
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const { userId, type = "info" } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      await notificationService.createNotification({
        userId,
        userType: "user",
        title: "Test Notification",
        message: "This is a test notification from the OwnItRight system.",
        type,
        category: "system",
        priority: "low",
        actionUrl: "/user-dashboard",
        actionText: "Go to Dashboard"
      });

      res.json({ success: true, message: "Test notification sent" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });

  // Backup System API Routes
  app.get("/api/admin/backups", async (req, res) => {
    try {
      const backups = backupService.getBackupHistory();
      res.json(backups);
    } catch (error) {
      console.error("Error fetching backup history:", error);
      res.status(500).json({ error: "Failed to fetch backup history" });
    }
  });

  app.post("/api/admin/backups/create", async (req, res) => {
    try {
      const { type } = req.body;
      
      if (!['full', 'database', 'files', 'config'].includes(type)) {
        return res.status(400).json({ error: "Invalid backup type" });
      }

      const backupId = await backupService.createBackup(type);
      
      res.json({ 
        success: true, 
        backupId,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} backup initiated successfully`
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  app.get("/api/admin/backups/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const backup = backupService.getBackup(id);
      
      if (!backup) {
        return res.status(404).json({ error: "Backup not found" });
      }
      
      if (backup.status !== 'completed') {
        return res.status(400).json({ error: "Backup is not ready for download" });
      }

      const filePath = await backupService.getBackupFilePath(id);
      
      if (!filePath) {
        return res.status(404).json({ error: "Backup file not found" });
      }

      const stats = await fs.promises.stat(filePath);
      const filename = `backup-${backup.type}-${new Date(backup.createdAt).toISOString().split('T')[0]}.zip`;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      
      stream.on('error', (error) => {
        console.error("Error streaming backup file:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error downloading backup file" });
        }
      });
      
    } catch (error) {
      console.error("Error downloading backup:", error);
      res.status(500).json({ error: "Failed to download backup" });
    }
  });

  app.delete("/api/admin/backups/cleanup", async (req, res) => {
    try {
      const { daysToKeep = 30 } = req.body;
      await backupService.deleteOldBackups(daysToKeep);
      res.json({ success: true, message: "Old backups cleaned up successfully" });
    } catch (error) {
      console.error("Error cleaning up backups:", error);
      res.status(500).json({ error: "Failed to cleanup old backups" });
    }
  });

  // ============ PROPERTY VALUATION REPORTS API ============
  
  // Get all valuation reports
  app.get("/api/valuation-reports", async (req, res) => {
    try {
      const reports = await storage.getAllValuationReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching valuation reports:", error);
      res.status(500).json({ error: "Failed to fetch valuation reports" });
    }
  });

  // Get valuation report by ID
  app.get("/api/valuation-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getValuationReport(id);
      
      if (!report) {
        return res.status(404).json({ error: "Valuation report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching valuation report:", error);
      res.status(500).json({ error: "Failed to fetch valuation report" });
    }
  });

  // Create new valuation report
  app.post("/api/valuation-reports", async (req, res) => {
    try {
      const validatedData = insertPropertyValuationReportSchema.parse(req.body);
      const report = await storage.createValuationReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating valuation report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create valuation report" });
    }
  });

  // Update valuation report
  app.put("/api/valuation-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const report = await storage.updateValuationReport(id, updates);
      
      if (!report) {
        return res.status(404).json({ error: "Valuation report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error updating valuation report:", error);
      res.status(500).json({ error: "Failed to update valuation report" });
    }
  });

  // Delete valuation report
  app.delete("/api/valuation-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteValuationReport(id);
      
      if (!success) {
        return res.status(404).json({ error: "Valuation report not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting valuation report:", error);
      res.status(500).json({ error: "Failed to delete valuation report" });
    }
  });

  // Get reports by property
  app.get("/api/properties/:propertyId/valuation-reports", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const reports = await storage.getValuationReportsByProperty(propertyId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching property valuation reports:", error);
      res.status(500).json({ error: "Failed to fetch property valuation reports" });
    }
  });

  // Get reports by customer
  app.get("/api/customers/:customerId/valuation-reports", async (req, res) => {
    try {
      const { customerId } = req.params;
      const reports = await storage.getValuationReportsByCustomer(customerId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching customer valuation reports:", error);
      res.status(500).json({ error: "Failed to fetch customer valuation reports" });
    }
  });

  // Assign report to customer
  app.post("/api/valuation-reports/:id/assign", async (req, res) => {
    try {
      const { id } = req.params;
      const { customerId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      
      const report = await storage.assignReportToCustomer(id, customerId);
      
      if (!report) {
        return res.status(404).json({ error: "Valuation report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error assigning report to customer:", error);
      res.status(500).json({ error: "Failed to assign report to customer" });
    }
  });

  // Update report status
  app.patch("/api/valuation-reports/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["draft", "in_progress", "completed", "delivered"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const report = await storage.updateReportStatus(id, status);
      
      if (!report) {
        return res.status(404).json({ error: "Valuation report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ error: "Failed to update report status" });
    }
  });

  // Get valuation report statistics  
  app.get("/api/valuation-reports/stats", async (req, res) => {
    try {
      const reports = await storage.getValuationReports();
      const stats = {
        totalReports: reports.length,
        draftReports: reports.filter(r => r.reportStatus === 'draft').length,
        inProgressReports: reports.filter(r => r.reportStatus === 'in_progress').length,
        completedReports: reports.filter(r => r.reportStatus === 'completed').length,
        deliveredReports: reports.filter(r => r.reportStatus === 'delivered').length,
        averageValue: reports.length > 0 ? reports.reduce((sum, r) => sum + (r.estimatedMarketValue || 0), 0) / reports.length : 0
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching valuation report stats:", error);
      res.status(500).json({ error: "Failed to fetch valuation report statistics" });
    }
  });

  // ============ AUTOMATED SETUP API ============
  
  // Initialize Supabase setup
  app.post("/api/setup/initialize", async (req, res) => {
    try {
      const { supabaseUrl, supabaseKey } = req.body;
      
      if (!supabaseUrl || !supabaseKey) {
        return res.status(400).json({ 
          error: "Supabase URL and service role key are required" 
        });
      }

      const { SetupService } = await import('./setupService');
      const setupService = new SetupService({ supabaseUrl, supabaseKey });
      
      await setupService.performCompleteSetup();
      
      res.json({
        success: true,
        message: "Supabase setup completed successfully",
        nextSteps: [
          "Update your DATABASE_URL environment variable",
          "Restart your application",
          "Access the admin panel to begin using your platform"
        ]
      });
    } catch (error: any) {
      console.error("Setup initialization error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to initialize setup" 
      });
    }
  });

  // Setup progress streaming endpoint
  app.get("/api/setup/progress", async (req, res) => {
    const { url: supabaseUrl, key: supabaseKey } = req.query;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    try {
      const { SetupService } = await import('./setupService');
      const setupService = new SetupService({ 
        supabaseUrl: supabaseUrl as string, 
        supabaseKey: supabaseKey as string 
      });
      
      // Set up progress callback
      setupService.setProgressCallback((progress) => {
        const eventType = progress.status === 'start' ? 'step_start' : 
                         progress.status === 'complete' ? 'step_complete' : 'step_error';
        
        res.write(`data: ${JSON.stringify({
          type: eventType,
          step: progress.step,
          message: progress.message
        })}\n\n`);
      });

      // Perform setup
      await setupService.performCompleteSetup();
      
      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        message: 'Setup completed successfully'
      })}\n\n`);
      
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: error.message
      })}\n\n`);
    } finally {
      res.end();
    }
  });

  // Check if setup is required
  app.get("/api/setup/status", async (req, res) => {
    try {
      // Check if we have Supabase configuration
      const hasSupabaseUrl = !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL;
      const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
      const hasDatabaseUrl = !!process.env.DATABASE_URL;
      
      // Check if setup was completed
      const fs = await import('fs/promises');
      const path = await import('path');
      let setupCompleted = false;
      
      try {
        const setupConfigPath = path.join(process.cwd(), '.env.setup');
        const setupConfig = await fs.readFile(setupConfigPath, 'utf-8');
        setupCompleted = setupConfig.includes('setup_completed=true');
      } catch {
        // Setup config file doesn't exist
      }
      
      res.json({
        setupRequired: !hasSupabaseUrl || !hasSupabaseKey || !hasDatabaseUrl || !setupCompleted,
        hasSupabaseUrl,
        hasSupabaseKey,
        hasDatabaseUrl,
        setupCompleted
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to check setup status" });
    }
  });

  // Register enhanced lead routes
  registerEnhancedLeadRoutes(app);
  
  // Register booking system routes
  registerBookingRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
