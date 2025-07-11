import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

type PortfolioItem = {
  name: string;
  quantity: number;
  average_cost: number;
  total_cost: number;
}

interface AssetState {
  assets: PortfolioItem[];
  holdings: number;

  fetchPortfolio: () => void;
  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: PortfolioItem[], tickers: Record<string, any>) => number[];
  getDoughnutData: (assets: PortfolioItem[], tickers: Record<string, any>) => { label: string; data: number; }[];
  getValuationSummary: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    totalInvestment: number;
    totalValuation: number;
    cumulativeProfitLoss: number;
    cumulativeProfitLossRate: number;
    averageInvestment: number;
  };
  getCumulativeProfitLossByDate: (assets: PortfolioItem[], tickers: Record<string, any>) => { date: string; cumulativeProfitLossRate: number }[];
}

const getUserPortfolio = async () => {
    const portfolio: PortfolioItem[] = await apiClient.userPorfolio();
    const holdings = await apiClient.userHoldings();
    const holding = holdings.asset;

    return {portfolio: portfolio, holdings: holding};
}

export const useAssetStore = create<AssetState>((set, get) => ({

    assets: [],
    holdings: 0,

    // user 포트폴리오 저장
    fetchPortfolio: async () => {
        const {portfolio, holdings} = await getUserPortfolio();
        set({assets: portfolio, holdings: holdings})
    },

    // 현재가 가져오기
    getCurrentPrice: (market: string, tickers: Record<string, any>) => {
        const price = tickers[market]?.trade_price;

        if (price) {
            return price;
        }
        return 0;
    },

    getTotalValuation: (assets: PortfolioItem[], tickers: Record<string, any>) => {
        const {getCurrentPrice, holdings} = get();

        // 총 매수 코인 가격
        const total_price = assets.reduce((sum, asset) => sum + asset.total_cost, 0);

        // 현재가 x 보유 코인 개수
        let valuations = assets.map((asset) => getCurrentPrice(asset.name, tickers) * asset.quantity);
        let total_valuations = valuations.reduce((sum, price) => sum + price, 0); // 총평가
        

        let total_holding = total_valuations + holdings; // 총 보유자산
        
        let pl = total_valuations - total_price; // 평가손익
        let total_rateReturn = pl/total_price * 100; // 총 수익률

        

        let result = [total_price, total_valuations, total_holding, pl, total_rateReturn];

        return result;   
    },

    getDoughnutData: (assets: PortfolioItem[], tickers: Record<string, any>) => {
        const { getCurrentPrice, getTotalValuation } = get();
        const result = getTotalValuation(assets, tickers);
        
        const data = assets.map((asset) => {
            // asset.market_code로 현재가를 가져와서 계산
            const current = getCurrentPrice(asset.name, tickers);
            return {
                label: asset.name,
                data: Number((current * asset.total_cost) / result[1]) * 100,
            }
        })
        return data;
    },

    getValuationSummary: (assets: PortfolioItem[], tickers: Record<string, any>) => {
        const { getCurrentPrice } = get();
    
        const totalInvestment = assets.reduce((sum, asset) => sum + asset.total_cost, 0);
        const totalValuation = assets.reduce(
          (sum, asset) => sum + getCurrentPrice(asset.name, tickers) * asset.quantity,
          0
        );
    
        const cumulativeProfitLoss = totalValuation - totalInvestment;
        const cumulativeProfitLossRate = totalInvestment === 0 ? 0 : (cumulativeProfitLoss / totalInvestment) * 100;
        const averageInvestment = assets.length === 0 ? 0 : totalInvestment / assets.length;
    
        return {
          totalInvestment,
          totalValuation,
          cumulativeProfitLoss,
          cumulativeProfitLossRate,
          averageInvestment,
        };
      },
    
      // 날짜별 누적 수익률 배열 반환 함수 (예시: 날짜 순서대로 계산)
      getCumulativeProfitLossByDate: (assets: PortfolioItem[], tickers: Record<string, any>) => {
        if (!assets.length) return [];
    
        // 날짜 기준으로 오름차순 정렬
        const sortedAssets = [...assets].sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    
        // 날짜별 누적 계산 저장
        const dateMap: Record<string, PortfolioItem[]> = {};
    
        sortedAssets.forEach((asset) => {
          if (!dateMap[asset.name]) dateMap[asset.name] = [];
          dateMap[asset.name].push(asset);
        });
    
        const results: { date: string; cumulativeProfitLossRate: number }[] = [];
    
        // 누적자산과 누적투자금 계산용 변수
        let cumulativeAssets: PortfolioItem[] = [];
    
        // 날짜 오름차순 순회하면서 누적값 계산
        Object.keys(dateMap)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .forEach((date) => {
            // 현재 날짜 자산을 누적 리스트에 추가
            cumulativeAssets = cumulativeAssets.concat(dateMap[date]);
    
            // 현재 누적 자산에 대해 계산
            const { totalInvestment, cumulativeProfitLossRate } = get().getValuationSummary(
              cumulativeAssets,
              tickers
            );
    
            results.push({ date, cumulativeProfitLossRate });
          });
    
        return results;
      },
}))