// utils/settingsStore.ts
import { create } from "zustand";

type Settings = {
  currency: string;
  dhlCharges: number;
  shippingRate: number;
};

type SettingsStore = Settings & {
  setSettings: (settings: Settings) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  currency: "PKR",
  dhlCharges: 0,
  shippingRate: 0,
  setSettings: (settings) => set(settings),
}));
