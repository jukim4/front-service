import React, { useEffect } from "react";
import Chart from "chart.js/auto"

interface CumulativeProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

// line chart

export default function CumulativeChart() {

  useEffect(() => {
        
    const canvas = document.getElementById("cumulative") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labels = ['1월', '2월', '3월', '4월', '5월'];
    const data = [10, 20, 15, 30, 25];

    const chart = new Chart(ctx, {
      type: "line",
      data: {
      labels,
      datasets: [
        {
          label: "누적 수익률 그래프",
          data,
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "누적 수익률 그래프",
        }
      }
    },
    });

    return () => {
      chart.destroy();
    };
  },);
  return null;
}