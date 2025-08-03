import { supabaseAdmin } from './supabase'
import { DatabaseStorage } from './storage'

/**
 * Migration utility to transfer data from existing PostgreSQL/Drizzle to Supabase
 * This allows gradual migration while maintaining data integrity
 */
export class SupabaseMigration {
  private dbStorage = new DatabaseStorage()

  async isSupabaseReady(): Promise<boolean> {
    if (!supabaseAdmin) {
      return false
    }

    try {
      // Test connection by trying to query a table
      const { error } = await supabaseAdmin
        .from('properties')
        .select('id')
        .limit(1)
        
      return !error
    } catch (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
  }

  // Transform camelCase property data to snake_case for Supabase
  private transformPropertyData(property: any) {
    return {
      id: property.id,
      name: property.name,
      type: property.type,
      developer: property.developer,
      status: property.status,
      area: property.area,
      zone: property.zone,
      address: property.address,
      possession_date: property.possessionDate,
      rera_number: property.reraNumber,
      rera_approved: property.reraApproved,
      infrastructure_verdict: property.infrastructureVerdict,
      zoning_info: property.zoningInfo,
      tags: property.tags,
      images: property.images,
      videos: property.videos,
      youtube_video_url: property.youtubeVideoUrl,
      property_score_id: property.propertyScoreId,
      location_score: property.locationScore || property.amenitiesScore || 0,
      amenities_score: property.amenitiesScore || 0,
      value_score: property.valueScore || 0,
      overall_score: property.overallScore || 0,
      area_avg_price_min: property.areaAvgPriceMin,
      area_avg_price_max: property.areaAvgPriceMax,
      city_avg_price_min: property.cityAvgPriceMin,
      city_avg_price_max: property.cityAvgPriceMax,
      price_comparison: property.priceComparison,
      title_clearance_status: property.titleClearanceStatus,
      ownership_type: property.ownershipType,
      legal_opinion_provided_by: property.legalOpinionProvidedBy,
      title_flow_summary: property.titleFlowSummary,
      encumbrance_status: property.encumbranceStatus,
      ec_extract_link: property.ecExtractLink,
      mutation_status: property.mutationStatus,
      conversion_certificate: property.conversionCertificate,
      rera_registered: property.reraRegistered,
      rera_id: property.reraId,
      rera_link: property.reraLink,
      litigation_status: property.litigationStatus,
      approving_authorities: property.approvingAuthorities,
      layout_sanction_copy_link: property.layoutSanctionCopyLink,
      legal_comments: property.legalComments,
      legal_verdict_badge: property.legalVerdictBadge,
      has_civil_mep_report: property.hasCivilMepReport,
      civil_mep_report_price: property.civilMepReportPrice,
      civil_mep_report_status: property.civilMepReportStatus,
      has_valuation_report: property.hasValuationReport,
      valuation_report_price: property.valuationReportPrice,
      valuation_report_status: property.valuationReportStatus,
      created_at: property.createdAt,
      updated_at: property.updatedAt
    }
  }

  async migrateProperties() {
    console.log('Starting properties migration...')
    
    try {
      // Get all properties from existing database
      const properties = await this.dbStorage.getAllProperties()
      console.log(`Found ${properties.length} properties to migrate`)

      if (properties.length === 0) {
        console.log('No properties to migrate')
        return
      }

      // Migrate properties in batches
      const batchSize = 10
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize)
        
        // Transform data to match Supabase schema
        const transformedBatch = batch.map(prop => this.transformPropertyData(prop))
        
        const { data, error } = await supabaseAdmin!
          .from('properties')
          .upsert(transformedBatch, { onConflict: 'id' })

        if (error) {
          console.error(`Error migrating properties batch ${i}-${i + batch.length}:`, error)
          throw error
        }

        console.log(`Migrated properties batch ${i + 1}-${Math.min(i + batchSize, properties.length)}`)
      }

      console.log('Properties migration completed successfully')
    } catch (error) {
      console.error('Properties migration failed:', error)
      throw error
    }
  }

  // Transform camelCase leads data to snake_case for Supabase
  private transformLeadData(lead: any) {
    return {
      id: lead.id,
      source: lead.source,
      lead_type: lead.leadType,
      priority: lead.priority,
      customer_name: lead.customerName,
      phone: lead.phone,
      email: lead.email,
      budget_min: lead.budgetMin,
      budget_max: lead.budgetMax,
      preferred_locations: lead.preferredLocations,
      property_type: lead.propertyType,
      area_of_interest: lead.areaOfInterest,
      specific_requirements: lead.specificRequirements,
      qualification_status: lead.qualificationStatus,
      lead_score: lead.leadScore,
      notes: lead.notes,
      assigned_to: lead.assignedTo,
      follow_up_date: lead.followUpDate,
      last_contact_date: lead.lastContactDate,
      status: lead.status,
      created_at: lead.createdAt,
      updated_at: lead.updatedAt
    }
  }

  async migrateLeads() {
    console.log('Starting leads migration...')
    
    try {
      const leads = await this.dbStorage.getAllLeads()
      console.log(`Found ${leads.length} leads to migrate`)

      if (leads.length === 0) {
        console.log('No leads to migrate')
        return
      }

      const batchSize = 10
      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize)
        
        // Transform data to match Supabase schema
        const transformedBatch = batch.map(lead => this.transformLeadData(lead))
        
        const { error } = await supabaseAdmin!
          .from('leads')
          .upsert(transformedBatch, { onConflict: 'id' })

        if (error) {
          console.error(`Error migrating leads batch ${i}-${i + batch.length}:`, error)
          throw error
        }

        console.log(`Migrated leads batch ${i + 1}-${Math.min(i + batchSize, leads.length)}`)
      }

      console.log('Leads migration completed successfully')
    } catch (error) {
      console.error('Leads migration failed:', error)
      throw error
    }
  }

  // Transform camelCase bookings data to snake_case for Supabase
  private transformBookingData(booking: any) {
    return {
      id: booking.id,
      booking_id: booking.bookingId,
      property_id: booking.propertyId,
      property_name: booking.propertyName,
      booking_type: booking.bookingType,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      preferred_date: booking.preferredDate,
      preferred_time: booking.preferredTime,
      message: booking.message,
      status: booking.status,
      admin_notes: booking.adminNotes,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt
    }
  }

  async migrateBookings() {
    console.log('Starting bookings migration...')
    
    try {
      const bookings = await this.dbStorage.getAllBookings()
      console.log(`Found ${bookings.length} bookings to migrate`)

      if (bookings.length === 0) {
        console.log('No bookings to migrate')
        return
      }

      const batchSize = 10
      for (let i = 0; i < bookings.length; i += batchSize) {
        const batch = bookings.slice(i, i + batchSize)
        
        // Transform data to match Supabase schema
        const transformedBatch = batch.map(booking => this.transformBookingData(booking))
        
        const { error } = await supabaseAdmin!
          .from('bookings')
          .upsert(transformedBatch, { onConflict: 'id' })

        if (error) {
          console.error(`Error migrating bookings batch ${i}-${i + batch.length}:`, error)
          throw error
        }

        console.log(`Migrated bookings batch ${i + 1}-${Math.min(i + batchSize, bookings.length)}`)
      }

      console.log('Bookings migration completed successfully')
    } catch (error) {
      console.error('Bookings migration failed:', error)
      throw error
    }
  }

  async migrateAppSettings() {
    console.log('Starting app settings migration...')
    
    try {
      const settings = await this.dbStorage.getAppSettings()
      if (!settings) {
        console.log('No app settings to migrate')
        return
      }

      const { error } = await supabaseAdmin!
        .from('app_settings')
        .upsert(settings, { onConflict: 'id' })

      if (error) {
        console.error('Error migrating app settings:', error)
        throw error
      }

      console.log('App settings migration completed successfully')
    } catch (error) {
      console.error('App settings migration failed:', error)
      throw error
    }
  }

  // Transform camelCase team member data to snake_case for Supabase
  private transformTeamMemberData(member: any) {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      joining_date: member.joiningDate,
      experience_years: member.experienceYears,
      specializations: member.specializations,
      performance_score: member.performanceScore,
      active: member.active,
      profile_image: member.profileImage,
      bio: member.bio,
      achievements: member.achievements,
      created_at: member.createdAt,
      updated_at: member.updatedAt
    }
  }

  async migrateTeamMembers() {
    console.log('Starting team members migration...')
    
    try {
      const teamMembers = await this.dbStorage.getAllTeamMembers()
      console.log(`Found ${teamMembers.length} team members to migrate`)

      if (teamMembers.length === 0) {
        console.log('No team members to migrate')
        return
      }

      const batchSize = 10
      for (let i = 0; i < teamMembers.length; i += batchSize) {
        const batch = teamMembers.slice(i, i + batchSize)
        
        // Transform data to match Supabase schema
        const transformedBatch = batch.map(member => this.transformTeamMemberData(member))
        
        const { error } = await supabaseAdmin!
          .from('team_members')
          .upsert(transformedBatch, { onConflict: 'id' })

        if (error) {
          console.error(`Error migrating team members batch ${i}-${i + batch.length}:`, error)
          throw error
        }

        console.log(`Migrated team members batch ${i + 1}-${Math.min(i + batchSize, teamMembers.length)}`)
      }

      console.log('Team members migration completed successfully')
    } catch (error) {
      console.error('Team members migration failed:', error)
      throw error
    }
  }

  async migrateAll() {
    console.log('Starting complete migration to Supabase...')
    
    const isReady = await this.isSupabaseReady()
    if (!isReady) {
      throw new Error('Supabase is not ready for migration. Please check your configuration.')
    }

    try {
      await this.migrateProperties()
      await this.migrateLeads()
      await this.migrateBookings()
      await this.migrateAppSettings()
      await this.migrateTeamMembers()
      
      console.log('🎉 Complete migration to Supabase completed successfully!')
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  async getDataSummary() {
    const isReady = await this.isSupabaseReady()
    
    if (!isReady) {
      console.log('Supabase not configured - using existing database only')
      return {
        supabaseReady: false,
        existingData: {
          properties: (await this.dbStorage.getAllProperties()).length,
          leads: (await this.dbStorage.getAllLeads()).length,
          bookings: (await this.dbStorage.getAllBookings()).length,
          teamMembers: (await this.dbStorage.getAllTeamMembers()).length
        }
      }
    }

    try {
      // Get counts from both databases
      const [
        existingProperties,
        existingLeads,
        existingBookings,
        existingTeamMembers
      ] = await Promise.all([
        this.dbStorage.getAllProperties(),
        this.dbStorage.getAllLeads(),
        this.dbStorage.getAllBookings(),
        this.dbStorage.getAllTeamMembers()
      ])

      const [
        { count: supabaseProperties },
        { count: supabaseLeads },
        { count: supabaseBookings },
        { count: supabaseTeamMembers }
      ] = await Promise.all([
        supabaseAdmin!.from('properties').select('*', { count: 'exact', head: true }),
        supabaseAdmin!.from('leads').select('*', { count: 'exact', head: true }),
        supabaseAdmin!.from('bookings').select('*', { count: 'exact', head: true }),
        supabaseAdmin!.from('team_members').select('*', { count: 'exact', head: true })
      ])

      return {
        supabaseReady: true,
        existingData: {
          properties: existingProperties.length,
          leads: existingLeads.length,
          bookings: existingBookings.length,
          teamMembers: existingTeamMembers.length
        },
        supabaseData: {
          properties: supabaseProperties || 0,
          leads: supabaseLeads || 0,
          bookings: supabaseBookings || 0,
          teamMembers: supabaseTeamMembers || 0
        }
      }
    } catch (error) {
      console.error('Error getting data summary:', error)
      throw error
    }
  }
}

export const supabaseMigration = new SupabaseMigration()