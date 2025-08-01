import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertyConfigurationSchema, insertBookingSchema, insertLeadSchema, insertLeadActivitySchema, insertLeadNoteSchema } from "@shared/schema";
import { z } from "zod";

// In-memory session storage for demo (use Redis/database in production)
const sessions = new Map<string, { phoneNumber: string; isAdmin: boolean; sessionId: string }>();
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Admin phone numbers - add authorized numbers here
const adminPhoneNumbers = new Set([
  "9560366601", // Your number
  "9876543210"  // Demo number
]);

// Helper function to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                    req.session?.sessionId || 
                    req.cookies?.sessionId;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  req.user = sessions.get(sessionId);
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      // Check if phone number is authorized admin
      if (!adminPhoneNumbers.has(phoneNumber)) {
        return res.status(403).json({ error: "Phone number not authorized for admin access" });
      }

      const otp = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      otpStore.set(phoneNumber, { otp, expiresAt });
      
      // In production, integrate with SMS service like Twilio
      // For development, OTP is logged to console
      console.log(`🔐 Admin OTP for ${phoneNumber}: ${otp} (expires in 5 minutes)`);
      
      res.json({ 
        message: "OTP sent successfully",
        // Only in development - remove in production
        developmentNote: process.env.NODE_ENV === "development" ? 
          "OTP is logged to server console for development" : undefined
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      const otpData = otpStore.get(phoneNumber);
      if (!otpData) {
        return res.status(400).json({ error: "OTP not found or expired" });
      }
      
      if (Date.now() > otpData.expiresAt) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({ error: "OTP expired" });
      }
      
      // Development bypass for admin number
      if (phoneNumber === "9560366601" && process.env.NODE_ENV === "development") {
        console.log(`🔓 Development bypass: Admin login successful for ${phoneNumber}`);
      } else if (otpData.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      
      // Clean up used OTP
      otpStore.delete(phoneNumber);
      
      // Create session
      const sessionId = generateSessionId();
      const user = { phoneNumber, isAdmin: true, sessionId };
      sessions.set(sessionId, user);
      
      // Set session cookie
      res.cookie('sessionId', sessionId, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                      req.cookies?.sessionId;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = sessions.get(sessionId);
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                      req.cookies?.sessionId;
    
    if (sessionId) {
      sessions.delete(sessionId);
      res.clearCookie('sessionId');
    }
    
    res.json({ message: "Logged out successfully" });
  });
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
  app.get("/api/all-configurations", async (req, res) => {
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

  // Customer-facing booking routes with lead management
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        bookingId: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
        bookingType: "site-visit"
      };
      
      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      
      console.log("📅 New booking request:", booking);
      
      // Automatically create a lead from the booking
      const leadId = `LD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const lead = await storage.createLead({
        leadId,
        source: "site-visit",
        customerName: booking.name,
        phone: booking.phone,
        email: booking.email,
        propertyName: booking.propertyName,
        propertyId: booking.propertyId,
        leadDetails: {
          visitType: booking.visitType,
          numberOfVisitors: booking.numberOfVisitors,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          specialRequests: booking.specialRequests,
        },
        leadType: "warm",
        priority: "medium",
        leadScore: 60,
        status: "new",
      });

      // Add initial activity
      await storage.addLeadActivity({
        leadId: lead.id,
        activityType: "site-visit",
        subject: `Site visit scheduled for ${booking.propertyName}`,
        description: `Customer ${booking.name} scheduled a site visit for ${booking.propertyName}`,
        outcome: "positive",
        nextAction: `Contact customer on ${booking.preferredDate} at ${booking.preferredTime}`,
        scheduledAt: booking.preferredDate && booking.preferredTime ? 
          new Date(`${booking.preferredDate}T${booking.preferredTime}:00`) : undefined,
        performedBy: "system",
      });

      console.log(`🎯 Auto-created lead: ${lead.leadId} from booking ${booking.bookingId}`);
      
      res.status(201).json({ 
        success: true,
        bookingId: booking.bookingId,
        leadId: lead.leadId,
        message: "Booking confirmed successfully" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

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
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
