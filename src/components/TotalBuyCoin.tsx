'use client'

import { useAssetStore } from "@/store/assetStore"
import { useMarketStore } from "@/store/marketStore"

export default function TotalBuyCoin() {
  const { assets, getTotalValuation } = useAssetStore();
  const { tickers } = useMarketStore();

  const result = getTotalValuation(assets, tickers);
  const safeResult = Array.isArray(result) && result.length === 5 ? result : [0, 0, 0, 0, 0];

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 gap-8 p-8 rounded-lg bg-blue-50 border max-w-screen-lg mx-auto">
        {/* 왼쪽 영역 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 매수 코인</span>
            <span className="text-3xl font-bold text-black">
              {safeResult[0].toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">총 평가</span>
            <span className="text-lg font-semibold text-black">
              {safeResult[1].toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* 오른쪽 영역 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 보유 자산</span>
            <span className="text-3xl font-bold text-black">
              {safeResult[2].toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">평가 손익</span>
            <span className={`text-lg font-semibold ${safeResult[3] < 0 ? "text-blue-500" : "text-red-500"}`}>
              {safeResult[3].toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">수익률</span>
            <span className={`text-lg font-semibold ${safeResult[3] < 0 ? "text-blue-500" : "text-red-500"}`}>
              {safeResult[4].toLocaleString(undefined, { maximumFractionDigits: 0 })} %
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
