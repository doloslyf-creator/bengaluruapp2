import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client to prevent crashes when Supabase is not configured
const createDummyClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null })
  })
})

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createDummyClient() as any
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
}

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