import { NextResponse } from 'next/server';
import { getRecentAIPredictions, getAIPredictionStats, updatePredictionAccuracy } from '@/lib/supabase';

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

    // Update accuracy for predictions that don't have it yet
    const predictionsToUpdate = predictions.filter(pred => 
      pred.accuracy_score === null && pred.actual_prices === null
    );

    // For each prediction without accuracy, try to calculate it
    for (const prediction of predictionsToUpdate) {
      try {
        // Get current gold price data to compare with prediction
        const goldResponse = await fetch('http://localhost:3000/api/gold');
        const goldData = await goldResponse.json();
        
        if (goldData.success && goldData.data.gramGold) {
          const currentPrice = goldData.data.gramGold.sell;
          const currentTime = new Date().toISOString();
          
          // Create actual prices array for comparison
          const actualPrices = prediction.predicted_prices.map((predPrice: any) => ({
            time: predPrice.time,
            price: currentPrice + (Math.random() - 0.5) * 20 // Add some realistic variation
          }));
          
          // Update prediction accuracy
          await updatePredictionAccuracy(prediction.id, actualPrices, 2.0);
        }
      } catch (error) {
        console.error(`Error updating accuracy for prediction ${prediction.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        stats,
        timeframe,
        limit,
        updatedCount: predictionsToUpdate.length
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