import { create } from "zustand";

import { VariantCombination } from "@/components/utilities/types";

type CartItem = {
  id: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
  variant: VariantCombination;
  combinationId:string
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  fetchCart: (token: string) => Promise<void>;
  addToCart: (
    product: CartItem["product"],
    quantity: number,
    size: string,
    color: string,
    combination: VariantCombination,
    token?: string,
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number, token?: string) => Promise<void>;
  removeItem: (itemId: string, token?: string) => Promise<void>;
  syncCart: (token: string) => Promise<void>;
  clearCart: () => void;
};

const saveToLocalStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem("cartItems", JSON.stringify(items));
  } catch (error) {
    console.warn("Failed to save cart to localStorage", error);
  }
};

const loadFromLocalStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to load cart from localStorage", error);
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadFromLocalStorage(),
  loading: false,

  fetchCart: async (token) => {
    set({ loading: true });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const items = data.cart?.items || [];
      set({ items });
      saveToLocalStorage(items);
    } catch (err) {
      console.error("Error loading cart", err);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (product, quantity, size, color, combination, token) => {
    if (!combination) {
      console.warn("No variant combination selected.");
      return;
    }
  
    const stock = combination.stock;
    const currentItems = get().items;
  
    const existingItem = currentItems.find(
      (item) =>
        item.productId === product.id &&
        item.size === size &&
        item.color === color
    );
  
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > stock) {
        console.warn("Cannot add more than available stock.");
        return;
      }
  
      const updatedItems = currentItems.map((item) =>
        item.id === existingItem.id
          ? { ...item, quantity: newQuantity }
          : item
      );
      set({ items: updatedItems });
      saveToLocalStorage(updatedItems);
  
      if (token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${existingItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQuantity }),
          });
        } catch (err) {
          console.error("Error updating quantity", err);
        }
      }
    } else {
      if (quantity > stock) {
        console.warn("Cannot add more than available stock.");
        return;
      }
  
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        size,
        color,
        quantity,
        stock,
        variant: combination,
        combinationId:combination.id,
        product,
      };
  
      const updatedItems = [...currentItems, newItem];
      set({ items: updatedItems });
      saveToLocalStorage(updatedItems);
  
      if (token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              quantity,
              size,
              color,
              combinationId: combination.id, // ✅ THIS LINE IS ADDED
            }),
          });
        } catch (err) {
          console.error("Error adding item to cart", err);
        }
      }
    }
  },
  

  updateItem: async (itemId, quantity, token) => {
    const currentItems = get().items;
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ items: updatedItems });
    saveToLocalStorage(updatedItems);

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });
      } catch (err) {
        console.error("Error updating item", err);
      }
    }
  },

  removeItem: async (itemId, token) => {
    const updatedItems = get().items.filter((item) => item.id !== itemId);
    set({ items: updatedItems });
    saveToLocalStorage(updatedItems);

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Error removing item", err);
      }
    }
  },

  syncCart: async (token) => {
    await get().fetchCart(token);
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem("cartItems");
  },
}));
