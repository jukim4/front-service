import { create } from 'zustand';

interface Asset {
    market_code: string;
    market_name: string;
    total_coin_price: number;
    total_coin_cnt: number; // 매수 수량
}

interface AssetState {
  assets: Asset[];
  holdings: number;

  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: Asset[], tickers: Record<string, any>) => number[];
  getDoughnutData: (assets: Asset[], tickers: Record<string, any>) => { label: string; data: number; }[];
}

export const useAssetStore = create<AssetState>((set, get) => ({

    assets: [
        {
            market_code: 'KRW-BTC',
            market_name: '비트코인',
            total_coin_price: 409482,
            total_coin_cnt: 0.123,
        },
        {
            market_code: 'KRW-ETH',
            market_name: '이더리움',
            total_coin_price: 409482000,
            total_coin_cnt: 10,
        },
        {
            market_code: 'KRW-USDT',
            market_name: '테더',
            total_coin_price: 40948200000,
            total_coin_cnt: 0.123,
        },
        
    ],
    holdings: 0,

    // 현재가 가져오기
    getCurrentPrice: (market: string, tickers: Record<string, any>) => {
        const price = tickers[market]?.trade_price;

        if (price) {
            return price;
        }
        return 0;
    },

    getTotalValuation: (assets: Asset[], tickers: Record<string, any>) => {
        const {getCurrentPrice, holdings} = get();

        // 총 매수 코인 가격
        const total_price = assets.reduce((sum, asset) => sum + asset.total_coin_price, 0);

        // 현재가 x 보유 코인 개수
        let valuations = assets.map((asset) => getCurrentPrice(asset.market_code, tickers) * asset.total_coin_cnt);
        let total_valuations = valuations.reduce((sum, price) => sum + price, 0); // 총평가

        let total_holding = total_valuations + holdings; // 총 보유자산
        let pl = total_valuations - total_price; // 평가손익
        let total_rateReturn = pl/total_price * 100; // 총 수익률

        

        let result = [total_price, total_valuations, total_holding, pl, total_rateReturn];

        return result;   
    },

    getDoughnutData: (assets: Asset[], tickers: Record<string, any>) => {
        const { getCurrentPrice, getTotalValuation } = get();
        const result = getTotalValuation(assets, tickers);
        
        const data = assets.map((asset) => {
            // asset.market_code로 현재가를 가져와서 계산
            const current = getCurrentPrice(asset.market_code, tickers);
            return {
                label: asset.market_name,
                data: Number((current * asset.total_coin_cnt) / result[1]) * 100,
            }
        })
        return data;
    },
}))