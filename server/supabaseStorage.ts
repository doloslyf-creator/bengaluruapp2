import { supabaseAdmin } from './supabase'
import { IStorage } from './storage'
import {
  type Property,
  type InsertProperty,
  type PropertyStats,
  type PropertyConfiguration,
  type InsertPropertyConfiguration,
  type PropertyWithConfigurations,
  type PropertyScore,
  type InsertPropertyScore,
  type Lead,
  type InsertLead,
  type LeadWithDetails,
  type LeadActivity,
  type InsertLeadActivity,
  type LeadNote,
  type InsertLeadNote,
  type LeadStats,
  type Booking,
  type InsertBooking,
  type CivilMepReport,
  type InsertCivilMepReport,
  type PropertyValuationReport,
  type InsertPropertyValuationReport,
  type ReportPayment,
  type InsertReportPayment,
  type CustomerNote,
  type InsertCustomerNote,
  type AppSettings,
  type InsertAppSettings,
  type TeamMember,
  type InsertTeamMember,
  type ReraData,
  type InsertReraData
} from '@shared/schema'

// Supabase Storage Implementation that mimics the existing IStorage interface
export class SupabaseStorage implements IStorage {
  private isConfigured(): boolean {
    return supabaseAdmin !== null
  }

  // For now, we'll delegate to the existing DatabaseStorage when Supabase is not configured
  // This allows gradual migration
  private fallbackToDatabase() {
    if (!this.isConfigured()) {
      throw new Error('Supabase not configured. Using fallback database storage.')
    }
  }

  // Property CRUD operations
  async getProperty(id: string): Promise<Property | undefined> {
    if (!this.isConfigured()) {
      this.fallbackToDatabase()
    }

    try {
      const { data, error } = await supabaseAdmin!
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return undefined // No rows found
        }
        throw error
      }

