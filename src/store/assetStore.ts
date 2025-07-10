import { create } from 'zustand';
import { useEffect } from 'react';
import axios from 'axios';
import { apiClient } from '@/lib/apiClient';
import {useMarketStore} from '@/store/marketStore';
interface Asset {
  marketCode: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  date: string; //날짜 값이 없어서 누적 수익률 그래프 안뜸
}

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
  getValuationSummary: (
    assets: Asset[],
    tickers: Record<string, any>
  ) => {
    totalInvestment: number;
    totalValuation: number;
    cumulativeProfitLoss: number;
    cumulativeProfitLossRate: number;
    averageInvestment: number;
  };

  getCumulativeProfitLossByDate: (
    assets: Asset[],
    tickers: Record<string, any>
  ) => { date: string; cumulativeProfitLossRate: number }[];
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
    if (!assets || !tickers) return [];

    const total = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
    if (total === 0) return [];

    return assets.map((asset) => ({
      label: asset.marketCode,
      data: parseFloat(((asset.totalCost / total) * 100).toFixed(2)),
    }));
  },

  getValuationSummary: (assets: Asset[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();

    const totalInvestment = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
    const totalValuation = assets.reduce(
      (sum, asset) => sum + getCurrentPrice(asset.marketCode, tickers) * asset.quantity,
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
  getCumulativeProfitLossByDate: (assets: Asset[], tickers: Record<string, any>) => {
    if (!assets.length) return [];

    // 날짜 기준으로 오름차순 정렬
    const sortedAssets = [...assets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 날짜별 누적 계산 저장
    const dateMap: Record<string, Asset[]> = {};

    sortedAssets.forEach((asset) => {
      if (!dateMap[asset.date]) dateMap[asset.date] = [];
      dateMap[asset.date].push(asset);
    });

    const results: { date: string; cumulativeProfitLossRate: number }[] = [];

    // 누적자산과 누적투자금 계산용 변수
    let cumulativeAssets: Asset[] = [];

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
}));

// 포트폴리오 fetch 훅
export const useFetchPortfolio = () => {
  const setAssets = useAssetStore((state) => state.setAssets);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const assets = await apiClient.userPorfolio();
        console.log("Fetched assets:", assets); 
        setAssets(assets);
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      }
    };

    fetchPortfolio();
  }, []);
};