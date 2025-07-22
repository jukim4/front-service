import React, { useEffect, useRef } from "react";
import { Chart, TimeScale, Tooltip, Legend, LinearScale } from "chart.js/auto";
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import "chartjs-adapter-date-fns"; // 날짜 포맷팅을 위한 어댑터
import zoomPlugin from 'chartjs-plugin-zoom';

// Chart.js candlestick chart controller 등록
Chart.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  Tooltip,
  Legend,
  LinearScale,
  zoomPlugin,
  // 그 외... 등록할 요소들
)

interface Candle {
    x: number; // 시간 (timestamp)
    o: number; // 시가
    h: number; // 고가
    l: number; // 저가
    c: number; // 종가
}

type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

interface WriteChartProps {
    market: string;
    candle: Candle[];
    timeUnit: TimeUnit;
}

// candlestick 차트
const WriteChart: React.FC<WriteChartProps> = ({ market, candle, timeUnit }) => {

     let chart_data: {x: number, y: number, data: any} | null = null;
     const chartRef = useRef<Chart | null>(null);
     const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        // 캔버스 요소 가져오기
        const ctx = canvasRef.current?.getContext("2d")
        
        // 캔버스가 존재하지 않으면 종료
        if (!ctx) return;

        // candle 데이터가 없거나 비어있으면 종료
        if (!candle || candle.length === 0) {
            console.log("Candle data is empty or undefined");
            return;
        }

        // 기존 차트가 있고, 같은 마켓과 타임유닛이면 데이터만 업데이트
        if (chartRef.current && 
            chartRef.current.data.datasets[0].label === market &&
            (chartRef.current.options.scales?.x as any)?.time?.unit === timeUnit &&
            chartRef.current.data.datasets[0].data.length > 0) {
            
            // 데이터 업데이트
            chartRef.current.data.datasets[0].data = candle;
            
            // 차트 업데이트 (애니메이션 비활성화로 성능 향상)
            chartRef.current.update('none');
            
            // 스케일 범위 업데이트
            if (chartRef.current.options.scales?.x) {
                (chartRef.current.options.scales.x as any).min = candle.length > 200 ? candle[candle.length - 200].x : candle[0].x;
                (chartRef.current.options.scales.x as any).max = candle[candle.length - 1].x;
            }
            
            return;
        }

        // 기존 차트 제거
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        // 차트 생성
        const chart = new Chart(ctx, {
            type: "candlestick",
            data: {
                datasets: [
                    {
                        label: market,
                        data: candle,
                        borderColors: {
                            up: 'rgba(200, 0, 13, 0.8)',
                            down: 'rgba(0, 0, 200, 0.8)',
                            unchanged: 'rgba(143, 143, 143, 1)'
                        },
                        backgroundColors: {
                            up: 'rgba(200, 0, 13, 0.8)',
                            down: 'rgba(0, 0, 200, 0.8)',
                            unchanged: 'rgba(143, 143, 143, 1)'
                        }
                    },
                ],
            },
            options: {
                responsive: true,
                animation: {
                    duration: 0 // 애니메이션 비활성화로 성능 향상
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            // day, hour, millisecond, minute, month, quarter, second, week, year
                            unit: timeUnit,
                        },
                        title: {
                            display: true,
                            text: "시간",
                        },
                        min: candle.length > 200 ? candle[candle.length - 200].x : candle[0].x, // 초기 표시 범위 시작
                        max: candle[candle.length - 1].x, // 초기 표시 범위 끝
                    },
                    y: {
                        title: {
                            display: true,
                            text: "가격",   
                        },
                        beginAtZero: false, // 자동 min/max 설정
                    },
                },
                plugins: {
                    // 교차선 제거 후 툴팁으로 대체
                    tooltip: {
                        intersect: false,
                        mode: 'index',
                        callbacks: {
                            label: function (context: any) {
                                const {o, h, l, c} = context.raw;
                                return `시가: ${o}, 고가: ${h}, 저가: ${l}, 종가: ${c}`;
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'x',
                        },
                    },
                },
            },
    });

    chartRef.current = chart;

    // 컴포넌트 언마운트 시 정리
    return () => {
        chartRef.current?.destroy();
        chartRef.current = null;
    };

}, [market, candle, timeUnit]);

    return <canvas ref={canvasRef} />
};

export default WriteChart;