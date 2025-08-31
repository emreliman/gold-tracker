'use client';

export default function AIAnalysisCard() {
  return (
    <div className="bg-[#221c11] rounded-xl shadow-xl p-6 border border-[#483c23]" id="analysis">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">AI Piyasa Analizi</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[#eca413] rounded-full animate-pulse"></div>
          <span className="text-sm text-[#eca413]">Canlı</span>
        </div>
      </div>

      {/* AI Analysis Placeholder */}
      <div className="bg-[#332b19] rounded-xl p-4 mb-4 border border-[#483c23]">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#eca413] to-[#d89410] rounded-full flex items-center justify-center text-[#221c11] text-sm font-bold">
            AI
          </div>
          <div className="flex-1">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong>Mevcut Trend:</strong> Altın fiyatları %1.19 artış göstererek $1,950.20 seviyesinde. 
              Fed politikası ve jeopolitik riskler altını destekliyor. Kısa vadede yükseliş trendi devam edebilir.
            </p>
          </div>
        </div>
      </div>

      {/* Sentiment Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-green-900/30 rounded-lg border border-green-600">
          <div className="text-lg font-bold text-green-400">Yükseliş</div>
          <div className="text-xs text-green-300">75%</div>
        </div>
        <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
          <div className="text-lg font-bold text-gray-400">Denge</div>
          <div className="text-xs text-gray-300">15%</div>
        </div>
        <div className="text-center p-3 bg-red-900/30 rounded-lg border border-red-600">
          <div className="text-lg font-bold text-red-400">Düşüş</div>
          <div className="text-xs text-red-300">10%</div>
        </div>
      </div>

      {/* Key Factors */}
      <div className="space-y-2 mb-4">
        <h3 className="font-semibold text-white text-sm">Etkili Faktörler:</h3>
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            <span className="text-gray-400">Fed Faiz Kararları</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-2 h-2 bg-[#eca413] rounded-full mr-2"></span>
            <span className="text-gray-400">USD/TRY Paritesi</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-gray-400">Jeopolitik Riskler</span>
          </div>
        </div>
      </div>

      {/* Gemini Status */}
      <div className="p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[#eca413] rounded-full"></div>
          <span className="text-sm text-[#eca413]">
            Gemini AI analizi yakında
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Gerçek zamanlı AI analizi geliştiriliyor
        </p>
      </div>

      <button className="w-full mt-4 py-2 text-sm text-[#eca413] hover:bg-[#332b19] rounded-lg transition-colors border border-[#483c23]">
        Detaylı analiz →
      </button>
    </div>
  );
}
