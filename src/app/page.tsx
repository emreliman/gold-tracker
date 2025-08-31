import GoldPriceCard from '@/components/GoldPriceCard';
import PriceChart from '@/components/PriceChart';
import NewsSection from '@/components/NewsSection';
import AIAnalysisCard from '@/components/AIAnalysisCard';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#1c160c]" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <Header />
      
      <main className="px-16 flex flex-1 justify-center py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-white text-4xl font-bold">Altın Fiyatları</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Son güncelleme:</span>
              <span className="font-medium text-gray-300">Az önce</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1"></div>
            </div>
          </div>
          
          <GoldPriceCard />
        </div>
      </main>
    </div>
  );
}
