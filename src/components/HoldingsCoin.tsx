'use client'
import { useRef } from "react";
import TotalBuyCoin from "./TotalBuyCoin";
import { useAssetStore } from "@/store/assetStore";
import { useMarketStore } from "@/store/marketStore";
import PortfolioCoin from "./PortfolioCoin";
import HoldingCointList from "./HoldingCoinList";

export default function HoldingsCoin() {
  const { assets, getDoughnutData } = useAssetStore();
  const { tickers } = useMarketStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50 ">
      <div className="col-span-3 px-4 md:px-10 lg:px-20 py-6 w-full max-w-7xl mx-auto bg-white border rounded-lg">
        <TotalBuyCoin />

        <div className="mt-8">
          <p className="text-xl font-semibold mb-4 ml-4">보유 코인 포트폴리오</p>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
            <div className="w-full md:w-1/2">
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
    </main>
  )
}
