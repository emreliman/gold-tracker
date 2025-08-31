# Supabase Hızlı Kurulum

## 1. SQL Schema'yı Çalıştırın

Supabase Dashboard → SQL Editor'da aşağıdaki kodu çalıştırın:

```sql
-- Gold Tracker Database Schema
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

-- Enable Row Level Security (RLS)
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON gold_prices
    FOR SELECT USING (true);

-- Create policy to allow public insert (for the API)
CREATE POLICY "Allow public insert" ON gold_prices
    FOR INSERT WITH CHECK (true);
```

## 2. Test Database Connection

Schema çalıştırdıktan sonra:

```bash
curl http://localhost:3000/api/test-db
```

Başarılı response:
```json
{
  "success": true,
  "message": "Supabase connection successful!",
  "tableExists": true,
  "timestamp": "2025-08-31T19:45:00.000Z"
}
```

## 3. Özellikleri Test Edin

### Gold API
```bash
curl http://localhost:3000/api/gold
```

### Database Cache
İlk istek → Scraping + Database save
İkinci istek (30dk içinde) → Database cache

## 4. Mevcut Durum

✅ **Tamamen Çalışıyor:**
- Gold Price Scraping (altin.doviz.com)
- Database Caching (30 dakika cache)
- Memory Cache Fallback
- Graceful Database Failures
- Frontend Display
- Supabase Connection
- RLS Policies Active

✅ **Database Status:**
- `gold_prices` tablosu oluşturuldu
- RLS policies ayarlandı
- Intelligent caching aktif

## 5. Sonraki Adımlar

Database kurulumu tamamlandıktan sonra:
- [ ] Historical data charting
- [ ] News API integration
- [ ] AI Analysis (Gemini API)
- [ ] Cron jobs for auto-updates
