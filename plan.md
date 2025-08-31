Build a Next.js (App Router, TypeScript) project called "gold-tracker". 

Requirements:
- Use TailwindCSS for styling (responsive, clean UI).
- Homepage layout:
   1. Show current Gram Gold price in TL (highlight card).
   2. Show a 24h gold price chart (line chart).
   3. Show the latest 3-5 Turkish finance news (headline + link).
   4. Show an "AI Tahmin" card with short analysis of news.

Backend/API:
- /api/gold → fetch gold price in USD/ounce (MetalsAPI or Yahoo Finance GC=F), fetch USD/TRY exchange rate, calculate Gram Gold (TL), return JSON.
- /api/news → fetch latest Turkish finance news (NewsAPI or Google News RSS), return JSON { title, link, publishedAt }.
- /api/analysis → take last 3 news, send to OpenAI/Gemini, return 2-3 sentence gold price outlook in TL.

Extra:
- Store historical prices in DB (Supabase) for 24h chart.
- Deploy on Vercel, set up a cron job every 15 min to update gold price in DB.