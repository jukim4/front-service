'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useMarketStore } from "@/store/marketStore";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";

type TradeHistory = {
  marketCode: string;
  orderPosition: "BUY" | "SELL";
  tradeQuantity: number;
  tradePrice: number;
};

export default function HoldingCoinList() {
  const { tickers } = useMarketStore();
  const [periodTrade, setPeriodTrade] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const tableHeaders = [
    "코인", "마켓", "보유수량", "매수단가", "현재단가", "총매수금액", "수익률"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.tradeHistory();
        console.log("Trade history data:", data);
        setPeriodTrade(data);
      } catch (err: any) {
        console.error("Failed to fetch trade history:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const holdingAssets = useMemo(() => {
    const map = new Map<string, { quantity: number; totalCost: number }>();

    periodTrade.forEach(trade => {
      const { marketCode, orderPosition, tradeQuantity, tradePrice } = trade;
      const entry = map.get(marketCode) || { quantity: 0, totalCost: 0 };

      if (orderPosition === "BUY") {
        entry.quantity += tradeQuantity;
        entry.totalCost += tradeQuantity * tradePrice;
      } else if (orderPosition === "SELL") {
        const avgBuyPrice = entry.quantity > 0 ? entry.totalCost / entry.quantity : 0;
        entry.quantity -= tradeQuantity;
        entry.totalCost -= tradeQuantity * avgBuyPrice;
      }

      map.set(marketCode, entry);
    });

    return Array.from(map.entries())
      .filter(([_, val]) => val.quantity > 0)
      .map(([marketCode, { quantity, totalCost }]) => {
        const currentPrice = tickers[marketCode]?.trade_price || 0;
        const coinTicker = marketCode.split("-")[1];
        const avgBuyPrice = totalCost / quantity;
        const valuation = quantity * currentPrice;
        const profitRate = totalCost === 0 ? 0 : ((valuation - totalCost) / totalCost) * 100;

        return {
          marketCode,
          coinTicker,
          quantity,
          avgBuyPrice,
          currentPrice,
          totalCost,
          profitRate,
        };
      });
  }, [periodTrade, tickers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        오류 발생: {error}
      </div>
    );
  }

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
                  <tr key={asset.marketCode} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-1 text-center text-gray-800">{asset.coinTicker}</td>
                    <td className="px-3 py-1 text-center text-gray-800">{asset.marketCode}</td>
                    <td className="px-3 py-1 text-center text-gray-800">{asset.quantity.toFixed(8)}</td>
                    <td className="px-3 py-1 text-center text-gray-800">{asset.avgBuyPrice.toLocaleString()} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{asset.currentPrice.toLocaleString()} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{asset.totalCost.toLocaleString()} KRW</td>
                    <td className="px-3 py-1 text-center text-gray-800">{asset.profitRate.toFixed(2)}%</td>
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
