'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-solid border-b-[#483c23] px-4 sm:px-6 md:px-10 py-3 sm:py-4 bg-[#1c160c] relative z-50">
        {/* Logo section - flexibilite için flex-shrink-0 */}
        <div className="flex items-center gap-2 sm:gap-3 text-white flex-shrink-0">
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[#eca413] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-13.5 0L12 14.251 14.25 21" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold leading-tight tracking-tight">GoldTrackr</h2>
        </div>
        
        {/* Navigation section - mobilde sadece notification */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Desktop menü - sadece büyük ekranlarda görünür */}
          <nav className="hidden lg:flex items-center gap-6">
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors whitespace-nowrap" href="#">Ana Sayfa</a>
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors whitespace-nowrap" href="#">Grafikler</a>
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors whitespace-nowrap" href="#">Haberler</a>
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors whitespace-nowrap" href="#">Analiz</a>
          </nav>
          
          {/* Mobile menu button - sadece mobilde görünür */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-transparent text-gray-400 hover:bg-[#2a2214] hover:text-white transition-colors"
            aria-label="Menüyü aç/kapat"
          >
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          {/* Notification button */}
          <button className="flex h-8 w-8 sm:h-9 sm:w-9 cursor-pointer items-center justify-center rounded-full bg-transparent text-gray-400 hover:bg-[#2a2214] hover:text-white transition-colors flex-shrink-0">
            <svg fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed left-0 right-0 z-50 bg-[#1c160c] border-b border-[#483c23] shadow-lg animate-slide-down"
          style={{ top: '57px' }} // Header yüksekliği kadar
        >
          <nav className="px-4 py-4 space-y-1">
            <a 
              className="block text-gray-300 hover:text-white hover:bg-[#2a2214] text-base font-medium leading-normal transition-colors py-3 px-3 rounded-md" 
              href="#"
              onClick={toggleMobileMenu}
            >
              Ana Sayfa
            </a>
            <a 
              className="block text-gray-300 hover:text-white hover:bg-[#2a2214] text-base font-medium leading-normal transition-colors py-3 px-3 rounded-md" 
              href="#"
              onClick={toggleMobileMenu}
            >
              Grafikler
            </a>
            <a 
              className="block text-gray-300 hover:text-white hover:bg-[#2a2214] text-base font-medium leading-normal transition-colors py-3 px-3 rounded-md" 
              href="#"
              onClick={toggleMobileMenu}
            >
              Haberler
            </a>
            <a 
              className="block text-gray-300 hover:text-white hover:bg-[#2a2214] text-base font-medium leading-normal transition-colors py-3 px-3 rounded-md" 
              href="#"
              onClick={toggleMobileMenu}
            >
              Analiz
            </a>
          </nav>
          
          {/* Menü dışına tıklandığında kapatmak için invisible overlay */}
          <div 
            className="fixed inset-0 -z-10"
            onClick={toggleMobileMenu}
          />
        </div>
      )}
    </>
  );
}
