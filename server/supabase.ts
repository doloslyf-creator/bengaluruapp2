import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.')
}

// Server-side Supabase client with service role key for admin operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null

// Database types - matches the client-side types
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          location: string
          price: number
          // Add other property fields as needed
        }
        Insert: {
          id?: string
          name: string
          location: string
          price: number
          // Add other property fields as needed
        }
        Update: {
          id?: string
          name?: string
          location?: string
          price?: number
          // Add other property fields as needed
        }
      }
      // Add other table types as needed
    }
  }
}