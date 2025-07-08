import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

interface PortfolioItem {
  name: string;
  quantity: number;
  average_cost: number;
}

export default function CumulativeChart() {
  // useRef로 차트 인스턴스 관리
  const chartRef = useRef<Chart | null>(null);

  const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          console.error("액세스 토큰이 없습니다.");
          return;
        }

        const res = await axios.get<PortfolioItem[]>(
          "http://localhost:8080/api/v1/portfolio",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const portfolio = res.data;
        const averageCost = portfolio[0]?.average_cost ?? 0;

        const labels = ["7월", "8월", "9월", "10월", "11월", "12월"];
        const data = [averageCost, 0, 0, 0, 0, 0];

        const canvas = document.getElementById("cumulative") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 기존 차트가 있으면 파괴
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }

        // 새 차트 생성 및 저장
        chartRef.current = new Chart(ctx, {
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
                  callback: (value: number | string) => value + "%",
                },
              },
            },
          },
        });
      } catch (err) {
        console.error("백엔드 호출 실패", err);
      }
    };

    fetchData();


    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return null;
}