'use client';

import { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore } from "@/store/assetStore";
import { formatNumber, safeNumber } from "@/lib/numberUtils";

export default function TotalBuyCoin() {
  const { tickers } = useMarketStore();
  const { assets, holdings, getTotalSummary } = useAssetStore();

  const [summary, setSummary] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);

  // assets, holdings, tickers 변경 시 계산 다시 실행
  useEffect(() => {
    if (assets.length > 0 && Object.keys(tickers).length > 0) {
      const result = getTotalSummary(assets, tickers, holdings);
      setSummary(result);
    }
  }, [assets, holdings, tickers, getTotalSummary]);


  const [totalBuy, totalValuation, totalAsset, profit, profitRate] = summary;

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 gap-8 p-8 rounded-lg bg-blue-50 border max-w-screen-lg mx-auto">
        {/* 왼쪽 */}
        <div className="space-y-6">
        <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 보유 자산</span>
            <span className="text-3xl font-bold text-black">
              {formatNumber(safeNumber(totalAsset))}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 보유 원화 자산</span>
            <span className="text-3xl font-bold text-black">
              {(formatNumber(safeNumber(holdings)))}
            </span>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="space-y-6">
         <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 매수 금액</span>
            <span className="text-3xl font-bold text-black">
              {(formatNumber(safeNumber(totalBuy)))}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-base text-gray-600 font-medium">총 평가 손익</span>
              <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
                {formatNumber(safeNumber(profit))}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-base text-gray-600 font-medium">총 평가 금액</span>
              <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
                {formatNumber(safeNumber(totalValuation))}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-base text-gray-600 font-medium">총 평가 수익률</span>
              <span className={`text-lg font-semibold ${profit < 0 ? "text-blue-500" : "text-red-500"}`}>
                {formatNumber(safeNumber(profitRate), 2)} %
              </span>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}
