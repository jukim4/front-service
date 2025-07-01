
import { format } from "date-fns";
import { useState } from "react";

export default function ProfitLossNum() {
  const [selectedPeriod, setSelectedPeriod] = useState("1개월");
  const period = ['1주일', '1개월', '3개월', '직접입력'];
  const [periodNum, setPeriodNum] = useState(30);

  const default_sTime = new Date();
  const default_eTime = new Date(default_sTime.getTime() - periodNum * 24 * 60 * 60 * 1000);

  const setPeriod = (period: string) => {
      setSelectedPeriod(period);
      if (period === "1주일") setPeriodNum(7);
      if (period === "1개월") setPeriodNum(30);
      if (period === "3개월") setPeriodNum(90);
    }
    
    return (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-start space-x-4">
            <div className="flex space-x-4">
              <span className="text-sm text-gray-500">기간</span>
              <span className="text-sm text-gray-500">{`${format(default_sTime, 'yyyy.MM.dd')} - ${format(default_eTime, 'yyyy.MM.dd')}`}</span>
            </div>
            <div className="flex space-x-2">
              {period.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs border rounded 
                    ${selectedPeriod == p ? "bg-blue-50 border-blue-300 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`} 
                >{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 ml-8 my-6 items-center">
            <div className="flex flex-col items-start space-y-3 self-start">
              <span className="text-gray-500 font-medium">기간 누적 손익</span>
              <div className="flex space-x-2">
                <p className="text-6xl font-bold text-blue-500">-7,123,531</p>
                <p className="text-gray-500 font-semibold text-xl self-end">KRW</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 self-end">
              <div className="flex flex-col items-start">
                <span className="text-gray-500 font-medium">기간 누적 손익률</span>
                <span className="text-blue-500 font-semibold my-2">-6.25%</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-gray-500 font-medium">기간 평균 투자 금액</span>
                <div className="space-x-1">
                  <span className="font-semibold">90,343,123</span>
                  <span className="text-gray-500 font-semibold">KRW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}