import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Priority: Use Supabase database URL as primary, fallback to existing DATABASE_URL
function getDatabaseUrl() {
  // Check for Supabase connection string first
  if (process.env.SUPABASE_DATABASE_URL) {
    console.log('Using Supabase as primary database');
    return process.env.SUPABASE_DATABASE_URL;
  }
  
  // Fallback to existing DATABASE_URL for backward compatibility
  if (process.env.DATABASE_URL) {
    console.log('Using existing DATABASE_URL (consider migrating to Supabase)');
    return process.env.DATABASE_URL;
  }
  
  throw new Error(
    "DATABASE_URL or SUPABASE_DATABASE_URL must be set. Please provide a database connection string.",
  );
}

const dbUrl = getDatabaseUrl();
export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle({ client: pool, schema });