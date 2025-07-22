'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export type DoughnutData = {
  label: string;
  data: number;
};

type Props = {
  datas: DoughnutData[];
};

const PortfolioCoin = ({ datas }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 차트 중복 생성 방지
    if(chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const hasData = datas && datas.length > 0 && datas.some(d => d.data > 0);

    const chartInstance = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: hasData ? datas.map(d => d.label) : ['보유한 자산 없음'],
        datasets: [
          {
            data: hasData ? datas.map(d => d.data) : [1], // 더미 데이터 1개
            backgroundColor: hasData
              ? ['#60a5fa', '#34d399', '#f87171', '#fbbf24']
              : ['#e5e7eb'], // 회색 배경
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: false,  
          animateScale: false,    
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: hasData ? '#000' : '#6b7280', // 데이터 없을 때 회색
            },
          },
          tooltip: {
            enabled: hasData,
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [datas]);

  return (
    <div className="w-full md:w-[40%] max-w-full aspect-square relative mx-auto">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default PortfolioCoin;
