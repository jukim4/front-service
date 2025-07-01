'use client';

import { useRef, useState } from 'react';
import { useRouter } from "next/navigation";
import TotalBuyCoin from '@/components/TotalBuyCoin';
import { useAssetStore } from '@/store/assetStore';
import { useMarketStore } from '@/store/marketStore';
import PortfolioCoin from '@/components/PortfolioCoin';
import HoldingCointList from '@/components/HoldingCoinList';
import SearchBar from '@/components/SearchBar';
import MarketTabs from '@/components/MarketTabs';
import MarketSortBar from '@/components/MarketSortBar';
import MarketList from '@/components/MarketList';

export default function Holdings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("보유자산");

  const { assets, getDoughnutData } = useAssetStore();
  const { tickers } = useMarketStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tabs = ["보유자산", "투자손익"];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "보유자산") {
      router.push('/portfolio/holdings');
    } else {
      router.push('/portfolio/profit-loss');
    }
  };


  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Left Section */}
      <div className="col-span-2 border rounded-md overflow-hidden bg-white">
        <div className="w-full max-w-6xl mx-auto pt-4 bg-white px-4 p-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content (보유자산 탭) */}
        {activeTab === "보유자산" && (
          <div className="flex flex-col w-full max-w-6xl pl-4 bg-white">
            <TotalBuyCoin />

            <div className="mt-12">
              <p className="text-3xl text-center font-bold">보유 코인 포트폴리오</p>

              <div className="flex flex-col md:flex-row md:flex-wrap">
                {/* 도넛 차트 */}
                <div className="w-full flex justify-center">
                  <div className="w-full md:w-2/3 max-w-full aspect-square relative">
                    <canvas
                      ref={canvasRef}
                      id="total-doughnut"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* 차트 데이터 */}
                <div className="w-full md:w-1/2 overflow-hidden">
                  <PortfolioCoin
                    uid={1}
                    datas={getDoughnutData(assets, tickers)}
                    canvasRef={canvasRef}
                  />
                </div>
              </div>
            </div>

            <HoldingCointList />
          </div>
        )}
      </div>

      {/* Right (검색 및 마켓 영역) */}
      <div className="relative col-span-1">
        <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-2">
          {/* 상단 고정 영역 */}
          <div className="flex-shrink-0">
            <SearchBar />
            <div className="mt-2 rounded-t-md border-x border-t bg-white">
              <MarketTabs />
              <MarketSortBar />
            </div>
          </div>

          {/* 스크롤 가능 영역 */}
          <div className="flex-1 rounded-b-md border-x border-b bg-white overflow-y-auto">
            <MarketList />
          </div>
        </div>
      </div>
    </main>
  );
}
