import { useAssetStore } from '@/store/assetStore';
import { useMarketStore } from '@/store/marketStore';

const ProfitSummary = () => {
  const tickers = useMarketStore(state => state.tickers);
  const { assets, getValuationSummary } = useAssetStore();
  const displayData = getValuationSummary(assets, tickers);

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-2 gap-2 ml-8 my-6 items-center">
        {/* 좌측: 기간 누적 손익 */}
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
              {displayData.cumulativeProfitLossRate.toFixed(2)}%
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
};

export default ProfitSummary;
