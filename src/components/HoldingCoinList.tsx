'use client';

import { useAssetStore } from "@/store/assetStore";
import { useMarketStore } from "@/store/marketStore";
import { Card, CardContent } from "@/components/ui/card";

export default function HoldingCointList() {
  const { assets, getCurrentPrice } = useAssetStore();
  const { tickers } = useMarketStore();

  const head = [
    "코인", "마켓", "거래수량", "거래단가", "현재단가", "거래금액", "수익률"
  ];

  return (
    <div className="w-full">
      <Card className="border-none shadow-sm overflow-x-auto pt-0">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {head.map((title) => (
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
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    보유한 자산이 없습니다.
                  </td>
                </tr>
              ) : (
                assets
                  .filter(asset => asset.position === 0) // BUY만
                  .map((asset) => {
                    const currentPrice = getCurrentPrice(asset.market_code, tickers);
                    const buyPrice = tickers[asset.market_code]?.trade_price || 1; // 오류 방지
                    const quantity = asset.total_price / buyPrice;
                    const valuation = quantity * currentPrice;
                    const profitRate = ((valuation - asset.total_price) / asset.total_price) * 100;

                    return (
                      <tr key={asset.market_code} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-1 text-center text-gray-800">{asset.coin_ticker}</td>
                        <td className="px-3 py-1 text-center text-gray-800">{asset.market_code}</td>
                        <td className="px-3 py-1 text-center text-gray-800">{quantity.toFixed(6)}</td>
                        <td className="px-3 py-1 text-center text-gray-800">{buyPrice.toLocaleString()} KRW</td>
                        <td className="px-3 py-1 text-center text-gray-800">{currentPrice.toLocaleString()} KRW</td>
                        <td className="px-3 py-1 text-center text-gray-800">{asset.total_price.toLocaleString()} KRW</td>
                        <td className="px-3 py-1 text-center text-gray-800">{profitRate.toFixed(2)} %</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
