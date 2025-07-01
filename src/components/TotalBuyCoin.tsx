'use client'

import { useAssetStore } from "@/store/assetStore"
import { useMarketStore } from "@/store/marketStore"

// 보유 자산
export default function TotalBuyCoin() {
  const { assets, getTotalValuation } = useAssetStore();
  const { tickers } = useMarketStore();

  // 0: 코인 구매가의 합, 1: 총평가, 2: 총 보유자산, 3: 평가손익, 4: 총 수익률
  const result = getTotalValuation(assets, tickers);

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-8  p-8 rounded-lg bg-blue-50 border">

        {/* 왼쪽 영역 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 매수 코인</span>
            <span className="text-3xl font-bold text-black">{result[0].toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">총 평가</span>
            <span className="text-lg font-semibold text-black">{result[1].toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* 오른쪽 영역 */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-base text-gray-600 font-medium">총 보유 자산</span>
            <span className="text-3xl font-bold text-black">{result[2].toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">평가 손익</span>
            <span className={`text-lg font-semibold ${result[3] < 0 ? "text-blue-500" : "text-red-500"}`}>
              {result[3].toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-base text-gray-600 font-medium">수익률</span>
            <span className={`text-lg font-semibold ${result[3] < 0 ? "text-blue-500" : "text-red-500"}`}>
              {result[4].toLocaleString(undefined, { maximumFractionDigits: 0 })} %
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
