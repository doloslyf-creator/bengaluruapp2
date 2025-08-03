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
        
        const { data, error } = await supabaseAdmin!
          .from('properties')
          .upsert(batch, { onConflict: 'id' })

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
        
        const { error } = await supabaseAdmin!
          .from('leads')
          .upsert(batch, { onConflict: 'id' })

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
        
        const { error } = await supabaseAdmin!
          .from('bookings')
          .upsert(batch, { onConflict: 'id' })

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
        
        const { error } = await supabaseAdmin!
          .from('team_members')
          .upsert(batch, { onConflict: 'id' })

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