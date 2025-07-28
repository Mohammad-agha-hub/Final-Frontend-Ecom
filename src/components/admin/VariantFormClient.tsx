"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  discount: number;
  categoryId: string;
  image: string;
  variantCombinations: {
    id: string;
    stock: number;
    price: number;
    image: string | null;
    variants: { variant: { key: string; value: string } }[];
  }[];
}

interface VariantCombo {
  id?: string;
  variants: Record<string, string>;
  price: string;
  stock: string;
}

interface Variant {
  id: string;
  key: string;
  value: string;
}

type VariantOptions = Record<string, Variant[]>;

export default function EditProductClient({
  product,
  token,
  variantOptions,
}: {
  product: Product;
  token: string | undefined;
  variantOptions: VariantOptions;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Product>(product);
  const [combos, setCombos] = useState<VariantCombo[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setForm({
      ...product,
      variantCombinations: product.variantCombinations ?? [],
    });

    setCombos(
      product.variantCombinations.map((vc) => ({
        id: vc.id,
        price: vc.price.toString(),
        stock: vc.stock.toString(),
        variants: Object.fromEntries(
          vc.variants.map((v) => [v.variant.key, v.variant.value])
        ),
      }))
    );

    setLoading(false);
  }, [product]);

  const addCombo = () => {
    const defaultVariants = Object.fromEntries(
      Object.keys(variantOptions).map((key) => [key, ""])
    );
    setCombos([
      ...combos,
      { variants: defaultVariants, price: "0", stock: "0" },
    ]);
  };

  const removeCombo = (idx: number) => {
    setCombos(combos.filter((_, i) => i !== idx));
  };

  const updateCombo = (
    idx: number,
    field: keyof Omit<VariantCombo, "variants">,
    value: string
  ) => {
    const updated = [...combos];
    updated[idx] = { ...updated[idx], [field]: value };
    setCombos(updated);
  };

  const updateComboVariant = (idx: number, key: string, value: string) => {
    const updated = [...combos];
    updated[idx].variants[key] = value;
    setCombos(updated);
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      const validCombos = combos
        .filter((combo) =>
          Object.values(combo.variants).every((v) => v.trim() !== "")
        )
        .map(({ id, variants, price, stock }) => ({
          id,
          variants,
          price: Number(price),
          stock: Number(stock),
        }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/update-combination/${form.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ combinations: validCombos }),
        }
      );

      if (!res.ok) throw new Error("Failed to save variant combinations");
      router.push("/dashboard/view-products");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${form.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete product");
      router.push("/dashboard/view-products");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <h2 className="text-xl font-semibold text-muted-foreground">
        {form.name}
      </h2>

      <div>
        <h3 className="font-semibold mb-2">Variant Combinations</h3>
        {combos.map((combo, idx) => (
          <Card key={idx} className="mb-4">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Variant {idx + 1}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCombo(idx)}
              >
                <FiTrash2 className="text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.keys(variantOptions)
                .sort()
                .map((key) => (
                  <div key={key}>
                    <Label className="pb-2">{key}</Label>
                    {key.toLowerCase() === "color" ? (
                      <Input
                        type="color"
                        value={combo.variants[key]}
                        onChange={(e) =>
                          updateComboVariant(idx, key, e.target.value)
                        }
                      />
                    ) : (
                      <Select
                        value={combo.variants[key]}
                        onValueChange={(value) =>
                          updateComboVariant(idx, key, value)
                        }
                      >
                        <SelectTrigger className="px-7">
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variantOptions[key]?.map((v) => (
                            <SelectItem key={v.id} value={v.value}>
                              {v.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              <div>
                <Label className="pb-2">Price</Label>
                <Input
                  type="number"
                  value={combo.price}
                  onChange={(e) => updateCombo(idx, "price", e.target.value)}
                />
              </div>
              <div>
                <Label className="pb-2">Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={combo.stock}
                  onChange={(e) => updateCombo(idx, "stock", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="link" onClick={addCombo}>
          + Add Combination
        </Button>
      </div>

      <div className="flex gap-4">
        <Button onClick={saveProduct} disabled={saving}>
          {saving ? "Saving..." : "Save Product"}
        </Button>
        <Button
          variant="destructive"
          onClick={deleteProduct}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Product"}
        </Button>
      </div>
    </div>
  );
}
