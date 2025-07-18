'use client'

import { useState } from "react";

import CumulativeChart from "./CumulativeChart";
import ProfitLossChart from "./ProfitLossChart";
import ProfitLossWrapper from "./ProfitLossNum"; // 변경된 이름 사용
import MarketListCompoenet from "./MarketListComponent";
import { useRouter } from "next/navigation";
export default function ProfitLossPage() {
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

        <div className="flex flex-col space-y-4 w-full max-w-6xl mx-auto px-4 bg-white">
          <ProfitLossWrapper />

          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ProfitLossChart />
              <CumulativeChart />
            </div>
          </div>
        </div>

      </div>

      {/* Right section - 1/3 width (1 column) */}
            <div className="relative col-span-1">
              <MarketListCompoenet></MarketListCompoenet>
            </div>
          </main>
  );
}
