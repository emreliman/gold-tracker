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
  source: string
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

export async function getLatestGoldPrice(): Promise<GoldPriceRecord | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database check');
    return null;
  }

  try {
    const thirtyMinutesAgo = new Date(Date.now() - CACHE_DURATION_MS).toISOString()
    
    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching latest gold price:', error)
    return null
  }
}

export async function saveGoldPrice(goldData: GoldData): Promise<GoldPriceRecord | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database save');
    return null;
  }

  try {
    const record: Omit<GoldPriceRecord, 'id' | 'created_at' | 'updated_at'> = {
      gram_gold_buy: goldData.gramGold.buy,
      gram_gold_sell: goldData.gramGold.sell,
      gram_gold_change_percent: goldData.gramGold.changePercent,
      quarter_gold_buy: goldData.quarterGold.buy,
      quarter_gold_sell: goldData.quarterGold.sell,
      quarter_gold_change_percent: goldData.quarterGold.changePercent,
      half_gold_buy: goldData.halfGold.buy,
      half_gold_sell: goldData.halfGold.sell,
      half_gold_change_percent: goldData.halfGold.changePercent,
      ons_gold_buy: goldData.onsGold.buy,
      ons_gold_sell: goldData.onsGold.sell,
      ons_gold_change_percent: goldData.onsGold.changePercent,
      has_gold_buy: goldData.hasGold.buy,
      has_gold_sell: goldData.hasGold.sell,
      has_gold_change_percent: goldData.hasGold.changePercent,
      source: goldData.source
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

    return data
  } catch (error) {
    console.error('Error saving gold price:', error)
    return null
  }
}

export function convertRecordToGoldData(record: GoldPriceRecord): GoldData {
  return {
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
    lastUpdate: record.created_at || new Date().toISOString(),
    source: record.source
  }
}
