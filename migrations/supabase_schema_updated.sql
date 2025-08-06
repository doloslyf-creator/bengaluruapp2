
-- Updated Supabase Schema for OwnItRight Platform
-- This schema matches the current database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Zones table
CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    state VARCHAR,
    zone_id VARCHAR REFERENCES zones(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Developers table
CREATE TABLE IF NOT EXISTS developers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    description TEXT,
    established_year INTEGER,
    headquarters VARCHAR,
    website VARCHAR,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    ongoing_projects INTEGER DEFAULT 0,
    upcoming_projects INTEGER DEFAULT 0,
    experience_years INTEGER DEFAULT 0,
    certification_details JSONB DEFAULT '[]'::jsonb,
    major_delays JSONB DEFAULT '[]'::jsonb,
    logo_url VARCHAR,
    banner_image_url VARCHAR,
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties table with all columns
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    type VARCHAR,
    developer VARCHAR,
    status VARCHAR,
    area VARCHAR,
    zone VARCHAR,
    address TEXT,
    possession_date DATE,
    rera_number VARCHAR,
    rera_approved BOOLEAN DEFAULT false,
    infrastructure_verdict VARCHAR,
    zoning_info TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    youtube_video_url VARCHAR,
    property_score_id VARCHAR,
    location_score DECIMAL(5,2) DEFAULT 0,
    amenities_score DECIMAL(5,2) DEFAULT 0, -- Added missing column
    value_score DECIMAL(5,2) DEFAULT 0,
    overall_score DECIMAL(5,2) DEFAULT 0,
    area_avg_price_min DECIMAL(15,2),
    area_avg_price_max DECIMAL(15,2),
    city_avg_price_min DECIMAL(15,2),
    city_avg_price_max DECIMAL(15,2),
    price_comparison VARCHAR,
    title_clearance_status VARCHAR,
    ownership_type VARCHAR,
    legal_opinion_provided_by VARCHAR,
    title_flow_summary TEXT,
    encumbrance_status VARCHAR,
    ec_extract_link VARCHAR,
    mutation_status VARCHAR,
    conversion_certificate VARCHAR,
    rera_registered BOOLEAN DEFAULT false,
    rera_id VARCHAR,
    rera_link VARCHAR,
    litigation_status VARCHAR,
    approving_authorities JSONB DEFAULT '[]'::jsonb,
    layout_sanction_copy_link VARCHAR,
    legal_comments TEXT,
    legal_verdict_badge VARCHAR,
    has_civil_mep_report BOOLEAN DEFAULT false,
    civil_mep_report_price DECIMAL(10,2),
    civil_mep_report_status VARCHAR,
    has_valuation_report BOOLEAN DEFAULT false,
    valuation_report_price DECIMAL(10,2),
    valuation_report_status VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Property valuation reports with all columns
CREATE TABLE IF NOT EXISTS property_valuation_reports (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    property_id VARCHAR REFERENCES properties(id),
    report_title VARCHAR,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_phone VARCHAR,
    property_name VARCHAR,
    property_address TEXT,
    property_type VARCHAR,
    built_up_area DECIMAL(10,2),
    carpet_area DECIMAL(10,2),
    floor_number INTEGER,
    total_floors INTEGER,
    age_of_property INTEGER,
    current_condition VARCHAR,
    market_value DECIMAL(15,2),
    distress_sale_value DECIMAL(15,2),
    rental_value_monthly DECIMAL(10,2),
    rental_yield DECIMAL(5,2),
    price_per_sqft DECIMAL(10,2),
    area_average_price DECIMAL(10,2),
    price_comparison_verdict VARCHAR,
    location_score DECIMAL(5,2),
    infrastructure_score DECIMAL(5,2),
    connectivity_score DECIMAL(5,2),
    amenities_score DECIMAL(5,2),
    future_growth_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    investment_recommendation VARCHAR,
    key_highlights JSONB DEFAULT '[]'::jsonb,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    market_trends TEXT,
    legal_verification_status VARCHAR,
    document_verification_notes TEXT,
    physical_inspection_notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    comparable_properties JSONB DEFAULT '[]'::jsonb,
    amenities_list JSONB DEFAULT '[]'::jsonb,
    amenities_charges DECIMAL(10,2), -- Added missing column
    maintenance_charges DECIMAL(10,2),
    parking_charges DECIMAL(10,2),
    club_membership_charges DECIMAL(10,2),
    total_additional_charges DECIMAL(10,2),
    report_status VARCHAR DEFAULT 'pending',
    report_date DATE DEFAULT CURRENT_DATE,
    valuer_name VARCHAR,
    valuer_credentials VARCHAR,
    report_pdf_url VARCHAR,
    price DECIMAL(10,2) DEFAULT 999,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- App settings with all columns
CREATE TABLE IF NOT EXISTS app_settings (
    id VARCHAR PRIMARY KEY DEFAULT '1',
    business_name VARCHAR DEFAULT 'OwnItRight – Curated Property Advisors', -- Added missing column
    contact_email VARCHAR DEFAULT 'contact@ownitright.com',
    contact_phone VARCHAR,
    razorpay_key_id VARCHAR,
    razorpay_key_secret VARCHAR,
    google_analytics_id VARCHAR,
    google_maps_api_key VARCHAR,
    twilio_account_sid VARCHAR,
    twilio_auth_token VARCHAR,
    twilio_phone_number VARCHAR,
    sendgrid_api_key VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source VARCHAR,
    lead_type VARCHAR,
    priority VARCHAR DEFAULT 'medium',
    customer_name VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    preferred_locations JSONB DEFAULT '[]'::jsonb,
    property_type VARCHAR,
    area_of_interest VARCHAR,
    specific_requirements TEXT,
    qualification_status VARCHAR DEFAULT 'new',
    lead_score INTEGER DEFAULT 0,
    notes TEXT,
    assigned_to VARCHAR,
    follow_up_date DATE,
    last_contact_date DATE,
    status VARCHAR DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_id VARCHAR UNIQUE,
    property_id VARCHAR REFERENCES properties(id),
    property_name VARCHAR,
    booking_type VARCHAR DEFAULT 'site_visit',
    name VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    preferred_date DATE,
    preferred_time TIME,
    message TEXT,
    status VARCHAR DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    phone VARCHAR,
    role VARCHAR,
    department VARCHAR,
    joining_date DATE,
    experience_years INTEGER DEFAULT 0,
    specializations JSONB DEFAULT '[]'::jsonb,
    performance_score DECIMAL(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    profile_image VARCHAR,
    bio TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Legal audit reports table
CREATE TABLE IF NOT EXISTS legal_audit_reports (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    property_id VARCHAR REFERENCES properties(id),
    report_title VARCHAR,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_phone VARCHAR,
    lawyer_name VARCHAR,
    report_type VARCHAR,
    status VARCHAR DEFAULT 'pending',
    overall_score DECIMAL(5,2),
    risk_level VARCHAR,
    priority VARCHAR DEFAULT 'medium',
    price DECIMAL(10,2) DEFAULT 1499,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_zone ON properties(zone);
CREATE INDEX IF NOT EXISTS idx_properties_developer ON properties(developer);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
