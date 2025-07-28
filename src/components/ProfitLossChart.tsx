import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type DataByDate = {
  date: string; // YYYY-MM-DD
  profitLoss: number; // 누적 손익(원)
  profitLossRate: number;
};

interface Props {
  chartData: DataByDate[];
  isTradeHistoryLoading: boolean;
  chartError: string | null;
}
export default function PortfolioChart({chartData, isTradeHistoryLoading, chartError}: Props) {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);



  // 차트 그리기 (단 한번만 그리도록 설정)
  useEffect(() => {
    if (chartData.length === 0 || chartRef.current) return;

    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 데이터 값 얻기
      const values = chartData.map(item => item.profitLoss);
      const lastValue = values[values.length - 1] || 0;

      // 최대, 최소값 찾기 (적절한 Y축 범위 설정을 위해)
      const maxValue = Math.max(...values, 0);
      const minValue = Math.min(...values, 0);

      // 축 범위 계산 (가장 가까운 10,000 단위로 올림/내림)
      const yMax = Math.ceil(maxValue / 10000) * 10000;
      const yMin = Math.floor(minValue / 10000) * 10000;

      // 적절한 스텝 사이즈 계산
      const range = Math.max(Math.abs(yMax), Math.abs(yMin));
      let stepSize = 10000; // 기본 스텝 사이즈

      if (range > 100000) stepSize = 50000;
      if (range > 500000) stepSize = 100000;
      if (range > 1000000) stepSize = 250000;
      if (range > 5000000) stepSize = 1000000;

      // 수익/손실에 따른 색상 설정
      const gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (lastValue >= 0) {
        // 수익인 경우 빨간색 계열
        gradientFill.addColorStop(0, "rgba(255, 99, 132, 0.3)");
        gradientFill.addColorStop(1, "rgba(255, 99, 132, 0.05)");
      } else {
        // 손실인 경우 파란색 계열
        gradientFill.addColorStop(0, "rgba(54, 162, 235, 0.3)");
        gradientFill.addColorStop(1, "rgba(54, 162, 235, 0.05)");
      }

      // 차트 생성
      chartRef.current = new Chart(ctx, {
        type: "bar", 
        data: {
          labels: chartData.map(item => item.date),
          datasets: [
            {
              label: "누적 손익 (원)",
              data: values,
              backgroundColor: function (context) {
                const value = context.dataset.data[context.dataIndex] as number;
                return value >= 0 ? "rgba(255, 99, 132, 0.7)" : "rgba(54, 162, 235, 0.7)";
              },
              borderColor: function (context) {
                const value = context.dataset.data[context.dataIndex] as number;
                return value >= 0 ? "#ff6384" : "#36A2EB";
              },
              barThickness: 20,
              borderWidth: 1,
            },
          ],
        },
        options: {
          animation: false,
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "일별 누적 손익 추이",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  // 천 단위 콤마 표시와 원화 표시
                  return new Intl.NumberFormat('ko-KR').format(context.parsed.y) + "원";
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
              },
              grid: { display: false },
            },
            y: {
              suggestedMin: yMin,
              suggestedMax: yMax,
              title: {
                display: true,
                text: '손익 (원)'
              },
              ticks: {
                // 정해진 간격으로 눈금 표시 (균일한 간격)
                stepSize: stepSize,
                // 최대 9개 눈금으로 제한
                maxTicksLimit: 9,
                // 자동 스킵 방지
                autoSkip: false,
                callback: function (value) {
                  return new Intl.NumberFormat('ko-KR', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(Number(value));
                },
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                tickLength: 0,
              },
            },
          },
          // 자동 크기 계산 비활성화 
          maintainAspectRatio: false,
        },
      });
    };

    drawChart();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    }
  }, [chartData]);

  return (
    <div className="w-full h-[500px] flex flex-col justify-center items-center p-4 rounded-xl bg-white">
      <div className="w-full h-full relative">
        {isTradeHistoryLoading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : chartError ? (
          <div className="absolute inset-0 flex justify-center items-center text-gray-500">
            {chartError}
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex justify-center items-center text-gray-500">
            차트 데이터가 없습니다.
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
}