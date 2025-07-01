'use client'

import { useRef, useState } from "react";

import CumulativeChart from "./CumulativeChart";
import ProfitLossChart from "./ProfitLossChart";
import ProfitLossNum from "./ProfitLossNum";

import MarketSortBar from "@/components/MarketSortBar";
import MarketTabs from "@/components/MarketTabs";
import SearchBar from "@/components/SearchBar";
import MarketList from "@/components/MarketList";
import { useRouter } from "next/navigation";

export default function ProfitLoss() {

  const [activeTab, setActiveTab] = useState("투자손익");

  const tabs = ["보유자산", "투자손익"];

  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === "보유자산") {
      router.push('/portfolio/holdings');
    } else { 
      router.push('/portfolio/profit-loss');
    }
  }
  
  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">

      <div className="col-span-2 border rounded-md overflow-hidden bg-white">

        <div className="w-full max-w-6xl mx-auto pt-4 bg-white px-4 p-4">
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
        </div>

        <div className="flex flex-col space-y-4 w-full max-w-6xl mx-auto px-4 bg-white">

          <div>
            <ProfitLossNum></ProfitLossNum>
          </div>


          <div className="flex flex-col space-y-4">

            <span className="text-gray-500 font-medium">투자손익 그래프</span>

            <div className="grid grid-cols-2">
              <canvas id="cumulative" width={400} height={400}></canvas>
              <CumulativeChart></CumulativeChart>

              <canvas id="profitloss" width={400} height={400}></canvas>
              <ProfitLossChart></ProfitLossChart>
            </div>

          </div>

          
        </div>
      </div>

      {/* Right section - 1/3 width (1 column) */}
      <div className="relative col-span-1">
        <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-2">
          {/* Non-scrolling part */}
          <div className="flex-shrink-0">
            <SearchBar />
            <div className="mt-2 rounded-t-md border-x border-t bg-white">
              <MarketTabs />
              <MarketSortBar />
            </div>
          </div>
            
          {/* Scrolling part */}
          <div className="flex-1 rounded-b-md border-x border-b bg-white overflow-y-auto">
            <MarketList />
          </div>
        </div>
      </div>



    </main>
  )
}