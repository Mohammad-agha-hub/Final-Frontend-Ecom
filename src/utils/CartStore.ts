// stores/cartStore.ts
import { create } from 'zustand'

type CartItem = {
  id: string
  productId: string
  quantity: number
  stock:number
  product: {
    id: string
    name: string
    image: string
    price: number
    
  }
}

type CartState = {
  items: CartItem[]
  loading: boolean
  fetchCart: (token: string) => Promise<void>
  addToCart: (productId: string, quantity: number, token: string) => Promise<void>
  updateItem: (itemId: string, quantity: number, token: string) => Promise<void>
  removeItem: (itemId: string, token: string) => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,

  fetchCart: async (token) => {
    set({ loading: true })
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      set({ items: data.cart?.items || [] })
    } catch (err) {
      console.error('Error loading cart', err)
    } finally {
      set({ loading: false })
    }
  },

  addToCart: async (productId, quantity = 1, token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await useCartStore.getState().fetchCart(token)
      }
    } catch (err) {
      console.error('Error adding to cart', err)
    }
  },

  updateItem: async (itemId, quantity, token) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`, {
        method: 'PUT',
        
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity }),
      })
      await useCartStore.getState().fetchCart(token)
    } catch (err) {
      console.error('Error updating item', err)
    }
  },

  removeItem: async (itemId, token) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${itemId}`, {
        method: 'DELETE',
        
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      })
      await useCartStore.getState().fetchCart(token)
    } catch (err) {
      console.error('Error removing item', err)
    }
  },
}))

