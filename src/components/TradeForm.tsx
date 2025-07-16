"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { useMarketStore } from "@/store/marketStore"

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

type PortfolioItem = {
  name: string;
  quantity: number;
  average_cost: number;
  total_cost: number;
}

export default function TradeForm() {
  const { tickers, selectedMarket } = useMarketStore();

  const [activeTab, setActiveTab] = useState("매수")
  const [price, setPrice] = useState("")
  const [selectedPercentage, setSelectedPercentage] = useState("0%");
  const [ totalPrice, setTotalPrice ] = useState('0');
  const [ coinCnt, setCoinCnt ] = useState(0);
  const [ holdings_coin, setHoldingsCoin] = useState('');
  const [ currentPortpolio, setcurrentPortpolio ] = useState({name: selectedMarket, quantity: 0, average_cost: 0, total_cost: 0});

  const [inputMode, setInputMode] = useState<'total' | 'count'>("total");

  const tabs = [
    { id: "매수", label: "매수" },
    { id: "매도", label: "매도" },
  ]

  const percentages = ["10%", "25%", "50%", "100%", "직접입력"]

  const [selectedPosition, setSelectedPosition] = useState('지정가');



  useEffect(() => {
    const currentPrice = tickers[selectedMarket]?.trade_price;
    const value = isNaN(Number(currentPrice)) || currentPrice == null ? 0 : Number(currentPrice);
    setPrice(new Intl.NumberFormat('ko-KR').format(value));
    setCoinCnt(0);
    setTotalPrice('0');

    getPortfolio();
  }, [selectedMarket])

  // tickers 데이터가 업데이트될 때 현재 시세로 가격 설정 (초기 로드 시)
  useEffect(() => {
    const currentPrice = tickers[selectedMarket]?.trade_price;
    if (currentPrice && selectedPosition === '지정가') {
      const currentPriceValue = parseFloat(price.replace(/,/g, ''));
      // 현재 가격이 0이거나 NaN이면 시세로 초기화
      if (isNaN(currentPriceValue) || currentPriceValue === 0) {
        const value = isNaN(Number(currentPrice)) ? 0 : Number(currentPrice);
        if (value > 0) {
          setPrice(new Intl.NumberFormat('ko-KR').format(value));
        }
      }
    }
  }, [tickers, selectedMarket, selectedPosition, price])

  // 시장가 선택 시 현재 시장가로 가격 설정
  useEffect(() => {
    if (selectedPosition === '시장가') {
      const currentPrice = tickers[selectedMarket]?.trade_price;
      if (currentPrice) {
        setPrice(new Intl.NumberFormat('ko-KR').format(Number(currentPrice)));
        setInputMode('count');
      }
    }
  }, [selectedPosition, selectedMarket, tickers]);

  useEffect(() => {
    if (inputMode !== 'total') return;
    const result = Number(price.replace(/,/g, ''));
    const total = parseFloat(totalPrice.replace(/,/g, ''));
    if(!isNaN(result) && result > 0 && !isNaN(total)) {
      setCoinCnt(Number((total/result)));
    } else {
      setCoinCnt(0);
    }

    setInputMode('count');
    getPortfolio();
  }, [totalPrice, price, inputMode])

  useEffect(() => {
    if (inputMode !== 'count') return;
    const result = Number(price.replace(/,/g, ''));
    if(!isNaN(result) && result > 0 && coinCnt > 0) {
      const total = result * coinCnt;
      setTotalPrice(new Intl.NumberFormat('ko-KR').format(Number(total.toFixed(0)))) 
    }
  }, [price, coinCnt, inputMode])

   useEffect(() => {
    if (!useAuthStore.getState().isAuthenticated) {
      setHoldingsCoin('0');
      return;
    };
      fetchAsset();
  }, []);

  // 선택된 마켓의 보유 코인 개수
  const getPortfolio = async () => {
    try {
      const portfolio: PortfolioItem[] = await apiClient.userPorfolio();
      const filterPortfolio = portfolio.filter((item) => item.name === selectedMarket)
      if (filterPortfolio.length !== 0 ){
        setcurrentPortpolio(filterPortfolio[0]);
      } else {
        setcurrentPortpolio({name: selectedMarket, quantity: 0, average_cost: 0, total_cost: 0});
      }
    } catch {
      setcurrentPortpolio({name: selectedMarket, quantity: 0, average_cost: 0, total_cost: 0});
    }
    
  }

  const fetchAsset = async () => {
    const asset = await apiClient.userHoldings();

    // 로그인 하지 않았을 경우
    setHoldingsCoin(new Intl.NumberFormat('ko-KR').format(Number(asset.asset)));
  };

  const submitOrders = async (tab: string): Promise<void> => {
    if (!useAuthStore.getState().isAuthenticated) {
      return;
    }

    if (Number(totalPrice.replace(/,/g, '')) === 0) return;

    // 최소 결제 금액
    if ( (activeTab === '매도' && selectedPosition === '시장가' && Number(totalPrice.replace(/,/g, '')) > currentPortpolio.quantity)) {

      if (( Number(totalPrice.replace(/,/g, '')) < 5000 
    || activeTab==='매도' && selectedPosition !== '시장가' && Number(totalPrice.replace(/,/g, '')) > currentPortpolio.total_cost)) {
        return;
      }
      return;
    }

    const coin_ticker = selectedMarket.split('-')[1]
    const total = parseFloat(totalPrice.replace(/,/g, ''));
    const orderPrice = parseFloat(price.replace(/,/g, ''));
    const orderType = tab === '매수' ? 'buy' : 'sell';

    
    if (selectedPosition === '시장가') {
      if (activeTab === '매수') {
        try {
          const result = await apiClient.orderMarket(coin_ticker, 'buy', total, selectedMarket);
            
          if(result.success) {
            alert(result.message)
            fetchAsset();
          } else {
            alert(result.message)
          }
        } catch(err) {
          console.error("error", err);
        } 
      } else if(activeTab === '매도') {
        try {
          const result = await apiClient.orderMarket(coin_ticker, 'sell', total, selectedMarket);
            
          if(result.success) {
            alert(result.message)
            fetchAsset();
          } else {
            alert(result.message)
          }
        } catch(err) {
          console.error("error", err);
        } 
      }
    } else if(selectedPosition === '지정가') {
        try {
          const result = await apiClient.orderLimit(selectedMarket, coin_ticker, orderPrice, orderType, coinCnt, total)

          if (result.success) {
            alert(result.message);
            fetchAsset();
          } else {
            alert(result.message);
          }
        } catch(err) {
          console.error("error", err);
        } 
    }

    setTotalPrice('0');
    setCoinCnt(0);
    setInputMode('total');

    getPortfolio();
 }

 // 초기화
 const resetPrice = ():void => {
  const currentPrice = tickers[selectedMarket]?.trade_price;
  setTotalPrice('0');
  setCoinCnt(0);
  setPrice(new Intl.NumberFormat('ko-KR').format(Number(currentPrice)));
 }

  return (
    <div className="w-full bg-white border rounded-md">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-3 font-medium ${
              activeTab === tab.id
                ? tab.id === "매수"
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Type */}
      <div className="p-4 flex items-center">
        <div className="flex items-center mr-2">
          <span className="text-sm mr-1">주문유형</span>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input type="radio" name="orderType" className="mr-1 accent-blue-600"
            checked={selectedPosition === '지정가'}
            onChange={() => setSelectedPosition("지정가")} />
            <span className="text-sm">지정가</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="orderType" className="mr-1 accent-blue-600" 
            checked={selectedPosition === "시장가"} 
            onChange={() => setSelectedPosition("시장가")}/>
            <span className="text-sm">시장가</span>
          </label>
        </div>
      </div>

      {/* Available Balance */}
      <div className="px-4 py-2 flex justify-between">
        <span className="text-sm">보유자산</span>
        <span className="text-sm font-medium">{holdings_coin} KRW</span>
      </div>
      
      <div className="px-4 py-2 flex justify-between">
        <span className="text-sm">보유코인 (KRW)</span>
        <span className="text-sm font-medium">{new Intl.NumberFormat('ko-KR').format(currentPortpolio.total_cost)} KRW</span>
      </div>
      
      <div className="px-4 py-2 flex justify-between">
        <span className="text-sm">보유수량 ({selectedMarket.split('-')[1]})</span>
        <span className="text-sm font-medium">{new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 8 }).format(currentPortpolio.quantity)} {selectedMarket.split('-')[1]}</span>
      </div>

      {/* Price Input */}
      <div>
        <div className="px-4 py-2">
        <div className="flex items-center mb-1">
          <span className="text-sm">{activeTab === "매수" ? "매수가격" : "매도가격"} (KRW)</span>
        </div>
        <div className="flex">
          <input
            type="text"
            value={price}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9.]/g, '');
              const parts = value.split('.');
              if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
              }
              setPrice(value); 
              setInputMode('count');
              
              // 실시간 주문수량 계산
              const newPrice = parseFloat(value.replace(/,/g, ''));
              const totalAmount = parseFloat(totalPrice.replace(/,/g, ''));
              if (!isNaN(newPrice) && newPrice > 0 && !isNaN(totalAmount) && totalAmount > 0) {
                setCoinCnt(totalAmount / newPrice);
              } else {
                setCoinCnt(0);
              }
            }}
            className={`flex-1 border rounded-l p-2 text-right ${
              selectedPosition === '시장가' ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="가격을 입력하세요"
            inputMode="decimal"
            pattern="[0-9.]*"
            disabled={selectedPosition === '시장가'}
            readOnly={selectedPosition === '시장가'}
          />
          <div className="flex border-t border-r border-b rounded-r">
            <button 
              className={`px-3 py-2 text-gray-600 ${
                (!useAuthStore.getState().isAuthenticated || selectedPosition === '시장가') ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                if (selectedPosition === '시장가') return;
                const numPrice = parseFloat(price.replace(/,/g, ''));
                const newPrice = Math.max(0, numPrice - 1000);
                setPrice(new Intl.NumberFormat('ko-KR').format(newPrice));
                
                // 실시간 주문수량 계산
                const totalAmount = parseFloat(totalPrice.replace(/,/g, ''));
                if (newPrice > 0 && !isNaN(totalAmount) && totalAmount > 0) {
                  setCoinCnt(totalAmount / newPrice);
                } else {
                  setCoinCnt(0);
                }
              }}
              disabled={!useAuthStore.getState().isAuthenticated || selectedPosition === '시장가'}
            >
              −
            </button>
            <button 
              className={`px-3 py-2 text-gray-600 ${
                (!useAuthStore.getState().isAuthenticated || selectedPosition === '시장가') ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                if (selectedPosition === '시장가') return;
                const numPrice = parseFloat(price.replace(/,/g, ''));
                const newPrice = numPrice + 1000;
                setPrice(new Intl.NumberFormat('ko-KR').format(newPrice));
                
                // 실시간 주문수량 계산
                const totalAmount = parseFloat(totalPrice.replace(/,/g, ''));
                if (newPrice > 0 && !isNaN(totalAmount) && totalAmount > 0) {
                  setCoinCnt(totalAmount / newPrice);
                } else {
                  setCoinCnt(0);
                }
              }}
              disabled={!useAuthStore.getState().isAuthenticated || selectedPosition === '시장가'}
            >
              +
            </button>
          </div>
        </div>
      </div>


      </div>
      
      {/* 매수일 때: 주문총액 -> 퍼센트 버튼 -> 주문수량 */}
      {/* 매도일 때: 주문수량 -> 퍼센트 버튼 -> 주문총액 */}
      
      {activeTab === '매수' ? (
        <>
          {/* Total */}
          <div className="px-4 py-2">
            <div className="flex items-center mb-1">
              <span className="text-sm">주문총액 (KRW)</span>
            </div>
            <input type="text" value={totalPrice} className="w-full border rounded p-2 text-right"
             onChange={e => {
               let value = e.target.value.replace(/[^0-9.]/g, '');
               const parts = value.split('.');
               if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
               }

               const num = value === '' ? '0' : value;
               setTotalPrice(num);
               setInputMode('total');
               
               // 실시간 주문수량 계산
               const currentPrice = parseFloat(price.replace(/,/g, ''));
               const totalAmount = parseFloat(num.replace(/,/g, ''));
               if (!isNaN(currentPrice) && currentPrice > 0 && !isNaN(totalAmount) && totalAmount > 0) {
                 setCoinCnt(totalAmount / currentPrice);
               } else {
                 setCoinCnt(0);
               }
             }}
             inputMode="decimal"
             pattern="[0-9.]*"
             />
          </div>

          {/* Asset Ratio Selection */}
          <div className="px-4 py-2">
            <div className="grid grid-cols-5 gap-2">
              {percentages.map((percent) => (
                <button
                  key={percent}
                  className={`py-1 text-sm border rounded ${
                    selectedPercentage === percent ? "bg-gray-100 border-gray-400" : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedPercentage(percent);
                    
                    if (percent !== '직접입력') {
                      const percentValue = parseFloat(percent) / 100;
                      // 매수: 보유자산 기준으로 총액 계산
                      const holdingsAmount = parseFloat(holdings_coin.replace(/,/g, '') || '0');
                      const calculatedAmount = holdingsAmount * percentValue;
                      setTotalPrice(new Intl.NumberFormat('ko-KR').format(Math.floor(calculatedAmount)));
                      
                      // 실시간 주문수량 계산
                      const currentPrice = parseFloat(price.replace(/,/g, ''));
                      if (!isNaN(currentPrice) && currentPrice > 0) {
                        setCoinCnt(calculatedAmount / currentPrice);
                      } else {
                        setCoinCnt(0);
                      }
                    }
                  }}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="px-4 py-2">
            <div className="flex items-center mb-1">
              <span className="text-sm">주문수량</span>
            </div>
            <div className="w-full border rounded p-2 text-right bg-gray-50">
              {coinCnt > 0 ? new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 8 }).format(coinCnt) : '0'} {selectedMarket.split('-')[1]}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Quantity */}
          <div className="px-4 py-2">
            <div className="flex items-center mb-1">
              <span className="text-sm">주문수량</span>
            </div>
            <input
              type="text"
              value={coinCnt > 0 ? coinCnt.toString() : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                const numValue = value === '' ? 0 : parseFloat(value);
                setCoinCnt(numValue);
                
                // 실시간 주문총액 계산
                const currentPrice = parseFloat(price.replace(/,/g, ''));
                if (!isNaN(currentPrice) && currentPrice > 0 && numValue > 0) {
                  const totalAmount = numValue * currentPrice;
                  setTotalPrice(new Intl.NumberFormat('ko-KR').format(Math.floor(totalAmount)));
                } else {
                  setTotalPrice('0');
                }
              }}
              className="w-full border rounded p-2 text-right"
              placeholder="수량을 입력하세요"
              inputMode="decimal"
              pattern="[0-9.]*"
              disabled={!useAuthStore.getState().isAuthenticated}
              readOnly={!useAuthStore.getState().isAuthenticated}
            />
          </div>

          {/* Asset Ratio Selection */}
          <div className="px-4 py-2">
            <div className="grid grid-cols-5 gap-2">
              {percentages.map((percent) => (
                <button
                  key={percent}
                  className={`py-1 text-sm border rounded ${
                    selectedPercentage === percent ? "bg-gray-100 border-gray-400" : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedPercentage(percent);
                    
                    if (percent !== '직접입력') {
                      const percentValue = parseFloat(percent) / 100;
                      // 매도: 보유수량 기준으로 수량 계산
                      const coinQuantity = currentPortpolio.quantity;
                      const calculatedQuantity = coinQuantity * percentValue;
                      setCoinCnt(calculatedQuantity);
                      
                      // 실시간 주문총액 계산
                      const currentPrice = parseFloat(price.replace(/,/g, ''));
                      if (!isNaN(currentPrice) && currentPrice > 0) {
                        const totalAmount = calculatedQuantity * currentPrice;
                        setTotalPrice(new Intl.NumberFormat('ko-KR').format(Math.floor(totalAmount)));
                      } else {
                        setTotalPrice('0');
                      }
                    }
                  }}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="px-4 py-2">
            <div className="flex items-center mb-1">
              <span className="text-sm">주문총액 (KRW)</span>
            </div>
            <input type="text" value={totalPrice} className="w-full border rounded p-2 text-right bg-gray-50"
             onChange={e => {
               let value = e.target.value.replace(/[^0-9.]/g, '');
               const parts = value.split('.');
               if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
               }

               const num = value === '' ? '0' : value;
               setTotalPrice(num);
               setInputMode('total');
               
               // 실시간 주문수량 계산
               const currentPrice = parseFloat(price.replace(/,/g, ''));
               const totalAmount = parseFloat(num.replace(/,/g, ''));
               if (!isNaN(currentPrice) && currentPrice > 0 && !isNaN(totalAmount) && totalAmount > 0) {
                 setCoinCnt(totalAmount / currentPrice);
               } else {
                 setCoinCnt(0);
               }
             }}
             inputMode="decimal"
             pattern="[0-9.]*"
             disabled={!useAuthStore.getState().isAuthenticated}
             readOnly={!useAuthStore.getState().isAuthenticated} />
          </div>
        </>
      )}

      {/* Fee Info */}
      <div className="px-4 py-2 text-xs text-gray-500 text-center">
        최소 주문 금액: 5,000 KRW / 수수료 : 0.05%
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 grid grid-cols-2 gap-2">
        <button className="py-3 bg-gray-400 text-white rounded" onClick={resetPrice}>초기화</button>
        <button 
          className={`py-3 text-white rounded ${
            activeTab === "매수" ? "bg-red-500" : "bg-blue-500"
          }`}
          onClick={() => submitOrders(activeTab)}
        >
          {activeTab}
        </button>
      </div>
    </div>
  )
}