      return data as Property
    } catch (error) {
      console.error('Error fetching property from Supabase:', error)
      this.fallbackToDatabase()
      return undefined
    }
  }

  async getAllProperties(): Promise<Property[]> {
    if (!this.isConfigured()) {
      this.fallbackToDatabase()
    }

    try {
      const { data, error } = await supabaseAdmin!
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as Property[]
    } catch (error) {
      console.error('Error fetching properties from Supabase:', error)
      this.fallbackToDatabase()
      return []
    }
  }

  async getPropertyWithConfigurations(id: string): Promise<PropertyWithConfigurations | undefined> {
    this.fallbackToDatabase()
    // TODO: Implement Supabase version
    throw new Error('Not implemented yet - using existing database')
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    if (!this.isConfigured()) {
      this.fallbackToDatabase()
    }

    try {
      const { data, error } = await supabaseAdmin!
        .from('properties')
        .insert(property)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Property
    } catch (error) {
      console.error('Error creating property in Supabase:', error)
      this.fallbackToDatabase()
      throw error
    }
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined> {
    if (!this.isConfigured()) {
      this.fallbackToDatabase()
    }

    try {
      const { data, error } = await supabaseAdmin!
        .from('properties')
        .update(property)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return undefined // No rows found
        }
        throw error
      }

      return data as Property
    } catch (error) {
      console.error('Error updating property in Supabase:', error)
      this.fallbackToDatabase()
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    if (!this.isConfigured()) {
      this.fallbackToDatabase()
    }

    try {
      const { error } = await supabaseAdmin!
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting property in Supabase:', error)
      return false
    }
  }

  // Property Scoring operations
  async createPropertyScore(score: InsertPropertyScore): Promise<PropertyScore> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getPropertyScore(propertyId: string): Promise<PropertyScore | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updatePropertyScore(id: string, score: Partial<InsertPropertyScore>): Promise<PropertyScore | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deletePropertyScore(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllPropertyScores(): Promise<PropertyScore[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Property Configuration operations
  async getPropertyConfigurations(propertyId: string): Promise<PropertyConfiguration[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async createPropertyConfiguration(config: InsertPropertyConfiguration): Promise<PropertyConfiguration> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updatePropertyConfiguration(id: string, config: Partial<InsertPropertyConfiguration>): Promise<PropertyConfiguration | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deletePropertyConfiguration(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Search operations
  async searchProperties(query: any): Promise<Property[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getPropertiesByLocation(location: string): Promise<Property[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getPropertiesByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getPropertyStats(): Promise<PropertyStats> {
    if (!this.isConfigured()) {
      this.fallbackToDatabase()
    }

    try {
      // Get total properties count
      const { count: totalProperties, error: totalError } = await supabaseAdmin!
        .from('properties')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        throw totalError
      }

      // Get active projects count
      const { count: activeProjects, error: activeError } = await supabaseAdmin!
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (activeError) {
        throw activeError
      }

      // Get average price
      const { data: priceData, error: priceError } = await supabaseAdmin!
        .from('properties')
        .select('starting_price')
        .not('starting_price', 'is', null)

      if (priceError) {
        throw priceError
      }

      const averagePrice = priceData.length > 0
        ? priceData.reduce((sum, p) => sum + (p.starting_price || 0), 0) / priceData.length
        : 0

      // Get total area
      const { data: areaData, error: areaError } = await supabaseAdmin!
        .from('properties')
        .select('total_area')
        .not('total_area', 'is', null)

      if (areaError) {
        throw areaError
      }

      const totalArea = areaData.reduce((sum, p) => sum + (p.total_area || 0), 0)

      return {
        totalProperties: totalProperties || 0,
        activeProjects: activeProjects || 0,
        avgPrice: averagePrice,
        totalArea
      }
    } catch (error) {
      console.error('Error fetching property stats from Supabase:', error)
      this.fallbackToDatabase()
      return { totalProperties: 0, activeProjects: 0, avgPrice: 0, totalArea: 0 }
    }
  }

  // Lead operations
  async createLead(lead: InsertLead): Promise<Lead> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getLead(id: string): Promise<Lead | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getLeadWithDetails(id: string): Promise<LeadWithDetails | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllLeads(): Promise<Lead[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllLeadsWithDetails(): Promise<LeadWithDetails[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteLead(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getLeadStats(): Promise<LeadStats> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Lead Activity operations
  async createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateLeadActivity(id: string, activity: Partial<InsertLeadActivity>): Promise<LeadActivity | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteLeadActivity(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Lead Note operations
  async createLeadNote(note: InsertLeadNote): Promise<LeadNote> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateLeadNote(id: string, note: Partial<InsertLeadNote>): Promise<LeadNote | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteLeadNote(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllBookings(): Promise<Booking[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteBooking(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Report operations
  async createCivilMepReport(report: InsertCivilMepReport): Promise<CivilMepReport> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getCivilMepReport(id: string): Promise<CivilMepReport | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllCivilMepReports(): Promise<CivilMepReport[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateCivilMepReport(id: string, report: Partial<InsertCivilMepReport>): Promise<CivilMepReport | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteCivilMepReport(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async createPropertyValuationReport(report: InsertPropertyValuationReport): Promise<PropertyValuationReport> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getPropertyValuationReport(id: string): Promise<PropertyValuationReport | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllPropertyValuationReports(): Promise<PropertyValuationReport[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updatePropertyValuationReport(id: string, report: Partial<InsertPropertyValuationReport>): Promise<PropertyValuationReport | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deletePropertyValuationReport(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Payment operations
  async createReportPayment(payment: InsertReportPayment): Promise<ReportPayment> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getReportPayment(id: string): Promise<ReportPayment | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllReportPayments(): Promise<ReportPayment[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateReportPayment(id: string, payment: Partial<InsertReportPayment>): Promise<ReportPayment | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteReportPayment(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Customer Note operations
  async createCustomerNote(note: InsertCustomerNote): Promise<CustomerNote> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getCustomerNote(id: string): Promise<CustomerNote | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllCustomerNotes(): Promise<CustomerNote[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateCustomerNote(id: string, note: Partial<InsertCustomerNote>): Promise<CustomerNote | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteCustomerNote(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Settings operations
  async getAppSettings(): Promise<AppSettings | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async createAppSettings(settings: InsertAppSettings): Promise<AppSettings> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // Team operations
  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  // RERA operations
  async createReraData(data: InsertReraData): Promise<ReraData> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getReraData(id: string): Promise<ReraData | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async getAllReraData(): Promise<ReraData[]> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async updateReraData(id: string, data: Partial<InsertReraData>): Promise<ReraData | undefined> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }

  async deleteReraData(id: string): Promise<boolean> {
    this.fallbackToDatabase()
    throw new Error('Not implemented yet - using existing database')
  }
}