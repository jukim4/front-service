import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import { useProfitLossStore } from '@/store/ProfitLossStore';




interface PortfolioItem {
  name: string;
  quantity: number;
  average_cost: number;
}

export default function CumulativeChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const { cumulativeProfitLossRate } = useProfitLossStore();

  const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          console.error("액세스 토큰이 없습니다.");
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_URL;
        await axios.get<PortfolioItem[]>(`${baseUrl}/api/v1/portfolio`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const labels = ["7월", "8월", "9월", "10월", "11월", "12월"];
        const data = [cumulativeProfitLossRate, 0, 0, 0, 0, 0];

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
        console.error("백엔드 호출 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [cumulativeProfitLossRate]);

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
