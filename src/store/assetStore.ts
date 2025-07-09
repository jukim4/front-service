import { create } from 'zustand';
import { useEffect } from 'react';
import axios from 'axios';

// Asset 타입 정의
interface Asset {
  marketCode: string;
  marketName: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
}

// Zustand 스토어 타입 정의
interface AssetState {
  assets: Asset[];
  holdings: number;

  setAssets: (assets: Asset[]) => void;

  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: Asset[], tickers: Record<string, any>) => number[];
  getDoughnutData: (
    assets: Asset[],
    tickers: Record<string, any>
  ) => { label: string; data: number }[];
}

// Zustand 스토어 구현
export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  holdings: 0,

  setAssets: (assets: Asset[]) => set({ assets }),

  getCurrentPrice: (market: string, tickers: Record<string, any>) => {
    return tickers[market]?.trade_price || 0;
  },

  getTotalValuation: (assets: Asset[], tickers: Record<string, any>) => {
    const { getCurrentPrice, holdings } = get();

    const total_price = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
    const total_valuations = assets.reduce(
      (sum, asset) => sum + getCurrentPrice(asset.marketCode, tickers) * asset.quantity,
      0
    );

    const total_holding = total_valuations + holdings;
    const pl = total_valuations - total_price;
    const total_rateReturn = total_price === 0 ? 0 : (pl / total_price) * 100;

    return [total_price, total_valuations, total_holding, pl, total_rateReturn];
  },

  getDoughnutData: (assets: Asset[], tickers: Record<string, any>) => {
    if (!assets || !tickers) return [];

    const total = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
    if (total === 0) return [];

    return assets.map((asset) => ({
      label: asset.marketName,
      data: parseFloat(((asset.totalCost / total) * 100).toFixed(2)), // 비중(%)
    }));
  },
}));

// 포트폴리오 fetch 훅
export const useFetchPortfolio = () => {
  const setAssets = useAssetStore((state) => state.setAssets);

  useEffect(() => {
    // 실제 API 호출 대신 더미 데이터 사용
    const dummyAssets = [
      {
        marketCode: 'BTC',
        marketName: 'Bitcoin',
        quantity: 1.5,
        averageCost: 30000,
        totalCost: 45000,
      },
      {
        marketCode: 'ETH',
        marketName: 'Ethereum',
        quantity: 10,
        averageCost: 2000,
        totalCost: 20000,
      },
      {
        marketCode: 'XRP',
        marketName: 'Ripple',
        quantity: 500,
        averageCost: 0.5,
        totalCost: 250,
      },
    ];

    setAssets(dummyAssets);
  }, []);
};