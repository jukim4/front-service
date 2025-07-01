import React, { useEffect } from "react";
import Chart from "chart.js/auto"

interface CumulativeProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

// line chart

export default function CumulativeChart({ canvasRef }: CumulativeProps) {

  useEffect(() => {
    if (!canvasRef.current) return;
        
    const ctx = canvasRef.current;

    const labels = ['1월', '2월', '3월', '4월', '5월'];
    const data = [10, 20, 15, 30, 25];

    const chart = new Chart(ctx, {
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
      responsive: false,
    },
    });

    return () => {
      chart.destroy();
    };
  }, [canvasRef]);
  return null;
}