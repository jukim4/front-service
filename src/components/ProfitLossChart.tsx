import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

interface PortfolioDto {
  name: string;
  quantity: number;
  averageCost: number;
}

export default function PortfolioChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchDataAndDrawChart = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("Access token이 없습니다.");
          setLoading(false);
          return;
        }

        const res = await axios.get<{
          code: number;
          message: string;
          data: PortfolioDto[];
        }>("http://localhost:8080/api/v1/portfolio", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data.code !== 200) {
          setError(res.data.message);
          setLoading(false);
          return;
        }

        let portfolios = res.data.data;

        if (portfolios.length === 0) {
          portfolios = [
            { name: "7월", quantity: 0, averageCost: 0 },
            { name: "8월", quantity: 0, averageCost: 0 },
            { name: "9월", quantity: 0, averageCost: 0 },
            { name: "10월", quantity: 0, averageCost: 0 },
            { name: "11월", quantity: 0, averageCost: 0 },
            { name: "12월", quantity: 0, averageCost: 0 },
          ];
        }

        const labels = portfolios.map((p) => p.name);
        const data = portfolios.map((p) => p.quantity * p.averageCost);
        const maxAbs = Math.max(...data.map((v) => Math.abs(v))) || 1;

        const backgroundColors = data.map((amount) =>
          amount >= 0
            ? `rgba(54, 162, 235, ${0.3 + 0.7 * (amount / maxAbs)})` // blue
            : `rgba(255, 99, 132, ${0.3 + 0.7 * (Math.abs(amount) / maxAbs)})` // red
        );

        const canvas = document.getElementById("portfolioChart") as HTMLCanvasElement | null;
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
                text: "포트폴리오 자산별 투자금액",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) =>
                    Number(value).toLocaleString() + "원",
                },
              },
            },
          },
        });
      } catch (e: any) {
        const msg =
          e.response?.data?.message ||
          "포트폴리오 데이터를 불러오는 데 실패했습니다.";
        setError(msg);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndDrawChart();

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  if (loading) return <div>📊 포트폴리오 데이터를 불러오는 중입니다...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: "400px", height: "400px" }}>
      <canvas id="portfolioChart" width="400" height="400" />
    </div>
  );
}
