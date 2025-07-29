import CheckoutClient from "./CheckoutClient";

export default async function SettingsPage() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/settings`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch settings");
  }

  const { data } = await res.json();

  return <CheckoutClient settings={data} />;
}