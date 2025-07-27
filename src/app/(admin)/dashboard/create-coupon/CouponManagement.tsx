"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2, Trash2 } from "lucide-react";

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

export default function ManageCoupons({ Coupon }: { Coupon: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(Coupon);
  const [form, setForm] = useState<Partial<Coupon>>({});
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const fetchCoupons = useCallback(async () => {
    if (!session?.user.backendToken) return;

    try {
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
    } catch {
      toast.error("Failed to fetch coupons.");
    }
  }, [session?.user.backendToken]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
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
        toast.success("Coupon created successfully");
      } else {
        toast.error(data.message || "Error creating coupon");
      }
    } catch {
      toast.error("Network error while creating coupon.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;

    try {
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
      if (data.success) {
        fetchCoupons();
        toast.success("Coupon deleted");
      } else {
        toast.error(data.message || "Error deleting coupon");
      }
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }

  return (
    <div className="p-6 px-10 space-y-10">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Create New Coupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                className="py-5"
                placeholder="Enter code"
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                className="py-5"
                placeholder="e.g. 10 or 1000"
                value={form.discount ?? ""}
                onChange={(e) =>
                  setForm({ ...form, discount: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type || ""}
                onValueChange={(val) =>
                  setForm({ ...form, type: val as CouponType })
                }
              >
                <SelectTrigger className="py-5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expiry Date</Label>
              <Input
                id="expiresAt"
                type="date"
                className="appearance-none py-5 bg-white border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min={new Date().toISOString().split("T")[0]}
                value={form.expiresAt?.split("T")[0] || ""}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
              <Input
                id="usageLimit"
                type="number"
                className="py-5"
                placeholder="Leave blank for unlimited"
                value={form.usageLimit ?? ""}
                onChange={(e) =>
                  setForm({ ...form, usageLimit: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex justify-center">
              <Button type="submit" className="py-6 px-6" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Coupon List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Existing Coupons
        </h2>
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className="flex justify-between items-center p-4 border"
            >
              <div>
                <div className="text-base font-semibold">{coupon.code}</div>
                <div className="text-sm text-muted-foreground">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.discount}% off`
                    : `Rs. ${coupon.discount} off`}
                </div>
                {coupon.expiresAt && (
                  <div className="text-xs text-red-600 mt-1">
                    Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                  </div>
                )}
                {coupon.usageLimit && (
                  <div className="text-xs text-muted-foreground">
                    Usage Limit: {coupon.usageLimit}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(coupon.code)}
                className="text-red-500 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
