import { create } from 'zustand';
import { useEffect } from 'react';
import axios from 'axios';

// Asset 타입
interface Asset {
  marketCode: string;
  marketName: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
}

// Zustand 스토어 정의
interface AssetState {
  assets: Asset[];
  holdings: number;

  setAssets: (assets: Asset[]) => void;

  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: Asset[], tickers: Record<string, any>) => number[];
  getDoughnutData: (assets: Asset[], tickers: Record<string, any>) => { label: string; data: number }[];
}

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
    const { getCurrentPrice, getTotalValuation } = get();
    const [, totalValuation] = getTotalValuation(assets, tickers);

    if (totalValuation === 0) return [];

    return assets.map((asset) => {
      const current = getCurrentPrice(asset.marketCode, tickers);
      const value = current * asset.quantity;
      return {
        label: asset.marketCode, 
        data: Math.round((value / totalValuation) * 10000) / 100,
      };
    });
  },
}));

// 포트폴리오 fetch 훅
export const useFetchPortfolio = () => {
  const setAssets = useAssetStore((state) => state.setAssets);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          console.error('Access token이 없습니다.');
          return;
        }

        const res = await axios.get('/api/v1/portfolio', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const data = res.data?.data ?? [];

        const formattedAssets: Asset[] = data.map((item: any) => ({
          marketCode: item.marketCode,
          marketName: item.marketCode,
          quantity: parseFloat(item.quantity ?? 0),
          averageCost: item.averageCost ?? 0,
          totalCost: item.totalCost ?? 0,
        }));

        setAssets(formattedAssets);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      }
    };

    fetchPortfolio();
  }, []);
};
