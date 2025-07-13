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
  concludedAt: string; // 거래 시간 추가
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
  
  // 새로운 메소드 인터페이스 추가
  getProfitLossDataFromTradeHistory: (
    trades: TradeHistory[],
    tickers: Record<string, any>
  ) => {
    cumulativeProfitLoss: number;
    cumulativeProfitLossRate: number;
    averageInvestment: number;
  };
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

 // 기간별 손익 데이터 계산 메소드 구현
getProfitLossDataFromTradeHistory: (
  trades: TradeHistory[],
  tickers: Record<string, any>
) => {
  const map = new Map<string, { quantity: number; totalCost: number }>();
  let totalBuyAmount = 0;        // 총 매수 금액
  let totalSellAmount = 0;       // 총 매도 금액
  let realizedProfitLoss = 0;    // 실현된 손익
  
  // 각 거래에 따른 포지션 계산
  trades.forEach((trade: TradeHistory) => {
    const { marketCode, orderPosition, tradeQuantity, tradePrice } = trade;
    const entry = map.get(marketCode) || { quantity: 0, totalCost: 0 };
    
    if (orderPosition === "BUY") {
      entry.quantity += tradeQuantity;
      entry.totalCost += tradeQuantity * tradePrice;
      totalBuyAmount += tradeQuantity * tradePrice;
    } 
    else if (orderPosition === "SELL") {
      // 평균 매수 가격 계산
      const avgBuyPrice = entry.quantity > 0 ? entry.totalCost / entry.quantity : 0;
      
      // 해당 매도에 대한 실현 손익 계산
      const sellAmount = tradeQuantity * tradePrice;
      const buyAmount = tradeQuantity * avgBuyPrice;
      const tradeProfitLoss = sellAmount - buyAmount;
      
      // 전체 실현 손익에 더함
      realizedProfitLoss += tradeProfitLoss;
      totalSellAmount += sellAmount;
      
      // 포지션 업데이트
      entry.quantity -= tradeQuantity;
      entry.totalCost = entry.quantity * avgBuyPrice; // 남은 포지션에 대한 비용
    }
    
    map.set(marketCode, entry);
  });
  
  // 현재 보유 중인 자산의 미실현 손익 계산
  let totalHoldingCost = 0;     // 보유 자산 비용
  let totalCurrentValue = 0;    // 보유 자산의 현재 가치
  
  for (const [marketCode, { quantity, totalCost }] of Array.from(map.entries())) {
    if (quantity <= 0) continue;
    
    const currentPrice = tickers[marketCode]?.trade_price ?? 0;
    totalHoldingCost += totalCost;
    totalCurrentValue += quantity * currentPrice;
  }
  
  // 미실현 손익
  const unrealizedProfitLoss = totalCurrentValue - totalHoldingCost;
  
  // 총 손익 = 실현 손익 + 미실현 손익
  const cumulativeProfitLoss = realizedProfitLoss + unrealizedProfitLoss;
  
  // 손익률 계산
  // totalBuyAmount가 0이면 분모가 0이 되므로 조건 처리
  const cumulativeProfitLossRate = totalBuyAmount > 0 
    ? (cumulativeProfitLoss / totalBuyAmount) * 100 
    : 0;
    
  // 기간 평균 투자 금액 = 총 매수 금액
  const averageInvestment = totalBuyAmount;
  
  return {
    cumulativeProfitLoss,
    cumulativeProfitLossRate,
    averageInvestment,
    realizedProfitLoss,       
    unrealizedProfitLoss,      
    totalBuyAmount,            
    totalSellAmount            
  };
}
}));