-- Minimal Cache Tables (Trigger'sız versiyon)
-- Bu daha basit ve hata riski daha düşük

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

-- Grant table access to anonymous and authenticated users
GRANT SELECT, INSERT ON news_cache TO anon, authenticated;
