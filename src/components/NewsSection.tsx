'use client';

import { useState, useEffect } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  content?: string;
}

interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  source: string;
  timestamp: string;
  error?: string;
  count?: number;
  cacheAge?: number;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching news from: /api/news');
      const response = await fetch('/api/news');
      console.log('News response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: NewsResponse = await response.json();
      console.log('News result:', result);

      if (result.success || result.data) {
        setNews(result.data);
        setSource(result.source);
        console.log('News loaded successfully from source:', result.source);
      } else {
        const errorMsg = result.error || 'Haberler yüklenemedi';
        setError(errorMsg);
        console.error('News API error:', result);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'API bağlantısı başarısız';
      setError(errorMsg);
      console.error('Critical error fetching news:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        url: '/api/news',
        timestamp: new Date().toISOString()
      });
      throw err; // Re-throw to be caught by parent components if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Auto refresh every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}dk önce`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}sa önce`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}g önce`;
    }
  };

  return (
    <div className="bg-[#221c11] rounded-xl shadow-xl p-6 border border-[#483c23]" id="news">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Piyasa Haberleri</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-300">📰 Canlı</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[#332b19] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[#483c23] rounded w-full mb-1"></div>
              <div className="h-3 bg-[#483c23] rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 text-lg mb-2">⚠️ Hata</div>
          <p className="text-gray-400 mb-4">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((article) => (
            <div 
              key={article.id}
              className="border-l-4 border-[#eca413] pl-4 py-2 hover:bg-[#332b19] rounded-r-lg transition-colors cursor-pointer"
              onClick={() => article.url !== '#' && window.open(article.url, '_blank')}
            >
              <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{article.source.name}</span>
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Status */}
      <div className="mt-6 p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-green-300">
            Canlı haberler
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Güncel ekonomi ve altın haberleri
        </p>
      </div>
    </div>
  );
}
