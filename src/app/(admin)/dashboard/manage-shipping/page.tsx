// app/(admin)/settings/page.tsx
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch settings");

  const { data } = await res.json();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Store Settings</h1>
      <SettingsForm initialSettings={data} />
    </div>
  );
}
