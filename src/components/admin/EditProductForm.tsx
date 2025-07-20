"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { FiTrash2 } from "react-icons/fi";

interface Tag {
  id: string;
  name: string;
  parent?: Tag | null;
}

interface Category {
  id: string;
  name: string;
}

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
  tags: Tag[];
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
  price: number;
  stock: number;
  image?: string | File;
}

interface Variant {
  id: string;
  key: string;
  value: string;
}

type VariantOptions = Record<string, Variant[]>;

export default function EditProductClient({
  product,
  categories,
  tags,
  token,
  variantOptions,
}: {
  product: Product;
  categories: Category[];
  tags: Tag[];
  token: string | undefined;
  variantOptions: VariantOptions;
}) {
  const router = useRouter();

  const [form, setForm] = useState<Product>({
    ...product,
    tags: product.tags ?? [],
    variantCombinations: product.variantCombinations ?? [],
  });

  const [mainImage, setMainImage] = useState<string | File>(product.image);

  const [combos, setCombos] = useState<VariantCombo[]>(
    product.variantCombinations.map((vc) => ({
      id: vc.id,
      price: vc.price,
      stock: vc.stock,
      image: vc.image || "",
      variants: Object.fromEntries(
        vc.variants.map((v) => [v.variant.key, v.variant.value])
      ),
    }))
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm({ ...form, [key]: value });
  };

  const toggleTag = (id: string) => {
    const exists = form.tags.some((t) => t.id === id);
    const updated = exists
      ? form.tags.filter((t) => t.id !== id)
      : [...form.tags, tags.find((t) => t.id === id)!];
    setForm({ ...form, tags: updated });
  };

  const addCombo = () => {
    const defaultVariants = Object.fromEntries(
      Object.keys(variantOptions).map((key) => [key, ""])
    );
    setCombos([...combos, { variants: defaultVariants, price: 0, stock: 0 }]);
  };

  const removeCombo = (idx: number) => {
    setCombos(combos.filter((_, i) => i !== idx));
  };

  const updateCombo = (
    idx: number,
    field: keyof VariantCombo,
    value: VariantCombo[typeof field]
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

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setMainImage(file);
    } else {
      alert("Please select a valid image file.");
    }
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      const fd = new FormData();

      type FormKey =
        | "name"
        | "slug"
        | "description"
        | "price"
        | "stock"
        | "discount"
        | "categoryId";

      (
        [
          "name",
          "slug",
          "description",
          "price",
          "stock",
          "discount",
          "categoryId",
        ] as FormKey[]
      ).forEach((key) => {
        fd.append(key, String(form[key]));
      });

      form.tags.forEach((t) => fd.append("tagIds", t.id));

      const serializedCombos = combos.map((combo, index) => {
        const { image, ...rest } = combo;
        if (image instanceof File) {
          fd.append("comboImages", image);
          return { ...rest, image: `__upload__comboImages__${index}` };
        }
        return { ...rest, image };
      });

      const validCombos = serializedCombos.filter((combo) =>
        Object.values(combo.variants).every((v) => v.trim() !== "")
      );

      fd.append("combinations", JSON.stringify(validCombos));

      if (mainImage instanceof File) {
        fd.append("image", mainImage);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${form.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (!res.ok) throw new Error("Failed to save product");
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

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      {mainImage && (
        <div className="flex justify-center">
          <Image
            src={
              typeof mainImage === "string"
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${mainImage}`
                : URL.createObjectURL(mainImage)
            }
            alt="Product"
            className="object-cover rounded"
            width={240}
            height={240}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="md:col-span-2">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="md:col-span-2">
          <label>Change Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => updateField("stock", Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Discount (%)</label>
          <input
            type="number"
            value={form.discount}
            onChange={(e) => updateField("discount", Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Tags (Parent)</label>
        <div className="flex flex-wrap gap-2 overflow-x-auto whitespace-nowrap mb-4">
          {tags
            .filter((tag) => !tag.parent)
            .map((tag) => {
              const selected = form.tags.some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm shrink-0 ${
                    selected ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                  type="button"
                >
                  {tag.name}
                </button>
              );
            })}
        </div>

        <label className="block font-medium mb-1">Subtags</label>
        <div className="flex flex-wrap gap-2 overflow-x-auto whitespace-nowrap">
          {tags
            .filter((tag) => tag.parent)
            .map((tag) => {
              const selected = form.tags.some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm shrink-0 ${
                    selected ? "bg-purple-600 text-white" : "bg-gray-200"
                  }`}
                  type="button"
                >
                  {tag.name}
                </button>
              );
            })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Variant Combinations</h3>
        {combos.map((combo, idx) => (
          <div key={idx} className="border rounded p-4 mb-3 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Variant {idx + 1}</span>
              <FiTrash2
                onClick={() => removeCombo(idx)}
                className="text-red-600 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.keys(variantOptions)
                .sort()
                .map((key) => (
                  <div key={key}>
                    <label className="text-sm">{key}</label>
                    <select
                      value={combo.variants[key]}
                      onChange={(e) =>
                        updateComboVariant(idx, key, e.target.value)
                      }
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select {key}</option>
                      {variantOptions[key]?.map((v) => (
                        <option key={v.id} value={v.value}>
                          {v.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              <div>
                <label className="text-sm">Price</label>
                <input
                  type="number"
                  value={combo.price}
                  onChange={(e) =>
                    updateCombo(idx, "price", Number(e.target.value))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm">Stock</label>
                <input
                  type="number"
                  value={combo.stock}
                  onChange={(e) =>
                    updateCombo(idx, "stock", Number(e.target.value))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          className="text-blue-600 font-medium mt-2"
          type="button"
          onClick={addCombo}
        >
          + Add Combination
        </button>
      </div>

      <div className="flex gap-10">
        <button
          onClick={saveProduct}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
        <button
          onClick={deleteProduct}
          disabled={deleting}
          className="bg-red-500 text-white px-6 py-2 rounded"
        >
          {deleting ? "Deleting..." : "Delete Product"}
        </button>
      </div>
    </div>
  );
}
