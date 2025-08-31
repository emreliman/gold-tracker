# Gold Tracker

A Next.js application for tracking Turkish gold prices in real-time with AI-powered analysis.

## Features

- 📊 Real-time gold price tracking (Gram, Quarter, Half, Ounce, Has gold)
- 📈 24-hour price charts
- 📰 Latest Turkish finance news
- 🤖 AI-powered market analysis (Gemini)
- 💾 Smart caching with Supabase (30-minute intervals)
- 🛡️ Anti-ban scraping strategy
- ⚡ Lightweight and Vercel-optimized

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Scraping**: cheerio + node-fetch
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd gold-tracker
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional APIs
NEWS_API_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Setup

1. Create a new project at [Supabase](https://app.supabase.com/)
2. Run the SQL script from `database/schema.sql` in Supabase SQL Editor
3. Copy your project URL and anon key to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Gold Prices
```
GET /api/gold
```

Returns current gold prices with intelligent caching:
- Checks database for fresh data (< 30 minutes)
- If no fresh data, scrapes altin.doviz.com
- Saves new data to database
- Fallback to memory cache if database fails

### Sample Response
```json
{
  "success": true,
  "data": {
    "gramGold": {
      "type": "Gram Altın",
      "buy": 4562.43,
      "sell": 4563.13,
      "change": 0.70,
      "changePercent": 1.19
    },
    "quarterGold": {
      "type": "Çeyrek Altın",
      "buy": 7244.37,
      "sell": 7408.02,
      "changePercent": 0.74
    }
    // ... other gold types
  },
  "timestamp": "2025-08-31T..."
}
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Make sure to add these in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEWS_API_KEY` (optional)
- `GEMINI_API_KEY` (optional)

## License

MIT
