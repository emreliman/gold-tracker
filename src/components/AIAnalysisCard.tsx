'use client';

import { useState, useEffect } from 'react';

interface AnalysisFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

interface AnalysisData {
  trend: string;
  confidence: number;
  summary: string;
  factors: AnalysisFactor[];
  predictions: {
    short_term: string;
    risk_level: string;
    medium_term?: string;
    key_levels?: string;
  };
  sentiment?: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  turkey_specific?: {
    inflation_hedge: string;
    currency_impact: string;
    local_demand: string;
  };
  lastUpdate: string;
}

interface AnalysisResponse {
  success: boolean;
  data: AnalysisData;
  source: string;
  timestamp: string;
  error?: string;
  cacheAge?: number;
  inputs?: {
    goldPrice: number;
    newsCount: number;
  };
}

export default function AIAnalysisCard() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');

  const fetchAnalysis = async (clearCache: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = clearCache ? '/api/analysis?clearCache=true' : '/api/analysis';
      console.log('Fetching analysis from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: AnalysisResponse = await response.json();
      console.log('Analysis result:', result);

      if (result.success || result.data) {
        setAnalysis(result.data);
        setSource(result.source);
        console.log('Analysis loaded successfully from source:', result.source);
      } else {
        const errorMsg = result.error || 'Analiz yüklenemedi';
        setError(errorMsg);
        console.error('Analysis API error:', result);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'API bağlantısı başarısız';
      setError(errorMsg);
      console.error('Critical error fetching analysis:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        url: clearCache ? '/api/analysis?clearCache=true' : '/api/analysis',
        timestamp: new Date().toISOString()
      });
      throw err; // Re-throw to be caught by parent components if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    
    // Auto refresh every hour
    const interval = setInterval(fetchAnalysis, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'bg-green-400';
      case 'negative':
        return 'bg-red-400';
      default:
        return 'bg-[#eca413]';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'yükseliş':
        return 'text-green-400';
      case 'düşüş':
        return 'text-red-400';
      default:
        return 'text-[#eca413]';
    }
  };

  return (
    <div className="bg-[#221c11] rounded-xl shadow-xl p-6 border border-[#483c23]" id="analysis">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">AI Piyasa Analizi</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-300">🤖 AI</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-20 bg-[#332b19] rounded-xl mb-4"></div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#332b19] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 text-lg mb-2">⚠️ Hata</div>
          <p className="text-gray-400 mb-4">{error}</p>
        </div>
      ) : analysis ? (
        <>
          {/* AI Analysis Summary */}
          <div className="bg-[#332b19] rounded-xl p-4 mb-4 border border-[#483c23]">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#eca413] to-[#d89410] rounded-full flex items-center justify-center text-[#221c11] text-sm font-bold">
                AI
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-400">Trend:</span>
                  <span className={`font-semibold ${getTrendColor(analysis.trend)}`}>
                    {analysis.trend}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({analysis.confidence}% güven)
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Sentiment Indicators */}
          {analysis.sentiment ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-green-900/30 rounded-lg border border-green-600">
                <div className="text-lg font-bold text-green-400">Yükseliş</div>
                <div className="text-xs text-green-300">{analysis.sentiment.bullish}%</div>
              </div>
              <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
                <div className="text-lg font-bold text-gray-400">Denge</div>
                <div className="text-xs text-gray-300">{analysis.sentiment.neutral}%</div>
              </div>
              <div className="text-center p-3 bg-red-900/30 rounded-lg border border-red-600">
                <div className="text-lg font-bold text-red-400">Düşüş</div>
                <div className="text-xs text-red-300">{analysis.sentiment.bearish}%</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
                <div className="text-lg font-bold text-[#eca413]">Güven Skoru</div>
                <div className="text-xs text-[#eca413]">{analysis.confidence}%</div>
              </div>
              <div className="text-center p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
                <div className="text-lg font-bold text-[#eca413]">Risk</div>
                <div className={`text-xs ${
                  analysis.predictions.risk_level === 'Yüksek' ? 'text-red-400' :
                  analysis.predictions.risk_level === 'Orta' ? 'text-[#eca413]' : 'text-green-400'
                }`}>
                  {analysis.predictions.risk_level}
                </div>
              </div>
            </div>
          )}

          {/* Key Factors */}
          {analysis.factors && analysis.factors.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="font-semibold text-white text-sm">Etkili Faktörler:</h3>
              <div className="space-y-1">
                {analysis.factors.slice(0, 4).map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${getImpactColor(factor.impact)}`}></span>
                      <span className="text-gray-400">{factor.factor}</span>
                    </div>
                    <span className="text-xs text-gray-500">{factor.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictions */}
          <div className="space-y-2 mb-4">
            <h3 className="font-semibold text-white text-sm">Tahminler:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Kısa Vade:</span>
                <span className="text-gray-300">{analysis.predictions.short_term}</span>
              </div>
              {analysis.predictions.medium_term && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Orta Vade:</span>
                  <span className="text-gray-300">{analysis.predictions.medium_term}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Seviyesi:</span>
                <span className={`${
                  analysis.predictions.risk_level === 'Yüksek' ? 'text-red-400' :
                  analysis.predictions.risk_level === 'Orta' ? 'text-[#eca413]' : 'text-green-400'
                }`}>
                  {analysis.predictions.risk_level}
                </span>
              </div>
              {analysis.predictions.key_levels && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Seviyeler:</span>
                  <span className="text-gray-300 text-xs">{analysis.predictions.key_levels}</span>
                </div>
              )}
            </div>
          </div>

          {/* Turkey Specific Analysis */}
          {analysis.turkey_specific && (
            <div className="space-y-2 mb-4">
              <h3 className="font-semibold text-white text-sm">Türkiye Analizi:</h3>
              <div className="space-y-1 text-sm">
                <div className="p-2 bg-[#332b19] rounded border border-[#483c23]">
                  <div className="text-xs text-gray-400 mb-1">Enflasyon Korunması:</div>
                  <div className="text-gray-300 text-xs">{analysis.turkey_specific.inflation_hedge}</div>
                </div>
                <div className="p-2 bg-[#332b19] rounded border border-[#483c23]">
                  <div className="text-xs text-gray-400 mb-1">Döviz Etkisi:</div>
                  <div className="text-gray-300 text-xs">{analysis.turkey_specific.currency_impact}</div>
                </div>
                <div className="p-2 bg-[#332b19] rounded border border-[#483c23]">
                  <div className="text-xs text-gray-400 mb-1">Yerel Talep:</div>
                  <div className="text-gray-300 text-xs">{analysis.turkey_specific.local_demand}</div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* API Status */}
      <div className="p-3 bg-[#332b19] rounded-lg border border-[#483c23]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-green-300">
            AI analiz aktif
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Güncel piyasa verileri ile analiz ediliyor
        </p>
      </div>
    </div>
  );
}
