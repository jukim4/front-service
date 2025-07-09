import { StateCreator, create } from "zustand";

interface ProfitLossState {
  cumulativeProfitLossRate: number;
  setCumulativeProfitLossRate: (rate: number) => void;
}

export const useProfitLossStore = create<ProfitLossState>(
  (set: (partial: Partial<ProfitLossState>) => void) => ({
    cumulativeProfitLossRate: 0,
    setCumulativeProfitLossRate: (rate: number) => set({ cumulativeProfitLossRate: rate }),
  })
);
