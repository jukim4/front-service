import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { apiClient } from "@/lib/apiClient";

type TradeHistory = {
  concludedAt: string;
  marketCode: string;
  orderPosition: "BUY" | "SELL";
  orderType: string;
  tradePrice: number;
  tradeQuantity: number;
};

type DataByDate = {
  date: string; // YYYY-MM-DD
  cumulativeProfitLossRate: number;
};

export default function CumulativeChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);

  const getCumulativeProfitLossByDate = (trades: TradeHistory[]): DataByDate[] => {
    const grouped: Record<string, { buySum: number; sellSum: number }> = {};

    trades.forEach(({ concludedAt, orderPosition, tradePrice, tradeQuantity }) => {
      const date = concludedAt.slice(0, 10);
      if (!grouped[date]) grouped[date] = { buySum: 0, sellSum: 0 };

      const amount = tradePrice * tradeQuantity;
      if (orderPosition === "BUY") {
        grouped[date].buySum += amount;
      } else if (orderPosition === "SELL") {
        grouped[date].sellSum += amount;
      }
    });

    const sortedDates = Object.keys(grouped).sort();

    let cumulativeBuy = 0;
    let cumulativeSell = 0;

    return sortedDates.map(date => {
      cumulativeBuy += grouped[date].buySum;
      cumulativeSell += grouped[date].sellSum;

      const rate = cumulativeBuy === 0 ? 0 : ((cumulativeSell - cumulativeBuy) / cumulativeBuy) * 100;

      return {
        date,
        cumulativeProfitLossRate: rate,
      };
    });
  };

  useEffect(() => {
    const fetchAndDraw = async () => {
      setLoading(true);
      try {
        const trades = await apiClient.tradeHistory();

        if (trades.length === 0) return;

        const dataByDate = getCumulativeProfitLossByDate(trades);
        const labels = dataByDate.map(item => item.date);
        const data = dataByDate.map(item => Number(item.cumulativeProfitLossRate.toFixed(2)));

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (chartRef.current) chartRef.current.destroy();

        chartRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "누적 수익률 (%)",
                data,
                borderColor: "#36A2EB",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                fill: true,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true },
              title: {
                display: true,
                text: "일별 누적 수익률 추이",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value: number | string) => `${value}%`,
                },
              },
            },
          },
        });
      } catch (err) {
        console.error("누적 수익률 차트 생성 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDraw();

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  return (
    <div className="w-[400px] h-[400px] flex justify-center items-center">
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
      ) : (
        <canvas ref={canvasRef} width={400} height={400} />
      )}
    </div>
  );
}
