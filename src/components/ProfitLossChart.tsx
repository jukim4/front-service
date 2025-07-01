import React, { useEffect } from "react";
import Chart from "chart.js/auto";

interface ProfitLossProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// bar chart border

export default function ProfitLossChart({ canvasRef }: ProfitLossProps) {

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    const labels = ["1월", "2월", "3월", "4월", "5월"];
    const data = [12, -8, 15, -5, 10];

    const bakgroundColors = data.map(value => value >0 ? "rgba(200, 0, 13, 0.8)" : "rgba(0, 0, 200, 0.8)");
    const borderColors = data.map(value => value >= 0 ? "rgba(200, 0, 13, 0.8)" : "#0000C8");

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "손익",
            data,
            backgroundColor: bakgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
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