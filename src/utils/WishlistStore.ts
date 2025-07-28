import { Product } from '@/components/utilities/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = Product

type WishlistState = {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (item) => {
        const exists = get().wishlist.find((i) => i.id === item.id);
        if (!exists) {
          set((state) => ({ wishlist: [...state.wishlist, item] }));
        }
      },

      removeFromWishlist: (id) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
      },

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'wishlist-storage', // Key in localStorage
    }
  )
);
