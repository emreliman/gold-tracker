import { createClient } from '@supabase/supabase-js'

// Geçici test için default values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

// Eğer gerçek values yoksa mock client oluştur
export const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database schema types
export interface GoldPriceRecord {
  id?: number
  gram_gold_buy: number
  gram_gold_sell: number
  gram_gold_change_percent: number
  quarter_gold_buy: number
  quarter_gold_sell: number
  quarter_gold_change_percent: number
  half_gold_buy: number
  half_gold_sell: number
  half_gold_change_percent: number
  ons_gold_buy: number
  ons_gold_sell: number
  ons_gold_change_percent: number
  has_gold_buy: number
  has_gold_sell: number
  has_gold_change_percent: number
  // Extended gold types
  full_gold_buy: number
  full_gold_sell: number
  full_gold_change_percent: number
  cumhuriyet_gold_buy: number
  cumhuriyet_gold_sell: number
  cumhuriyet_gold_change_percent: number
  ata_gold_buy: number
  ata_gold_sell: number
  ata_gold_change_percent: number
  ikibuçuk_gold_buy: number
  ikibuçuk_gold_sell: number
  ikibuçuk_gold_change_percent: number
  beşli_gold_buy: number
  beşli_gold_sell: number
  beşli_gold_change_percent: number
  bilezik_14_buy: number
  bilezik_14_sell: number
  bilezik_14_change_percent: number
  bilezik_18_buy: number
  bilezik_18_sell: number
  bilezik_18_change_percent: number
  bilezik_22_buy: number
  bilezik_22_sell: number
  bilezik_22_change_percent: number
  gram_has_gold_buy: number
  gram_has_gold_sell: number
  gram_has_gold_change_percent: number
  usd_try_buy: number
  usd_try_sell: number
  usd_try_change_percent: number
  source: string
  created_at?: string
  updated_at?: string
}

export interface NewsCacheRecord {
  id?: number
  news_data: any[]
  source: string
  cache_date: string
  created_at?: string
  updated_at?: string
}

export interface AnalysisCacheRecord {
  id?: number
  analysis_data: any
  gold_price_snapshot: any
  news_input: any[]
  source: string
  cache_date: string
  created_at?: string
  updated_at?: string
}

export interface AIPredictionRecord {
  id?: number
  prediction_date: string
  prediction_time: string
  timeframe: '24h' | '7d' | '1m'
  current_price: number
  ai_trend: string
  ai_confidence: number
  ai_prediction_text: string
  predicted_prices: any[]
  actual_prices?: any[]
  accuracy_score?: number
  prediction_source: string
  created_at?: string
  updated_at?: string
}

export interface GoldData {
  gramGold: {
    type: string
    buy: number
    sell: number
    change: number
    changePercent: number
  }
  quarterGold: {
    type: string
    buy: number
    sell: number
    change: number
    changePercent: number
  }
  halfGold: {
    type: string
    buy: number
    sell: number
    change: number
    changePercent: number
  }
  onsGold: {
    type: string
    buy: number
    sell: number
    change: number
    changePercent: number
  }
  hasGold: {
    type: string
    buy: number
    sell: number
    change: number
    changePercent: number
  }
  lastUpdate: string
  source: string
}

// 30 dakika = 30 * 60 * 1000 milliseconds
export const CACHE_DURATION_MS = 30 * 60 * 1000

export async function clearGoldPriceCache(): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured, skipping cache clear');
    return false;
  }

  try {
    // Delete all records older than 1 minute to force refresh
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    
    const { error } = await supabase
      .from('gold_prices')
      .delete()
      .lt('created_at', new Date().toISOString()) // Delete all existing records

    if (error) {
      console.error('Error clearing cache:', error)
      return false
    }

    console.log('Gold price cache cleared')
    return true
  } catch (error) {
    console.error('Error clearing cache:', error)
    return false
  }
}

export async function getLatestGoldPrice(skipCache = false): Promise<GoldPriceRecord | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database check');
    return null;
  }

  if (skipCache) {
    console.log('Skipping cache, forcing fresh data');
    return null;
  }

  try {
    const thirtyMinutesAgo = new Date(Date.now() - CACHE_DURATION_MS).toISOString()
    console.log('Checking for gold prices newer than:', thirtyMinutesAgo);
    
    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase error in getLatestGoldPrice:', error)
      return null
    }

    if (data) {
      console.log('Found cached gold price from:', data.created_at);
      return data;
    } else {
      console.log('No cached gold price found in database');
      return null;
    }
  } catch (error) {
    console.error('Error fetching latest gold price:', error)
    return null
  }
}

