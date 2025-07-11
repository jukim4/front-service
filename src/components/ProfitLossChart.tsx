import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useAssetStore } from "@/store/assetStore";

export default function PortfolioChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { assets } = useAssetStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    let labels: string[] = [];
    let data: number[] = [];
    let backgroundColors: string[] = [];
    const maxAbs = Math.max(...assets.map((v) => Math.abs(v.total_cost))) || 1;

    if (assets.length > 0) {
      labels = assets.map((asset) => asset.name);
      data = assets.map((asset) => asset.total_cost);
      backgroundColors = data.map((amount) =>
        amount >= 0
          ? `rgba(54, 162, 235, ${0.3 + 0.7 * (amount / maxAbs)})`
          : `rgba(255, 99, 132, ${0.3 + 0.7 * (Math.abs(amount) / maxAbs)})`
      );
    } else {
      // 기본 빈 차트 구성
      labels = ["자산 없음"];
      data = [0];
      backgroundColors = ["rgba(200, 200, 200, 0.5)"];
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
            borderColor: backgroundColors.map((c) => c.replace(/0\.\d+/, "1")),
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
            text: "보유 자산별 투자금액",
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

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [assets]);

  return (
    <div className="w-[400px] h-[400px] flex justify-center items-center rounded bg-white">
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
}
