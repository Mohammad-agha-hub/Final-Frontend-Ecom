import { create } from 'zustand';

export type WishlistItem = {
  id: string;
  name: string;
  image: string[];
  price: string;
  slug: string;
  // Add other properties as needed
};

type WishlistState = {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],

  addToWishlist: (item) => {
    const existing = get().wishlist.find((i) => i.id === item.id);
    if (!existing) {
      set((state) => ({ wishlist: [...state.wishlist, item] }));
    }
  },

  removeFromWishlist: (id) => {
    set((state) => ({
      wishlist: state.wishlist.filter((item) => item.id !== id),
    }));
  },

  clearWishlist: () => set({ wishlist: [] }),
}));
