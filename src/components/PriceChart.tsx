'use client';

export default function PriceChart() {
  return (
    <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-700" id="chart">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">24 Saatlik Fiyat Grafiği</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg">24S</button>
          <button className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg">7G</button>
          <button className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg">1A</button>
        </div>
      </div>

      {/* Placeholder Chart */}
      <div className="h-64 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl flex items-center justify-center border border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-400">Grafik Yakında Eklenecek</p>
          <p className="text-sm text-gray-500">Chart.js Entegrasyonu</p>
        </div>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center">
          <div className="text-sm text-gray-400">En Yüksek</div>
          <div className="font-semibold text-white">$1,962.25</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">En Düşük</div>
          <div className="font-semibold text-white">$1,940.15</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Ortalama</div>
          <div className="font-semibold text-white">$1,950.87</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Volatilite</div>
          <div className="font-semibold text-green-400">1.2%</div>
        </div>
      </div>
    </div>
  );
}
