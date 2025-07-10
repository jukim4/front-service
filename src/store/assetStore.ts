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
}

const  getUserPortfolio = async () => {
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
}))