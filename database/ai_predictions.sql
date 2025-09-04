-- AI Predictions Table
-- This table stores AI predictions for gold prices to track accuracy

CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGSERIAL PRIMARY KEY,
    prediction_date DATE NOT NULL,
    prediction_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timeframe VARCHAR(10) NOT NULL CHECK (timeframe IN ('24h', '7d', '1m')),
    current_price DECIMAL(10,2) NOT NULL,
    ai_trend VARCHAR(50) NOT NULL,
    ai_confidence INTEGER NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
    ai_prediction_text TEXT NOT NULL,
    predicted_prices JSONB NOT NULL, -- Array of predicted prices with timestamps
    actual_prices JSONB, -- Array of actual prices when they become available
    accuracy_score DECIMAL(5,2), -- Calculated accuracy percentage
    prediction_source VARCHAR(50) NOT NULL DEFAULT 'gemini',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_predictions_date ON ai_predictions(prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_timeframe ON ai_predictions(timeframe);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_accuracy ON ai_predictions(accuracy_score DESC);

-- Create updated_at trigger
CREATE TRIGGER update_ai_predictions_updated_at 
    BEFORE UPDATE ON ai_predictions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON ai_predictions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON ai_predictions
    FOR INSERT WITH CHECK (true);

-- Create a view for recent predictions with accuracy
CREATE OR REPLACE VIEW recent_ai_predictions AS
SELECT 
    id,
    prediction_date,
    prediction_time,
    timeframe,
    current_price,
    ai_trend,
    ai_confidence,
    ai_prediction_text,
    predicted_prices,
    actual_prices,
    accuracy_score,
    prediction_source,
    created_at,
    -- Calculate days since prediction
    EXTRACT(DAYS FROM NOW() - prediction_time) as days_since_prediction
FROM ai_predictions
ORDER BY prediction_date DESC, prediction_time DESC;

-- Create a view for prediction accuracy statistics
CREATE OR REPLACE VIEW ai_prediction_stats AS
SELECT 
    timeframe,
    COUNT(*) as total_predictions,
    AVG(accuracy_score) as avg_accuracy,
    AVG(ai_confidence) as avg_confidence,
    COUNT(CASE WHEN accuracy_score >= 80 THEN 1 END) as high_accuracy_count,
    COUNT(CASE WHEN accuracy_score >= 60 THEN 1 END) as medium_accuracy_count,
    COUNT(CASE WHEN accuracy_score < 60 THEN 1 END) as low_accuracy_count
FROM ai_predictions 
WHERE accuracy_score IS NOT NULL
GROUP BY timeframe;

-- Grant access to the views
GRANT SELECT ON recent_ai_predictions TO anon, authenticated;
GRANT SELECT ON ai_prediction_stats TO anon, authenticated;

-- Function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
    predicted_prices JSONB,
    actual_prices JSONB
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_error DECIMAL(10,2) := 0;
    count_points INTEGER := 0;
    predicted_price DECIMAL(10,2);
    actual_price DECIMAL(10,2);
    price_error DECIMAL(10,2);
    accuracy DECIMAL(5,2);
BEGIN
    -- Loop through predicted prices and find matching actual prices
    FOR i IN 0..jsonb_array_length(predicted_prices)-1 LOOP
        predicted_price := (predicted_prices->i->>'price')::DECIMAL(10,2);
        
        -- Find corresponding actual price by timestamp
        FOR j IN 0..jsonb_array_length(actual_prices)-1 LOOP
            IF predicted_prices->i->>'time' = actual_prices->j->>'time' THEN
                actual_price := (actual_prices->j->>'price')::DECIMAL(10,2);
                
                -- Calculate percentage error
                price_error := ABS(predicted_price - actual_price) / actual_price * 100;
                total_error := total_error + price_error;
                count_points := count_points + 1;
                EXIT;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Calculate accuracy (100% - average error)
    IF count_points > 0 THEN
        accuracy := 100 - (total_error / count_points);
        RETURN GREATEST(0, LEAST(100, accuracy)); -- Clamp between 0-100
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;