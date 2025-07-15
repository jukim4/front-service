'use client';

import { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore } from "@/store/assetStore";
import { apiClient } from "@/lib/apiClient";
import { formatNumber, safeNumber } from "@/lib/numberUtils";

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
  const [tradeData, setTradeData] = useState<any[]>([]);
  const [assetAmount, setAssetAmount] = useState<number>(0);

  // 데이터 페칭은 컴포넌트 마운트 시에만 실행
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tradeDataResult, assetRes] = await Promise.all([
          apiClient.tradeHistory(),
          apiClient.userHoldings(),
        ]);

        setTradeData(tradeDataResult);
        setAssetAmount(assetRes.asset);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };

    fetchData();
  }, []); // 의존성 배열에서 tickers 제거

  // tickers 변경 시 계산만 다시 실행
  useEffect(() => {
    if (tradeData.length > 0 && Object.keys(tickers).length > 0) {
      const result = getTotalSummaryArrayFromTradeHistory(tradeData, tickers, assetAmount);
      setSummary(result as [number, number, number, number, number]);
    }
  }, [tickers, tradeData, assetAmount, getTotalSummaryArrayFromTradeHistory]);


  const [totalBuy, totalValuation, totalAsset, profit, profitRate] = summary;

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 gap-8 p-8 rounded-lg bg-blue-50 border max-w-screen-lg mx-auto">
        {/* 왼쪽 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 매수 코인</span>
            <span className="text-3xl font-bold text-black">
              {(formatNumber(safeNumber(totalBuy)))}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">총 평가</span>
            <span className="text-lg font-semibold text-black">
              {formatNumber(safeNumber(totalValuation))}
            </span>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 보유 자산</span>
            <span className="text-3xl font-bold text-black">
              {formatNumber(safeNumber(totalAsset))}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">평가 손익</span>
            <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
              {formatNumber(safeNumber(profit))}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">수익률</span>
            <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
              {formatNumber(safeNumber(profitRate), 2)} %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
