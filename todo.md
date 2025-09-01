# Gold Tracker - TODO List

## ✅ Phase 1: Temel Yapı ve UI (TAMAMLANDI)

### ✅ Proje Kurulumu
- [x] Next.js projesi oluşturuldu
- [x] TailwindCSS kuruldu
- [x] TypeScript konfigürasyonu

### ✅ Ana Sayfa Layout
- [x] Ana sayfa grid layout tasarımı
- [x] Responsive design (mobile-first)
- [x] Altın fiyatı highlight kartı (real data from API)
- [x] 24h grafik placeholder'ı
- [x] Haberler bölümü layout'u
- [x] AI Tahmin kartı placeholder'ı
- [x] Loading states ve skeleton UI

### ✅ Bileşenler
- [x] GoldPriceCard component (fully functional with API)
- [x] NewsCard component (mock data)
- [x] PriceChart component (placeholder)
- [x] AIAnalysisCard component (placeholder)
- [x] Header/Navigation component
- [x] LoadingSkeleton component

## ✅ Phase 2: API Entegrasyonları (TAMAMLANDI)

### ✅ Altın Fiyatı API (Lightweight & Ban-Safe)
- [x] `/api/gold` endpoint oluştur
- [x] Lightweight scraping stratejisi:
  - Primary: altin.doviz.com (kapsamlı altın verileri)
  - Secondary: Garanti BBVA altın kurları (backup)
  - Fallback: TCMB XML (USD/TRY) + MetalsAPI
- [x] altin.doviz.com parsing:
  - Gram altın alış/satış + değişim %
  - Çeyrek, Yarım, Tam altın fiyatları
  - Ons altın ve Has altın fiyatları
  - Güncelleme zamanı (23:45 gibi)
- [x] Simple fetch + cheerio (no browser automation)
- [x] User-Agent rotation ve request throttling (5sn minimum)
- [x] Cache-first strategy (15min cache + timestamp check)
- [x] Multiple fallback sources implementation (DB cache + Memory cache)

### ✅ Haberler API
- [x] `/api/news` endpoint oluştur
- [x] NewsAPI entegrasyonu (Türkiye ekonomi haberleri)
  - API: `https://newsapi.org/v2/everything?q=altın+ekonomi&country=tr`
- [x] RSS feed parser alternatifi (NewsAPI limit aşımı için)
- [x] Haber filtreleme ve sıralama
- [x] Rate limiting handling
- [x] 30 dakikalık intelligent caching
- [x] Graceful fallback (mock data when API unavailable)

### ✅ AI Analiz API
- [x] `/api/analysis` endpoint oluştur
- [x] Google Gemini API entegrasyonu (lightweight fetch)
- [x] Prompt engineering (Türkçe altın analizi)
- [x] Son 3 haberi analiz etme logigi
- [x] Response caching (1 saatlik cache)
- [x] JSON structured output parsing
- [x] Intelligent fallback system

## ✅ Phase 3: Veri Görselleştirme (TAMAMLANDI)

### ✅ Chart Kütüphanesi
- [x] Chart.js ve react-chartjs-2 kurulumu
- [x] 24h altın fiyat grafiği
- [x] Responsive chart tasarımı
- [x] Hover effects ve tooltips
- [x] Zaman aralığı seçenekleri (24h/7d/1m)
- [x] Interactive chart controls

### ✅ Historical Data
- [x] `/api/historical` endpoint
- [x] Database historical data query
- [x] Chart için veri formatı
- [x] Graceful fallback (mock data when DB unavailable)
- [x] Statistics calculation (high/low/average/volatility)

## Phase 4: Database & Cron Jobs (1 gün)

### 🗄️ Supabase Setup
- [x] Supabase client kurulumu
- [x] Database schema (gold_prices tablosu)
- [x] Environment variables (.env.local)
- [x] Supabase setup guide (SUPABASE_SETUP.md)
- [x] Database connection test endpoint (/api/test-db)
- [x] Graceful fallback (memory cache when DB unavailable)
- [x] Gold prices tablosu ve RLS policies
- [x] 30 dakikalık intelligent cache stratejisi
- [x] Supabase project created & .env.local configured
- [x] **COMPLETED**: SQL schema çalıştırıldı - Database tamamen çalışır durumda!

### ⏰ Automation
- [ ] `/api/cron/update-gold` endpoint
- [ ] Vercel cron job konfigürasyonu (vercel.json)
- [ ] 15 dakikalık otomatik güncelleme
- [ ] Error monitoring ve alerting

