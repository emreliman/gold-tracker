'use client';

export default function NewsSection() {
  const mockNews = [
    {
      id: 1,
      title: "Altın fiyatları FED belirsizliği ile tüm zamanların rekorunu kırdı",
      summary: "Fed politika açıklamalarının ardından yatırımcılar güvenli liman arayışında altına yöneldi...",
      publishedAt: "2025-08-31T10:30:00Z",
      source: "Ekonomi Haberleri"
    },
    {
      id: 2,
      title: "Merkez bankaları altın rezervlerini 50 ton artırdı",
      summary: "Küresel merkez bankaları bu çeyrekte rezerv çeşitlendirmesi kapsamında önemli altın alımları yaptı...",
      publishedAt: "2025-08-31T08:15:00Z",
      source: "Reuters"
    },
    {
      id: 3,
      title: "Jeopolitik gerilimler altın talebini artırıyor",
      summary: "Küresel belirsizlikler yatırımcıları enflasyon korunması için değerli metallere yönlendiriyor...",
      publishedAt: "2025-08-30T16:45:00Z",
      source: "Bloomberg"
    }
  ];

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
    <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-700" id="news">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Piyasa Haberleri</h2>
        <span className="text-sm text-gray-400">Son 24 saat</span>
      </div>

      <div className="space-y-4">
        {mockNews.map((news) => (
          <div 
            key={news.id}
            className="border-l-4 border-yellow-500 pl-4 py-2 hover:bg-gray-800 rounded-r-lg transition-colors cursor-pointer"
          >
            <h3 className="font-semibold text-white text-sm mb-1">
              {news.title}
            </h3>
            <p className="text-gray-400 text-xs mb-2 line-clamp-2">
              {news.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{news.source}</span>
              <span>{formatTimeAgo(news.publishedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* News API Status */}
      <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-blue-300">
            Canlı haberler yakında
          </span>
        </div>
        <p className="text-xs text-blue-400 mt-1">
          NewsAPI entegrasyonu geliştiriliyor
        </p>
      </div>

      <button className="w-full mt-4 py-2 text-sm text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors border border-yellow-700">
        Tüm haberleri gör →
      </button>
    </div>
  );
}
