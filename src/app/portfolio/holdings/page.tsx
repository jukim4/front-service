'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import TotalBuyCoin from '@/components/TotalBuyCoin';
import { useMarketStore } from '@/store/marketStore';
import PortfolioCoin from '@/components/PortfolioCoin';
import HoldingCoinList from '@/components/HoldingCoinList';
import MarketListCompoenet from '@/components/MarketListComponent';
import { apiClient } from "@/lib/apiClient";

export type DoughnutData = {
  label: string;
  data: number;
};

type TickerData = {
  trade_price: number;
};

type TradeHistory = {
  concludedAt: string;
  marketCode: string;   // ex: "BTC", "ETH" 등
  orderPosition: "BUY" | "SELL";
  tradePrice: number;
  tradeQuantity: number;
};

export default function Holdings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("보유자산");

  const { tickers } = useMarketStore();

  const [doughnutData, setDoughnutData] = useState<DoughnutData[]>([]);
  const [loading, setLoading] = useState(false);

  // 체결 데이터는 최초 한번만 fetch
  const [trades, setTrades] = useState<TradeHistory[]>([]);

  const tabs = ["보유자산", "투자손익"];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tab === "보유자산" ? '/portfolio/holdings' : '/portfolio/profit-loss');
  };

  const calculateHoldingsFromTrades = (trades: TradeHistory[]) => {
    const holdingsMap: Record<string, number> = {};

    trades.forEach(({ marketCode, orderPosition, tradeQuantity }) => {
      if (!holdingsMap[marketCode]) holdingsMap[marketCode] = 0;
      holdingsMap[marketCode] += orderPosition === "BUY" ? tradeQuantity : -tradeQuantity;
    });

    return holdingsMap;
  };

  const calculateDoughnutData = (
    holdings: Record<string, number>, 
    tickers: Record<string, TickerData>
  ): DoughnutData[] => {
    return Object.entries(holdings)
      .map(([symbol, qty]) => {
        const price = tickers[symbol]?.trade_price ?? 0;
        return {
          label: symbol,
          data: +(price * qty).toFixed(2),
        };
      })
      .filter(item => item.data > 0);
  };

  // 최초 마운트시 체결 데이터 fetch
  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      try {
        const res = await apiClient.tradeHistory();
        setTrades(res);
      } catch (error) {
        console.error("체결 데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // tickers 혹은 trades 변경 시 도넛 데이터 재계산
  useEffect(() => {
    if (trades.length === 0) return;

    const holdings = calculateHoldingsFromTrades(trades);
    const doughnut = calculateDoughnutData(holdings, tickers);
    setDoughnutData(doughnut);
  }, [tickers, trades]);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="col-span-2 border rounded-md overflow-hidden bg-white">
        <div className="w-full max-w-6xl mx-auto pt-4 bg-white px-4 p-4">
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "보유자산" && (
          <div className="flex flex-col w-full max-w-6xl pl-4 bg-white">
            <TotalBuyCoin />

            <div className="mt-12">
              <p className="text-3xl text-center font-bold ">보유 코인 포트폴리오</p>

              <div className="flex flex-col md:flex-row md:flex-wrap p-4">
                <PortfolioCoin datas={doughnutData} />
              </div>
            </div>

            <HoldingCoinList />
          </div>
        )}
      </div>

      <div className="relative col-span-1">
        <MarketListCompoenet />
      </div>
    </main>
  );
}
