import SettingsForm from "./SettingsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Settings",
};

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

const defaultSettings = {
  currency: "IND",
  shippingRate: 0,
  dhlCharge: 0,
};

export default async function SettingsPage() {
  let settings = defaultSettings;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      const { data } = await res.json();
      settings = data || defaultSettings;
    } else {
      console.error("Failed to fetch settings:", res.status, res.statusText);
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    // settings remains as defaultSettings
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Store Settings</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
