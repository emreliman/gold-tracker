import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeframe') || '24h';
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: 'Using mock data instead'
      }, { status: 503 });
    }

    let startDate: Date;
    const now = new Date();
    
    // Calculate date range based on timeframe
    switch (timeFrame) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Query historical data
    const { data, error } = await supabase
      .from('gold_prices')
      .select('gram_gold_sell, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Historical data query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch historical data',
        details: error.message
      }, { status: 500 });
    }

    // Format data for chart
    const chartData = data.map(record => ({
      time: record.created_at,
      price: record.gram_gold_sell
    }));

    // Calculate statistics
    const prices = chartData.map(d => d.price);
    const stats = {
      high: Math.max(...prices),
      low: Math.min(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      count: prices.length
    };

    return NextResponse.json({
      success: true,
      data: chartData,
      stats: {
        high: Math.round(stats.high * 100) / 100,
        low: Math.round(stats.low * 100) / 100,
        average: Math.round(stats.average * 100) / 100,
        volatility: Math.round(((stats.high - stats.low) / stats.average) * 10000) / 100,
        dataPoints: stats.count
      },
      timeframe: timeFrame,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Historical API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