export async function saveGoldPrice(goldData: any): Promise<GoldPriceRecord | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database save');
    return null;
  }

  try {
    const record: Omit<GoldPriceRecord, 'id' | 'created_at' | 'updated_at'> = {
      // Temel altın türleri
      gram_gold_buy: goldData.gramGold?.buy || 0,
      gram_gold_sell: goldData.gramGold?.sell || 0,
      gram_gold_change_percent: goldData.gramGold?.changePercent || 0,
      quarter_gold_buy: goldData.quarterGold?.buy || 0,
      quarter_gold_sell: goldData.quarterGold?.sell || 0,
      quarter_gold_change_percent: goldData.quarterGold?.changePercent || 0,
      half_gold_buy: goldData.halfGold?.buy || 0,
      half_gold_sell: goldData.halfGold?.sell || 0,
      half_gold_change_percent: goldData.halfGold?.changePercent || 0,
      ons_gold_buy: goldData.onsGold?.buy || 0,
      ons_gold_sell: goldData.onsGold?.sell || 0,
      ons_gold_change_percent: goldData.onsGold?.changePercent || 0,
      has_gold_buy: goldData.hasGold?.buy || 0,
      has_gold_sell: goldData.hasGold?.sell || 0,
      has_gold_change_percent: goldData.hasGold?.changePercent || 0,
      
      // Genişletilmiş altın türleri
      full_gold_buy: goldData.fullGold?.buy || 0,
      full_gold_sell: goldData.fullGold?.sell || 0,
      full_gold_change_percent: goldData.fullGold?.changePercent || 0,
      cumhuriyet_gold_buy: goldData.cumhuriyetGold?.buy || 0,
      cumhuriyet_gold_sell: goldData.cumhuriyetGold?.sell || 0,
      cumhuriyet_gold_change_percent: goldData.cumhuriyetGold?.changePercent || 0,
      ata_gold_buy: goldData.ataGold?.buy || 0,
      ata_gold_sell: goldData.ataGold?.sell || 0,
      ata_gold_change_percent: goldData.ataGold?.changePercent || 0,
      ikibuçuk_gold_buy: goldData.ikibuçukGold?.buy || 0,
      ikibuçuk_gold_sell: goldData.ikibuçukGold?.sell || 0,
      ikibuçuk_gold_change_percent: goldData.ikibuçukGold?.changePercent || 0,
      beşli_gold_buy: goldData.beşliGold?.buy || 0,
      beşli_gold_sell: goldData.beşliGold?.sell || 0,
      beşli_gold_change_percent: goldData.beşliGold?.changePercent || 0,
      bilezik_14_buy: goldData.bilezik14?.buy || 0,
      bilezik_14_sell: goldData.bilezik14?.sell || 0,
      bilezik_14_change_percent: goldData.bilezik14?.changePercent || 0,
      bilezik_18_buy: goldData.bilezik18?.buy || 0,
      bilezik_18_sell: goldData.bilezik18?.sell || 0,
      bilezik_18_change_percent: goldData.bilezik18?.changePercent || 0,
      bilezik_22_buy: goldData.bilezik22?.buy || 0,
      bilezik_22_sell: goldData.bilezik22?.sell || 0,
      bilezik_22_change_percent: goldData.bilezik22?.changePercent || 0,
      gram_has_gold_buy: goldData.gramHasGold?.buy || 0,
      gram_has_gold_sell: goldData.gramHasGold?.sell || 0,
      gram_has_gold_change_percent: goldData.gramHasGold?.changePercent || 0,
      
      // USD/TRY kuru
      usd_try_buy: goldData.usdTry?.buy || 0,
      usd_try_sell: goldData.usdTry?.sell || 0,
      usd_try_change_percent: goldData.usdTry?.changePercent || 0,
      
      source: goldData.source || 'altin.doviz.com'
    }

    const { data, error } = await supabase
      .from('gold_prices')
      .insert([record])
      .select()
      .single()

    if (error) {
      console.error('Error saving gold price:', error)
      return null
    }

    console.log('Gold price saved to database successfully');
    return data
  } catch (error) {
    console.error('Error saving gold price:', error)
    return null
  }
}

