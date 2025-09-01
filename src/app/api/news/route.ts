import { NextResponse } from 'next/server';
import { getTodaysNews, saveNewsCache } from '@/lib/supabase';

// NewsAPI configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

// Cache duration: 30 minutes (for fallback memory cache)
const MEMORY_CACHE_DURATION_MS = 30 * 60 * 1000;

// In-memory cache backup (if database fails)
let memoryCache: { data: any[]; timestamp: number } | null = null;

// Mock news data (fallback when API unavailable)
const mockNewsData = [
  {
    id: 'mock-1',
    title: "Altın fiyatları FED belirsizliği ile tüm zamanların rekorunu kırdı",
    description: "Fed politika açıklamalarının ardından yatırımcılar güvenli liman arayışında altına yöneldi. Gram altın 4.600 TL seviyesini test etti.",
    url: "#",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    source: { name: "Ekonomi Haberleri" },
    content: "Fed politika toplantısı öncesi artan belirsizlik yatırımcıları güvenli liman varlıklarına yöneltti..."
  },
  {
    id: 'mock-2',
    title: "Merkez bankaları altın rezervlerini artırıyor",
    description: "Küresel merkez bankaları bu çeyrekte rezerv çeşitlendirmesi kapsamında önemli altın alımları yaptı. TCMB da rezervlerini güçlendirdi.",
    url: "#",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    source: { name: "Reuters Türkiye" },
    content: "Türkiye Cumhuriyet Merkez Bankası da dahil olmak üzere küresel merkez bankaları altın rezervlerini artırıyor..."
  },
  {
    id: 'mock-3',
    title: "Jeopolitik gerilimler altın talebini destekliyor",
    description: "Küresel belirsizlikler ve jeopolitik riskler yatırımcıları enflasyon korunması için değerli metallere yönlendiriyor.",
    url: "#",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    source: { name: "Bloomberg HT" },
    content: "Artan jeopolitik riskler ve küresel ekonomideki belirsizlikler altına olan talebi artırıyor..."
  },
  {
    id: 'mock-4',
    title: "Türkiye'de altın yatırımı artan enflasyonla popüler",
    description: "Yüksek enflasyon ortamında Türk yatırımcılar değer koruma aracı olarak altına yöneliyor. Fiziksel altın satışları arttı.",
    url: "#",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    source: { name: "Hürriyet" },
    content: "Enflasyonist baskılar altında Türk yatırımcılar portföylerinde altın ağırlığını artırıyor..."
  },
  {
    id: 'mock-5',
    title: "Gram altın 4.500 TL direncini test ediyor",
    description: "Teknik analistlere göre gram altın fiyatları 4.500 TL seviyesindeki güçlü direnci test ediyor. Aşılması halinde 4.700 TL hedefleniyor.",
    url: "#",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    source: { name: "Investing.com Türkiye" },
    content: "Teknik analiz açısından gram altın önemli bir direnç seviyesinde işlem görüyor..."
  }
];

async function fetchNewsFromAPI() {
  if (!NEWS_API_KEY) {
    console.log('NewsAPI key not configured, using mock data');
    return mockNewsData;
  }

  try {
    const params = new URLSearchParams({
      country: 'us',
      category: 'business',
      pageSize: '50',
      apiKey: NEWS_API_KEY
    });

    const response = await fetch(`${NEWS_API_URL}?${params}`, {
      headers: {
        'User-Agent': 'GoldTracker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(`NewsAPI error: ${data.message}`);
    }

    // Filter and format news
    const filteredNews = data.articles
      .filter((article: any) => 
        article.title && 
        article.description && 
        !article.title.includes('[Removed]') &&
        (article.title.toLowerCase().includes('gold') ||
         article.description.toLowerCase().includes('gold') ||
         article.title.toLowerCase().includes('fed') ||
         article.title.toLowerCase().includes('dollar') ||
         article.title.toLowerCase().includes('economy') ||
         article.title.toLowerCase().includes('inflation') ||
         article.title.toLowerCase().includes('bank'))
      )
      .map((article: any) => ({
        id: article.url || `news-${Date.now()}-${Math.random()}`,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source,
        content: article.content
      }))
      .slice(0, 5); // Take only first 5 relevant news

    return filteredNews.length > 0 ? filteredNews : mockNewsData;

  } catch (error) {
    console.error('Error fetching news from API:', error);
    return mockNewsData;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clearCache') === 'true';
    
    if (clearCache) {
      console.log('Clearing memory cache as requested');
      memoryCache = null;
    }

    // Önce database'den bugünkü haberleri kontrol et
    if (!clearCache) {
      const todaysNews = await getTodaysNews();
      if (todaysNews && todaysNews.length > 0) {
        console.log('Returning cached news from database');
        return NextResponse.json({
          success: true,
          data: todaysNews,
          source: 'database_cache',
          timestamp: new Date().toISOString(),
          count: todaysNews.length
        });
      }
    }

    // Database'de bugünkü haber yok, memory cache kontrol et
    if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_DURATION_MS) {
      console.log('Returning data from memory cache');
      return NextResponse.json({
        success: true,
        data: memoryCache.data,
        source: 'memory_cache',
        timestamp: new Date().toISOString(),
        cacheAge: Math.floor((Date.now() - memoryCache.timestamp) / 1000 / 60) // minutes
      });
    }

    console.log('Fetching fresh news data...');
    
    // Fresh haber çek
    const newsData = await fetchNewsFromAPI();
    
    // Database'e kaydet (günlük cache)
    const dbSaved = await saveNewsCache(newsData, NEWS_API_KEY ? 'newsapi' : 'mock');
    
    // Memory cache'e de kaydet (backup)
    memoryCache = {
      data: newsData,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: newsData,
      source: NEWS_API_KEY ? 'newsapi' : 'mock',
      timestamp: new Date().toISOString(),
      count: newsData.length,
      dbCached: dbSaved
    });

  } catch (error) {
    console.error('News API error:', error);
    
    // Son çare: Memory cache'den dön
    if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_DURATION_MS) {
      console.log('Returning data from memory cache as fallback');
      return NextResponse.json({
        success: false,
        data: memoryCache.data,
        source: 'memory_fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
    
    // En son çare: Mock data
    return NextResponse.json({
      success: false,
      data: mockNewsData,
      source: 'mock_fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}
