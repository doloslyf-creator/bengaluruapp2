-- OwnItRight Platform - Complete Supabase Schema
-- This schema creates all necessary tables for the property management platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SESSION MANAGEMENT (Required for authentication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ZONES & LOCATION MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS zones (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL,
  description TEXT,
  location_type VARCHAR,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  appreciation_rate DECIMAL(5,2),
  rental_yield DECIMAL(5,2),
  infrastructure_score DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PROPERTIES MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL,
  description TEXT,
  area VARCHAR,
  location VARCHAR,
  price DECIMAL(15,2),
  bhk_type VARCHAR,
  size_sqft DECIMAL(10,2),
  price_per_sqft DECIMAL(10,2),
  project_status VARCHAR DEFAULT 'ongoing',
  builder_name VARCHAR,
  rera_number VARCHAR,
  possession_date DATE,
  amenities TEXT[],
  images TEXT[],
  videos TEXT[],
  
  -- Location & Zone Information
  zone_id VARCHAR REFERENCES zones(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Additional Property Details
  property_type VARCHAR DEFAULT 'apartment',
  total_floors INTEGER,
  parking_spaces INTEGER,
  facing VARCHAR,
  
  -- Pricing Details
  maintenance_cost DECIMAL(10,2),
  other_charges DECIMAL(10,2),
  
  -- Legal & Compliance
  legal_clearance VARCHAR DEFAULT 'pending',
  loan_approval VARCHAR DEFAULT 'available',
  
  -- Property Scores
  overall_score DECIMAL(3,1),
  location_score DECIMAL(3,1),
  amenities_score DECIMAL(3,1),
  value_score DECIMAL(3,1),
  legal_score DECIMAL(3,1),
  
  -- Metadata
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CUSTOMERS & LEAD MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  budget_min DECIMAL(15,2),
  budget_max DECIMAL(15,2),
  preferred_locations TEXT[],
  preferred_bhk VARCHAR,
  requirements TEXT,
  source VARCHAR DEFAULT 'website',
  status VARCHAR DEFAULT 'active',
  lead_score INTEGER DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PROPERTY VALUATION REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_valuation_reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id VARCHAR REFERENCES properties(id),
  customer_id VARCHAR,
  report_title VARCHAR NOT NULL,
  report_status VARCHAR DEFAULT 'draft',
  created_by VARCHAR NOT NULL,
  assigned_to VARCHAR,
  
  -- 1. Property Profile
  project_name VARCHAR,
  property_address TEXT,
  unit_type VARCHAR,
  configuration VARCHAR,
  inspection_date DATE,
  
  -- 2. Executive Summary
  executive_summary TEXT,
  key_highlights TEXT[],
  critical_concerns TEXT[],
  
  -- 3. Market Valuation & Pricing
  estimated_market_value DECIMAL(15,2),
  rate_per_sqft_sba_uds VARCHAR,
  construction_value VARCHAR,
  guidance_value_zone_rate VARCHAR,
  market_premium_discount VARCHAR,
  
  -- 4. Comparable Sales Analysis
  comparable_sales JSONB,
  benchmarking_sources VARCHAR,
  volatility_index VARCHAR,
  average_days_on_market INTEGER,
  
  -- 5. Location & Infrastructure Assessment
  planning_authority VARCHAR,
  zonal_classification VARCHAR,
  land_use_status VARCHAR,
  connectivity TEXT,
  water_supply VARCHAR,
  drainage VARCHAR,
  social_infrastructure TEXT,
  future_infrastructure JSONB,
  
  -- 6. Legal & Compliance Snapshot
  rera_registration VARCHAR,
  khata_verification VARCHAR,
  title_clearance VARCHAR,
  dc_conversion VARCHAR,
  plan_approval VARCHAR,
  loan_approval JSONB,
  title_clarity_notes TEXT,
  
  -- 7. Rental & Yield Potential
  expected_monthly_rent VARCHAR,
  gross_rental_yield VARCHAR,
  tenant_demand VARCHAR,
  exit_liquidity VARCHAR,
  yield_score VARCHAR,
  
  -- 8. Cost Sheet Breakdown
  base_unit_cost VARCHAR,
  amenities_charges VARCHAR,
  floor_rise_charges VARCHAR,
  gst_amount VARCHAR,
  stamp_duty_registration VARCHAR,
  total_all_in_price VARCHAR,
  khata_transfer_costs VARCHAR,
  
  -- 9. Pros & Cons Summary
  pros JSONB,
  cons JSONB,
  
  -- 10. Final Recommendation
  buyer_type_fit VARCHAR,
  negotiation_advice VARCHAR,
  risk_summary VARCHAR,
  appreciation_outlook_5yr VARCHAR,
  exit_plan VARCHAR,
  overall_score VARCHAR,
  overall_verdict TEXT,
  final_recommendation TEXT,
  
  -- Additional Fields
  appendices JSONB,
  custom_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Valuation Report Customers (Many-to-Many)
CREATE TABLE IF NOT EXISTS property_valuation_report_customers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  report_id VARCHAR REFERENCES property_valuation_reports(id) ON DELETE CASCADE,
  customer_id VARCHAR NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by VARCHAR NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_report_customer ON property_valuation_report_customers (report_id, customer_id);

-- Property Valuation Report Configurations
CREATE TABLE IF NOT EXISTS property_valuation_report_configurations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  report_id VARCHAR REFERENCES property_valuation_reports(id) ON DELETE CASCADE,
  
  -- Configuration Details
  configuration_type VARCHAR NOT NULL,
  configuration_name VARCHAR,
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Area Details
  built_up_area DECIMAL(8,2),
  super_built_up_area DECIMAL(8,2),
  carpet_area DECIMAL(8,2),
  plot_area DECIMAL(8,2),
  balcony_area DECIMAL(8,2),
  
  -- UDS and Land Details
  uds_share DECIMAL(8,2),
  uds_percentage DECIMAL(5,2),
  land_share_value DECIMAL(12,2),
  
  -- Pricing Details
  basic_price DECIMAL(12,2),
  rate_per_sqft DECIMAL(10,2),
  rate_per_sqft_bua DECIMAL(10,2),
  rate_per_sqft_sba DECIMAL(10,2),
  total_price DECIMAL(12,2),
  
  -- Additional Charges
  amenities_charges DECIMAL(10,2),
  maintenance_charges DECIMAL(10,2),
  parking_charges DECIMAL(10,2),
  floor_rise_charges DECIMAL(10,2),
  
  -- Configuration Specific Details
  number_of_bedrooms INTEGER,
  number_of_bathrooms INTEGER,
  number_of_balconies INTEGER,
  facing VARCHAR,
  floor_number VARCHAR,
  
  -- Availability
  total_units INTEGER,
  available_units INTEGER,
  sold_units INTEGER,
  
  -- Configuration Notes
  configuration_notes TEXT,
  amenities_included JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_report_config ON property_valuation_report_configurations (report_id);

-- ============================================================================
-- APPLICATION SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR PRIMARY KEY DEFAULT '1',
  business_name VARCHAR DEFAULT 'OwnItRight',
  contact_email VARCHAR,
  contact_phone VARCHAR,
  address TEXT,
  website_url VARCHAR,
  logo_url VARCHAR,
  
  -- API Keys (encrypted)
  razorpay_key_id VARCHAR,
  razorpay_key_secret VARCHAR,
  google_maps_api_key VARCHAR,
  google_analytics_id VARCHAR,
  twilio_account_sid VARCHAR,
  twilio_auth_token VARCHAR,
  twilio_phone_number VARCHAR,
  sendgrid_api_key VARCHAR,
  
  -- UI Theme
  theme_primary_color VARCHAR DEFAULT '#2563eb',
  theme_secondary_color VARCHAR DEFAULT '#1e40af',
  
  -- Regional Settings
  currency VARCHAR DEFAULT 'INR',
  timezone VARCHAR DEFAULT 'Asia/Kolkata',
  date_format VARCHAR DEFAULT 'DD/MM/YYYY',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  recipient_id VARCHAR,
  recipient_type VARCHAR DEFAULT 'customer',
  status VARCHAR DEFAULT 'pending',
  priority VARCHAR DEFAULT 'normal',
  channel VARCHAR DEFAULT 'email',
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- BOOKINGS & ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id VARCHAR,
  property_id VARCHAR REFERENCES properties(id),
  booking_type VARCHAR NOT NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR,
  status VARCHAR DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id VARCHAR,
  service_type VARCHAR NOT NULL,
  service_name VARCHAR,
  amount DECIMAL(10,2),
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR,
  payment_status VARCHAR DEFAULT 'pending',
  razorpay_order_id VARCHAR,
  razorpay_payment_id VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CIVIL & MEP REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS civil_mep_reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id VARCHAR,
  property_id VARCHAR REFERENCES properties(id),
  report_type VARCHAR NOT NULL,
  report_title VARCHAR,
  inspection_date DATE,
  inspector_name VARCHAR,
  overall_rating VARCHAR,
  key_findings TEXT[],
  recommendations TEXT[],
  images TEXT[],
  pdf_report_url VARCHAR,
  status VARCHAR DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- RERA MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS rera_projects (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rera_number VARCHAR UNIQUE NOT NULL,
  project_name VARCHAR NOT NULL,
  developer_name VARCHAR,
  location VARCHAR,
  project_type VARCHAR,
  project_status VARCHAR,
  approval_date DATE,
  completion_date DATE,
  total_units INTEGER,
  available_units INTEGER,
  project_area DECIMAL(10,2),
  verification_status VARCHAR DEFAULT 'pending',
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_zone ON properties(zone_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(project_status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_valuation_reports_property ON property_valuation_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_valuation_reports_status ON property_valuation_reports(report_status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_valuation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Admin policies (you'll need to adjust based on your auth setup)
CREATE POLICY "Admin full access" ON customers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.email LIKE '%@ownitright.com'
  )
);

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default app settings (will be overridden by setup process)
INSERT INTO app_settings (id) VALUES ('1') ON CONFLICT (id) DO NOTHING;

-- Create initial admin user placeholder
INSERT INTO users (id, email, first_name, last_name) 
VALUES ('admin', 'admin@ownitright.com', 'Admin', 'User') 
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'OwnitWise database schema created successfully!' as setup_status;