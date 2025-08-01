import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertyConfigurationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
