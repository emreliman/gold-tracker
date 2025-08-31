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
  quarterGold: GoldPrice;
  halfGold: GoldPrice;
  onsGold: GoldPrice;
  hasGold: GoldPrice;
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

  const fetchGoldPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gold');
      const result: ApiResponse = await response.json();

      if (result.success) {
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
    fetchGoldPrices();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchGoldPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPercentage = (percent: number): string => {
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
            onClick={fetchGoldPrices}
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

  const goldTypes = [
    { 
      name: 'Ons', 
      data: goldData.onsGold, 
      currency: '$',
      key: 'onsGold'
    },
    { 
      name: 'Gram', 
      data: goldData.gramGold, 
      currency: '₺',
      key: 'gramGold'
    },
    { 
      name: 'Kilogram', 
      data: { 
        buy: goldData.gramGold.buy * 1000, 
        sell: goldData.gramGold.sell * 1000, 
        changePercent: goldData.gramGold.changePercent 
      }, 
      currency: '₺',
      key: 'kilogram'
    },
    { 
      name: 'Tola', 
      data: goldData.hasGold, 
      currency: '₺',
      key: 'hasGold'
    },
    { 
      name: 'Troy Ons', 
      data: goldData.onsGold, 
      currency: '$',
      key: 'troyOunce'
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
          {goldTypes.map((gold, index) => (
            <tr key={gold.key}>
              <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base font-medium text-white">{gold.name}</td>
              <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base text-gray-300">
                {gold.currency}{formatPrice(gold.data.buy)}
              </td>
              <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base text-gray-300">
                {gold.currency}{formatPrice(gold.data.sell)}
              </td>
              <td className={`px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base ${getChangeColor(gold.data.changePercent)} flex items-center gap-1`}>
                {gold.data.changePercent >= 0 ? (
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" fillRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                  </svg>
                )}
                {formatPercentage(gold.data.changePercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
