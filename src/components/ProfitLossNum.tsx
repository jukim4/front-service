import { format } from "date-fns";
import { useState, useEffect } from "react";
import axios from "axios";
import { useProfitLossStore } from "../store/useProfitLossStore";

interface PortfolioItem {
  name: string;
  quantity: number;
  average_cost: number;
}

interface ProfitLossData {
  cumulativeProfitLoss: number;
  cumulativeProfitLossRate: number;
  averageInvestment: number;
}

interface ProfitLossNumProps {
  data?: ProfitLossData;
}

function ProfitLossNum({ data }: ProfitLossNumProps) {
  const displayData = data || {
    cumulativeProfitLoss: 0,
    cumulativeProfitLossRate: 0,
    averageInvestment: 0,
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-2 gap-2 ml-8 my-6 items-center">
        <div className="flex flex-col items-start space-y-3 self-start">
          <span className="text-gray-500 font-medium">기간 누적 손익</span>
          <div className="flex space-x-2">
            <p className="text-6xl font-bold text-blue-500">
              {displayData.cumulativeProfitLoss.toLocaleString()}
            </p>
            <p className="text-gray-500 font-semibold text-xl self-end">KRW</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 self-end">
          <div className="flex flex-col items-start">
            <span className="text-gray-500 font-medium">기간 누적 손익률</span>
            <span className="text-blue-500 font-semibold my-2">
              {`${displayData.cumulativeProfitLossRate.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-gray-500 font-medium">기간 평균 투자 금액</span>
            <div className="space-x-1">
              <span className="font-semibold">
                {displayData.averageInvestment.toLocaleString()}
              </span>
              <span className="text-gray-500 font-semibold">KRW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfitLossWrapper() {
  const periodOptions = ["1주일", "1개월", "3개월", "직접입력"];
  const [selectedPeriod, setSelectedPeriod] = useState("1개월");
  const [periodNum, setPeriodNum] = useState(30);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCumulativeProfitLossRate } = useProfitLossStore();

  const setPeriod = (p: string) => {
    setSelectedPeriod(p);
    switch (p) {
      case "1주일":
        setPeriodNum(7);
        break;
      case "1개월":
        setPeriodNum(30);
        break;
      case "3개월":
        setPeriodNum(90);
        break;
      case "직접입력":
        break;
      default:
        setPeriodNum(30);
    }
  };

  useEffect(() => {
    const now = new Date();
    const before = new Date(now.getTime() - periodNum * 24 * 60 * 60 * 1000);
    setStartDate(before);
    setEndDate(now);
  }, [periodNum]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const portfolioRes = await axios.get<{ portfolio: PortfolioItem[] }>("/portfolio/profit-loss");
        const portfolio = portfolioRes.data.portfolio;

        if (!portfolio || portfolio.length === 0) {
          setData(null);
          setLoading(false);
          return;
        }

        const symbols = portfolio.map((item) => item.name).join(",");

        const pricesRes = await axios.get<{ prices: Record<string, number> }>("/api/v1/portfolio", {
          params: { symbols },
        });
        const prices = pricesRes.data.prices;

        const totalInvestment = portfolio.reduce(
          (acc, item) => acc + item.average_cost * item.quantity,
          0
        );

        const cumulativeProfitLoss = portfolio.reduce((acc, item) => {
          const currentPrice = prices[item.name] ?? 0;
          return acc + (currentPrice - item.average_cost) * item.quantity;
        }, 0);

        const cumulativeProfitLossRate =
          totalInvestment === 0 ? 0 : (cumulativeProfitLoss / totalInvestment) * 100;

        const averageInvestment = periodNum === 0 ? 0 : totalInvestment / periodNum;

        const newData = {
          cumulativeProfitLoss,
          cumulativeProfitLossRate,
          averageInvestment,
        };

        setData(newData);
        setCumulativeProfitLossRate(cumulativeProfitLossRate); // ⭐ store에 저장
      } catch (e) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodNum]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-start space-x-4">
        <div className="flex space-x-4">
          <span className="text-sm text-gray-500">기간</span>
          {startDate && endDate ? (
            <span className="text-sm text-gray-500">
              {`${format(startDate, "yyyy.MM.dd")} - ${format(endDate, "yyyy.MM.dd")}`}
            </span>
          ) : (
            <span className="text-sm text-gray-400">날짜 계산 중...</span>
          )}
        </div>

        <div className="flex space-x-2">
          {periodOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs border rounded ${
                selectedPeriod === p
                  ? "bg-blue-50 border-blue-300 text-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading && <div>로딩중...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && <ProfitLossNum data={data ?? undefined} />}
    </div>
  );
}
