-- Gold Tracker - Cache Tables Schema
-- Run this SQL in Supabase SQL Editor to add daily cache tables

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create news_cache table for daily news caching
CREATE TABLE IF NOT EXISTS news_cache (
    id BIGSERIAL PRIMARY KEY,
    news_data JSONB NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'newsapi',
    cache_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_cache table for daily AI analysis caching
CREATE TABLE IF NOT EXISTS analysis_cache (
    id BIGSERIAL PRIMARY KEY,
    analysis_data JSONB NOT NULL,
    gold_price_snapshot JSONB NOT NULL,
    news_input JSONB NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'gemini',
    cache_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_news_cache_date ON news_cache(cache_date DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_date ON analysis_cache(cache_date DESC);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_news_cache_updated_at 
    BEFORE UPDATE ON news_cache 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_cache_updated_at 
    BEFORE UPDATE ON analysis_cache 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON news_cache
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON news_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON analysis_cache
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON analysis_cache
    FOR INSERT WITH CHECK (true);

-- Create views for latest cached data
CREATE OR REPLACE VIEW latest_news_cache AS
SELECT *
FROM news_cache
WHERE cache_date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW latest_analysis_cache AS
SELECT *
FROM analysis_cache
WHERE cache_date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;

-- Grant access to the views
GRANT SELECT ON latest_news_cache TO anon, authenticated;
GRANT SELECT ON latest_analysis_cache TO anon, authenticated;

-- Grant table access to anonymous and authenticated users
GRANT SELECT, INSERT ON news_cache TO anon, authenticated;
GRANT SELECT, INSERT ON analysis_cache TO anon, authenticated;
