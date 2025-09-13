// components/settings-initializer.tsx
"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/utils/shippingStore";

export default function SettingsInitializer({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: {
    currency: string;
    dhlCharges: number;
    shippingRate: number;
  };
}) {
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    if (setSettings && settings) {
      setSettings(settings);
    }
  }, [settings, setSettings]);

  return <>{children}</>;
}
