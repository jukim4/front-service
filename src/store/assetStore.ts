import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

export type PortfolioItem = {
  market_code: string;
  position: number;
  total_price: number;
  coin_ticker: string;
  quantity: number;
};

type TradeHistory = {
  marketCode: string;
  orderPosition: 'BUY' | 'SELL';
  tradeQuantity: number;
  tradePrice: number;
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
  getTotalSummaryArray: (assets: PortfolioItem[], tickers: Record<string, any>) => number[];

  getTotalSummaryArrayFromTradeHistory: (
    periodTrade: TradeHistory[],
    tickers: Record<string, any>,
    totalHoldings: number
  ) => number[];
}

const getUserPortfolio = async (market_code?: string) => {
  const portfolio: PortfolioItem[] = await apiClient.userPorfolio(market_code);
  const holdingsResponse = await apiClient.userHoldings();

  const coins = Array.isArray(holdingsResponse?.coins) ? holdingsResponse.coins : [];
  const totalAsset = holdingsResponse?.asset ?? 0;

  const enrichedPortfolio = portfolio.map(item => {
    const coin = coins.find((c: { coin_ticker: string; quantity: number }) => c.coin_ticker === item.coin_ticker);
    return {
      ...item,
      quantity: coin?.quantity ?? 0
    };
  });

  return { portfolio: enrichedPortfolio, holdings: totalAsset };
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

        totalInvestment += item.total_price;
        totalValuation += item.quantity * currentPrice;
      });

    return [totalInvestment, totalValuation];
  },

  getValuationSummary: (assets, tickers) => {
    const { getCurrentPrice } = get();
    const buyItems = assets.filter(item => item.position === 0);

    const totalInvestment = buyItems.reduce((sum, item) => sum + item.total_price, 0);
    const totalValuation = buyItems.reduce((sum, item) => {
      const currentPrice = getCurrentPrice(item.market_code, tickers);
      return sum + item.quantity * currentPrice;
    }, 0);

    const cumulativeProfitLoss = totalValuation - totalInvestment;
    const cumulativeProfitLossRate = totalInvestment > 0
      ? (cumulativeProfitLoss / totalInvestment) * 100
      : 0;
    const averageInvestment = buyItems.length > 0
      ? totalInvestment / buyItems.length
      : 0;

    return {
      totalInvestment,
      totalValuation,
      cumulativeProfitLoss,
      cumulativeProfitLossRate,
      averageInvestment,
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

        const valuation = asset.quantity * currentPrice;

        return {
          label: asset.coin_ticker,
          data: Number(((valuation / totalValuation) * 100).toFixed(2)),
        };
      })
      .filter(item => item.data > 0);
  },

  getTotalSummaryArray: (assets: PortfolioItem[], tickers: Record<string, any>) => {
    const summary = get().getValuationSummary(assets, tickers);
    const holdings = get().holdings;

    return [
      summary.totalInvestment,
      summary.totalValuation,
      holdings,
      summary.cumulativeProfitLoss,
      summary.cumulativeProfitLossRate,
    ];
  },

  getTotalSummaryArrayFromTradeHistory: (
    periodTrade: TradeHistory[],
    tickers: Record<string, any>,
    totalHoldings: number
  ): number[] => {
    const map = new Map<string, { quantity: number; totalCost: number }>();

    periodTrade.forEach((trade: TradeHistory) => {
      const { marketCode, orderPosition, tradeQuantity, tradePrice } = trade;
      const entry = map.get(marketCode) || { quantity: 0, totalCost: 0 };

      if (orderPosition === "BUY") {
        entry.quantity += tradeQuantity;
        entry.totalCost += tradeQuantity * tradePrice;
      } else if (orderPosition === "SELL") {
        const avgBuyPrice = entry.quantity > 0 ? entry.totalCost / entry.quantity : 0;
        entry.quantity -= tradeQuantity;
        entry.totalCost -= tradeQuantity * avgBuyPrice;
      }

      map.set(marketCode, entry);
    });

    let totalInvestment = 0;
    let totalValuation = 0;

    for (const [marketCode, { quantity, totalCost }] of Array.from(map.entries())) {
      if (quantity <= 0) continue;

      const currentPrice = tickers[marketCode]?.trade_price ?? 0;
      totalInvestment += totalCost;
      totalValuation += quantity * currentPrice;
    }

    const profitLoss = totalValuation - totalInvestment;
    const profitLossRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    return [
      totalInvestment,
      totalValuation,
      totalHoldings,
      profitLoss,
      profitLossRate
    ];
  },
}));