export function convertRecordToGoldData(record: GoldPriceRecord): any {
  return {
    // Temel altın türleri
    gramGold: {
      type: 'Gram Altın',
      buy: record.gram_gold_buy,
      sell: record.gram_gold_sell,
      change: record.gram_gold_sell - record.gram_gold_buy,
      changePercent: record.gram_gold_change_percent
    },
    quarterGold: {
      type: 'Çeyrek Altın',
      buy: record.quarter_gold_buy,
      sell: record.quarter_gold_sell,
      change: record.quarter_gold_sell - record.quarter_gold_buy,
      changePercent: record.quarter_gold_change_percent
    },
    halfGold: {
      type: 'Yarım Altın',
      buy: record.half_gold_buy,
      sell: record.half_gold_sell,
      change: record.half_gold_sell - record.half_gold_buy,
      changePercent: record.half_gold_change_percent
    },
    onsGold: {
      type: 'Ons Altın',
      buy: record.ons_gold_buy,
      sell: record.ons_gold_sell,
      change: record.ons_gold_sell - record.ons_gold_buy,
      changePercent: record.ons_gold_change_percent
    },
    hasGold: {
      type: 'Has Altın',
      buy: record.has_gold_buy,
      sell: record.has_gold_sell,
      change: record.has_gold_sell - record.has_gold_buy,
      changePercent: record.has_gold_change_percent
    },
    
    // Genişletilmiş altın türleri
    fullGold: {
      type: 'Tam Altın',
      buy: record.full_gold_buy,
      sell: record.full_gold_sell,
      change: record.full_gold_sell - record.full_gold_buy,
      changePercent: record.full_gold_change_percent
    },
    cumhuriyetGold: {
      type: 'Cumhuriyet Altını',
      buy: record.cumhuriyet_gold_buy,
      sell: record.cumhuriyet_gold_sell,
      change: record.cumhuriyet_gold_sell - record.cumhuriyet_gold_buy,
      changePercent: record.cumhuriyet_gold_change_percent
    },
    ataGold: {
      type: 'Ata Altın',
      buy: record.ata_gold_buy,
      sell: record.ata_gold_sell,
      change: record.ata_gold_sell - record.ata_gold_buy,
      changePercent: record.ata_gold_change_percent
    },
    ikibuçukGold: {
      type: 'İkibuçuk Altın',
      buy: record.ikibuçuk_gold_buy,
      sell: record.ikibuçuk_gold_sell,
      change: record.ikibuçuk_gold_sell - record.ikibuçuk_gold_buy,
      changePercent: record.ikibuçuk_gold_change_percent
    },
    beşliGold: {
      type: 'Beşli Altın',
      buy: record.beşli_gold_buy,
      sell: record.beşli_gold_sell,
      change: record.beşli_gold_sell - record.beşli_gold_buy,
      changePercent: record.beşli_gold_change_percent
    },
    bilezik14: {
      type: '14 Ayar Bilezik',
      buy: record.bilezik_14_buy,
      sell: record.bilezik_14_sell,
      change: record.bilezik_14_sell - record.bilezik_14_buy,
      changePercent: record.bilezik_14_change_percent
    },
    bilezik18: {
      type: '18 Ayar Bilezik',
      buy: record.bilezik_18_buy,
      sell: record.bilezik_18_sell,
      change: record.bilezik_18_sell - record.bilezik_18_buy,
      changePercent: record.bilezik_18_change_percent
    },
    bilezik22: {
      type: '22 Ayar Bilezik',
      buy: record.bilezik_22_buy,
      sell: record.bilezik_22_sell,
      change: record.bilezik_22_sell - record.bilezik_22_buy,
      changePercent: record.bilezik_22_change_percent
    },
    gramHasGold: {
      type: 'Gram Has Altın',
      buy: record.gram_has_gold_buy,
      sell: record.gram_has_gold_sell,
      change: record.gram_has_gold_sell - record.gram_has_gold_buy,
      changePercent: record.gram_has_gold_change_percent
    },
    
    // USD/TRY kuru
    usdTry: {
      type: 'USD/TRY',
      buy: record.usd_try_buy,
      sell: record.usd_try_sell,
      change: record.usd_try_sell - record.usd_try_buy,
      changePercent: record.usd_try_change_percent
    },
    
    lastUpdate: record.created_at || new Date().toISOString(),
    source: record.source
  }
}

