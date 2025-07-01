import React, { useRef, useEffect, RefObject } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface Data {
    label: string;
    data: number;
}

interface PortfolioCoinProps {
    uid: number;
    datas: Data[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    size?: {
        width: number;
        height: number;
    };
}

// 보유자산 차트
export default function PortfolioCoin({uid, datas, canvasRef}: PortfolioCoinProps) {
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx || !datas || datas.length === 0) return;

        const threshold = 0.3;
        const mainCoins = datas.filter((data) => data.data > threshold);
        const etcCoins = datas.filter((data) => data.data <= threshold);
        let etc = etcCoins.reduce((sum, d) => sum + d.data, 0);

        const chartData = etc > 0 ? [...mainCoins, { label: "기타", data: etc }] : mainCoins;
        const coinName = chartData.map((d) => d.label);
        const coinData = chartData.map((d) => d.data);

        const fontSize = Math.max(Math.round(window.innerWidth / 130), 8);

        const createChart = () => {
            return new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: coinName,
                    datasets: [{
                        data: coinData,
                        backgroundColor: [
                            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                            "#FF9F40", "#C9CBCF", "#F67019", "#F53794", "#537BC4",
                            "#ACC236", "#166A8F", "#00A950", "#58595B", "#8549BA"
                        ],
                        datalabels: {
                            align: 'center',
                            color: 'white',
                            font: {
                                weight: 'bold',
                                size: fontSize,
                            },
                            formatter: (value: number) =>
                                value < threshold ? null : `${value.toFixed(2)} %`
                        }
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    size: fontSize + 2
                                },
                                generateLabels: (chart) => {
                                    const datasets = chart.data.datasets;
                                    const bgColors = datasets[0].backgroundColor as string[];
                                    return datasets[0].data.map((val, idx) => {
                                        const numericValue = typeof val === 'number' ? val : 0;
                                        return {
                                            text: `${chart.data.labels?.[idx] ?? ''}: ${numericValue.toFixed(2)} %`,
                                            fillStyle: bgColors[idx],
                                            index: idx,
                                            strokeStyle: bgColors[idx]
                                        };
                                    });
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        };

        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = createChart();

        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = createChart();
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, [datas, canvasRef]);

    return null;
}