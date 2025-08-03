-- OwnItRight Supabase Database Schema
-- This file contains the complete database schema for migration to Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table (updated to match current schema)
CREATE TABLE properties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'villa', 'plot')),
  developer TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pre-launch', 'active', 'under-construction', 'completed', 'sold-out')),
  
  -- Location details
  area TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('north', 'south', 'east', 'west', 'central')),
  address TEXT NOT NULL,
  
  -- Property specifications
  possession_date TEXT, -- YYYY-MM format
  
  -- Legal and regulatory
  rera_number TEXT,
  rera_approved BOOLEAN DEFAULT false,
  
  -- Infrastructure and zoning
  infrastructure_verdict TEXT,
  zoning_info TEXT,
  
  -- Tags and flags
  tags JSONB NOT NULL DEFAULT '[]',
  
  -- Media
  images JSONB NOT NULL DEFAULT '[]',
  videos JSONB NOT NULL DEFAULT '[]',
  youtube_video_url TEXT,
  
  -- Property Scoring (linked to propertyScores table)
  property_score_id TEXT,
  
  -- Widget Data - Legacy scoring (kept for backward compatibility)
  location_score INTEGER DEFAULT 0, -- 1-5
  amenities_score INTEGER DEFAULT 0, -- 1-5
  value_score INTEGER DEFAULT 0, -- 1-5
  overall_score DECIMAL(3,1) DEFAULT 0.0, -- calculated average
  
  -- Widget Data - Price Comparison
  area_avg_price_min INTEGER, -- in lakhs
  area_avg_price_max INTEGER, -- in lakhs
  city_avg_price_min INTEGER, -- in lakhs
  city_avg_price_max INTEGER, -- in lakhs
  price_comparison TEXT, -- e.g., "12% below area average"

  -- Legal Due Diligence Metadata
  title_clearance_status TEXT, -- Clear, Pending, Disputed
  ownership_type TEXT, -- Freehold, Leasehold, Joint Development
  legal_opinion_provided_by TEXT, -- Lawyer/firm name
  title_flow_summary TEXT, -- Summary of title chain
  encumbrance_status TEXT, -- No encumbrance as per EC
  ec_extract_link TEXT, -- URL to EC PDF
  mutation_status TEXT, -- Mutation completed status
  conversion_certificate BOOLEAN DEFAULT false, -- DC conversion done
  rera_registered BOOLEAN DEFAULT false, -- RERA compliance
  rera_id TEXT, -- RERA project ID
  rera_link TEXT, -- Direct link to RERA record
  litigation_status TEXT, -- Any known litigation
  approving_authorities JSONB DEFAULT '[]', -- Authority approvals
  layout_sanction_copy_link TEXT, -- PDF/Image of approval
  legal_comments TEXT, -- Lawyer's custom comment
  legal_verdict_badge TEXT, -- Tagline or summary badge

  -- CIVIL+MEP Report System
  has_civil_mep_report BOOLEAN DEFAULT false, -- Does this property have a report
  civil_mep_report_price DECIMAL(10,2) DEFAULT 2999.00, -- Price in INR
  civil_mep_report_status TEXT DEFAULT 'draft' CHECK (civil_mep_report_status IN ('draft', 'completed', 'reviewing')),
  
  -- Property Valuation Report System
  has_valuation_report BOOLEAN DEFAULT false,
  valuation_report_price DECIMAL(10,2) DEFAULT 15000.00,
  valuation_report_status TEXT DEFAULT 'draft' CHECK (valuation_report_status IN ('draft', 'in-progress', 'completed', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property configurations table (updated)
CREATE TABLE property_configurations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  configuration_type TEXT NOT NULL,
  area DECIMAL(10,2),
  price DECIMAL(15,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property scores table (comprehensive scoring system)
CREATE TABLE property_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL,
  
  -- Scoring metadata
  scoring_version TEXT DEFAULT '1.0',
  scored_by TEXT, -- Admin user who created the score
  scoring_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Location Score (25 points total)
  transport_connectivity INTEGER DEFAULT 0, -- 0-8 points
  transport_notes TEXT,
  infrastructure_development INTEGER DEFAULT 0, -- 0-7 points
  infrastructure_notes TEXT,
  social_infrastructure INTEGER DEFAULT 0, -- 0-5 points
  social_notes TEXT,
  employment_hubs INTEGER DEFAULT 0, -- 0-5 points
  employment_notes TEXT,
  
  -- Amenities & Features Score (20 points total)
  basic_amenities INTEGER DEFAULT 0, -- 0-8 points
  basic_amenities_notes TEXT,
  lifestyle_amenities INTEGER DEFAULT 0, -- 0-7 points
  lifestyle_amenities_notes TEXT,
  modern_features INTEGER DEFAULT 0, -- 0-5 points
  modern_features_notes TEXT,
  
  -- Legal & Compliance Score (20 points total)
  rera_compliance INTEGER DEFAULT 0, -- 0-8 points
  rera_compliance_notes TEXT,
  title_clarity INTEGER DEFAULT 0, -- 0-7 points
  title_clarity_notes TEXT,
  approvals INTEGER DEFAULT 0, -- 0-5 points
  approvals_notes TEXT,
  
  -- Value Proposition Score (15 points total)
  price_competitiveness INTEGER DEFAULT 0, -- 0-8 points
  price_competitiveness_notes TEXT,
  appreciation_potential INTEGER DEFAULT 0, -- 0-4 points
  appreciation_potential_notes TEXT,
  rental_yield INTEGER DEFAULT 0, -- 0-3 points
  rental_yield_notes TEXT,
  
  -- Developer Credibility Score (10 points total)
  track_record INTEGER DEFAULT 0, -- 0-5 points
  track_record_notes TEXT,
  financial_stability INTEGER DEFAULT 0, -- 0-3 points
  financial_stability_notes TEXT,
  customer_satisfaction INTEGER DEFAULT 0, -- 0-2 points
  customer_satisfaction_notes TEXT,
  
  -- Construction Quality Score (10 points total)
  structural_quality INTEGER DEFAULT 0, -- 0-5 points
  structural_quality_notes TEXT,
  finishing_standards INTEGER DEFAULT 0, -- 0-3 points
  finishing_standards_notes TEXT,
  maintenance_standards INTEGER DEFAULT 0, -- 0-2 points
  maintenance_standards_notes TEXT,
  
  -- Calculated scores
  location_score_total INTEGER DEFAULT 0, -- max 25
  amenities_score_total INTEGER DEFAULT 0, -- max 20
  legal_score_total INTEGER DEFAULT 0, -- max 20
  value_score_total INTEGER DEFAULT 0, -- max 15
  developer_score_total INTEGER DEFAULT 0, -- max 10
  construction_score_total INTEGER DEFAULT 0, -- max 10
  overall_score_total INTEGER DEFAULT 0, -- max 100
  overall_grade TEXT CHECK (overall_grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D')),
  
  -- Additional insights
  key_strengths JSONB DEFAULT '[]',
  areas_of_concern JSONB DEFAULT '[]',
  recommendation_summary TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RERA Data Integration table
CREATE TABLE rera_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  rera_id TEXT NOT NULL UNIQUE,
  property_id TEXT REFERENCES properties(id),
  
  -- Basic Project Information
  project_name TEXT NOT NULL,
  promoter_name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT DEFAULT 'Karnataka',
  
  -- Project Details
  project_type TEXT DEFAULT 'residential' CHECK (project_type IN ('residential', 'commercial', 'mixed', 'plotted-development', 'other')),
  total_units INTEGER,
  project_area TEXT,
  built_up_area TEXT,
  
  -- Legal and Compliance Status
  registration_date TEXT,
  approval_date TEXT,
  completion_date TEXT,
  registration_valid_till TEXT,
  project_status TEXT DEFAULT 'under-construction' CHECK (project_status IN ('under-construction', 'completed', 'delayed', 'cancelled', 'approved')),
  compliance_status TEXT DEFAULT 'active' CHECK (compliance_status IN ('active', 'non-compliant', 'suspended', 'cancelled')),
  
  -- Financial Information
  project_cost TEXT,
  amount_collected TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (updated)
CREATE TABLE leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('site-visit', 'consultation', 'property-inquiry')),
  lead_type TEXT CHECK (lead_type IN ('hot', 'warm', 'cold')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  budget_min DECIMAL(15,2),
  budget_max DECIMAL(15,2),
  preferred_locations JSONB DEFAULT '[]',
  property_type TEXT,
  area_of_interest TEXT,
  specific_requirements TEXT,
  qualification_status TEXT DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  notes TEXT,
  assigned_to TEXT,
  follow_up_date TEXT,
  last_contact_date TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table (updated)
CREATE TABLE bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  property_id TEXT REFERENCES properties(id),
  property_name TEXT,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('site-visit', 'consultation')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members table
CREATE TABLE team_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT,
  joining_date TEXT,
  experience_years INTEGER DEFAULT 0,
  specializations JSONB DEFAULT '[]',
  performance_score INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  profile_image TEXT,
  bio TEXT,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Civil MEP Reports table (comprehensive)
CREATE TABLE civil_mep_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL REFERENCES properties(id),
  report_type TEXT NOT NULL DEFAULT 'combined' CHECK (report_type IN ('civil', 'mep', 'combined')),
  report_version TEXT DEFAULT '1.0',
  generated_by TEXT,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Report content as JSONB for flexibility
  structural_analysis JSONB DEFAULT '{}',
  material_breakdown JSONB DEFAULT '{}',
  cost_breakdown JSONB DEFAULT '{}',
  quality_assessment JSONB DEFAULT '{}',
  mep_systems JSONB DEFAULT '{}',
  compliance_checklist JSONB DEFAULT '{}',
  snag_report JSONB DEFAULT '{}',
  
  -- Scoring
  overall_score TEXT DEFAULT '0',
  structural_score TEXT DEFAULT '0',
  mep_score TEXT DEFAULT '0',
  
  -- Report metadata
  engineer_name TEXT,
  engineer_license TEXT,
  inspection_date TEXT,
  executive_summary TEXT,
  recommendations TEXT,
  supporting_documents JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valuation Reports table
CREATE TABLE valuation_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL REFERENCES properties(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  report_title TEXT,
  valuation_amount DECIMAL(15,2),
  market_value DECIMAL(15,2),
  forced_sale_value DECIMAL(15,2),
  rental_value DECIMAL(10,2),
  valuation_date TEXT,
  validity_period TEXT,
  valuer_name TEXT,
  valuer_registration TEXT,
  methodology TEXT,
  assumptions TEXT,
  limitations TEXT,
  market_analysis JSONB DEFAULT '{}',
  comparable_properties JSONB DEFAULT '[]',
  risk_factors JSONB DEFAULT '[]',
  recommendations TEXT,
  supporting_documents JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Templates table  
CREATE TABLE notification_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,
  variables JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences table
CREATE TABLE notification_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  in_app_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead activities table
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead notes table
CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Civil MEP reports table
CREATE TABLE civil_mep_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  report_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  amount DECIMAL(10,2),
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property valuation reports table
CREATE TABLE property_valuation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  valuation_amount DECIMAL(15,2),
  market_analysis JSONB,
  risk_assessment JSONB,
  recommendations TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report payments table
CREATE TABLE report_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID,
  report_type TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer notes table
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email TEXT NOT NULL,
  note TEXT NOT NULL,
  category TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App settings table
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  google_analytics_id TEXT,
  google_maps_api_key TEXT,
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  twilio_phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  permissions TEXT[],
  performance_score INTEGER DEFAULT 0,
  hire_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RERA data table
CREATE TABLE rera_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rera_number TEXT UNIQUE NOT NULL,
  project_name TEXT NOT NULL,
  promoter_name TEXT,
  project_type TEXT,
  project_status TEXT,
  registration_date DATE,
  completion_date DATE,
  project_address TEXT,
  project_location TEXT,
  total_area DECIMAL(15,2),
  sanctioned_area DECIMAL(15,2),
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft',
  author TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal trackers table
CREATE TABLE legal_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT,
  status TEXT DEFAULT 'pending',
  completed_date DATE,
  notes TEXT,
  documents TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_zone ON properties(zone);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(starting_price);

CREATE INDEX idx_property_configurations_property_id ON property_configurations(property_id);
CREATE INDEX idx_property_scores_property_id ON property_scores(property_id);

CREATE INDEX idx_leads_qualification_status ON leads(qualification_status);
CREATE INDEX idx_leads_lead_source ON leads(lead_source);
CREATE INDEX idx_leads_created_at ON leads(created_at);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_notes_lead_id ON lead_notes(lead_id);

CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_lead_id ON bookings(lead_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_civil_mep_reports_property_id ON civil_mep_reports(property_id);
CREATE INDEX idx_civil_mep_reports_status ON civil_mep_reports(status);

CREATE INDEX idx_property_valuation_reports_property_id ON property_valuation_reports(property_id);
CREATE INDEX idx_property_valuation_reports_status ON property_valuation_reports(status);

CREATE INDEX idx_report_payments_report_type ON report_payments(report_type);
CREATE INDEX idx_report_payments_payment_status ON report_payments(payment_status);

CREATE INDEX idx_customer_notes_customer_email ON customer_notes(customer_email);

CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

CREATE INDEX idx_rera_data_rera_number ON rera_data(rera_number);
CREATE INDEX idx_rera_data_project_name ON rera_data(project_name);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

CREATE INDEX idx_legal_trackers_property_id ON legal_trackers(property_id);
CREATE INDEX idx_legal_trackers_status ON legal_trackers(status);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE civil_mep_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_valuation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rera_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_trackers ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated access
-- For now, allow all authenticated users to access all data
-- In production, you would create more granular policies

CREATE POLICY "Allow all operations for authenticated users" ON properties
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON property_configurations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON property_scores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON lead_activities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON lead_notes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON bookings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON civil_mep_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON property_valuation_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON report_payments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON customer_notes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON app_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON team_members
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON rera_data
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON legal_trackers
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_configurations_updated_at BEFORE UPDATE ON property_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_scores_updated_at BEFORE UPDATE ON property_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_civil_mep_reports_updated_at BEFORE UPDATE ON civil_mep_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_valuation_reports_updated_at BEFORE UPDATE ON property_valuation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_payments_updated_at BEFORE UPDATE ON report_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rera_data_updated_at BEFORE UPDATE ON rera_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_trackers_updated_at BEFORE UPDATE ON legal_trackers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();