// utils/SidebarStore.ts
import { create } from 'zustand';

type SidebarType = 'search' | 'cart' | 'menu' | 'none';

type SidebarState = {
  openSidebar: SidebarType;
  setOpenSidebar: (type: SidebarType) => void;
  closeSidebar: () => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  openSidebar: 'none',
  setOpenSidebar: (type) => set({ openSidebar: type }),
  closeSidebar: () => set({ openSidebar: 'none' }),
}));
