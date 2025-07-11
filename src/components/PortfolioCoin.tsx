import { useEffect } from 'react';
import Chart from 'chart.js/auto';

type DoughnutData = {
  label: string;
  data: number;
};

type Props = {
  datas: DoughnutData[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

const PortfolioCoin = ({ datas, canvasRef }: Props) => {
  useEffect(() => {
    if (!canvasRef.current) return;

    const chartInstance = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: datas.map((d) => d.label),
        datasets: [
          {
            data: datas.map((d) => d.data),
            backgroundColor: ['#60a5fa', '#34d399', '#f87171', '#fbbf24'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });

    return () => {
      chartInstance.destroy(); // 차트 인스턴스 제거
    };
  }, [datas, canvasRef]);

  return null;
};

export default PortfolioCoin;
