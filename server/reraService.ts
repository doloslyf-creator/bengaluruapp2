import { reraData, properties } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// RERA API Response interface based on Surepass API documentation
interface ReraApiResponse {
  status: boolean;
  message: string;
  data?: {
    rera_id: string;
    project_name: string;
    promoter_name: string;
    location: string;
    district: string;
    state?: string;
    project_type?: string;
    total_units?: number;
    project_area?: string;
    built_up_area?: string;
    registration_date?: string;
    approval_date?: string;
    completion_date?: string;
    registration_valid_till?: string;
    project_status?: string;
    compliance_status?: string;
    project_cost?: string;
    amount_collected?: string;
    percentage_collected?: number;
    website?: string;
    contact_phone?: string;
    contact_email?: string;
    promoter_address?: string;
    rera_portal_link?: string;
    [key: string]: any; // For additional fields
  };
}

export class ReraService {
  private apiKey: string;
  private baseUrl = "https://api.surepass.io/rera-verification";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SUREPASS_API_KEY || "";
  }

  /**
   * Verify RERA project by ID using Surepass API
   */
  async verifyReraProject(reraId: string): Promise<ReraApiResponse> {
    if (!this.apiKey) {
      throw new Error("RERA API key not configured. Please set SUREPASS_API_KEY environment variable.");
    }

    try {
      const response = await fetch(`${this.baseUrl}/karnataka`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rera_id: reraId }),
      });

      if (!response.ok) {
        throw new Error(`RERA API request failed: ${response.status} ${response.statusText}`);
      }

      const data: ReraApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("RERA API verification failed:", error);
      throw new Error(`Failed to verify RERA project: ${error.message}`);
    }
  }

  /**
   * Sync RERA data from API and store in database
   */
  async syncReraData(reraId: string, propertyId?: string): Promise<any> {
    try {
      const apiResponse = await this.verifyReraProject(reraId);
      
      if (!apiResponse.status || !apiResponse.data) {
        throw new Error(`RERA verification failed: ${apiResponse.message}`);
      }

      const reraInfo = apiResponse.data;
      
      // Check if RERA data already exists
      const existingRera = await db
        .select()
        .from(reraData)
        .where(eq(reraData.reraId, reraId))
        .limit(1);

      const reraDataToSave = {
        reraId: reraInfo.rera_id,
        propertyId: propertyId || null,
        projectName: reraInfo.project_name,
        promoterName: reraInfo.promoter_name,
        location: reraInfo.location,
        district: reraInfo.district,
        state: reraInfo.state || "Karnataka",
        projectType: this.mapProjectType(reraInfo.project_type),
        totalUnits: reraInfo.total_units || null,
        projectArea: reraInfo.project_area || null,
        builtUpArea: reraInfo.built_up_area || null,
        registrationDate: reraInfo.registration_date || null,
        approvalDate: reraInfo.approval_date || null,
        completionDate: reraInfo.completion_date || null,
        registrationValidTill: reraInfo.registration_valid_till || null,
        projectStatus: this.mapProjectStatus(reraInfo.project_status),
        complianceStatus: this.mapComplianceStatus(reraInfo.compliance_status),
        projectCost: reraInfo.project_cost || null,
        amountCollected: reraInfo.amount_collected || null,
        percentageCollected: reraInfo.percentage_collected || null,
        website: reraInfo.website || null,
        contactPhone: reraInfo.contact_phone || null,
        contactEmail: reraInfo.contact_email || null,
        promoterAddress: reraInfo.promoter_address || null,
        reraPortalLink: reraInfo.rera_portal_link || null,
        verificationStatus: "verified" as const,
        lastVerifiedAt: new Date(),
        lastSyncAt: new Date(),
        rawApiResponse: apiResponse,
      };

      let savedRera;
      if (existingRera.length > 0) {
        // Update existing record
        [savedRera] = await db
          .update(reraData)
          .set({
            ...reraDataToSave,
            updatedAt: new Date(),
          })
          .where(eq(reraData.reraId, reraId))
          .returning();
      } else {
        // Insert new record
        [savedRera] = await db
          .insert(reraData)
          .values(reraDataToSave)
          .returning();
      }

      // Update property with RERA compliance status if propertyId provided
      if (propertyId) {
        await db
          .update(properties)
          .set({
            reraApproved: reraDataToSave.complianceStatus === "active",
            reraNumber: reraId,
            updatedAt: new Date(),
          })
          .where(eq(properties.id, propertyId));
      }

      return savedRera;
    } catch (error) {
      console.error("RERA sync failed:", error);
      
      // Log failed sync attempt
      const existingRera = await db
        .select()
        .from(reraData)
        .where(eq(reraData.reraId, reraId))
        .limit(1);

      if (existingRera.length > 0) {
        await db
          .update(reraData)
          .set({
            verificationStatus: "failed",
            syncFailureReason: error.message,
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(reraData.reraId, reraId));
      }

      throw error;
    }
  }

  /**
   * Get RERA data for a property
   */
  async getReraDataForProperty(propertyId: string) {
    return await db
      .select()
      .from(reraData)
      .where(eq(reraData.propertyId, propertyId));
  }

  /**
   * Get all RERA data with optional filtering
   */
  async getAllReraData(filters?: {
    verificationStatus?: string;
    complianceStatus?: string;
    projectStatus?: string;
  }) {
    let query = db.select().from(reraData);
    
    if (filters) {
      const conditions = [];
      if (filters.verificationStatus) {
        conditions.push(eq(reraData.verificationStatus, filters.verificationStatus as any));
      }
      if (filters.complianceStatus) {
        conditions.push(eq(reraData.complianceStatus, filters.complianceStatus as any));
      }
      if (filters.projectStatus) {
        conditions.push(eq(reraData.projectStatus, filters.projectStatus as any));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  /**
   * Bulk sync RERA data for multiple projects
   */
  async bulkSyncReraData(reraIds: string[]): Promise<any[]> {
    const results = [];
    
    for (const reraId of reraIds) {
      try {
        const result = await this.syncReraData(reraId);
        results.push({ reraId, success: true, data: result });
      } catch (error) {
        console.error(`Failed to sync RERA ID ${reraId}:`, error);
        results.push({ reraId, success: false, error: error.message });
      }
      
      // Add delay between requests to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  /**
   * Auto-sync RERA data for properties that have RERA numbers but no RERA data
   */
  async autoSyncPropertiesWithReraNumbers(): Promise<any[]> {
    // Get properties with RERA numbers but no linked RERA data
    const propertiesWithRera = await db
      .select({
        id: properties.id,
        reraNumber: properties.reraNumber,
        name: properties.name,
      })
      .from(properties)
      .where(and(
        eq(properties.reraNumber, properties.reraNumber), // Not null
        eq(properties.reraApproved, false) // Not yet verified
      ));

    const results = [];
    for (const property of propertiesWithRera) {
      if (property.reraNumber) {
        try {
          const result = await this.syncReraData(property.reraNumber, property.id);
          results.push({ 
            propertyId: property.id, 
            propertyName: property.name,
            reraId: property.reraNumber, 
            success: true, 
            data: result 
          });
        } catch (error) {
          results.push({ 
            propertyId: property.id,
            propertyName: property.name,
            reraId: property.reraNumber, 
            success: false, 
            error: error.message 
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Helper methods for mapping API responses to our schema enums
  private mapProjectType(type?: string): "residential" | "commercial" | "mixed" | "plotted-development" | "other" {
    if (!type) return "residential";
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes("residential")) return "residential";
    if (lowerType.includes("commercial")) return "commercial";
    if (lowerType.includes("mixed")) return "mixed";
    if (lowerType.includes("plotted") || lowerType.includes("plot")) return "plotted-development";
    return "other";
  }

  private mapProjectStatus(status?: string): "under-construction" | "completed" | "delayed" | "cancelled" | "approved" {
    if (!status) return "under-construction";
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed") || lowerStatus.includes("ready")) return "completed";
    if (lowerStatus.includes("delayed") || lowerStatus.includes("postponed")) return "delayed";
    if (lowerStatus.includes("cancelled") || lowerStatus.includes("revoked")) return "cancelled";
    if (lowerStatus.includes("approved") || lowerStatus.includes("registered")) return "approved";
    return "under-construction";
  }

  private mapComplianceStatus(status?: string): "active" | "non-compliant" | "suspended" | "cancelled" {
    if (!status) return "active";
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("active") || lowerStatus.includes("compliant")) return "active";
    if (lowerStatus.includes("suspended")) return "suspended";
    if (lowerStatus.includes("cancelled") || lowerStatus.includes("revoked")) return "cancelled";
    if (lowerStatus.includes("non-compliant") || lowerStatus.includes("violation")) return "non-compliant";
    return "active";
  }
}

// Export singleton instance
export const reraService = new ReraService();