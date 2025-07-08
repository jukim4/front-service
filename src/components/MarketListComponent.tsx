import SearchBar from "./SearchBar"
import MarketTabs from "./MarketTabs"
import MarketSortBar from "./MarketSortBar"
import MarketList from "./MarketList"
import { useMarketStore } from "@/store/marketStore"

import { useState } from "react"

export default function MarketListCompoenet() {
  const { markets } = useMarketStore();


  const [searchTerm, setSearchTerm] = useState(''); 

  const filterData = markets.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.market.toLowerCase().includes(term) ||
      item.korean_name.toLowerCase().includes(term)
    )
  });

  const onSearch = (term: any) => {
    setSearchTerm(term);
  }

  return (
    <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-2">
      {/* Non-scrolling part */}
      <div className="flex-shrink-0">
        <SearchBar searchTerm={searchTerm} onSearch={onSearch} />
        <div className="mt-2 rounded-t-md border-x border-t bg-white">
          <MarketTabs />
          <MarketSortBar />
        </div>
      </div>
        
      {/* Scrolling part */}
      <div className="flex-1 rounded-b-md border-x border-b bg-white overflow-y-auto">
        <MarketList filterData={filterData}/>
      </div>
    </div>
    )
}