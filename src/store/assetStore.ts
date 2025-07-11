import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

export type PortfolioItem = {
  market_code: string; // 마켓코드 (ex. KRW-BTC)
  position: number;     // 0 = BUY, 1 = SELL
  total_price: number;  // 투입 금액
  coin_ticker: string;  // BTC, ETH 등
};

interface AssetState {
  assets: PortfolioItem[];
  holdings: number;

  fetchPortfolio: () => void;
  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: PortfolioItem[], tickers: Record<string, any>) => number[];
  getDoughnutData: (assets: PortfolioItem[], tickers: Record<string, any>) => { label: string; data: number }[];
  getValuationSummary: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    totalInvestment: number;
    totalValuation: number;
    cumulativeProfitLoss: number;
    cumulativeProfitLossRate: number;
    averageInvestment: number;
  };
}

const getUserPortfolio = async (market_code?: string) => {
  const portfolio: PortfolioItem[] = await apiClient.userPorfolio(market_code);
  const holdings = await apiClient.userHoldings();
  const holding = holdings.asset;

  return { portfolio, holdings: holding };
};

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  holdings: 0,

// API에서 유저 포트폴리오 및 보유 현금 정보를 가져와 상태에 저장
  fetchPortfolio: async (market_code?: string) => {
    const { portfolio, holdings } = await getUserPortfolio(market_code);
    set({ assets: portfolio, holdings });
  },

// tickers[market_code].trade_price를 이용해 현재가 가져옴
  getCurrentPrice: (market: string, tickers: Record<string, any>) => {
    return tickers[market]?.trade_price || 0;
  },
//총 매수 금액 (totalInvestment)과 현재 평가 금액 (totalValuation) 계산
  getTotalValuation: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();
    let totalInvestment = 0;
    let totalValuation = 0;

    assets.filter(item => item.position === 0).forEach(item => {
      const currentPrice = getCurrentPrice(item.market_code, tickers);
      totalInvestment += item.total_price;
      totalValuation += currentPrice * (item.total_price / currentPrice); // 수량 = total_price / currentPrice
    });

    return [totalInvestment, totalValuation];
  }, //totalValuation NaN 방지 해야함

  // 총 투자금, 평가 금액, 손익, 손익률, 평균 투자 금액 리턴
  getValuationSummary: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();
    const buyItems = assets.filter(item => item.position === 0);

    const totalInvestment = buyItems.reduce((sum, item) => sum + item.total_price, 0);
    const totalValuation = buyItems.reduce((sum, item) => {
      const currentPrice = getCurrentPrice(item.market_code, tickers);
      return sum + currentPrice * (item.total_price / currentPrice);
    }, 0);

    const cumulativeProfitLoss = totalValuation - totalInvestment;
    const cumulativeProfitLossRate = totalInvestment > 0 ? (cumulativeProfitLoss / totalInvestment) * 100 : 0;
    const averageInvestment = buyItems.length > 0 ? totalInvestment / buyItems.length : 0;

    return {
      totalInvestment,
      totalValuation,
      cumulativeProfitLoss,
      cumulativeProfitLossRate,
      averageInvestment
    };
  },

  // 각 자산의 평가금액 비중을 퍼센트로 변환 (도넛 차트 등 시각화에 사용)
  getDoughnutData: (assets: PortfolioItem[], tickers: Record<string, any>) => {
  const { getCurrentPrice, getTotalValuation } = get();
  const [, totalValuation] = getTotalValuation(assets, tickers);

  if (totalValuation === 0) return [];

  return assets
    .filter(asset => asset.position === 0)
    .map(asset => {
      const value = asset.total_price;
      return {
        label: asset.coin_ticker,
        data: Number(((value / totalValuation) * 100).toFixed(2)),
      };
    });
}



}));