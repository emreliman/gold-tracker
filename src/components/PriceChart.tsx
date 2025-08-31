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

export default function PriceChart() {
  const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '1m'>('24h');
  const [chartData, setChartData] = useState<ChartData[]>([]);
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
    
    // Fetch historical data from API or use mock data
    fetchHistoricalData(timeFrame).then(result => {
      console.log(`Chart data loaded:`, result);
      setChartData(result.data);
      
      if (result.stats) {
        setStats(result.stats);
      } else {
        setStats(calculateStats(result.data));
      }
      
      setLoading(false);
    });
  }, [timeFrame]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            return `Gram Altın: ${context.parsed.y.toFixed(2)} TL`;
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

  const data = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: 'Gram Altın Fiyatı',
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
      },
    ],
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
