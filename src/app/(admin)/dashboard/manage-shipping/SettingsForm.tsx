"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface Settings {
  id: string;
  currency: string;
  shippingRate: number;
  dhlCharge: number;
  updatedAt: string;
}

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const [form, setForm] = useState({
    currency: initialSettings.currency,
    shippingRate: initialSettings.shippingRate.toString(),
    dhlCharge: initialSettings.dhlCharge.toString(),
  });

  const [loading, setLoading] = useState(false);
  const {data:session} = useSession()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`, // Optional: auth
          },
          body: JSON.stringify({
            currency: form.currency,
            shippingRate: parseFloat(form.shippingRate),
            dhlCharge: parseFloat(form.dhlCharge),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Settings updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="currency">Currency</Label>
        <Input
          name="currency"
          id="currency"
          value={form.currency}
          onChange={handleChange}
          placeholder="e.g. PKR or INR"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shippingRate">Shipping Rate (Local)</Label>
        <Input
          name="shippingRate"
          id="shippingRate"
          type="number"
          value={form.shippingRate}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dhlCharge">DHL Charge (International)</Label>
        <Input
          name="dhlCharge"
          id="dhlCharge"
          type="number"
          value={form.dhlCharge}
          onChange={handleChange}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
