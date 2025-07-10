import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useAssetStore, useFetchPortfolio } from '@/store/assetStore';

export default function ProfitLossChart() {
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const assets = useAssetStore((state) => state.assets);

  useEffect(() => {
    if (!assets || assets.length === 0) return;

    const labels = assets.map((asset) => asset.marketName);
    const data = assets.map((asset) => asset.totalCost);
    const maxAbs = Math.max(...data.map((v) => Math.abs(v))) || 1;

    const backgroundColors = data.map((amount) =>
      amount >= 0
        ? `rgba(54, 162, 235, ${0.3 + 0.7 * (amount / maxAbs)})`
        : `rgba(255, 99, 132, ${0.3 + 0.7 * (Math.abs(amount) / maxAbs)})`
    );

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "총 투자금액 (원)",
            data,
            backgroundColor: backgroundColors,
            borderColor: data.map((amount) =>
              amount >= 0 ? "rgba(54, 162, 235, 1)" : "rgba(255, 99, 132, 1)"
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "자산별 총 투자금액",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => Number(value).toLocaleString() + "원",
            },
          },
        },
      },
    });

    setLoading(false);

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [assets]);

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
