'use client';

import { useState, useEffect } from 'react';
import GoldPriceCard from '@/components/GoldPriceCard';
import PriceChart from '@/components/PriceChart';
import NewsSection from '@/components/NewsSection';
import AIAnalysisCard from '@/components/AIAnalysisCard';
import Header from '@/components/Header';

export default function Home() {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Altın fiyatlarının son güncellenme zamanını al
    const fetchLastUpdate = async () => {
      try {
        const response = await fetch('/api/gold');
        const data = await response.json();
        if (data.success && data.data.lastUpdate) {
          setLastUpdate(data.data.lastUpdate);
        }
      } catch (error) {
        console.log('Could not fetch last update time');
      }
    };

    fetchLastUpdate();
    
    // Her 5 dakikada güncelle
    const interval = setInterval(fetchLastUpdate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdate = (dateString: string) => {
    if (!dateString) return 'Yükleniyor...';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      // Son 2 dakika içinde ise
      if (diffInMinutes < 2) {
        return 'Az önce';
      } 
      // Son 60 dakika içinde ise
      else if (diffInMinutes < 60) {
        return `${diffInMinutes} dk önce`;
      }
      // Son 24 saat içinde ise
      else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} sa önce`;
      }
      // Bugün ise saat göster
      else if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      }
      // Geçmiş günler için tarih
      else {
        const diffInDays = Math.floor(diffInMinutes / 1440);
        if (diffInDays === 1) {
          return 'Dün ' + date.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit'
          });
        } else if (diffInDays < 7) {
          return `${diffInDays} gün önce`;
        } else {
          return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
    } catch (error) {
      return 'Bilinmiyor';
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#1c160c]" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <Header />
      
      <main className="px-4 sm:px-6 md:px-8 lg:px-16 flex flex-1 justify-center py-4 sm:py-6 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">Altın Fiyatları</h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <span>Son güncelleme:</span>
              <span className="font-medium text-gray-300">{formatLastUpdate(lastUpdate)}</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1"></div>
            </div>
          </div>
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Left Column - Gold Price Card (Highlighted) */}
            <div className="lg:col-span-2">
              <GoldPriceCard />
            </div>
            
            {/* Right Column - AI Analysis */}
            <div className="lg:col-span-1">
              <AIAnalysisCard />
            </div>
          </div>
          
          {/* Second Row - Chart and News */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Chart Section */}
            <div className="xl:col-span-2">
              <PriceChart />
            </div>
            
            {/* News Section */}
            <div className="xl:col-span-1">
              <NewsSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
