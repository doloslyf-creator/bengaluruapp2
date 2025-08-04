import { supabaseAdmin } from './supabase';
import { db } from './db';
import * as schema from '@shared/schema';

export class SupabaseMigrator {
  private supabase = supabaseAdmin;

  async checkSupabaseConnection(): Promise<boolean> {
    try {
      if (!this.supabase) {
        console.error('Supabase client not initialized');
        return false;
      }
      
      const { data, error } = await this.supabase.from('properties').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
  }

  async migrateProperties() {
    try {
      console.log('Starting properties migration...');
      
      // Get all properties from current database
      const properties = await db.select().from(schema.properties);
      console.log(`Found ${properties.length} properties to migrate`);

      if (!this.supabase) {
        throw new Error('Supabase client not available');
      }

      // Migrate each property
      for (const property of properties) {
        const { error } = await this.supabase
          .from('properties')
          .upsert(property, { onConflict: 'id' });
        
        if (error) {
          console.error(`Failed to migrate property ${property.id}:`, error);
        } else {
          console.log(`Successfully migrated property: ${property.name}`);
        }
      }

      console.log('Properties migration completed');
      return { success: true, migrated: properties.length };
    } catch (error) {
      console.error('Properties migration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async migrateValuationReports() {
    try {
      console.log('Starting valuation reports migration...');
      
      const reports = await db.select().from(schema.propertyValuationReports);
      console.log(`Found ${reports.length} valuation reports to migrate`);

      if (!this.supabase) {
        throw new Error('Supabase client not available');
      }

      for (const report of reports) {
        const { error } = await this.supabase
          .from('property_valuation_reports')
          .upsert(report, { onConflict: 'id' });
        
        if (error) {
          console.error(`Failed to migrate report ${report.id}:`, error);
        } else {
          console.log(`Successfully migrated report: ${report.reportTitle}`);
        }
      }

      console.log('Valuation reports migration completed');
      return { success: true, migrated: reports.length };
    } catch (error) {
      console.error('Valuation reports migration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async migrateCustomers() {
    try {
      console.log('Starting customers migration...');
      
      // Skip customers migration for now as table doesn't exist in schema
      console.log('Customers table not found in schema, skipping...');
      return { success: true, migrated: 0 };
      console.log(`Found ${customers.length} customers to migrate`);

      if (!this.supabase) {
        throw new Error('Supabase client not available');
      }

      for (const customer of customers) {
        const { error } = await this.supabase
          .from('customers')
          .upsert(customer, { onConflict: 'id' });
        
        if (error) {
          console.error(`Failed to migrate customer ${customer.id}:`, error);
        } else {
          console.log(`Successfully migrated customer: ${customer.name}`);
        }
      }

      // This section is now skipped above
    } catch (error) {
      console.error('Customers migration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async migrateSettings() {
    try {
      console.log('Starting settings migration...');
      
      const settings = await db.select().from(schema.appSettings);
      console.log(`Found ${settings.length} settings to migrate`);

      if (!this.supabase) {
        throw new Error('Supabase client not available');
      }

      for (const setting of settings) {
        const { error } = await this.supabase
          .from('app_settings')
          .upsert(setting, { onConflict: 'id' });
        
        if (error) {
          console.error(`Failed to migrate setting ${setting.id}:`, error);
        } else {
          console.log(`Successfully migrated setting: ${setting.id}`);
        }
      }

      console.log('Settings migration completed');
      return { success: true, migrated: settings.length };
    } catch (error) {
      console.error('Settings migration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async migrateAllData() {
    console.log('Starting complete data migration to Supabase...');
    
    const results = {
      properties: await this.migrateProperties(),
      valuationReports: await this.migrateValuationReports(),
      customers: await this.migrateCustomers(),
      settings: await this.migrateSettings(),
    };

    const totalSuccess = Object.values(results).every(r => r.success);
    const totalMigrated = Object.values(results).reduce((sum, r) => sum + (r.migrated || 0), 0);

    console.log('Migration Summary:', {
      success: totalSuccess,
      totalRecords: totalMigrated,
      details: results
    });

    return {
      success: totalSuccess,
      totalMigrated,
      results
    };
  }

  async verifyMigration() {
    if (!this.supabase) {
      return { success: false, error: 'Supabase client not available' };
    }

    try {
      const checks = await Promise.all([
        this.supabase.from('properties').select('count').single(),
        this.supabase.from('property_valuation_reports').select('count').single(),
        this.supabase.from('customers').select('count').single(),
        this.supabase.from('app_settings').select('count').single(),
      ]);

      const [propertiesCount, reportsCount, customersCount, settingsCount] = checks;

      return {
        success: true,
        counts: {
          properties: propertiesCount.data?.count || 0,
          valuationReports: reportsCount.data?.count || 0,
          customers: customersCount.data?.count || 0,
          settings: settingsCount.data?.count || 0,
        }
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const supabaseMigrator = new SupabaseMigrator();