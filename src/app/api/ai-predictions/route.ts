import { NextResponse } from 'next/server';
import { getRecentAIPredictions, getAIPredictionStats } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') as '24h' | '7d' | '1m' || '24h';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Get recent predictions and stats
    const [predictions, stats] = await Promise.all([
      getRecentAIPredictions(timeframe, limit),
      getAIPredictionStats()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        stats,
        timeframe,
        limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Predictions API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}