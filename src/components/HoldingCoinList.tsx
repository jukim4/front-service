'use client';

import React, { useMemo } from "react";
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore } from "@/store/assetStore";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/numberUtils";
import { safeNumber } from "@/lib/numberUtils";

export default function HoldingCoinList() {
  const { tickers } = useMarketStore();
  const { assets } = useAssetStore();

  const tableHeaders = [
    "코인종류", "보유수량", "매수단가", "현재단가", "총매수금액", "총평가손익", "총평가수익률"
  ];

  const holdingAssets = useMemo(() => {
    return assets
      .filter(asset => asset.quantity > 0)
      .map(asset => {
        const currentPrice = tickers[asset.market_code]?.trade_price || 0;
        const coinTicker = asset.coin_ticker;
        const avgBuyPrice = asset.total_price / asset.quantity; // 평단가 = 총 매수 금액 / 보유 수량
        const valuation = asset.quantity * currentPrice;
        const profitRate = asset.total_price === 0 ? 0 : ((valuation - asset.total_price) / asset.total_price) * 100;

        return {
          coinTicker,
          quantity: asset.quantity,
          avgBuyPrice,
          currentPrice,
          totalCost: asset.total_price,
          profit: valuation - asset.total_price,
          profitRate,
        };
      });
  }, [assets, tickers]);

  return (
    <div className="w-full">
      <Card className="border-none shadow-sm overflow-x-auto pt-0">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {tableHeaders.map((title) => (
                  <th
                    key={title}
                    className="px-3 py-2 text-center font-medium text-gray-500 whitespace-nowrap"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdingAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    보유한 자산이 없습니다.
                  </td>
                </tr>
              ) : (
                holdingAssets.map((asset) => (
                  <tr key={asset.coinTicker} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-1 text-center text-gray-800">{asset.coinTicker}</td>
                    <td className="px-3 py-1 text-center text-gray-800">{formatNumber(safeNumber(asset.quantity), 8)}</td>
                    <td className="px-3 py-1 text-center text-gray-800">{formatNumber(safeNumber(asset.avgBuyPrice))} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{formatNumber(safeNumber(asset.currentPrice))} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{formatNumber(safeNumber(asset.totalCost))} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{formatNumber(safeNumber(asset.profit))} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{formatNumber(safeNumber(asset.profitRate), 2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
