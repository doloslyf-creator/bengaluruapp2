
-- Create video education table
CREATE TABLE IF NOT EXISTS video_education (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty VARCHAR CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
    duration TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add some sample video content if table is empty
INSERT INTO video_education (title, description, youtube_url, category, difficulty, duration, tags, is_published)
SELECT 
    'Getting Started with Property Investment',
    'Learn the basics of property investment in this comprehensive beginner guide. Understand market analysis, financing options, and legal considerations.',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Property Basics',
    'beginner',
    '12:45',
    ARRAY['property', 'investment', 'beginner', 'basics'],
    true
WHERE NOT EXISTS (SELECT 1 FROM video_education LIMIT 1);

INSERT INTO video_education (title, description, youtube_url, category, difficulty, duration, tags, is_published)
SELECT 
    'Understanding RERA Compliance',
    'Deep dive into Real Estate Regulation and Development Act (RERA) and how it protects property buyers. Essential knowledge for any property purchase.',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'RERA Compliance',
    'intermediate',
    '18:20',
    ARRAY['RERA', 'legal', 'compliance', 'regulation'],
    true
WHERE (SELECT COUNT(*) FROM video_education) < 2;

INSERT INTO video_education (title, description, youtube_url, category, difficulty, duration, tags, is_published)
SELECT 
    'Advanced Investment Strategies',
    'Advanced techniques for maximizing returns on property investments. Covers portfolio diversification, market timing, and exit strategies.',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Investment Strategy',
    'advanced',
    '25:10',
    ARRAY['advanced', 'strategy', 'portfolio', 'returns'],
    true
WHERE (SELECT COUNT(*) FROM video_education) < 3;