// News Cache Functions
export async function getTodaysNews(): Promise<any[] | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping news cache check');
    return null;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('news_cache')
      .select('news_data')
      .eq('cache_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching news cache:', error);
      return null;
    }

    return data?.news_data || null;
  } catch (error) {
    console.error('Error fetching news cache:', error);
    return null;
  }
}

export async function saveNewsCache(newsData: any[], source: string = 'newsapi'): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured, skipping news cache save');
    return false;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { error } = await supabase
      .from('news_cache')
      .insert([{
        news_data: newsData,
        source: source,
        cache_date: today
      }]);

    if (error) {
      console.error('Error saving news cache:', error);
      return false;
    }

    console.log('News cache saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving news cache:', error);
    return false;
  }
}

// Analysis Cache Functions
export async function getTodaysAnalysis(): Promise<any | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping analysis cache check');
    return null;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('analysis_cache')
      .select('analysis_data')
      .eq('cache_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching analysis cache:', error);
      return null;
    }

    return data?.analysis_data || null;
  } catch (error) {
    console.error('Error fetching analysis cache:', error);
    return null;
  }
}

export async function saveAnalysisCache(
  analysisData: any, 
  goldPriceSnapshot: any, 
  newsInput: any[], 
  source: string = 'gemini'
): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured, skipping analysis cache save');
    return false;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { error } = await supabase
      .from('analysis_cache')
      .insert([{
        analysis_data: analysisData,
        gold_price_snapshot: goldPriceSnapshot,
        news_input: newsInput,
        source: source,
        cache_date: today
      }]);

    if (error) {
      console.error('Error saving analysis cache:', error);
      return false;
    }

    console.log('Analysis cache saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving analysis cache:', error);
    return false;
  }
}

// AI Predictions Functions
export async function saveAIPrediction(
  predictionData: Omit<AIPredictionRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<AIPredictionRecord | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping AI prediction save');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert([predictionData])
      .select()
      .single();

    if (error) {
      console.error('Error saving AI prediction:', error);
      return null;
    }

    console.log('AI prediction saved successfully');
    return data;
  } catch (error) {
    console.error('Error saving AI prediction:', error);
    return null;
  }
}

export async function getRecentAIPredictions(
  timeframe: '24h' | '7d' | '1m',
  limit: number = 10
): Promise<AIPredictionRecord[]> {
  if (!supabase) {
    console.log('Supabase not configured, skipping AI predictions fetch');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('timeframe', timeframe)
      .order('prediction_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching AI predictions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching AI predictions:', error);
    return [];
  }
}

export async function getAIPredictionStats(): Promise<any> {
  if (!supabase) {
    console.log('Supabase not configured, skipping AI prediction stats');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('ai_prediction_stats')
      .select('*');

    if (error) {
      console.error('Error fetching AI prediction stats:', error);
      return null;
  }

    return data;
  } catch (error) {
    console.error('Error fetching AI prediction stats:', error);
    return null;
  }
}

export async function updatePredictionAccuracy(
  predictionId: number,
  actualPrices: any[]
): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured, skipping accuracy update');
    return false;
  }

  try {
    // Get the prediction to calculate accuracy
    const { data: prediction, error: fetchError } = await supabase
      .from('ai_predictions')
      .select('predicted_prices')
      .eq('id', predictionId)
      .single();

    if (fetchError) {
      console.error('Error fetching prediction for accuracy calculation:', fetchError);
      return false;
    }

    // Calculate accuracy using the database function
    const { data: accuracyResult, error: accuracyError } = await supabase
      .rpc('calculate_prediction_accuracy', {
        predicted_prices: prediction.predicted_prices,
        actual_prices: actualPrices
      });

    if (accuracyError) {
      console.error('Error calculating accuracy:', accuracyError);
      return false;
    }

    // Update the prediction with actual prices and accuracy
    const { error: updateError } = await supabase
      .from('ai_predictions')
      .update({
        actual_prices: actualPrices,
        accuracy_score: accuracyResult
      })
      .eq('id', predictionId);

    if (updateError) {
      console.error('Error updating prediction accuracy:', updateError);
      return false;
    }

    console.log(`Prediction accuracy updated: ${accuracyResult}%`);
    return true;
  } catch (error) {
    console.error('Error updating prediction accuracy:', error);
    return false;
  }
}
