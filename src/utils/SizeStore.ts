import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VariantCombination } from '@/components/utilities/types';

interface SelectedOptionsState {
  selectedColor: string;
  selectedSize: string;
  combination: VariantCombination | null;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
  setCombination: (combo: VariantCombination | null) => void;
}

export const useSelectedOptionsStore = create<SelectedOptionsState>()(
  persist(
    (set) => ({
      selectedColor: '',
      selectedSize: '',
      combination: null,
      setSelectedColor: (color) => set({ selectedColor: color }),
      setSelectedSize: (size) => set({ selectedSize: size }),
      setCombination: (combination) => set({ combination }),
    }),
    {
      name: 'selected-options-storage',
    }
  )
);
