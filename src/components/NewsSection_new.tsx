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
      
      const response = await fetch('/api/news');
      const result: NewsResponse = await response.json();

      if (result.success || result.data) {
        setNews(result.data);
        setSource(result.source);
      } else {
        setError(result.error || 'Haberler yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      console.error('Error fetching news:', err);
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

  const getSourceIcon = () => {
    switch (source) {
      case 'newsapi':
        return '📰';
      case 'cache':
        return '💾';
      case 'mock':
      case 'fallback':
        return '🔄';
      default:
        return '📡';
    }
  };

  const getSourceText = () => {
    switch (source) {
      case 'newsapi':
        return 'Canlı haberler';
      case 'cache':
        return 'Önbellek';
      case 'mock':
        return 'Demo haberler';
      case 'fallback':
        return 'Yedek veri';
      default:
        return 'Haberler';
    }
  };

  return (
    <div className="bg-[#221c11] rounded-xl shadow-xl p-6 border border-[#483c23]" id="news">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Piyasa Haberleri</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>{getSourceIcon()}</span>
          <span>{getSourceText()}</span>
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
          <button 
            onClick={fetchNews}
            className="px-4 py-2 bg-[#eca413] text-[#221c11] rounded-lg hover:bg-[#d89410] transition-colors"
          >
            Tekrar Dene
          </button>
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

      {/* News API Status */}
      <div className="mt-6 p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              source === 'newsapi' ? 'bg-green-400' : 
              source === 'cache' ? 'bg-[#eca413]' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-300">
              {source === 'newsapi' ? 'Canlı NewsAPI bağlantısı' :
               source === 'cache' ? 'Önbellekten yüklendi' :
               'Demo veriler gösteriliyor'}
            </span>
          </div>
          <button 
            onClick={fetchNews}
            className="text-xs text-[#eca413] hover:text-[#d89410] transition-colors"
            disabled={loading}
          >
            {loading ? '🔄' : '↻'}
          </button>
        </div>
        {source !== 'newsapi' && (
          <p className="text-xs text-gray-400 mt-1">
            {source === 'mock' ? 'NewsAPI anahtarı gerekli' : 'API bağlantısı başarısız'}
          </p>
        )}
      </div>

      <button 
        className="w-full mt-4 py-2 text-sm text-[#eca413] hover:bg-[#332b19] rounded-lg transition-colors border border-[#483c23]"
        onClick={fetchNews}
        disabled={loading}
      >
        {loading ? 'Yükleniyor...' : 'Haberleri yenile →'}
      </button>
    </div>
  );
}
