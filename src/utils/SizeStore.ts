// utils/SizeStore.ts
import { create } from "zustand";

interface SelectedOptionsState {
  selectedSize: string | null;
  selectedColor: string | null;
  setSelectedSize: (size: string) => void;
  setSelectedColor: (color: string) => void;
  clearSelections: () => void;
}

export const useSelectedOptionsStore = create<SelectedOptionsState>((set) => ({
  selectedSize: null,
  selectedColor: null,
  setSelectedSize: (size) => set({ selectedSize: size }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  clearSelections: () => set({ selectedSize: null, selectedColor: null }),
}));
