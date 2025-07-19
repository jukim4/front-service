import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

// PortfolioDto 구조에 맞는 타입
export type PortfolioDto = {
  name: string;           // 종목명 (예: "BTC")
  quantity: number;       // 구매 수량
  average_cost: number;   // 평단가
  total_cost: number;     // 총 구매 가격
};

interface AssetState {
  assets: PortfolioDto[];
  holdings: number;
  isLoading: boolean;

  fetchPortfolio: (market_code?: string) => Promise<void>;
  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: PortfolioDto[], tickers: Record<string, any>) => [number, number];
  getDoughnutData: (assets: PortfolioDto[], tickers: Record<string, any>) => { label: string; data: number }[];
  getTotalSummary: (assets: PortfolioDto[], tickers: Record<string, any>, holdings: number) => [number, number, number, number, number];
}

// 보유코인 및 보유자산 조회 후 하나의 배열로 반환
const getUserPortfolio = async (market_code?: string) => {
  const portfolioResponse: PortfolioDto[] = await apiClient.userPorfolio(market_code);
  const holdingsResponse = await apiClient.userHoldings();

  return { portfolio: portfolioResponse, holdings: holdingsResponse.asset };
};

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  holdings: 0,
  isLoading: false,

  // 보유코인 및 보유자산 조회
  fetchPortfolio: async (market_code?: string) => {
    const { isLoading } = get();
    if (isLoading) return; // 이미 로딩 중이면 중복 호출 방지

    try {
      set({ isLoading: true });
      const { portfolio, holdings } = await getUserPortfolio(market_code);
      set({ assets: portfolio, holdings: holdings });
    } finally {
      set({ isLoading: false });
    }
  },

  // 현재 시세 계산
  getCurrentPrice: (market: string, tickers: Record<string, any>) => {
    return tickers[market]?.trade_price ?? 0;
  },

  // 총 평가 금액 계산
  getTotalValuation: (assets: PortfolioDto[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();
    let totalBuyAmount = 0;
    let totalValuation = 0;

    assets.forEach(item => {
      const currentPrice = getCurrentPrice(item.name, tickers);
      if (currentPrice === 0) return;

      totalBuyAmount += item.total_cost;
      totalValuation += item.quantity * currentPrice;
    });

    return [totalBuyAmount, totalValuation];
  },

  // 원형 차트 데이터 계산
  getDoughnutData: (assets: PortfolioDto[], tickers: Record<string, any>) => {
    const { getCurrentPrice, getTotalValuation } = get();
    const [, totalValuation] = getTotalValuation(assets, tickers);

    if (totalValuation === 0) return [];

    return assets
      .map(asset => {
        const currentPrice = getCurrentPrice(asset.name, tickers);
        if (currentPrice === 0) return { label: asset.name, data: 0 };

        const valuation = asset.quantity * currentPrice;

        return {
          label: asset.name,
          data: Number(((valuation / totalValuation) * 100).toFixed(2)),
        };
      })
      .filter(item => item.data > 0);
  },

  // Portfolio 기반 총 요약 계산 메서드 구현
  getTotalSummary: (
    assets: PortfolioDto[],
    tickers: Record<string, any>,
    holdings: number
  ): [number, number, number, number, number] => {
    const { getTotalValuation } = get();
    const [totalBuyAmount, totalValuation] = getTotalValuation(assets, tickers);

    const totalProfitLoss = totalValuation - totalBuyAmount;
    const totalProfitLossRate = totalBuyAmount > 0 ? (totalProfitLoss / totalBuyAmount) * 100 : 0;
    const totalAsset = holdings + totalValuation;
    
    return [
      totalBuyAmount,      // 총 매수 금액
      totalValuation,      // 총 평가 금액
      totalAsset,          // 총 보유 자산
      totalProfitLoss,     // 총 평가 손익
      totalProfitLossRate  // 총 평가 수익률
    ];
}
}));