
-- Add missing major_delays column to developers table
ALTER TABLE developers ADD COLUMN IF NOT EXISTS major_delays jsonb DEFAULT '[]'::jsonb;
