import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  name: string
  email: string
  // Note: Don't store sensitive tokens in persisted state
}

type AuthState = {
  user: User | null
  isLoggedIn: boolean
  showLoginModal: boolean
  login: (userData: User) => void
  logout: () => void
  setShowLoginModal: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      showLoginModal: false,
      
      login: (userData) => set({ 
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email
        },
        isLoggedIn: true 
      }),
      
      logout: () => set({ 
        user: null, 
        isLoggedIn: false 
      }),
      
      setShowLoginModal: (value) => set({ 
        showLoginModal: value 
      }),
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive UI state
      partialize: (state) => ({
        showLoginModal: state.showLoginModal
        // Explicitly omit user data from persistence
      })
    }
  )
)