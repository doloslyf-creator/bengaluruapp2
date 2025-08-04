import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Priority: Use Supabase database URL if available, otherwise fall back to existing DATABASE_URL
function getDatabaseUrl() {
  // For now, we'll keep using DATABASE_URL but you should replace it with your Supabase connection string
  // To get your Supabase database connection string:
  // 1. Go to your Supabase project dashboard
  // 2. Click "Settings" > "Database" 
  // 3. Copy the "Connection string" under "Connection parameters"
  // 4. Replace [YOUR-PASSWORD] with your database password
  
  if (process.env.DATABASE_URL) {
    console.log('Using existing DATABASE_URL (will transition to Supabase)');
    return process.env.DATABASE_URL;
  }
  
  throw new Error(
    "DATABASE_URL must be set. Please provide your Supabase database connection string.",
  );
}

const dbUrl = getDatabaseUrl();
export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle({ client: pool, schema });