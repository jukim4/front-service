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
    <Card className="border-none shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {head.map((title) => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                  const currentPrice = getCurrentPrice(asset.market_code, tickers);
                  const avgPrice = asset.total_coin_price / asset.total_coin_cnt;
                  const valuation = asset.total_coin_cnt * currentPrice;
                  const profit = ((valuation / asset.total_coin_price) * 100).toFixed(3);

                  return (
                    <tr key={asset.market_code} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{asset.market_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{asset.market_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{asset.total_coin_cnt.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{avgPrice.toLocaleString()} KRW</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{currentPrice.toLocaleString()} KRW</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{asset.total_coin_price.toLocaleString()} KRW</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{profit} %</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
