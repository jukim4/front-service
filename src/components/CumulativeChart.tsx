import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { apiClient } from "@/lib/apiClient";
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore } from "@/store/assetStore";

type TradeHistory = {
  concludedAt: string;
  marketCode: string;
  orderPosition: "BUY" | "SELL";
  orderType: string;
  tradePrice: number;
  tradeQuantity: number;
};

type DataByDate = {
  date: string; // YYYY-MM-DD
  cumulativeProfitLossRate: number;
};

export default function CumulativeChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [chartData, setChartData] = useState<DataByDate[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Store 가져오기
  const tickers = useMarketStore(state => state.tickers);
  const assets = useAssetStore(state => state.assets);
  const { getPeriodProfitLoss } = useAssetStore();

  // 거래 내역 기반 누적 수익률 계산 함수
  const calculateCumulativeProfitLossByDate = (trades: TradeHistory[]) => {
    if (!trades || trades.length === 0) {
      console.log("거래 내역이 없습니다.");
      return [];
    }

    if (!tickers || Object.keys(tickers).length === 0) {
      console.log("티커 데이터가 로드되지 않았습니다.");
      return [];
    }

    console.log(`거래 내역 ${trades.length}개 처리 중`);

    // 날짜별로 거래 분류
    const tradesByDate: Record<string, TradeHistory[]> = {};

    // 날짜별로 거래 정렬 (가장 오래된 거래부터)
    const sortedTrades = [...trades].sort((a, b) =>
      new Date(a.concludedAt).getTime() - new Date(b.concludedAt).getTime()
    );

    // 각 거래의 날짜를 추출
    sortedTrades.forEach(trade => {
      const date = trade.concludedAt.slice(0, 10);
      if (!tradesByDate[date]) {
        tradesByDate[date] = [];
      }
      tradesByDate[date].push(trade);
    });

    // 날짜를 정렬
    const sortedDates = Object.keys(tradesByDate).sort();

    if (sortedDates.length === 0) {
      console.log("정렬된 날짜가 없습니다.");
      return [];
    }

    // 누적 거래 내역
    let accumulatedTrades: TradeHistory[] = [];
    const dataByDate: DataByDate[] = [];

    // 각 날짜별로 누적 수익률 계산
    sortedDates.forEach(date => {
      // 이 날짜까지의 모든 거래 누적
      accumulatedTrades = [...accumulatedTrades, ...tradesByDate[date]];

      try {
        // assetStore의 메소드를 사용해 누적 수익률 계산
        const profitLossData = getPeriodProfitLoss(accumulatedTrades, tickers, 30);

        // 결과 저장
        dataByDate.push({
          date,
          cumulativeProfitLossRate: Number(profitLossData.periodProfitLossRate.toFixed(2))
        });
      } catch (err) {
        console.error(`날짜 ${date} 처리 중 오류 발생:`, err);
      }
    });

    console.log(`계산된 데이터 ${dataByDate.length}개 생성`);
    return dataByDate;
  };

  // 거래 내역 가져오기
  useEffect(() => {
    const fetchTradeHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // API에서 거래 내역 가져오기
        const history = await apiClient.tradeHistory();
        console.log(`API에서 ${history?.length || 0}개의 거래 내역을 불러왔습니다.`);

        if (!history || history.length === 0) {
          console.log("거래 내역이 없어 포트폴리오에서 시뮬레이션합니다.");
        } else {
          setTradeHistory(history);
        }
      } catch (error) {
        console.error('거래 내역 가져오기 실패:', error);
        setError("거래 내역을 불러오는데 실패했습니다.");
        setTradeHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeHistory();
  }, [assets]);

  // 거래 내역으로부터 차트 데이터 계산
  useEffect(() => {
    if (loading || !tradeHistory.length || !tickers || Object.keys(tickers).length === 0) {
      return;
    }

    try {
      console.log("차트 데이터 계산 중...");
      const data = calculateCumulativeProfitLossByDate(tradeHistory);
      console.log("계산된 차트 데이터:", data);

      if (data.length > 0) {
        setChartData(data);
        setError(null);
      } else {
        setError("계산된 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("차트 데이터 계산 중 오류:", err);
      setError("데이터 계산 중 오류가 발생했습니다.");
    }
  }, [tradeHistory, tickers, loading]);

  // 차트 그리기 (단 한번만 그리도록 설정)
  useEffect(() => {
    if (chartData.length === 0 || chartRef.current) return;

    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 수익/손실에 따른 색상 설정
      const gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const lastValue = chartData[chartData.length - 1]?.cumulativeProfitLossRate || 0;

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
        type: "line",
        data: {
          labels: chartData.map(item => item.date),
          datasets: [
            {
              label: "누적 수익률 (%)",
              data: chartData.map(item => item.cumulativeProfitLossRate),
              borderColor: lastValue >= 0 ? "#ff6384" : "#36A2EB",
              backgroundColor: gradientFill,
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: function (context) {
                const value = context.dataset.data[context.dataIndex] as number;
                return value >= 0 ? "#ff6384" : "#36A2EB";
              }
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "일별 누적 수익률 추이",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.parsed.y.toFixed(2) + "%";
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
              beginAtZero: false,
              suggestedMin: -100,
              suggestedMax: 100,
              ticks: {
                stepSize: 25,
                callback: function (value) {
                  return value + "%";
                },
                autoSkip: false,
                maxTicksLimit: 9,
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
  }, [chartData]);

  return (
    <div className="w-full h-[500px] flex flex-col justify-center items-center p-4 rounded-xl bg-white">
      <div className="w-full h-full relative">
        {loading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex justify-center items-center text-gray-500">
            {error}
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