import { create } from "zustand";

type BackendCartItem = {
  id: string;
  productId: string;
  quantity: number;
  combinationId: string | null;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    images?: string[];
    image?: string;
    price: number;
    discount?: number;
  };
  combination?: {
    id: string;
    stock: number;
    price?: number;
    variants?: {
      variant: {
        key: string;
        value: string;
      };
    }[];
  };
};

type ProductCartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  discount?: number;
};

type VariantSelection = {
  id: string;
  stock: number;
  price?: number;
  variants: {
    key: string;
    value: string;
  }[];
};

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  combinationId: string | null;
  size: string | null;
  color: string | null;
  product: ProductCartItem;
  variant?: VariantSelection;

};

type CartState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: (token: string) => Promise<void>;
  addToCart: (
    product: ProductCartItem,
    quantity: number,
    combinationId: string | null,
    size: string | null,
    color: string | null,
    token: string
  ) => Promise<void>;
  updateItem: (
    itemId: string,
    quantity: number,
    token: string
  ) => Promise<void>;
  removeItem: (itemId: string, token: string) => Promise<void>;
  syncCart: (token: string) => Promise<void>;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchCart: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      const items = data.cart?.items?.map((item: BackendCartItem) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        combinationId: item.combinationId,
        size: item.size || null,
        color: item.color || null,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images?.[0] || item.product.image,
          price: item.product.price,
          discount: item.product.discount || 0,
        },
        ...(item.combination && {
          variant: {
            id: item.combination.id,
            stock: item.combination.stock,
            price: item.combination.price,
            variants:
              item.combination.variants?.map((v: {variant:{key:string;value:string}}) => ({
                key: v.variant.key,
                value: v.variant.value,
              })) || [],
          },
        }),
      })) || [];

      set({ items });
    } catch (error) {
      console.error("Fetch cart error:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch cart",
      });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (product, quantity, combinationId, size, color, token) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          combinationId,
          size,
          color,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      // ✅ Always fetch full cart from backend after update
      await get().fetchCart(token);
    } catch (error) {
      console.error("Add to cart error:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add to cart",
      });
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (itemId, quantity, token) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) throw new Error("Failed to update cart item");

      await get().fetchCart(token);
    } catch (error) {
      console.error("Update item error:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update item",
      });
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (itemId, token) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to remove item");

      await get().fetchCart(token);
    } catch (error) {
      console.error("Remove item error:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to remove item",
      });
    } finally {
      set({ loading: false });
    }
  },

  syncCart: async (token) => {
    await get().fetchCart(token);
  },

  clearCart: () => {
    set({ items: [] });
  },
}));
