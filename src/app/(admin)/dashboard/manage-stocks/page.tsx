"use client";

import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";

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

const StockPage = () => {
  const { data: session } = useSession();
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);
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
            Authorization: `Bearer ${session?.user.backendToken}`,
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
  }, [session?.user.backendToken]);

  useEffect(() => {
    fetchCombinations();
  }, [fetchCombinations]);
  

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
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({ quantity: qty }),
        }
      );
      
      fetchCombinations();
      setRestockInputs((prev) => ({ ...prev, [id]: 0 }));
    } catch {
      alert("Failed to restock");
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
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({ stock: newStock }),
        }
      );
      fetchCombinations();
      setUpdateInputs((prev) => ({ ...prev, [id]: 0 }));
    } catch {
      alert("Failed to update stock");
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <input
          type="text"
          placeholder="Search product name or slug"
          className="border px-3 py-2 rounded w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
          />
          Show Low Stock Only
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredGroups.length === 0 ? (
        <p>No matching variant combinations found.</p>
      ) : (
        filteredGroups.map(([productId, combos]) => {
          const product = combos[0].product;

          return (
            <div
              key={productId}
              className="border rounded p-4 mb-6 shadow-sm space-y-4 bg-white"
            >
              <h2 className="text-xl font-bold">
                {product.name} ({product.slug})
              </h2>

              {combos.map((combo) => {
                const variantText = combo.variants
                  .map((v) => `${v.variant.key}: ${v.variant.value}`)
                  .join(", ");
                const isLow = combo.stock < 5;

                return (
                  <div
                    key={combo.id}
                    className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium">{variantText}</p>
                      <p className="text-sm text-gray-600">
                        Price: Rs {combo.price} | Stock: {combo.stock}
                      </p>
                      {isLow && (
                        <p className="text-sm text-red-500 font-semibold">
                          Low Stock
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Restock Input */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Restock (+Qty)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="border px-2 py-1 rounded w-24"
                            value={restockInputs[combo.id] || ""}
                            onChange={(e) =>
                              setRestockInputs((prev) => ({
                                ...prev,
                                [combo.id]: Number(e.target.value),
                              }))
                            }
                          />
                          <button
                            onClick={() => restock(combo.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Restock
                          </button>
                        </div>
                      </div>

                      {/* Update Input */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Update Stock (Overwrite)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="border px-2 py-1 rounded w-24"
                            value={updateInputs[combo.id] || ""}
                            onChange={(e) =>
                              setUpdateInputs((prev) => ({
                                ...prev,
                                [combo.id]: Number(e.target.value),
                              }))
                            }
                          />
                          <button
                            onClick={() => updateStock(combo.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
};

export default StockPage;
