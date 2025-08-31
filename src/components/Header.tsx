'use client';

import { useState } from 'react';

export default function Header() {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#483c23] px-10 py-4 bg-[#1c160c]">
      <div className="flex items-center gap-3 text-white">
        <svg className="h-8 w-8 text-[#eca413]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-13.5 0L12 14.251 14.25 21" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
        <h2 className="text-white text-xl font-bold leading-tight tracking-tight">GoldTrackr</h2>
      </div>
      <div className="flex flex-1 justify-end gap-6">
        <div className="flex items-center gap-6">
          <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Ana Sayfa</a>
          <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Grafikler</a>
          <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Haberler</a>
          <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Analiz</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-gray-400 hover:bg-[#2a2214] hover:text-white transition-colors">
            <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
