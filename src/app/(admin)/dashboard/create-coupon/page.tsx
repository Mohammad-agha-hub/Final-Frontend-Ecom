"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

type CouponType = "PERCENTAGE" | "FIXED";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: CouponType;
  expiresAt?: string;
  usageLimit?: number;
  createdAt: string;
}

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<Partial<Coupon>>({});
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const fetchCoupons = useCallback(async () => {
    if (!session?.user.backendToken) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupons`,
      {
        headers: {
          Authorization: `Bearer ${session.user.backendToken}`,
        },
      }
    );
    const data = await res.json();
    if (data.success) setCoupons(data.coupons);
  }, [session?.user.backendToken]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.backendToken}`,
        },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();
    if (data.success) {
      setForm({});
      fetchCoupons();
    } else {
      alert(data.message || "Error creating coupon");
    }
    setLoading(false);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupons/${code}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.user.backendToken}`,
        },
      }
    );
    const data = await res.json();
    if (data.success) fetchCoupons();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Coupons</h1>

      {/* Coupon Form */}
      <div className="bg-gray-50 p-4 rounded border mb-8 space-y-4">
        <input
          type="text"
          placeholder="Coupon Code"
          value={form.code || ""}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Discount Value"
          value={form.discount ?? ""}
          onChange={(e) =>
            setForm({ ...form, discount: parseInt(e.target.value) })
          }
          className="w-full p-2 border rounded"
        />

        <select
          value={form.type || ""}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as CouponType })
          }
          className="w-full p-2 border rounded"
        >
          <option value="">Select Type</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed Amount</option>
        </select>

        <input
          type="date"
          value={form.expiresAt?.split("T")[0] || ""}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Usage Limit (optional)"
          value={form.usageLimit ?? ""}
          onChange={(e) =>
            setForm({ ...form, usageLimit: parseInt(e.target.value) })
          }
          className="w-full p-2 border rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Coupon"}
        </button>
      </div>

      {/* Coupon List */}
      <h2 className="text-xl font-semibold mb-2">All Coupons</h2>
      <div className="space-y-2">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="border p-4 rounded flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <div className="font-bold text-lg">{coupon.code}</div>
              <div className="text-sm text-gray-600">
                {coupon.type === "PERCENTAGE"
                  ? `${coupon.discount}% off`
                  : `Rs. ${coupon.discount} off`}
              </div>
              {coupon.expiresAt && (
                <div className="text-xs text-red-500">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </div>
              )}
              {coupon.usageLimit && (
                <div className="text-xs text-gray-500">
                  Usage Limit: {coupon.usageLimit}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(coupon.code)}
              className="text-red-600 text-sm hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
