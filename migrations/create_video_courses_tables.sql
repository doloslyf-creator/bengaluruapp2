
-- Create video courses table
CREATE TABLE IF NOT EXISTS video_courses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    thumbnail_url TEXT,
    level VARCHAR CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
    estimated_duration TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create video chapters table
CREATE TABLE IF NOT EXISTS video_chapters (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR NOT NULL REFERENCES video_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    duration TEXT NOT NULL,
    thumbnail_url TEXT,
    chapter_number INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    learning_objectives JSONB DEFAULT '[]',
    key_takeaways JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR NOT NULL REFERENCES video_courses(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    current_chapter_id VARCHAR REFERENCES video_chapters(id),
    completed_chapters JSONB DEFAULT '[]',
    progress_percentage INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    last_accessed_at TIMESTAMP,
    completed_at TIMESTAMP,
    total_watch_time INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_chapter ON video_chapters(course_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_user_course ON course_enrollments(user_email, course_id);
CREATE INDEX IF NOT EXISTS idx_course_slug ON video_courses(slug);
CREATE INDEX IF NOT EXISTS idx_chapter_slug ON video_chapters(course_id, slug);

-- Insert sample home buying journey course
INSERT INTO video_courses (title, description, slug, category, level, is_published, is_featured, display_order)
SELECT 
    'Complete Home Buying Journey',
    'A comprehensive step-by-step guide through the entire home buying process. From initial research to final possession, learn everything you need to know to make informed property decisions.',
    'home-buying-journey',
    'Property Basics',
    'beginner',
    true,
    true,
    1
WHERE NOT EXISTS (SELECT 1 FROM video_courses WHERE slug = 'home-buying-journey');

-- Insert sample chapters for the home buying course
INSERT INTO video_chapters (course_id, title, description, slug, youtube_url, duration, chapter_number, is_preview, learning_objectives, key_takeaways, is_published)
SELECT 
    (SELECT id FROM video_courses WHERE slug = 'home-buying-journey'),
    'Chapter 1: Setting Your Budget & Financial Planning',
    'Learn how to assess your financial readiness, calculate your budget, and understand different financing options available for home buyers.',
    'setting-budget-financial-planning',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '12:45',
    1,
    true,
    '["Assess your financial readiness", "Calculate affordable budget range", "Understand loan types and eligibility"]',
    '["20% down payment is ideal but not mandatory", "Pre-approval speeds up the buying process", "Factor in additional costs beyond property price"]',
    true
WHERE NOT EXISTS (SELECT 1 FROM video_chapters WHERE slug = 'setting-budget-financial-planning');

INSERT INTO video_chapters (course_id, title, description, slug, youtube_url, duration, chapter_number, learning_objectives, key_takeaways, is_published)
SELECT 
    (SELECT id FROM video_courses WHERE slug = 'home-buying-journey'),
    'Chapter 2: Location Research & Property Types',
    'Understand how to evaluate locations, analyze connectivity, infrastructure, and choose the right property type for your needs.',
    'location-research-property-types',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '15:20',
    2,
    '["Evaluate location prospects", "Analyze connectivity and infrastructure", "Compare property types (apartment vs villa vs plot)"]',
    '["Location determines 70% of appreciation potential", "Check future infrastructure projects", "Consider resale value early"]',
    true
WHERE NOT EXISTS (SELECT 1 FROM video_chapters WHERE slug = 'location-research-property-types');

INSERT INTO video_chapters (course_id, title, description, slug, youtube_url, duration, chapter_number, learning_objectives, key_takeaways, is_published)
SELECT 
    (SELECT id FROM video_courses WHERE slug = 'home-buying-journey'),
    'Chapter 3: Legal Due Diligence & Documentation',
    'Master the legal aspects of property buying including title verification, RERA compliance, and essential document checks.',
    'legal-due-diligence-documentation',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '18:30',
    3,
    '["Verify property titles and ownership", "Check RERA compliance", "Understand essential legal documents"]',
    '["Always verify clear title before booking", "RERA registration protects buyers", "Get legal opinion for high-value purchases"]',
    true
WHERE NOT EXISTS (SELECT 1 FROM video_chapters WHERE slug = 'legal-due-diligence-documentation');

INSERT INTO video_chapters (course_id, title, description, slug, youtube_url, duration, chapter_number, learning_objectives, key_takeaways, is_published)
SELECT 
    (SELECT id FROM video_courses WHERE slug = 'home-buying-journey'),
    'Chapter 4: Site Visits & Property Inspection',
    'Learn what to look for during site visits, how to evaluate construction quality, and questions to ask builders and agents.',
    'site-visits-property-inspection',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '14:15',
    4,
    '["Conduct effective site visits", "Evaluate construction quality", "Ask the right questions to builders"]',
    '["Visit at different times of day", "Check for structural issues early", "Verify amenities and common areas"]',
    true
WHERE NOT EXISTS (SELECT 1 FROM video_chapters WHERE slug = 'site-visits-property-inspection');

INSERT INTO video_chapters (course_id, title, description, slug, youtube_url, duration, chapter_number, learning_objectives, key_takeaways, is_published)
SELECT 
    (SELECT id FROM video_courses WHERE slug = 'home-buying-journey'),
    'Chapter 5: Negotiation, Booking & Final Steps',
    'Master negotiation techniques, understand the booking process, and learn about registration, loan processing, and possession.',
    'negotiation-booking-final-steps',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '16:40',
    5,
    '["Negotiate effectively with builders", "Understand booking and payment schedules", "Navigate registration and possession process"]',
    '["Everything is negotiable in real estate", "Read all documents before signing", "Plan for possession delays"]',
    true
WHERE NOT EXISTS (SELECT 1 FROM video_chapters WHERE slug = 'negotiation-booking-final-steps');
