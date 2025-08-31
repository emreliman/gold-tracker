-- Gold Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create gold_prices table
CREATE TABLE IF NOT EXISTS gold_prices (
    id BIGSERIAL PRIMARY KEY,
    gram_gold_buy DECIMAL(10,2) NOT NULL,
    gram_gold_sell DECIMAL(10,2) NOT NULL,
    gram_gold_change_percent DECIMAL(5,2) NOT NULL,
    quarter_gold_buy DECIMAL(10,2) NOT NULL,
    quarter_gold_sell DECIMAL(10,2) NOT NULL,
    quarter_gold_change_percent DECIMAL(5,2) NOT NULL,
    half_gold_buy DECIMAL(10,2) NOT NULL,
    half_gold_sell DECIMAL(10,2) NOT NULL,
    half_gold_change_percent DECIMAL(5,2) NOT NULL,
    ons_gold_buy DECIMAL(10,2) NOT NULL,
    ons_gold_sell DECIMAL(10,2) NOT NULL,
    ons_gold_change_percent DECIMAL(5,2) NOT NULL,
    has_gold_buy DECIMAL(10,2) NOT NULL,
    has_gold_sell DECIMAL(10,2) NOT NULL,
    has_gold_change_percent DECIMAL(5,2) NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'altin.doviz.com',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gold_prices_created_at ON gold_prices(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gold_prices_updated_at 
    BEFORE UPDATE ON gold_prices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON gold_prices
    FOR SELECT USING (true);

-- Create policy to allow public insert (for the API)
CREATE POLICY "Allow public insert" ON gold_prices
    FOR INSERT WITH CHECK (true);

-- Optional: Create a view for the latest gold prices
CREATE OR REPLACE VIEW latest_gold_prices AS
SELECT *
FROM gold_prices
ORDER BY created_at DESC
LIMIT 1;

-- Grant access to the view
GRANT SELECT ON latest_gold_prices TO anon, authenticated;