## Phase 5: Optimizasyon & Polish (1 gün)

### ⚡ Performance
- [ ] SWR veya TanStack Query entegrasyonu
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle analyzer

### 🎯 UX İyileştirmeleri
- [ ] Error boundaries
- [ ] Offline support (PWA opsiyonel)
- [ ] Dark mode support
- [ ] Accessibility improvements

### 🚀 Deployment
- [ ] Vercel deployment
- [ ] Environment variables setup
- [ ] Domain bağlama (opsiyonel)
- [ ] Analytics setup (opsiyonel)

## Phase 6: Testing & Monitoring (1 gün)

### 🧪 Testing
- [ ] API endpoint testleri
- [ ] Component testleri (Jest/React Testing Library)
- [ ] E2E testler (Playwright opsiyonel)

### 📊 Monitoring
- [ ] Error tracking (Sentry opsiyonel)
- [ ] API usage monitoring
- [ ] Performance monitoring

---

## API Kaynakları (Lightweight & Vercel-Safe)

### Altın Fiyatları (Ban-Safe)
```
Primary: https://altin.doviz.com/ (kapsamlı altın verileri)
- Gram altın: 4.563,13 TL (%1,19)
- Çeyrek altın: 7.408,02 TL (%0,74)
- Yarım altın: 14.816,04 TL (%0,74)
- Ons altın: $3.448,57 (%0,92)
Secondary: https://www.garantibbva.com.tr/altin-kurlari (backup)
Fallback: https://metals-api.com/ (50 requests/month)
Strategy: Cheerio only, 5sn throttling, timestamp-based cache
```

### Döviz Kurları (Resmi)
```
Primary: https://www.tcmb.gov.tr/kurlar/today.xml (TCMB XML)
Secondary: https://api.exchangerate-api.com/v4/latest/USD
Rate limit: Yok (TCMB), 1500/month (ExchangeRate)
```

### Lightweight Stack
```
- cheerio: HTML parsing (2KB gzipped)
- node-fetch: HTTP requests (built-in)
- xml2js: TCMB XML parsing
- NO Puppeteer (too heavy for Vercel)
```

### NewsAPI
```
Türkiye haberleri: https://newsapi.org/v2/everything?q=altın+ekonomi&country=tr
Free tier: 1000 requests/day
```

### Google Gemini API
```
Model: gemini-2.5-flash (hızlı ve ucuz)
Cost: $0.075/1M input tokens, $0.30/1M output tokens
Free tier: 15 requests/minute, 1500 requests/day
Türkçe support: Excellent
```

---

## Teknical Stack (Vercel-Optimized)
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Scraping**: cheerio + node-fetch (lightweight)
- **Charts**: Chart.js veya Recharts
- **Deployment**: Vercel (Edge Functions)
- **APIs**: altin.doviz.com, NewsAPI, Google Gemini

---

## Estimated Timeline: 6-8 gün

### Daily Goals:
- **Gün 1-2**: Layout ve temel componentler
- **Gün 3-4**: API entegrasyonları
- **Gün 5**: Chart ve database
- **Gün 6**: Cron jobs ve automation
- **Gün 7**: Optimizasyon ve deployment
- **Gün 8**: Testing ve polish

---

## Notlar (Vercel & Ban-Safe Strategy)
- altin.doviz.com kapsamlı altın verileri (ban riski düşük)
- Cheerio lightweight, Puppeteer Vercel'da çok ağır
- Edge Functions ile hızlı response
- Cache-first: 15min cache + timestamp check
- User-Agent rotation ve request throttling
- NewsAPI free tier günde 1000 request
- Gemini API ücretsiz tier: 1500 request/day (OpenAI'dan ucuz)
- Supabase free tier 500MB database, 50k API requests/month


---

## Vercel & Anti-Ban Strategy

### 🛡️ Ban Prevention
- **Request throttling**: Min 5 saniye interval
- **User-Agent rotation**: Mobile/desktop mix
- **Cache-first**: API'lara minimum istek
- **Error backoff**: Progressive delay artırma

### ⚡ Lightweight Implementation
- **cheerio**: HTML/XML parsing (2KB)
- **No Puppeteer**: Vercel'da çok ağır (50MB+)
- **Edge Functions**: Hızlı cold start
- **Minimal dependencies**: Bundle size optimization

### 📊 Data Sources Priority
1. **altin.doviz.com** → Kapsamlı altın verileri (Gram/Çeyrek/Yarım/Ons + %)

