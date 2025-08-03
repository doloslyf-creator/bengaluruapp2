import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types - will be generated from Supabase
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