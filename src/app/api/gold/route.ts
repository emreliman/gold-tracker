import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { 
  getLatestGoldPrice, 
  saveGoldPrice, 
  convertRecordToGoldData,
  type GoldData 
} from '@/lib/supabase';

// User-Agent listesi (ban prevention)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

// In-memory cache backup (if Supabase fails)
let memoryCache: { data: GoldData; timestamp: number } | null = null;
const MEMORY_CACHE_DURATION = 15 * 60 * 1000; // 15 dakika

interface GoldPrice {
  type: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  updateTime?: string;
}

async function scrapeAltinDoviz(): Promise<GoldData> {
  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  try {
    const response = await fetch('https://altin.doviz.com/', {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Charset': 'utf-8',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Altın fiyatları tablosunu parse et
    const goldData: GoldData = {
      gramGold: { type: 'Gram Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      quarterGold: { type: 'Çeyrek Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      halfGold: { type: 'Yarım Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      onsGold: { type: 'Ons Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      hasGold: { type: 'Has Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      lastUpdate: new Date().toISOString(),
      source: 'altin.doviz.com'
    };

    // Tablo satırlarını bul ve parse et
    $('tr').each((index, element) => {
      const $row = $(element);
      const cells = $row.find('td');
      
      if (cells.length >= 4) {
        const name = $row.find('a').text().trim().toLowerCase();
        const buyText = $(cells[1]).text().replace(/[^\d,]/g, '').replace(',', '.');
        const sellText = $(cells[2]).text().replace(/[^\d,]/g, '').replace(',', '.');
        const changeText = $(cells[3]).text().replace(/[^\d,%\-]/g, '');
        
        const buy = parseFloat(buyText) || 0;
        const sell = parseFloat(sellText) || 0;
        const changePercent = parseFloat(changeText.replace('%', '')) || 0;
        const change = sell - buy;

        if (name.includes('gram altın')) {
          goldData.gramGold = { type: 'Gram Altın', buy, sell, change, changePercent };
        } else if (name.includes('çeyrek altın')) {
          goldData.quarterGold = { type: 'Çeyrek Altın', buy, sell, change, changePercent };
        } else if (name.includes('yarım altın')) {
          goldData.halfGold = { type: 'Yarım Altın', buy, sell, change, changePercent };
        } else if (name.includes('ons altın')) {
          goldData.onsGold = { type: 'Ons Altın', buy, sell, change, changePercent };
        } else if (name.includes('gram has altın')) {
          goldData.hasGold = { type: 'Has Altın', buy, sell, change, changePercent };
        }
      }
    });

    // Scraping başarılı, memory cache'e de kaydet
    memoryCache = {
      data: goldData,
      timestamp: Date.now()
    };

    return goldData;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to fetch gold prices from altin.doviz.com');
  }
}

async function getGoldPrices(): Promise<GoldData> {
  try {
    // Önce database'den kontrol et (30 dakikalık cache)
    const latestRecord = await getLatestGoldPrice();
    
    if (latestRecord) {
      console.log('Returning cached data from database');
      return convertRecordToGoldData(latestRecord);
    }

    console.log('No fresh data in database, scraping...');
    
    // Database'de fresh data yok, scrape et
    const scrapedData = await scrapeAltinDoviz();
    
    // Database'e kaydet
    const savedRecord = await saveGoldPrice(scrapedData);
    
    if (savedRecord) {
      console.log('Data scraped and saved to database');
      return convertRecordToGoldData(savedRecord);
    } else {
      console.log('Failed to save to database, returning scraped data');
      return scrapedData;
    }
    
  } catch (error) {
    console.error('Error in getGoldPrices:', error);
    
    // Son çare: Memory cache'den dön
    if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_DURATION) {
      console.log('Returning data from memory cache as fallback');
      return {
        ...memoryCache.data,
        source: 'memory cache (database failed)',
        lastUpdate: new Date(memoryCache.timestamp).toISOString()
      };
    }
    
    throw error;
  }
}

export async function GET() {
  try {
    const goldData = await getGoldPrices();
    
    return NextResponse.json({
      success: true,
      data: goldData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gold prices',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Rate limiting için OPTIONS method
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
