import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { getTodaysAnalysis, saveAnalysisCache } from '@/lib/supabase';

// Gemini AI client with grounding
const ai = new GoogleGenAI({});

// Define the grounding tool for real-time data
const groundingTool = {
  googleSearch: {},
};

// Cache duration: 1 hour (for fallback memory cache)
const MEMORY_CACHE_DURATION_MS = 60 * 60 * 1000;

// In-memory cache backup (if database fails)
let memoryCache: { data: any; timestamp: number } | null = null;

// Mock analysis data (fallback when API unavailable)
const mockAnalysisData = {
  trend: "Yükseliş",
  confidence: 75,
  summary: "Altın fiyatları Fed politika belirsizliği ve jeopolitik riskler nedeniyle yükseliş trendinde. USD/TRY paritesindeki artış da altın talebini destekliyor.",
  factors: [
    { factor: "Fed Faiz Oranları", impact: "positive", weight: 85 },
    { factor: "USD/TRY", impact: "positive", weight: 80 },
    { factor: "TCMB Politikaları", impact: "neutral", weight: 70 }
  ],
  predictions: {
    short_term: "Mevcut fiyat 4563.13 TL. 1-2 hafta içinde 4472-4787 TL bandında olacak",
    risk_level: "Orta"
  },
  lastUpdate: new Date().toISOString()
};

// Direct imports for internal API calls (more efficient)
import { GET as getGoldData } from '../gold/route';
import { GET as getNewsData } from '../news/route';

async function fetchLatestNews() {
  try {
    // Create mock request for internal API call
    const mockRequest = new Request('http://localhost:3000/api/news');
    const response = await getNewsData(mockRequest);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      return result.data.slice(0, 3).map((article: any) => ({
        title: article.title,
        description: article.description,
        publishedAt: article.publishedAt
      }));
    }
    
    return null;
  } catch (error) {
    console.log('Could not fetch news for AI analysis');
    return null;
  }
}

async function generateGeminiAnalysis(goldPriceData: any, newsData: any[]) {
  try {
    const newsHeadlines = newsData && newsData.length > 0 
      ? newsData.slice(0, 8).map(n => `• ${n.title}`).join('\n')
      : 'Güncel ekonomi haberleri mevcut değil.';

    const currentTrend = goldPriceData.trend === 'up' ? 'Yükseliş' : 
                        goldPriceData.trend === 'down' ? 'Düşüş' : 'Yatay';

    // USD/TRY kuru bilgisi
    const usdTryInfo = goldPriceData.usdTry ? 
      `• USD/TRY Kuru: ${goldPriceData.usdTry.sell} TL (${goldPriceData.usdTry.changePercent}%)` :
      '• USD/TRY Kuru: Mevcut değil';

    const prompt = `
Sen altın piyasası uzmanısın. Türkiye'deki altın piyasasını kısa ve net analiz et.

GÜNCEL DURUM:
• Gram Altın: ${goldPriceData.current} TL (${goldPriceData.changePercent}%)
${usdTryInfo}

SON HABERLER:
${newsHeadlines}

ARAŞTIR: TCMB faiz oranları, Fed politikaları, USD/TRY beklentileri, Türkiye enflasyonu.

SADECE bu JSON formatında yanıt ver (kısa ve net):

{
  "trend": "Yükseliş|Düşüş|Yatay",
  "confidence": 0-100,
  "summary": "KISA özet (100 kelime max, güncel verilerle)",
  "factors": [
    {"factor": "Fed Faiz Oranları", "impact": "positive|negative|neutral", "weight": 0-100},
    {"factor": "USD/TRY", "impact": "positive|negative|neutral", "weight": 0-100},
    {"factor": "TCMB Politikaları", "impact": "positive|negative|neutral", "weight": 0-100}
  ],
  "predictions": {
    "short_term": "Mevcut fiyat ${goldPriceData.current} TL. 1-2 hafta içinde ${Math.round(goldPriceData.current * 0.98)}-${Math.round(goldPriceData.current * 1.05)} TL bandında olacak (mevcut fiyata yakın gerçekçi aralık ver)",
    "risk_level": "Düşük|Orta|Yüksek"
  }
}

SADECE JSON, başka açıklama yok.`;

    // Configure generation with grounding
    const config = {
      tools: [groundingTool],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    const generatedText = response.text || '';
    
    // Parse JSON response
    try {
      const cleanText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanText);
      
      return {
        ...analysis,
        lastUpdate: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      return mockAnalysisData;
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return mockAnalysisData;
  }
}

async function getCurrentGoldPrice() {
  try {
    // Direct API call - no network request needed
    const mockRequest = new Request('http://localhost:3000/api/gold');
    const response = await getGoldData(mockRequest);
    const result = await response.json();
    
    if (result.success && result.data.gramGold) {
      // Add trend calculation
      const changePercent = result.data.gramGold.changePercent || 0;
      const trend = changePercent > 0.1 ? 'up' : changePercent < -0.1 ? 'down' : 'sideways';
      
      return {
        current: result.data.gramGold.sell,
        change: result.data.gramGold.change,
        changePercent: changePercent,
        trend: trend,
        usdTry: result.data.usdTry // USD/TRY kuru bilgisi
      };
    }
    
    return {
      current: 4563.13,
      change: 12.5,
      changePercent: 0.27,
      trend: 'up',
      usdTry: null
    };
  } catch (error) {
    console.log('Could not fetch current gold price, using fallback');
    return {
      current: 4563.13,
      change: 12.5,
      changePercent: 0.27,
      trend: 'up',
      usdTry: null
    };
  }
}

export async function GET(request: Request) {
  try {
    // Check for cache clear parameter
    const url = new URL(request.url);
    const clearCache = url.searchParams.get('clearCache') === 'true';
    
    if (clearCache) {
      memoryCache = null;
      console.log('Memory cache cleared manually');
    }

    // Önce database'den bugünkü analizi kontrol et
    if (!clearCache) {
      const todaysAnalysis = await getTodaysAnalysis();
      if (todaysAnalysis) {
        console.log('Returning cached analysis from database');
        return NextResponse.json({
          success: true,
          data: todaysAnalysis,
          source: 'database_cache',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Database'de bugünkü analiz yok, memory cache kontrol et
    if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_DURATION_MS) {
      console.log('Returning cached AI analysis from memory');
      return NextResponse.json({
        success: true,
        data: memoryCache.data,
        source: 'memory_cache',
        timestamp: new Date().toISOString(),
        cacheAge: Math.floor((Date.now() - memoryCache.timestamp) / 1000 / 60) // minutes
      });
    }

    console.log('Generating fresh AI analysis with grounding...');
    
    // Get current data
    const [currentPrice, newsData] = await Promise.all([
      getCurrentGoldPrice(),
      fetchLatestNews()
    ]);

    // Generate analysis with grounding
    const analysisData = await generateGeminiAnalysis(currentPrice, newsData || []);
    
    // Database'e kaydet (günlük cache)
    const dbSaved = await saveAnalysisCache(
      analysisData, 
      currentPrice, 
      newsData || [], 
      'gemini'
    );
    
    // Memory cache'e de kaydet (backup)
    memoryCache = {
      data: analysisData,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: analysisData,
      source: 'gemini-grounded',
      timestamp: new Date().toISOString(),
      inputs: {
        goldPrice: currentPrice.current,
        usdTryRate: currentPrice.usdTry?.sell || 'N/A',
        newsCount: newsData?.length || 0
      },
      dbCached: dbSaved
    });

  } catch (error) {
    console.error('AI Analysis API error:', error);
    
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
      data: mockAnalysisData,
      source: 'mock_fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}
