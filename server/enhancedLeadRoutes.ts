import type { Express } from "express";
import { storage } from "./storage";
import { insertLeadSchema, type LeadWithDetails } from "@shared/schema";
import { z } from "zod";

export function registerEnhancedLeadRoutes(app: Express) {
  
  // Get enhanced leads with smart filtering
  app.get("/api/leads/enhanced", async (req, res) => {
    try {
      const filters = {
        persona: req.query.persona as string,
        urgency: req.query.urgency as string, 
        budget: req.query.budget as string,
        status: req.query.status as string,
        smartTags: req.query.smartTags ? (Array.isArray(req.query.smartTags) ? req.query.smartTags : [req.query.smartTags]) as string[] : [],
        assignedTo: req.query.assignedTo as string,
        dateRange: req.query.dateRange as string,
      };
      
      const leads = await storage.getEnhancedLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching enhanced leads:", error);
      res.status(500).json({ error: "Failed to fetch enhanced leads" });
    }
  });

  // Create enhanced lead with persona-specific details
  app.post("/api/leads/enhanced", async (req, res) => {
    try {
      const leadData = {
        ...req.body,
        leadId: `LD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        source: req.body.source || "manual-entry",
        status: req.body.status || "new",
        leadScore: calculateEnhancedLeadScore(req.body),
        smartTags: generateSmartTags(req.body),
      };

      const validatedData = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(validatedData);

      // Add initial activity for enhanced lead
      await storage.addLeadActivity({
        leadId: lead.id,
        activityType: "note",
        subject: `Enhanced lead created: ${lead.customerName}`,
        description: `Persona: ${lead.buyerPersona}, Urgency: ${lead.urgency}, Budget: ₹${lead.budgetMin}L-₹${lead.budgetMax}L`,
        outcome: "positive",
        performedBy: req.body.createdBy || "admin",
      });

      console.log(`🎯 Enhanced lead created: ${lead.leadId} (${lead.buyerPersona})`);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      console.error("Error creating enhanced lead:", error);
      res.status(500).json({ error: "Failed to create enhanced lead" });
    }
  });

  // Get lead with full enhanced details  
  app.get("/api/leads/enhanced/:leadId", async (req, res) => {
    try {
      const lead = await storage.getLeadWithDetails(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Add enhanced data
      const enhancedLead = {
        ...lead,
        timeline: await storage.getLeadTimeline(lead.id),
        documents: await storage.getLeadDocuments(lead.id),
      };
      
      res.json(enhancedLead);
    } catch (error) {
      console.error("Error fetching enhanced lead:", error);
      res.status(500).json({ error: "Failed to fetch enhanced lead" });
    }
  });

  // Update lead with enhanced fields
  app.patch("/api/leads/enhanced/:leadId", async (req, res) => {
    try {
      const updates = {
        ...req.body,
        smartTags: generateSmartTags(req.body),
        leadScore: req.body.leadScore || calculateEnhancedLeadScore(req.body),
        updatedAt: new Date(),
      };

      const lead = await storage.updateLead(req.params.leadId, updates);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      // Add activity for update
      await storage.addLeadActivity({
        leadId: lead.id,
        activityType: "note",
        subject: "Lead profile updated",
        description: `Updated lead with enhanced persona data`,
        outcome: "positive",
        performedBy: req.body.updatedBy || "admin",
      });

      res.json(lead);
    } catch (error) {
      console.error("Error updating enhanced lead:", error);
      res.status(500).json({ error: "Failed to update enhanced lead" });
    }
  });

  // Add enhanced note with categorization
  app.post("/api/leads/:leadId/notes", async (req, res) => {
    try {
      const note = await storage.addLeadNote({
        leadId: req.params.leadId,
        ...req.body,
        createdBy: req.body.createdBy || "admin",
      });

      res.status(201).json(note);
    } catch (error) {
      console.error("Error adding lead note:", error);
      res.status(500).json({ error: "Failed to add lead note" });
    }
  });

  // Add timeline milestone
  app.post("/api/leads/:leadId/timeline", async (req, res) => {
    try {
      const timeline = await storage.addLeadTimeline({
        leadId: req.params.leadId,
        ...req.body,
        createdBy: req.body.createdBy || "admin",
      });

      res.status(201).json(timeline);
    } catch (error) {
      console.error("Error adding timeline:", error);
      res.status(500).json({ error: "Failed to add timeline milestone" });
    }
  });

  // Upload lead document
  app.post("/api/leads/:leadId/documents", async (req, res) => {
    try {
      const document = await storage.addLeadDocument({
        leadId: req.params.leadId,
        ...req.body,
        uploadedBy: req.body.uploadedBy || "admin",
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });
}

// Enhanced lead scoring algorithm
function calculateEnhancedLeadScore(leadData: any): number {
  let score = 0;

  // Urgency scoring (0-25 points)
  switch (leadData.urgency) {
    case "immediate": score += 25; break;
    case "3-6-months": score += 20; break;
    case "6-12-months": score += 15; break;
    case "exploratory": score += 5; break;
  }

  // Budget scoring (0-20 points)
  const budgetMin = leadData.budgetMin || 0;
  if (budgetMin > 200) score += 20; // High budget
  else if (budgetMin > 100) score += 15; // Medium budget
  else if (budgetMin > 50) score += 10; // Basic budget
  else score += 5; // Low budget

  // Persona scoring (0-15 points)
  switch (leadData.buyerPersona) {
    case "end-user-family": score += 15; break;
    case "nri-investor": score += 12; break;
    case "research-oriented": score += 10; break;
    case "working-couple": score += 8; break;
    case "first-time-buyer": score += 6; break;
    case "senior-buyer": score += 5; break;
  }

  // Financing readiness (0-10 points)
  if (leadData.hasPreApproval) score += 10;
  else if (leadData.financing === "own-funds") score += 8;
  else if (leadData.financing === "bank-loan") score += 6;

  // Contact preferences (0-10 points)
  if (leadData.preferredContactTime) score += 5;
  if (leadData.phone && leadData.email) score += 5;

  // Property specificity (0-10 points)
  if (leadData.preferredAreas && leadData.preferredAreas.length > 0) score += 5;
  if (leadData.bhkPreference) score += 3;
  if (leadData.propertyType) score += 2;

  // Legal needs (0-10 points)
  if (leadData.wantsLegalSupport) score += 5;
  if (leadData.interestedInReports && leadData.interestedInReports.length > 0) score += 5;

  return Math.min(score, 100); // Cap at 100
}

// Generate smart tags based on lead data
function generateSmartTags(leadData: any): string[] {
  const tags: string[] = [];

  // Urgency-based tags
  if (leadData.urgency === "immediate") {
    tags.push("hot-lead", "urgent");
  }

  // Budget-based tags
  if (leadData.budgetMin && leadData.budgetMin > 100) {
    tags.push("high-budget");
  }

  // Persona-based tags
  if (leadData.buyerPersona === "first-time-buyer") {
    tags.push("first-time-buyer", "needs-guidance");
  }
  
  if (leadData.buyerPersona === "research-oriented") {
    tags.push("research-intensive", "detail-oriented");
  }

  if (leadData.buyerPersona === "nri-investor") {
    tags.push("investment-focused", "nri-client");
  }

  // Readiness tags
  if (leadData.hasPreApproval || leadData.financing === "own-funds") {
    tags.push("ready-to-buy");
  }

  // Support needs
  if (leadData.wantsLegalSupport) {
    tags.push("needs-legal-handholding");
  }

  if (leadData.seniorCitizenFriendly) {
    tags.push("senior-friendly");
  }

  // Site visit readiness
  if (leadData.urgency === "immediate" && leadData.preferredAreas && leadData.preferredAreas.length > 0) {
    tags.push("ready-to-visit");
  }

  return tags;
}