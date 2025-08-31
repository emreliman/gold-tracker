import GoldPriceCard from '@/components/GoldPriceCard';
import PriceChart from '@/components/PriceChart';
import NewsSection from '@/components/NewsSection';
import AIAnalysisCard from '@/components/AIAnalysisCard';
import Header from '@/components/Header';

export default function Home() {
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
              <span className="font-medium text-gray-300">Canlı</span>
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
