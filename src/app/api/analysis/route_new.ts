import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Gemini AI client with grounding
const ai = new GoogleGenAI({});

// Define the grounding tool for real-time data
const groundingTool = {
  googleSearch: {},
};

// Cache duration: 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000;

// In-memory cache for AI analysis
let analysisCache: { data: any; timestamp: number } | null = null;

// Mock analysis data (fallback when API unavailable)
const mockAnalysisData = {
  trend: "Yükseliş",
  confidence: 75,
  summary: "Altın fiyatları Fed politika belirsizliği ve jeopolitik riskler nedeniyle yükseliş trendinde. Gram altın 4.563 TL seviyesinde güçlü destek buluyor. USD/TRY paritesindeki artış da altın talebini destekliyor. Kısa vadede 4.700 TL hedefi mümkün.",
  factors: [
    { factor: "Fed Faiz Kararları", impact: "positive", weight: 85 },
    { factor: "USD/TRY Paritesi", impact: "positive", weight: 80 },
    { factor: "TCMB Politikaları", impact: "neutral", weight: 70 },
    { factor: "Küresel Riskler", impact: "positive", weight: 80 },
    { factor: "Türkiye Enflasyonu", impact: "positive", weight: 75 }
  ],
  predictions: {
    short_term: "4.600-4.700 TL bandında",
    medium_term: "Yükseliş devam edebilir",
    risk_level: "Orta",
    key_levels: "Destek: 4.500 TL, Direnç: 4.700 TL"
  },
  sentiment: {
    bullish: 75,
    neutral: 15,
    bearish: 10
  },
  turkey_specific: {
    inflation_hedge: "Yüksek enflasyon ortamında güçlü koruma sağlıyor",
    currency_impact: "TL zayıflaması altın talebini artırıyor",
    local_demand: "Güçlü, yatırımcı ilgisi yüksek"
  },
  lastUpdate: new Date().toISOString()
};

async function fetchLatestNews() {
  try {
    const response = await fetch('http://localhost:3001/api/news');
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
Sen uzman bir altın piyasası analistisin ve Türkiye'deki altın piyasasını analiz ediyorsun.

MEVCUT DURUM:
• Gram Altın Fiyatı: ${goldPriceData.current} TL
• Günlük Değişim: ${goldPriceData.change} TL (${goldPriceData.changePercent}%)
• Mevcut Trend: ${currentTrend}
${usdTryInfo}

SON EKONOMİ HABERLERİ (ABD ve Küresel):
${newsHeadlines}

GÜNCEL VERİ ARAŞTIRMASI GEREKEN FAKTÖRLER:
• TCMB güncel faiz oranları ve son kararları
• Fed'in son faiz oranı ve yaklaşan toplantı tarihleri  
• Türkiye'nin güncel enflasyon oranı (son TÜIK verisi)
• ABD'nin güncel enflasyon verisi (CPI/PCE)
• Dolar endeksi (DXY) son değeri
• Türkiye'deki güncel jeopolitik durumlar
• Küresel risk iştahı ve güvenli liman talebi

TÜRKİYE'YE ÖZGÜ FAKTÖRLER:
• USD/TRY döviz kuru etkisi ve beklentiler
• TCMB faiz politikaları ve rezerv durumu
• Türkiye'deki enflasyon oranları ve beklentiler
• Jeopolitik konumu ve bölgesel riskler
• Türk vatandaşlarının altına yönelim trendi
• Vergi düzenlemeleri ve mevzuat değişiklikleri

KÜRESEL FAKTÖRLER:
• Fed faiz oranları ve politika beklentileri
• ABD enflasyon verileri ve Fed'in hedefleri
• Küresel jeopolitik riskler ve çatışmalar
• Dolar endeksi (DXY) performansı ve trend
• Merkez bankalarının altın rezerv politikaları

Yukarıdaki güncel veri araştırması gereken faktörleri internetten araştırarak güncel bilgileri topla ve bu kapsamlı bilgiyi kullanarak Türkiye'deki yatırımcılar için profesyonel bir analiz yap. 

SADECE aşağıdaki JSON formatında yanıt ver:

{
  "trend": "Yükseliş|Düşüş|Yatay",
  "confidence": 0-100 arası güven skoru,
  "summary": "Türkiye odaklı kısa analiz özeti (200 kelime max, güncel verilerle desteklenmiş)",
  "factors": [
    {"factor": "Fed Faiz Oranları", "impact": "positive|negative|neutral", "weight": 0-100},
    {"factor": "USD/TRY Paritesi", "impact": "positive|negative|neutral", "weight": 0-100},
    {"factor": "TCMB Politikaları", "impact": "positive|negative|neutral", "weight": 0-100},
    {"factor": "Küresel Riskler", "impact": "positive|negative|neutral", "weight": 0-100},
    {"factor": "Türkiye Enflasyonu", "impact": "positive|negative|neutral", "weight": 0-100}
  ],
  "predictions": {
    "short_term": "1-2 haftalık tahmin (TL bazında, güncel verilere dayalı)",
    "medium_term": "1-3 aylık tahmin (güncel ekonomik göstergelerle)", 
    "risk_level": "Düşük|Orta|Yüksek",
    "key_levels": "Önemli destek ve direnç seviyeleri (güncel teknik analiz)"
  },
  "sentiment": {
    "bullish": 0-100,
    "neutral": 0-100,
    "bearish": 0-100
  },
  "turkey_specific": {
    "inflation_hedge": "Enflasyona karşı koruma değerlendirmesi (güncel enflasyon verisiyle)",
    "currency_impact": "TL zayıflaması etkisi (güncel USD/TRY ile)",
    "local_demand": "Yerel talep durumu (güncel piyasa koşullarıyla)"
  }
}

SADECE JSON yanıtı ver, başka açıklama ekleme.`;

    // Configure generation with grounding
    const config = {
      tools: [groundingTool],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
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
    const response = await fetch('http://localhost:3001/api/gold');
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

export async function GET() {
  try {
    // Check cache first
    if (analysisCache && Date.now() - analysisCache.timestamp < CACHE_DURATION_MS) {
      console.log('Returning cached AI analysis');
      return NextResponse.json({
        success: true,
        data: analysisCache.data,
        source: 'cache',
        timestamp: new Date().toISOString(),
        cacheAge: Math.floor((Date.now() - analysisCache.timestamp) / 1000 / 60) // minutes
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
    
    // Update cache
    analysisCache = {
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
      }
    });

  } catch (error) {
    console.error('AI Analysis API error:', error);
    
    // Return cached data if available, otherwise mock data
    const fallbackData = analysisCache?.data || mockAnalysisData;
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 with fallback data
  }
}
