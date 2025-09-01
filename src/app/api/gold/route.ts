import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { 
  getLatestGoldPrice, 
  saveGoldPrice, 
  convertRecordToGoldData,
  clearGoldPriceCache,
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
const MEMORY_CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

interface GoldPrice {
  type: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  updateTime?: string;
}

interface CurrencyRate {
  type: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
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

    // Altın fiyatları tablosunu parse et - Tüm altın türleri
    const goldData: any = {
      // Temel altın türleri
      gramGold: { type: 'Gram Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      gramHasGold: { type: 'Gram Has Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      onsGold: { type: 'Ons Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      
      // Çeyrek sistemleri
      quarterGold: { type: 'Çeyrek Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      halfGold: { type: 'Yarım Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      fullGold: { type: 'Tam Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      
      // Cumhuriyet ve klasik altınlar
      cumhuriyetGold: { type: 'Cumhuriyet Altını', buy: 0, sell: 0, change: 0, changePercent: 0 },
      ataGold: { type: 'Ata Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      ikibuçukGold: { type: 'İkibuçuk Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      beşliGold: { type: 'Beşli Altın', buy: 0, sell: 0, change: 0, changePercent: 0 },
      
      // Bilezikler
      bilezik14: { type: '14 Ayar Bilezik', buy: 0, sell: 0, change: 0, changePercent: 0 },
      bilezik18: { type: '18 Ayar Bilezik', buy: 0, sell: 0, change: 0, changePercent: 0 },
      bilezik22: { type: '22 Ayar Bilezik', buy: 0, sell: 0, change: 0, changePercent: 0 },
      
      lastUpdate: new Date().toISOString(),
      source: 'altin.doviz.com'
    };

    // USD/TRY kuru için
    let usdTryRate: CurrencyRate = { type: 'USD/TRY', buy: 0, sell: 0, change: 0, changePercent: 0 };

    // Tablo satırlarını bul ve parse et - Daha spesifik selectors
    $('table tr, .table tr, [class*="table"] tr').each((index, element) => {
      const $row = $(element);
      const cells = $row.find('td');
      
      if (cells.length >= 3) { // En az 3 cell olmalı (isim, alış, satış)
        const name = $row.find('a').text().trim().toLowerCase();
        
        // Eğer link yoksa, ilk cell'deki text'i al
        const displayName = name || $(cells[0]).text().trim().toLowerCase();
        
        if (!displayName) return; // Boş satır atla
        
        const buyText = $(cells[1]).text().replace(/[^\d,]/g, '').replace(',', '.');
        const sellText = $(cells[2]).text().replace(/[^\d,]/g, '').replace(',', '.');
        const changeText = cells.length >= 4 ? $(cells[3]).text().trim() : '';
        
        const buy = parseFloat(buyText) || 0;
        const sell = parseFloat(sellText) || 0;

        // Parse change percentage and amount from text like "%0,08 (3,65)" or "%0,08"
        let changePercent = 0;
        let change = 0;
        
        if (changeText) {
          // Extract percentage - handle both %0,08 and %-0,08 formats
          const percentMatch = changeText.match(/([+-]?\d+[,.]?\d*)/);
          if (percentMatch) {
            changePercent = parseFloat(percentMatch[1].replace(',', '.')) || 0;
          }
          
          // Extract amount in parentheses - handle both (3,65) and (-3,65) formats  
          const amountMatch = changeText.match(/\(([+-]?\d+[,.]?\d*)\)/);
          if (amountMatch) {
            change = parseFloat(amountMatch[1].replace(',', '.')) || 0;
          } else {
            // If no amount in parentheses, calculate from percentage
            change = (sell * changePercent) / 100;
          }
        }        // Altın türlerini tanımla
        const goldDataItem = { type: displayName, buy, sell, change, changePercent };
        
        if (displayName.includes('gram altın') && !displayName.includes('has')) {
          goldData.gramGold = { type: 'Gram Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('gram has altın') || displayName.includes('has altın')) {
          goldData.gramHasGold = { type: 'Gram Has Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('ons altın')) {
          goldData.onsGold = { type: 'Ons Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('çeyrek altın')) {
          goldData.quarterGold = { type: 'Çeyrek Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('yarım altın')) {
          goldData.halfGold = { type: 'Yarım Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('tam altın')) {
          goldData.fullGold = { type: 'Tam Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('cumhuriyet altın')) {
          goldData.cumhuriyetGold = { type: 'Cumhuriyet Altını', buy, sell, change, changePercent };
        } else if (displayName.includes('ata altın')) {
          goldData.ataGold = { type: 'Ata Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('ikibuçuk') || displayName.includes('2,5')) {
          goldData.ikibuçukGold = { type: 'İkibuçuk Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('beşli') || displayName.includes('5 li')) {
          goldData.beşliGold = { type: 'Beşli Altın', buy, sell, change, changePercent };
        } else if (displayName.includes('14 ayar') || displayName.includes('14ayar')) {
          goldData.bilezik14 = { type: '14 Ayar Bilezik', buy, sell, change, changePercent };
        } else if (displayName.includes('18 ayar') || displayName.includes('18ayar')) {
          goldData.bilezik18 = { type: '18 Ayar Bilezik', buy, sell, change, changePercent };
        } else if (displayName.includes('22 ayar') || displayName.includes('22ayar')) {
          goldData.bilezik22 = { type: '22 Ayar Bilezik', buy, sell, change, changePercent };
        }
        
        // Debug: Hangi altın türleri bulundu
        if (buy > 0 || sell > 0) {
          console.log(`Found: ${displayName} -> ${changePercent}% (${change})`);
        }
      }
    });

    // Ana sayfadaki döviz ticker'ını da parse et (USD/TRY için)
    $('.ticker, .header-ticker, [class*="ticker"]').each((index, element) => {
      const $ticker = $(element);
      const tickerText = $ticker.text();
      
      // Format: "DOLAR 41,1457 %0,01 (0,0041)" veya benzeri
      if (tickerText.toLowerCase().includes('dolar')) {
        console.log('Found USD ticker:', tickerText);
        
        // Fiyat parse et
        const priceMatch = tickerText.match(/(\d+[,.]?\d*)/);
        // Yüzde parse et  
        const percentMatch = tickerText.match(/%([+-]?\d+[,.]?\d*)/);
        // Miktar parse et
        const amountMatch = tickerText.match(/\(([+-]?\d+[,.]?\d*)\)/);
        
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(',', '.'));
          const changePercent = percentMatch ? parseFloat(percentMatch[1].replace(',', '.')) : 0;
          const change = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
          
          usdTryRate = {
            type: 'USD/TRY',
            buy: price - 0.01, // Yaklaşık alış
            sell: price,       // Ticker'daki fiyat genelde satış
            change: change,
            changePercent: changePercent
          };
          console.log('Parsed USD/TRY:', usdTryRate);
        }
      }
    });

    // USD/TRY'yi goldData'ya ekle
    (goldData as any).usdTry = usdTryRate;

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

async function getGoldPrices(clearCache = false): Promise<GoldData> {
  try {
    if (clearCache) {
      console.log('Clearing memory cache as requested');
      memoryCache = null;
    }

    // Memory cache kontrolü (15 dakika)
    if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_DURATION) {
      console.log('Returning data from memory cache');
      return {
        ...memoryCache.data,
        source: 'memory cache',
        lastUpdate: new Date(memoryCache.timestamp).toISOString()
      };
    }

    console.log('No fresh data in memory cache, scraping...');
    
    // Database'de fresh data yok, scrape et
    const scrapedData = await scrapeAltinDoviz();
    
    // Sadece memory cache'e kaydet (database bypass)
    memoryCache = {
      data: scrapedData,
      timestamp: Date.now()
    };
    
    console.log('Data scraped and saved to memory cache');
    return scrapedData;
    
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clearCache') === 'true';
    
    console.log('Gold API called with clearCache:', clearCache);
    
    const goldData = await getGoldPrices(clearCache);
    
    console.log('Gold API response data:', JSON.stringify(goldData, null, 2));
    
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
