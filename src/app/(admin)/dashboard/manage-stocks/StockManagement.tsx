"use client";

import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useSettingsStore } from "@/utils/shippingStore";

interface Variant {
  id: string;
  key: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface VariantCombination {
  id: string;
  stock: number;
  price: number;
  image?: string;
  product: Product;
  variants: {
    variant: Variant;
  }[];
}

interface Props {
  combinations: VariantCombination[];
  backendToken: string;
}

const StockManagement: React.FC<Props> = ({
  combinations: initialData,
  backendToken,
}) => {
  const { data: session } = useSession();
  const { currency } = useSettingsStore();
  const [combinations, setCombinations] =
    useState<VariantCombination[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [restockInputs, setRestockInputs] = useState<Record<string, number>>(
    {}
  );
  const [updateInputs, setUpdateInputs] = useState<Record<string, number>>({});

  const fetchCombinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variantcombination`,
        {
          headers: {
            Authorization: `Bearer ${backendToken}`,
          },
        }
      );
      const data = await res.json();
      setCombinations(data.combinations || []);
    } catch (err) {
      console.error("Failed to fetch combinations", err);
    } finally {
      setLoading(false);
    }
  }, [backendToken]);

  const restock = async (id: string) => {
    const qty = restockInputs[id];
    if (!qty || qty <= 0) return alert("Enter a valid quantity to restock.");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variantcombination/restock/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({ quantity: qty }),
        }
      );
      fetchCombinations();
      setRestockInputs((prev) => ({ ...prev, [id]: 0 }));
      toast.success("Product restocked!");
    } catch {
      toast.error("Failed to restock");
    }
  };

  const updateStock = async (id: string) => {
    const newStock = updateInputs[id];
    if (newStock === undefined || newStock < 0)
      return alert("Enter a valid stock value.");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variantcombination/stock/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({ stock: newStock }),
        }
      );
      fetchCombinations();
      setUpdateInputs((prev) => ({ ...prev, [id]: 0 }));
      toast.success("Stock updated!");
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const grouped = combinations.reduce<Record<string, VariantCombination[]>>(
    (acc, combo) => {
      const productId = combo.product.id;
      if (!acc[productId]) acc[productId] = [];
      acc[productId].push(combo);
      return acc;
    },
    {}
  );

  const filteredGroups = Object.entries(grouped).filter(([, combos]) => {
    const name = combos[0]?.product.name || "";
    const slug = combos[0]?.product.slug || "";
    const nameMatch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      slug.toLowerCase().includes(search.toLowerCase());

    const stockMatch = showLowStock ? combos.some((c) => c.stock < 5) : true;

    return nameMatch && stockMatch;
  });

  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Input
          placeholder="Search by product name or slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2"
        />
        <div className="flex items-center gap-2">
          <Switch
            id="low-stock-switch"
            checked={showLowStock}
            onCheckedChange={setShowLowStock}
          />
          <Label htmlFor="low-stock-switch">Show Low Stock Only</Label>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <p className="text-muted-foreground">
          No matching variant combinations found.
        </p>
      ) : (
        filteredGroups.map(([productId, combos]) => {
          const product = combos[0].product;

          return (
            <Card key={productId} className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {product.name} ({product.slug})
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Stock:{" "}
                  <span className="font-medium text-black">
                    {combos.reduce((sum, c) => sum + c.stock, 0)}
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {combos.map((combo) => {
                  const isLow = combo.stock < 5;

                  return (
                    <div
                      key={combo.id}
                      className="border-t pt-4 grid gap-4 md:grid-cols-2"
                    >
                      <div>
                        <div className="flex flex-wrap gap-3 items-center font-medium">
                          {combo.variants.map(({ variant }) => (
                            <div
                              key={variant.id}
                              className="flex items-center gap-2"
                            >
                              {variant.key.toLowerCase() === "color" ? (
                                <>
                                  <span className="text-sm">
                                    {variant.key}:
                                  </span>
                                  <span
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: variant.value }}
                                    title={variant.value}
                                  />
                                </>
                              ) : (
                                <span className="text-sm">
                                  {variant.key}: {variant.value}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Price: {currency}{" "}
                          {combo.price.toLocaleString("en-PK")} | Stock:{" "}
                          {combo.stock}
                        </p>
                        {isLow && (
                          <p className="text-sm text-red-500 font-semibold">
                            Low Stock
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Restock */}
                        <div>
                          <Label className="text-xs mb-1">Restock (+Qty)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={restockInputs[combo.id] || ""}
                              onChange={(e) =>
                                setRestockInputs((prev) => ({
                                  ...prev,
                                  [combo.id]: Number(e.target.value),
                                }))
                              }
                              className="w-24"
                            />
                            <Button
                              onClick={() => restock(combo.id)}
                              className="text-sm"
                            >
                              Restock
                            </Button>
                          </div>
                        </div>

                        {/* Update */}
                        <div>
                          <Label className="text-xs mb-1">
                            Update Stock (Overwrite)
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={updateInputs[combo.id] || ""}
                              onChange={(e) =>
                                setUpdateInputs((prev) => ({
                                  ...prev,
                                  [combo.id]: Number(e.target.value),
                                }))
                              }
                              className="w-24"
                            />
                            <Button
                              onClick={() => updateStock(combo.id)}
                              className="text-sm"
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default StockManagement;
