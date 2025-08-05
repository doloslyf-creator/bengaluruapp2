import type { Express } from "express";
import { storage } from "./storage";
import { insertLeadSchema, type LeadWithDetails } from "@shared/schema";
import { z } from "zod";

// Helper functions for enhanced lead processing
function calculateEnhancedLeadScore(leadData: any): number {
  let score = 0;
  
  // Persona scoring
  if (leadData.buyerPersona === "end-user-family") score += 25;
  else if (leadData.buyerPersona === "first-time-buyer") score += 20;
  else if (leadData.buyerPersona === "nri-investor") score += 15;
  else if (leadData.buyerPersona === "upgrader") score += 22;
  else if (leadData.buyerPersona === "investor") score += 18;
  
  // Urgency scoring
  if (leadData.urgency === "immediate") score += 30;
  else if (leadData.urgency === "3-6-months") score += 20;
  else if (leadData.urgency === "6-12-months") score += 10;
  
  // Budget readiness
  if (leadData.budgetMin && leadData.budgetMax) score += 15;
  if (leadData.hasPreApproval) score += 20;
  
  // Location preference (specific areas)
  if (leadData.preferredAreas?.length > 0) score += 10;
  
  return Math.min(score, 100); // Cap at 100
}

function generateSmartTags(leadData: any): string[] {
  const tags: string[] = [];
  
  if (leadData.urgency === "immediate") tags.push("hot-lead");
  if (leadData.buyerPersona === "first-time-buyer") tags.push("first-time-buyer");
  if (leadData.hasPreApproval) tags.push("pre-approved");
  if (leadData.wantsLegalSupport) tags.push("needs-legal-support");
  if (leadData.budgetMax && parseInt(leadData.budgetMax) > 200) tags.push("premium-budget");
  
  return tags;
}

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
      
      console.log("Fetching enhanced leads with filters:", filters);
      // Fallback to regular leads if enhanced leads method doesn't exist
      const leads = storage.getEnhancedLeads ? await storage.getEnhancedLeads(filters) : await storage.getLeads();
      console.log(`Found ${leads.length} enhanced leads`);
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

      // Add required fields for validation
      const completeLeadData = {
        ...leadData,
        propertyName: leadData.propertyName || "General Inquiry",
        interestedConfiguration: leadData.interestedConfiguration || leadData.bhkPreference || "any",  
        budgetRange: leadData.budgetMin && leadData.budgetMax ? `${leadData.budgetMin}L-${leadData.budgetMax}L` : "TBD"
      };
      
      const validatedData = insertLeadSchema.parse(completeLeadData);
      const lead = await storage.createLead(validatedData);

      // Add initial activity for enhanced lead
      await storage.addLeadActivity({
        leadId: lead.id,
        activityType: "note",
        subject: `Enhanced lead created: ${lead.customerName}`,
        description: `Persona: ${lead.buyerPersona}, Urgency: ${lead.urgency}, Budget: ₹${lead.budgetMin}L-₹${lead.budgetMax}L`,
        outcome: "positive",
        performedBy: req.body.createdBy || "admin",
        attendees: [],
        attachments: [],
        duration: null,
        scheduledAt: null,
        completedAt: null,
        nextAction: null
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
        score: lead.leadScore || 0,
        activities: lead.activities || [],
        notes: lead.notes || []
      };

      res.json(enhancedLead);
    } catch (error) {
      console.error("Error fetching enhanced lead:", error);
      res.status(500).json({ error: "Failed to fetch lead details" });
    }
  });

  // Update lead score
  app.put("/api/leads/enhanced/:leadId/score", async (req, res) => {
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
  app.put("/api/leads/enhanced/:leadId/qualify", async (req, res) => {
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

  // Add timeline milestone
  app.post("/api/leads/enhanced/:leadId/timeline", async (req, res) => {
    try {
      const timeline = await storage.addLeadActivity({
        leadId: req.params.leadId,
        activityType: "milestone",
        ...req.body,
        performedBy: req.body.performedBy || "admin",
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