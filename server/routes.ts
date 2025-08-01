import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertyConfigurationSchema, insertBookingSchema } from "@shared/schema";
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

  // Customer-facing booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        bookingId: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
        bookingType: "site-visit"
      };
      
      const validatedData = insertBookingSchema.parse(bookingData);
      
      // In a real app, you'd save this to database
      // For now, we'll just return success with the booking ID
      console.log("📅 New booking request:", validatedData);
      
      res.status(201).json({ 
        success: true,
        bookingId: validatedData.bookingId,
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
      
      // In a real app, you'd save this to database
      console.log("💬 New consultation request:", validatedData);
      
      res.status(201).json({ 
        success: true,
        consultationId: validatedData.bookingId,
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

  const httpServer = createServer(app);
  return httpServer;
}
