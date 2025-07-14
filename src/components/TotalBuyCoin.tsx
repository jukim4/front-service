'use client';

import { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore } from "@/store/assetStore";
import { apiClient } from "@/lib/apiClient";

type TradeHistory = {
  marketCode: string;
  orderPosition: "BUY" | "SELL";
  tradeQuantity: number;
  tradePrice: number;
};

export default function TotalBuyCoin() {
  const { tickers } = useMarketStore();
  const getTotalSummaryArrayFromTradeHistory = useAssetStore(state => state.getTotalSummaryArrayFromTradeHistory); // ✅ Zustand 메서드 접근

  const [summary, setSummary] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [tradeData, assetRes] = await Promise.all([
        apiClient.tradeHistory(),
        apiClient.userHoldings(),
      ]);

      const result = getTotalSummaryArrayFromTradeHistory(tradeData, tickers, assetRes.asset);
      setSummary(result as [number, number, number, number, number]);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  fetchData();
}, [tickers]);


  const [totalBuy, totalValuation, totalAsset, profit, profitRate] = summary;

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 gap-8 p-8 rounded-lg bg-blue-50 border max-w-screen-lg mx-auto">
        {/* 왼쪽 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 매수 코인</span>
            <span className="text-3xl font-bold text-black">
              {totalBuy.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">총 평가</span>
            <span className="text-lg font-semibold text-black">
              {totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 보유 자산</span>
            <span className="text-3xl font-bold text-black">
              {totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">평가 손익</span>
            <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
              {profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">수익률</span>
            <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
              {profitRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
