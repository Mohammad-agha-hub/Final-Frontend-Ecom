// utils/FilterStore.ts
import { create } from 'zustand';

type Filters = {
  price: string[];
  color: string[];
  type: string[];
  pieces: string[];
  size: string[];
};

type FilterStore = {
  filters: Filters;
  sortBy: string;
  setFilter: (category: keyof Filters, value: string) => void;
  removeFilter: (category: keyof Filters, value: string) => void;
  clearFilters: () => void;
  setSortBy: (value: string) => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: {
    price: [],
    color: [],
    type: [],
    pieces: [],
    size: [],
  },
  sortBy: 'Featured', // ✅ Added
  setFilter: (category, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [category]: [...new Set([...state.filters[category], value])],
      },
    })),
  removeFilter: (category, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [category]: state.filters[category].filter((v) => v !== value),
      },
    })),
  clearFilters: () =>
    set({
      filters: {
        price: [],
        color: [],
        type: [],
        pieces: [],
        size: [],
      },
    }),
  setSortBy: (value) => set({ sortBy: value }), // ✅ Added
}));
