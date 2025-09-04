'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { saveAIPrediction, getRecentAIPredictions, getAIPredictionStats, AIPredictionRecord } from '@/lib/supabase';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  time: string;
  price: number;
}

interface AIPrediction {
  trend: string;
  confidence: number;
  predictions: {
    short_term: string;
    risk_level: string;
    medium_term?: string;
    key_levels?: string;
  };
}

// Test function to create sample historical predictions for debugging
const createTestHistoricalPredictions = (): AIPredictionRecord[] => {
  const now = new Date();
  const testPredictions: AIPredictionRecord[] = [
    {
      id: 1,
      prediction_date: now.toISOString().split('T')[0],
      prediction_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      timeframe: '24h',
      current_price: 4563.13,
      ai_trend: 'Yükseliş',
      ai_confidence: 75,
      ai_prediction_text: 'Mevcut fiyat 4563.13 TL. 1-2 hafta içinde 4600-4700 TL bandında olacak',
      predicted_prices: [
        { time: '14:00', price: 4565.50 },
        { time: '15:00', price: 4568.20 },
        { time: '16:00', price: 4570.80 },
        { time: '17:00', price: 4573.40 },
        { time: '18:00', price: 4576.10 },
        { time: '19:00', price: 4578.90 }
      ],
      actual_prices: [
        { time: '14:00', price: 4564.20 },
        { time: '15:00', price: 4567.80 },
        { time: '16:00', price: 4569.50 },
        { time: '17:00', price: 4572.10 },
        { time: '18:00', price: 4574.80 },
        { time: '19:00', price: 4577.30 }
      ],
      accuracy_score: 85.5,
      prediction_source: 'gemini',
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      prediction_date: now.toISOString().split('T')[0],
      prediction_time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      timeframe: '24h',
      current_price: 4560.00,
      ai_trend: 'Düşüş',
      ai_confidence: 60,
      ai_prediction_text: 'Mevcut fiyat 4560.00 TL. 1-2 hafta içinde 4540-4560 TL bandında olacak',
      predicted_prices: [
        { time: '12:00', price: 4558.50 },
        { time: '13:00', price: 4556.20 },
        { time: '14:00', price: 4554.80 },
        { time: '15:00', price: 4552.40 },
        { time: '16:00', price: 4550.10 },
        { time: '17:00', price: 4548.90 }
      ],
      actual_prices: [
        { time: '12:00', price: 4559.20 },
        { time: '13:00', price: 4557.80 },
        { time: '14:00', price: 4555.50 },
        { time: '15:00', price: 4553.10 },
        { time: '16:00', price: 4550.80 },
        { time: '17:00', price: 4549.30 }
      ],
      accuracy_score: 78.2,
      prediction_source: 'gemini',
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return testPredictions;
};

export default function PriceChart() {
  const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '1m'>('24h');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [historicalPredictions, setHistoricalPredictions] = useState<AIPredictionRecord[]>([]);
  const [predictionStats, setPredictionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    high: 0,
    low: 0,
    average: 0,
    volatility: 0
  });

  // Generate mock historical data OR fetch from API
  const generateMockData = (timeFrame: '24h' | '7d' | '1m') => {
    const now = new Date();
    const data: ChartData[] = [];
    
    let points: number;
    let intervalMs: number;
    let basePrice = 4563.13; // Current gold price
    
    switch (timeFrame) {
      case '24h':
        points = 24;
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case '7d':
        points = 7;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1m':
        points = 30;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
    }

    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * intervalMs));
      const volatility = Math.random() * 40 - 20; // ±20 TL volatility
      const price = basePrice + volatility + (Math.sin(i * 0.5) * 15);
      
      data.push({
        time: timeFrame === '24h' ? 
          time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) :
          time.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        price: Math.round(price * 100) / 100
      });
    }

    return data;
  };

  // Generate AI prediction data based on current trend and confidence
  const generateAIPredictionData = (historicalData: ChartData[], prediction: AIPrediction) => {
    if (!prediction || historicalData.length === 0) return null;
    
    const lastPrice = historicalData[historicalData.length - 1].price;
    const confidence = prediction.confidence / 100;
    const trend = prediction.trend.toLowerCase();
    
    // Analyze historical data to understand current volatility and trend
    const analyzeHistoricalTrend = (data: ChartData[]) => {
      if (data.length < 3) return { volatility: 0.02, trendStrength: 0, avgChange: 0 };
      
      const prices = data.map(d => d.price);
      const changes = [];
      
      for (let i = 1; i < prices.length; i++) {
        const change = (prices[i] - prices[i-1]) / prices[i-1];
        changes.push(change);
      }
      
      const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
      const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length);
      const trendStrength = Math.abs(avgChange);
      
      return { volatility, trendStrength, avgChange };
    };
    
    const historicalAnalysis = analyzeHistoricalTrend(historicalData);
    console.log('Historical Analysis:', {
      volatility: historicalAnalysis.volatility,
      trendStrength: historicalAnalysis.trendStrength,
      avgChange: historicalAnalysis.avgChange,
      lastPrice
    });
    
    // Parse short term prediction for target price range
    const shortTermPrediction = prediction.predictions.short_term;
    let targetPriceRange: { min: number; max: number } | null = null;
    
    // Extract price range from AI prediction text (e.g., "4600-4700 TL bandında")
    const priceRangeMatch = shortTermPrediction.match(/(\d{3,4}(?:\.\d+)?)-(\d{3,4}(?:\.\d+)?)/);
    if (priceRangeMatch) {
      const minPrice = parseFloat(priceRangeMatch[1]);
      const maxPrice = parseFloat(priceRangeMatch[2]);
      
      // Validate that the price range makes sense
      if (minPrice > 1000 && maxPrice > 1000 && maxPrice > minPrice) {
        targetPriceRange = { min: minPrice, max: maxPrice };
        console.log('AI Price Range detected:', targetPriceRange);
      }
    }
    
    // Generate future data points based on AI prediction
    const futurePoints = timeFrame === '24h' ? 6 : timeFrame === '7d' ? 3 : 5;
    const predictionData: ChartData[] = [];
    
    for (let i = 1; i <= futurePoints; i++) {
      const time = new Date();
      let futureTime: Date;
      
      if (timeFrame === '24h') {
        futureTime = new Date(time.getTime() + (i * 60 * 60 * 1000)); // +1 hour
      } else {
        futureTime = new Date(time.getTime() + (i * 24 * 60 * 60 * 1000)); // +1 day
      }
      
      // Calculate predicted price based on AI analysis and historical data
      let predictedPrice: number;
      
      if (targetPriceRange) {
        // Use AI's specific price range prediction but respect historical volatility
        const progress = i / futurePoints; // 0 to 1
        
        // Calculate realistic target based on historical volatility
        const maxHistoricalChange = historicalAnalysis.volatility * 3; // Max 3x historical volatility
        const aiTargetChange = (targetPriceRange.max - lastPrice) / lastPrice;
        const realisticTargetChange = Math.min(Math.abs(aiTargetChange), maxHistoricalChange) * Math.sign(aiTargetChange);
        
        const realisticTarget = lastPrice * (1 + realisticTargetChange);
        const targetPrice = lastPrice + (realisticTarget - lastPrice) * progress;
        
        // Smooth transition with confidence
        const transitionFactor = Math.min(progress * 1.2, 1);
        predictedPrice = lastPrice + (targetPrice - lastPrice) * transitionFactor * confidence;
      } else {
        // Fallback to trend-based prediction using historical data
        const baseVolatility = historicalAnalysis.volatility || 0.02; // Default 2% volatility
        const trendDirection = historicalAnalysis.avgChange > 0 ? 1 : historicalAnalysis.avgChange < 0 ? -1 : 0;
        
        // Calculate realistic change based on historical patterns
        const daysAhead = timeFrame === '24h' ? i / 24 : i; // Convert to days
        const realisticChange = trendDirection * baseVolatility * daysAhead * confidence;
        
        predictedPrice = lastPrice * (1 + realisticChange);
      }
      
      // Add realistic noise based on historical volatility
      const noise = (Math.random() - 0.5) * historicalAnalysis.volatility * lastPrice * (1 - confidence);
      predictedPrice += noise;
      
      // Ensure price doesn't go below reasonable minimum (max 10% drop)
      predictedPrice = Math.max(predictedPrice, lastPrice * 0.9);
      
      // Ensure price doesn't go above reasonable maximum (max 15% increase)
      predictedPrice = Math.min(predictedPrice, lastPrice * 1.15);
      
      predictionData.push({
        time: timeFrame === '24h' ? 
          futureTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) :
          futureTime.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        price: Math.round(predictedPrice * 100) / 100
      });
    }
    
    return predictionData;
  };

  const fetchHistoricalData = async (timeFrame: '24h' | '7d' | '1m') => {
    try {
      const response = await fetch(`/api/historical?timeframe=${timeFrame}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Format API data for chart
        const formattedData = result.data.map((item: any) => {
          const date = new Date(item.time);
          return {
            time: timeFrame === '24h' ? 
              date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) :
              date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
            price: item.price
          };
        });
        
        return {
          data: formattedData,
          stats: result.stats,
          source: 'database'
        };
      } else {
        // Fallback to mock data
        console.log('Using mock data - no historical data available');
        return {
          data: generateMockData(timeFrame),
          stats: null,
          source: 'mock'
        };
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return {
        data: generateMockData(timeFrame),
        stats: null,
        source: 'mock'
      };
    }
  };

  const fetchAIAnalysis = async () => {
    try {
      const response = await fetch('/api/analysis');
      const result = await response.json();
      
      if (result.success && result.data) {
        setAiPrediction(result.data);
        
        // Save AI prediction to database
        if (chartData.length > 0) {
          const predictionData = generateAIPredictionData(chartData, result.data);
          if (predictionData) {
            await saveAIPrediction({
              prediction_date: new Date().toISOString().split('T')[0],
              prediction_time: new Date().toISOString(),
              timeframe: timeFrame,
              current_price: chartData[chartData.length - 1].price,
              ai_trend: result.data.trend,
              ai_confidence: result.data.confidence,
              ai_prediction_text: result.data.predictions.short_term,
              predicted_prices: predictionData,
              prediction_source: 'gemini'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
    }
  };

  const fetchHistoricalPredictions = async () => {
    try {
      // For testing, use mock data if no real predictions exist
      const testPredictions = createTestHistoricalPredictions();
      
      // Try to fetch from API first
      try {
        const response = await fetch(`/api/ai-predictions?timeframe=${timeFrame}&limit=5`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.predictions.length > 0) {
          console.log('Real historical predictions loaded:', result.data.predictions);
          console.log('Prediction stats:', result.data.stats);
          setHistoricalPredictions(result.data.predictions);
          setPredictionStats(result.data.stats);
        } else {
          // Use test data if no real predictions
          console.log('Using test historical predictions');
          setHistoricalPredictions(testPredictions);
          setPredictionStats([
            {
              timeframe: '24h',
              total_predictions: 2,
              avg_accuracy: 81.85,
              avg_confidence: 67.5,
              high_accuracy_count: 1,
              medium_accuracy_count: 1,
              low_accuracy_count: 0
            }
          ]);
        }
      } catch (apiError) {
        console.log('API error, using test data:', apiError);
        setHistoricalPredictions(testPredictions);
        setPredictionStats([
          {
            timeframe: '24h',
            total_predictions: 2,
            avg_accuracy: 81.85,
            avg_confidence: 67.5,
            high_accuracy_count: 1,
            medium_accuracy_count: 1,
            low_accuracy_count: 0
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching historical predictions:', error);
    }
  };

  const calculateStats = (data: ChartData[]) => {
    if (data.length === 0) return { high: 0, low: 0, average: 0, volatility: 0 };
    
    const prices = data.map(d => d.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const volatility = ((high - low) / average) * 100;
    
    return {
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      average: Math.round(average * 100) / 100,
      volatility: Math.round(volatility * 100) / 100
    };
  };

  useEffect(() => {
    setLoading(true);
    console.log(`Loading chart data for timeframe: ${timeFrame}`);
    
    // Fetch both historical data and AI analysis
    Promise.all([
      fetchHistoricalData(timeFrame),
      fetchAIAnalysis(),
      fetchHistoricalPredictions()
    ]).then(([historicalResult]) => {
      console.log(`Chart data loaded:`, historicalResult);
      setChartData(historicalResult.data);
      
      if (historicalResult.stats) {
        setStats(historicalResult.stats);
      } else {
        setStats(calculateStats(historicalResult.data));
      }
      
      setLoading(false);
    });
  }, [timeFrame]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#F9FAFB',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(34, 28, 17, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#eca413',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            return `${label}: ${context.parsed.y.toFixed(2)} TL`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(72, 60, 35, 0.5)',
        },
        ticks: {
          color: '#9CA3AF',
          maxTicksLimit: timeFrame === '24h' ? 8 : 10,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(72, 60, 35, 0.5)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return value.toFixed(2) + ' TL';
          }
        },
      },
    },
  };

  // Generate AI prediction data
  const aiPredictionData = aiPrediction ? generateAIPredictionData(chartData, aiPrediction) : null;
  
  // Combine historical and prediction data
  const allLabels = [...chartData.map(d => d.time)];
  if (aiPredictionData) {
    allLabels.push(...aiPredictionData.map(d => d.time));
  }

  // Create datasets array
  const datasets = [
    {
      label: 'Gerçek Fiyat',
      data: chartData.map(d => d.price),
      borderColor: '#eca413',
      backgroundColor: 'rgba(236, 164, 19, 0.1)',
      borderWidth: 2,
      fill: true,
      pointBackgroundColor: '#eca413',
      pointBorderColor: '#221c11',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
    }
  ];

  // Add current AI prediction
  if (aiPredictionData && aiPrediction) {
    datasets.push({
      label: `AI Tahmin (${aiPrediction.confidence}% güven)`,
      data: [...Array(chartData.length).fill(null), ...aiPredictionData.map(d => d.price)],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#221c11',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
    } as any);
  }

  // Add historical predictions (completed ones with accuracy)
  historicalPredictions
    .filter(pred => pred.accuracy_score !== null && pred.accuracy_score !== undefined)
    .slice(0, 3) // Show max 3 historical predictions
    .forEach((historicalPred, index) => {
      const colors = ['#8B5CF6', '#F59E0B', '#EF4444']; // Purple, Orange, Red
      const color = colors[index % colors.length];
      
      // Show historical prediction data that overlaps with current chart data
      const historicalPredictionData = historicalPred.predicted_prices.map((p: any) => p.price);
      const historicalLabels = historicalPred.predicted_prices.map((p: any) => p.time);
      
      // Create data array that aligns with current chart labels
      const alignedData = allLabels.map(label => {
        // For 24h timeframe, we need to handle different time formats
        if (timeFrame === '24h') {
          // For 24h, show historical predictions that were made recently
          const predictionDate = new Date(historicalPred.prediction_time);
          const now = new Date();
          const hoursSincePrediction = (now.getTime() - predictionDate.getTime()) / (1000 * 60 * 60);
          
          // If prediction was made within last 24 hours, show it
          if (hoursSincePrediction <= 24) {
            // Map historical prediction to current chart timeline
            const historicalIndex = Math.floor(hoursSincePrediction);
            if (historicalIndex < historicalPredictionData.length) {
              return historicalPredictionData[historicalIndex];
            }
          }
        } else {
          // For other timeframes, try direct matching
          const matchingIndex = historicalLabels.findIndex(hLabel => hLabel === label);
          return matchingIndex >= 0 ? historicalPredictionData[matchingIndex] : null;
        }
        return null;
      });
      
      // Only show if there's overlapping data
      const hasOverlappingData = alignedData.some(price => price !== null);
      
      if (hasOverlappingData) {
        datasets.push({
          label: `Geçmiş Tahmin ${index + 1} (${historicalPred.accuracy_score?.toFixed(1)}% doğruluk)`,
          data: alignedData,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 1,
          borderDash: [3, 3],
          fill: false,
          pointBackgroundColor: color,
          pointBorderColor: '#221c11',
          pointBorderWidth: 1,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.4,
        } as any);
      }
    });

  const data = {
    labels: allLabels,
    datasets: datasets,
  };

  const timeFrameLabels = {
    '24h': '24 Saat',
    '7d': '7 Gün', 
    '1m': '1 Ay'
  };

  return (
    <div className="bg-[#221c11] rounded-xl shadow-xl p-6 border border-[#483c23]" id="chart">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Altın Fiyat Grafiği</h2>
        <div className="flex space-x-2">
          {(['24h', '7d', '1m'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeFrame === tf
                  ? 'bg-[#eca413] text-[#221c11] font-medium'
                  : 'bg-[#332b19] text-gray-300 hover:bg-[#483c23] border border-[#483c23]'
              }`}
            >
              {timeFrameLabels[tf]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 mb-6">
        {loading ? (
          <div className="h-full bg-[#332b19] rounded-xl flex items-center justify-center border border-[#483c23]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#eca413] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-400">Grafik yükleniyor...</p>
            </div>
          </div>
        ) : (
          <Line data={data} options={chartOptions} />
        )}
      </div>

      {/* AI Prediction Info */}
      {aiPrediction && (
        <div className="mb-4 p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-green-400">AI Tahmin</span>
            <span className="text-xs text-gray-400">({aiPrediction.confidence}% güven)</span>
          </div>
          <div className="text-sm text-gray-300">
            <span className="text-gray-400">Trend:</span> {aiPrediction.trend} | 
            <span className="text-gray-400 ml-2">Kısa Vade:</span> {aiPrediction.predictions.short_term} | 
            <span className="text-gray-400 ml-2">Risk:</span> {aiPrediction.predictions.risk_level}
          </div>
        </div>
      )}

      {/* AI Prediction Stats */}
      {predictionStats && predictionStats.length > 0 && (
        <div className="mb-4 p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium text-blue-400">AI Tahmin İstatistikleri</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {predictionStats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-gray-400">{stat.timeframe === '24h' ? '24 Saat' : 
                  stat.timeframe === '7d' ? '7 Gün' : '1 Ay'}</div>
                <div className="font-semibold text-green-400">{stat.avg_accuracy?.toFixed(1) || 'N/A'}%</div>
                <div className="text-gray-500">{stat.total_predictions} tahmin</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="text-sm text-gray-400">En Yüksek</div>
          <div className="font-semibold text-green-400">{stats.high.toFixed(2)} TL</div>
        </div>
        <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="text-sm text-gray-400">En Düşük</div>
          <div className="font-semibold text-red-400">{stats.low.toFixed(2)} TL</div>
        </div>
        <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="text-sm text-gray-400">Ortalama</div>
          <div className="font-semibold text-white">{stats.average.toFixed(2)} TL</div>
        </div>
        <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="text-sm text-gray-400">Volatilite</div>
          <div className="font-semibold text-[#eca413]">{stats.volatility.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
