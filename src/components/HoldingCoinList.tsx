'use client'

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
    <div className="max-w-screen-xl mx-auto">
      <Card className="border-none shadow-sm overflow-x-auto pt-0">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {head.map((title) => (
                  <th
                    key={title}
                    className="px-3 py-2 text-right font-medium text-gray-500 whitespace-nowrap"
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
                assets.map((asset) => {
                  const currentPrice = getCurrentPrice(asset.marketCode, tickers);
                  const avgPrice = asset.averageCost;
                  const valuation = asset.quantity * currentPrice;
                  const profit = ((valuation / asset.totalCost) * 100).toFixed(3);

                  return (
                    <tr key={asset.marketCode} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-1 text-gray-800 whitespace-nowrap">{asset.marketName}</td>
                      <td className="px-3 py-1 text-gray-800 whitespace-nowrap">{asset.marketCode}</td>
                      <td className="px-3 py-1 text-right text-gray-800 whitespace-nowrap">{asset.quantity.toLocaleString()}</td>
                      <td className="px-3 py-1 text-right text-gray-800 whitespace-nowrap">{avgPrice.toLocaleString()} KRW</td>
                      <td className="px-3 py-1 text-right text-gray-800 whitespace-nowrap">{currentPrice.toLocaleString()} KRW</td>
                      <td className="px-3 py-1 text-right text-gray-800 font-medium whitespace-nowrap">{asset.totalCost.toLocaleString()} KRW</td>
                      <td className="px-3 py-1 text-right text-gray-800 whitespace-nowrap">{profit} %</td>
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
