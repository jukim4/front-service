import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { apiClient } from "@/lib/apiClient";

type TradeHistory = {
  concludedAt: string;      // 체결일시 ISO 문자열
  marketCode: string;
  orderPosition: string;    // "BUY" or "SELL"
  orderType: string;
  tradePrice: number;
  tradeQuantity: number;
};

export default function PortfolioChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeHistories, setTradeHistories] = useState<TradeHistory[]>([]);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // 1. 날짜별 누적 손익 계산 함수
  const getCumulativeProfitLossByDate = (trades: TradeHistory[]) => {
    const sellTrades = trades.filter(t => t.orderPosition === "SELL");

    const profitLossByDate: Record<string, number> = {};

    sellTrades.forEach(({ concludedAt, tradePrice, tradeQuantity }) => {
      const date = formatDate(concludedAt);
      const amount = tradePrice * tradeQuantity;

      if (!profitLossByDate[date]) {
        profitLossByDate[date] = 0;
      }
      profitLossByDate[date] += amount;
    });

    const sortedDates = Object.keys(profitLossByDate).sort();

    let cumulativeSum = 0;

    const result = sortedDates.map(date => {
      cumulativeSum += profitLossByDate[date];
      return {
        date,
        cumulativeProfitLoss: cumulativeSum,
      };
    });

    return result;
  };

  useEffect(() => {
    const fetchAndDraw = async () => {
      setLoading(true);
      try {
        const trades = await apiClient.tradeHistory();
        setTradeHistories(trades);

        if (trades.length === 0) return;

        const dataByDate = getCumulativeProfitLossByDate(trades);

        const labels = dataByDate.map(item => item.date);
        const data = dataByDate.map(item =>
          Number((item.cumulativeProfitLoss / 1000).toFixed(2)) // 천원 단위
        );

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (chartRef.current) {
          chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "손익 (단위: 천원)",
                data,
                borderColor: "#FF6384",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                fill: true,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: "손익 추이 그래프",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value: number | string) => `${value}천원`,
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("포트폴리오 차트 생성 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDraw();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-[400px] h-[400px] flex justify-center items-center">
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent" />
      ) : (
        <canvas ref={canvasRef} width={400} height={400} />
      )}
    </div>
  );
}
