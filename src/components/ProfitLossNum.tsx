'use client';

import { useState, useEffect } from 'react';
import { useAssetStore } from '@/store/assetStore';
import { useMarketStore } from '@/store/marketStore';
import { apiClient } from '@/lib/apiClient';

// Ensure TradeHistory type is properly imported or defined
type TradeHistory = {
  concludedAt: string;
  marketCode: string;
  orderPosition: 'BUY' | 'SELL';
  orderType: string;
  tradePrice: number;
  tradeQuantity: number;
};

const ProfitSummary = () => {
  const tickers = useMarketStore(state => state.tickers);
  const { assets, holdings, getProfitLossDataFromTradeHistory } = useAssetStore();

  const [selectedPeriod, setSelectedPeriod] = useState("1개월");
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [displayData, setDisplayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculate start date based on selected period
  const calculateStartDate = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case '1주일':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '1개월':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3개월':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6개월':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  useEffect(() => {
    const fetchTradeHistory = async () => {
      try {
        setLoading(true);
        const history = await apiClient.tradeHistory();
        setTradeHistory(history || []);
      } catch (error) {
        console.error('Failed to fetch trade history:', error);
        setTradeHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeHistory();
  }, []);

  useEffect(() => {
    if (loading || !tradeHistory.length || !tickers) return;

    const startDate = calculateStartDate(selectedPeriod);

    const filteredTrades = tradeHistory.filter(trade => {
      const tradeDate = new Date(trade.concludedAt);
      return tradeDate >= startDate;
    });

    if (filteredTrades.length === 0) {
      setDisplayData({
        cumulativeProfitLoss: 0,
        cumulativeProfitLossRate: 0,
        averageInvestment: 0
      });
      return;
    }

    const profitLossData = getProfitLossDataFromTradeHistory(filteredTrades, tickers);
    setDisplayData(profitLossData);
  }, [selectedPeriod, tradeHistory, tickers, loading, getProfitLossDataFromTradeHistory]);

  useEffect(() => {
    if (!tradeHistory.length && assets.length && tickers && !loading) {
      const simulatedTrades = assets.map(asset => ({
        concludedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Simulate 30 days ago
        marketCode: asset.market_code,
        orderPosition: 'BUY' as const,
        orderType: 'LIMIT',
        tradePrice: asset.total_price / asset.quantity || 0,
        tradeQuantity: asset.quantity
      }));

      setTradeHistory(simulatedTrades);
    }
  }, [assets, tickers, loading, tradeHistory]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2 ml-8 my-6">
        {['1주일', '1개월', '3개월', '6개월'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded ${selectedPeriod === period ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {period}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : displayData ? (
        <div className="grid grid-cols-2 gap-2 ml-8 my-6 items-center">
          <div className="flex flex-col items-start space-y-3 self-start">
            <span className="text-gray-500 font-medium">기간 누적 손익</span>
            <div className="flex space-x-2">
              <p className={`text-6xl font-bold ${displayData.cumulativeProfitLoss >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {Math.floor(displayData.cumulativeProfitLoss).toLocaleString()}
              </p>
              <p className="text-gray-500 font-semibold text-xl self-end">KRW</p>
            </div>
          </div>

          <div className="flex flex-col items-start space-y-3 self-start">
            <span className="text-gray-500 font-medium">기간 누적 손익률</span>
            <div className="flex space-x-2">
              <p className={`text-6xl font-bold ${displayData.cumulativeProfitLossRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {Math.floor(displayData.cumulativeProfitLossRate).toLocaleString()}
              </p>
              <p className="text-gray-500 font-semibold text-xl self-end">%</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <p>선택한 기간에 거래 내역이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ProfitSummary;