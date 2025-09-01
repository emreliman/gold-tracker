'use client';

import { useState, useEffect } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface GoldPrice {
  type: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
}

interface GoldData {
  gramGold: GoldPrice;
  gramHasGold?: GoldPrice;
  hasGold?: GoldPrice; // Backward compatibility
  onsGold: GoldPrice;
  quarterGold: GoldPrice;
  halfGold: GoldPrice;
  fullGold?: GoldPrice;
  cumhuriyetGold?: GoldPrice;
  ataGold?: GoldPrice;
  ikibuçukGold?: GoldPrice;
  beşliGold?: GoldPrice;
  bilezik14?: GoldPrice;
  bilezik18?: GoldPrice;
  bilezik22?: GoldPrice;
  usdTry?: GoldPrice;
  lastUpdate: string;
  source: string;
}

interface ApiResponse {
  success: boolean;
  data: GoldData;
  timestamp: string;
}

export default function GoldPriceCard() {
  const [goldData, setGoldData] = useState<GoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoldPrices = async (clearCache = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = clearCache ? '/api/gold?clearCache=true' : '/api/gold';
      const response = await fetch(url);
      const result: ApiResponse = await response.json();

      if (result.success) {
        console.log('Gold data received:', result.data);
        setGoldData(result.data);
      } else {
        setError('Altın fiyatları alınamadı');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      console.error('Error fetching gold prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldPrices(true); // İlk yüklemede cache'i temizle ve fresh data al
    
    // Auto-refresh every 5 minutes with fresh data
    const interval = setInterval(() => fetchGoldPrices(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPercentage = (percent: number): string => {
    console.log('Formatting percentage:', percent, 'Result:', `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`);
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (percent: number): string => {
    if (percent > 0) return 'text-green-400';
    if (percent < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeIcon = (percent: number): string => {
    if (percent > 0) return '↗';
    if (percent < 0) return '↘';
    return '→';
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="overflow-x-auto rounded-lg border border-[#483c23] bg-[#221c11] p-8">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️ Hata</div>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => fetchGoldPrices(true)}
            className="mt-4 px-4 py-2 bg-[#eca413] text-black rounded-lg hover:bg-[#d89410] transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!goldData) {
    return null;
  }

  // Debug: Console'a goldData'yı yazdır
  console.log('Rendering with goldData:', goldData);
  console.log('gramGold changePercent:', goldData.gramGold?.changePercent);
  console.log('onsGold changePercent:', goldData.onsGold?.changePercent);

  const goldTypes = [
    { 
      name: 'Gram Altın', 
      data: goldData.gramGold, 
      currency: '₺',
      key: 'gramGold'
    },
    { 
      name: 'Gram Has Altın', 
      data: goldData.gramHasGold || goldData.hasGold, 
      currency: '₺',
      key: 'gramHasGold'
    },
    { 
      name: 'Ons Altın', 
      data: goldData.onsGold, 
      currency: '$',
      key: 'onsGold'
    },
    { 
      name: 'Çeyrek Altın', 
      data: goldData.quarterGold, 
      currency: '₺',
      key: 'quarterGold'
    },
    { 
      name: 'Yarım Altın', 
      data: goldData.halfGold, 
      currency: '₺',
      key: 'halfGold'
    },
    { 
      name: 'Tam Altın', 
      data: goldData.fullGold, 
      currency: '₺',
      key: 'fullGold'
    },
    { 
      name: 'Cumhuriyet Altını', 
      data: goldData.cumhuriyetGold, 
      currency: '₺',
      key: 'cumhuriyetGold'
    },
    { 
      name: 'Ata Altın', 
      data: goldData.ataGold, 
      currency: '₺',
      key: 'ataGold'
    },
    { 
      name: 'Beşli Altın', 
      data: goldData.beşliGold, 
      currency: '₺',
      key: 'beşliGold'
    },
    { 
      name: '14 Ayar Bilezik', 
      data: goldData.bilezik14, 
      currency: '₺',
      key: 'bilezik14'
    },
    { 
      name: '18 Ayar Bilezik', 
      data: goldData.bilezik18, 
      currency: '₺',
      key: 'bilezik18'
    },
    { 
      name: '22 Ayar Bilezik', 
      data: goldData.bilezik22, 
      currency: '₺',
      key: 'bilezik22'
    },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-[#483c23] bg-[#221c11]">
      <table className="w-full text-left min-w-[640px]">
        <thead className="bg-[#332b19]">
          <tr>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white tracking-wider" scope="col">Birim</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white tracking-wider" scope="col">Alış Fiyatı</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white tracking-wider" scope="col">Satış Fiyatı</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white tracking-wider" scope="col">Değişim (24s)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#483c23]">
          {goldTypes.filter(gold => gold.data && (gold.data.buy > 0 || gold.data.sell > 0)).map((gold, index) => (
            <tr key={gold.key}>
              <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base font-medium text-white">{gold.name}</td>
              <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base text-gray-300">
                {gold.currency}{formatPrice(gold.data!.buy)}
              </td>
              <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base text-gray-300">
                {gold.currency}{formatPrice(gold.data!.sell)}
              </td>
              <td className={`px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base ${getChangeColor(gold.data!.changePercent)} flex items-center gap-1`}>
                {gold.data!.changePercent >= 0 ? (
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" fillRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                  </svg>
                )}
                {/* Test: Hardcoded percentage for debugging */}
                {gold.data!.changePercent !== 0 ? formatPercentage(gold.data!.changePercent) : 
                  `${gold.data!.changePercent >= 0 ? '+' : ''}${gold.data!.changePercent.toFixed(2)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
