import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertyConfigurationSchema, insertBookingSchema, insertLeadSchema, insertLeadActivitySchema, insertLeadNoteSchema, insertPropertyValuationReportSchema, leads, bookings, reportPayments, customerNotes, propertyConfigurations } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { or, eq } from "drizzle-orm";

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Create aliases for cleaner code
const leadTable = leads;
const bookingTable = bookings;
import { z } from "zod";
import { getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost } from "./blog";

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

  // Blog management routes
  app.get("/api/blog", getBlogPosts);
  app.get("/api/blog/:id", getBlogPost);
  app.post("/api/blog", createBlogPost);
  app.patch("/api/blog/:id", updateBlogPost);
  app.delete("/api/blog/:id", deleteBlogPost);

  // CIVIL+MEP Report routes
  app.get("/api/properties/with-reports", async (req, res) => {
    try {
      const { status } = req.query;
      console.log("Fetching properties with reports, status filter:", status);
      const properties = await storage.getPropertiesWithReports(status as string);
      console.log("Found properties:", properties.length);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties with reports:", error);
      res.status(500).json({ error: "Failed to fetch properties with reports" });
    }
  });

  app.get("/api/civil-mep-reports/stats", async (req, res) => {
    try {
      const stats = await storage.getCivilMepReportStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching report stats:", error);
      res.status(500).json({ error: "Failed to fetch report statistics" });
    }
  });

  app.post("/api/properties/:id/enable-civil-mep-report", async (req, res) => {
    try {
      const property = await storage.enableCivilMepReport(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error enabling CIVIL+MEP report:", error);
      res.status(500).json({ error: "Failed to enable CIVIL+MEP report" });
    }
  });

  app.post("/api/civil-mep-reports/pay-later", async (req, res) => {
    try {
      const { reportId, customerName, customerEmail, customerPhone, propertyId } = req.body;
      
      // First, create a basic CIVIL+MEP report record if it doesn't exist
      let report;
      try {
        // Check if report exists by property ID (since getCivilMepReport takes propertyId, not reportId)
        report = await storage.getCivilMepReport(propertyId);
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
          reportTitle: `CIVIL+MEP Report - ${property.name}`,
          engineerName: "TBD",
          engineerLicense: "TBD",
          inspectionDate: new Date(),
          reportDate: new Date(),
          civilMepReportStatus: "draft" as const,
          overallScore: "0.0",
          executiveSummary: "Report pending - Access granted via pay-later option",
          investmentRecommendation: "conditional" as const,
          estimatedMaintenanceCost: "0.00"
        };
        
        report = await storage.createCivilMepReport(reportData);
      }
      
      if (report) {
        const paymentData = {
          reportId: report.id,
          reportType: "civil-mep" as const,
          propertyId,
          customerName,
          customerEmail,
          customerPhone,
          amount: "2999.00",
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
          message: "Access granted for 7 days. Payment due within 7 days." 
        });
      } else {
        throw new Error("Failed to create or retrieve report");
      }
    } catch (error) {
      console.error("Error processing CIVIL+MEP pay-later request:", error);
      res.status(500).json({ error: "Failed to process CIVIL+MEP pay-later request" });
    }
  });

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
          reportType: "valuation",
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

  // Create CIVIL+MEP Report
  app.post("/api/civil-mep-reports", async (req, res) => {
    try {
      const reportData = req.body;
      
      // In production, this would save to database
      console.log("Creating CIVIL+MEP Report:", {
        reportId: reportData.reportId,
        propertyId: reportData.propertyId,
        engineerName: reportData.engineerName,
        overallScore: reportData.overallScore,
        timestamp: new Date().toISOString()
      });
      
      // Enable CIVIL+MEP report for the property if not already enabled
      if (reportData.propertyId) {
        await storage.enableCivilMepReport(reportData.propertyId);
      }
      
      res.json({ 
        message: "CIVIL+MEP report created successfully",
        reportId: reportData.reportId
      });
    } catch (error: any) {
      console.error("Error creating CIVIL+MEP report:", error);
      res.status(500).json({ message: error.message });
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

  // Valuation Reports API - Get all valuation reports
  app.get("/api/valuation-reports", async (req, res) => {
    try {
      const reports = await storage.getAllValuationReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching valuation reports:", error);
      res.status(500).json({ error: "Failed to fetch valuation reports" });
    }
  });

  // Valuation Reports API - Get valuation report stats
  app.get("/api/valuation-reports/stats", async (req, res) => {
    try {
      const stats = await storage.getValuationReportStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching valuation report stats:", error);
      res.status(500).json({ error: "Failed to fetch valuation report statistics" });
    }
  });

  // Valuation Reports API - Create new report
  app.post("/api/valuation-reports", async (req, res) => {
    try {
      const reportData = req.body;
      const report = await storage.createValuationReport(reportData);
      res.json(report);
    } catch (error: any) {
      console.error("Error creating valuation report:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Valuation Reports API - Get single report
  app.get("/api/valuation-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getValuationReportById(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching valuation report:", error);
      res.status(500).json({ error: "Failed to fetch valuation report" });
    }
  });

  // Valuation Reports API - Update report
  app.put("/api/valuation-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const reportData = req.body;
      const report = await storage.updateValuationReport(id, reportData);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error: any) {
      console.error("Error updating valuation report:", error);
      res.status(500).json({ error: error.message });
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
          if (new Date(booking.updatedAt || booking.createdAt) > new Date(customerMap.get(key).lastActivity)) {
            customerMap.get(key).lastActivity = booking.updatedAt || booking.createdAt;
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
          if (new Date(payment.updatedAt || payment.createdAt) > new Date(customer.lastActivity)) {
            customer.lastActivity = payment.updatedAt || payment.createdAt;
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
            status: item.leadType || "cold", 
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

  // Legal Due Diligence Tracker API
  app.get("/api/legal-trackers", async (req, res) => {
    try {
      // Return mock data for now - in production, would come from database
      const trackers = [
        {
          propertyId: "cf7d5749-e008-4f43-b728-f24104891bb7",
          propertyName: "Prestige Falcon City",
          steps: [
            {
              id: 1,
              title: "Property Title Verification",
              description: "Ensures the seller holds a clear and marketable title to the property.",
              action: "Confirm that the seller has valid ownership and that the title is free from any encumbrances (e.g., loans, disputes).",
              documentsNeeded: ["Title deed", "Previous sale deeds"],
              status: "verified",
              dateVerified: "2025-01-15T10:30:00Z",
              notes: "Title verified with clear ownership chain"
            },
            {
              id: 2,
              title: "Property Encumbrance Check",
              description: "Verifies that the property is not mortgaged or involved in any legal dispute.",
              action: "Check if there's a mortgage, lien, or any encumbrance listed in the encumbrance certificate.",
              documentsNeeded: ["Encumbrance certificate (EC)"],
              status: "verified",
              dateVerified: "2025-01-16T14:20:00Z"
            },
            {
              id: 3,
              title: "Zoning and Land Use Check",
              description: "Ensures the land is zoned correctly for the intended purpose (residential, commercial, etc.).",
              action: "Confirm that the property is located in a residential zone or within legal boundaries for the intended use.",
              documentsNeeded: ["Zoning certificate", "Land use approval from local municipal authority"],
              status: "pending"
            },
            {
              id: 4,
              title: "Building Plan Approval",
              description: "Ensures that the construction complies with local municipal and legal regulations.",
              action: "Verify that the builder has received approval from the local authority for the building's layout and design.",
              documentsNeeded: ["Building approval plan"],
              status: "not-verified"
            },
            {
              id: 5,
              title: "Occupancy Certificate (OC)",
              description: "A certificate issued by the local municipal authority stating the building is fit for occupation.",
              action: "Confirm that the property has been issued an OC for legal occupation.",
              documentsNeeded: ["Occupancy certificate"],
              status: "not-verified"
            },
            {
              id: 6,
              title: "No Objection Certificates (NOCs)",
              description: "Verifies that the required NOCs have been obtained from relevant authorities (fire, water, electricity, etc.).",
              action: "Ensure the developer has obtained NOCs for utilities and other essential services.",
              documentsNeeded: ["NOCs from relevant authorities"],
              status: "not-verified"
            },
            {
              id: 7,
              title: "RERA Registration",
              description: "Ensures that the property/project is registered with the Real Estate Regulatory Authority (RERA).",
              action: "Verify that the builder has registered the project with RERA and is compliant with its regulations.",
              documentsNeeded: ["RERA registration number"],
              status: "verified",
              dateVerified: "2025-01-10T09:15:00Z"
            },
            {
              id: 8,
              title: "Tax Payment and Land Revenue Records",
              description: "Ensures that the property taxes have been paid and there are no arrears or disputes.",
              action: "Verify that the seller has cleared all dues with the local municipality.",
              documentsNeeded: ["Property tax receipts"],
              status: "not-verified"
            },
            {
              id: 9,
              title: "Legal Title Verification of Developer/Builder",
              description: "Ensures the developer has the legal right to develop and sell the property.",
              action: "Check that the builder/developer is authorized to sell and construct on the land.",
              documentsNeeded: ["Developer's title deed", "Authorization from landowner"],
              status: "verified",
              dateVerified: "2025-01-12T11:45:00Z"
            },
            {
              id: 10,
              title: "Clearance from Other Authorities",
              description: "Ensures that there are no pending environmental clearances or issues with land use.",
              action: "Verify that the property is free from environmental restrictions, forest land disputes, etc.",
              documentsNeeded: ["Environmental clearance certificate", "Forest land certificate (if applicable)"],
              status: "not-verified"
            },
            {
              id: 11,
              title: "Legal Opinion",
              description: "A professional legal opinion to confirm that the property is free from litigation.",
              action: "Hire a property lawyer to provide a legal opinion after reviewing all the documents.",
              documentsNeeded: ["Lawyer's opinion letter"],
              status: "not-verified"
            },
            {
              id: 12,
              title: "Final Verification",
              description: "A final check to ensure that all due diligence steps have been completed satisfactorily.",
              action: "Ensure that there are no red flags, and everything is in order.",
              documentsNeeded: ["Summary of all verified documents"],
              status: "not-verified"
            }
          ],
          overallProgress: 42, // 5 verified out of 12 steps
          lastUpdated: "2025-01-16T14:20:00Z"
        }
      ];
      res.json(trackers);
    } catch (error) {
      console.error("Error fetching legal trackers:", error);
      res.status(500).json({ error: "Failed to fetch legal trackers" });
    }
  });

  app.post("/api/legal-trackers", async (req, res) => {
    try {
      const trackerData = req.body;
      // In production, would save to database
      const newTracker = {
        ...trackerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log("Legal tracker created:", newTracker);
      res.json(newTracker);
    } catch (error) {
      console.error("Error creating legal tracker:", error);
      res.status(500).json({ error: "Failed to create legal tracker" });
    }
  });

  app.patch("/api/legal-trackers/:trackerId/steps/:stepId", async (req, res) => {
    try {
      const { trackerId, stepId } = req.params;
      const updateData = req.body;
      // In production, would update database
      console.log("Legal step updated:", { trackerId, stepId, updateData });
      res.json({ success: true, message: "Legal step updated successfully" });
    } catch (error) {
      console.error("Error updating legal step:", error);
      res.status(500).json({ error: "Failed to update legal step" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
