import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import { useAssetStore } from '@/store/assetStore';
import { useMarketStore } from '@/store/marketStore';

export default function CumulativeChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const tickers = useMarketStore(state => state.tickers);

  const assets = useAssetStore((state) => state.assets);
  const getCumulativeProfitLossByDate = useAssetStore(
    (state) => state.getCumulativeProfitLossByDate
  );

  useEffect(() => {
    const drawChart = async () => {
      setLoading(true);

      try {
        if (assets.length === 0 || Object.keys(tickers).length === 0) return;
        const dataByDate = getCumulativeProfitLossByDate(assets, tickers);

        const labels = dataByDate.map((item) => item.date);
        const data = dataByDate.map((item) =>
          Number(item.cumulativeProfitLossRate.toFixed(2))
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
                label: "누적 수익률",
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
              legend: { display: false },
              title: {
                display: true,
                text: "누적 수익률 그래프",
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
        console.error("차트 생성 실패", err);
      } finally {
        setLoading(false);
      }
    };

    drawChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [tickers]);

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
