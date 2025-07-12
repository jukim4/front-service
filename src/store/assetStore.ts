import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

export type PortfolioItem = {
  market_code: string; // 마켓코드 (ex. KRW-BTC)
  position: number;     // 0 = BUY, 1 = SELL
  total_price: number;  // 투입 금액 (매수 총액)
  coin_ticker: string;  // BTC, ETH 등
};

interface AssetState {
  assets: PortfolioItem[];
  holdings: number;

  fetchPortfolio: (market_code?: string) => Promise<void>;
  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: PortfolioItem[], tickers: Record<string, any>) => [number, number];
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

  fetchPortfolio: async (market_code?: string) => {
    const { portfolio, holdings } = await getUserPortfolio(market_code);
    set({ assets: portfolio, holdings });
  },

  getCurrentPrice: (market: string, tickers: Record<string, any>) => {
    return tickers[market]?.trade_price ?? 0;
  },

  getTotalValuation: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();
    let totalInvestment = 0;
    let totalValuation = 0;

    assets
      .filter(item => item.position === 0)
      .forEach(item => {
        const currentPrice = getCurrentPrice(item.market_code, tickers);
        if (currentPrice === 0) return;

        const quantity = item.total_price / currentPrice;
        totalInvestment += item.total_price;
        totalValuation += currentPrice * quantity;
      });

    return [totalInvestment, totalValuation];
  },

  getValuationSummary: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();
    const buyItems = assets.filter(item => item.position === 0);

    const totalInvestment = buyItems.reduce((sum, item) => sum + item.total_price, 0);
    const totalValuation = buyItems.reduce((sum, item) => {
      const currentPrice = getCurrentPrice(item.market_code, tickers);
      if (currentPrice === 0) return sum;

      const quantity = item.total_price / currentPrice;
      return sum + currentPrice * quantity;
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

  getDoughnutData: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    const { getCurrentPrice, getTotalValuation } = get();
    const [, totalValuation] = getTotalValuation(assets, tickers);

    if (totalValuation === 0) return [];

    return assets
      .filter(asset => asset.position === 0)
      .map(asset => {
        const currentPrice = getCurrentPrice(asset.market_code, tickers);
        if (currentPrice === 0) return { label: asset.coin_ticker, data: 0 };

        const quantity = asset.total_price / currentPrice;
        const valuation = currentPrice * quantity;

        return {
          label: asset.coin_ticker,
          data: Number(((valuation / totalValuation) * 100).toFixed(2)),
        };
      })
      .filter(item => item.data > 0);
  }
}));
