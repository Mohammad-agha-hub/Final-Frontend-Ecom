"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "react-toastify";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  parent?: boolean;
}

interface Variant {
  key: string;
  value: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  discount: string;
  categoryId: string;
}

interface Props {
  categories: Category[];
  tags: Tag[];
  variants: Variant[];
}

export default function CreateProductForm({
  categories,
  tags,
  variants,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    discount: "",
    categoryId: "",
  });

  // Auto-generate slug from name
  useEffect(() => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.name]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tag) => tag !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleVariantSelect = (key: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || imageFiles.length === 0) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("slug", formData.slug);
      fd.append("description", formData.description);
      fd.append("price", String(Number(formData.price)));
      fd.append("stock", String(Number(formData.stock)));
      fd.append("discount", String(Number(formData.discount)));
      fd.append("categoryId", formData.categoryId);

      fd.append(
        "combinations",
        JSON.stringify([
          {
            variants: selectedVariants,
            stock: Number(formData.stock),
            price: Number(formData.price),
          },
        ])
      );

      selectedTags.forEach((id) => fd.append("tagIds", id));
      imageFiles.forEach((file) => fd.append("images", file));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.user?.backendToken}`,
          },
          body: fd,
        }
      );

      const result = await res.json();
      if (!res.ok) toast.error(result.message || "Failed to create product");
      toast.success("Created Product Successfully!")
      router.push(`/dashboard/view-products`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const groupedVariants: Record<string, string[]> = {};
  variants.forEach((variant) => {
    if (!groupedVariants[variant.key]) groupedVariants[variant.key] = [];
    if (!groupedVariants[variant.key].includes(variant.value)) {
      groupedVariants[variant.key].push(variant.value);
    }
  });

  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 mt-2 px-10 p-6 bg-white rounded-lg shadow"
    >
      <h1 className="text-2xl font-semibold">Create Product</h1>
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Name</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
            className="py-5"
            required
          />

          {/* Slug is hidden but still included in the form */}
          <input type="hidden" name="slug" value={formData.slug} />

          <Label>Description</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Price</Label>
          <Input
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            disabled={loading}
            className="py-5"
            required
          />

          <Label>Discount (%)</Label>
          <Input
            name="discount"
            value={formData.discount}
            onChange={handleInputChange}
            disabled={loading}
            className="py-5"
            
          />

          <Label>Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, categoryId: val }))
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div className="space-y-4">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((tag) => !tag.parent)
              .map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant={
                    selectedTags.includes(tag.id) ? "default" : "outline"
                  }
                  className="rounded-full text-sm"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
          </div>

          <Label>Subtags</Label>
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((tag) => tag.parent)
              .map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant={
                    selectedTags.includes(tag.id) ? "default" : "outline"
                  }
                  className="rounded-full text-sm"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
          </div>
        </div>

        <div>
          <Label className="pb-2">Variants</Label>
          <div className="grid gap-3">
            {Object.entries(groupedVariants).map(([key, values]) => (
              <div key={key}>
                <Label className="capitalize pb-2">{key}</Label>
                <Select
                  value={selectedVariants[key] || ""}
                  onValueChange={(val) => handleVariantSelect(key, val)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${key}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {values.map((val) => (
                      <SelectItem key={val} value={val}>
                        {key.toLowerCase() === "color" &&
                        /^#([0-9a-f]{3}){1,2}$/i.test(val) ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full border"
                              style={{ backgroundColor: val }}
                            />
                            <span>{val}</span>
                          </div>
                        ) : (
                          val
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={loading}
        />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {imagePreviews.map((src, i) => (
              <div
                key={i}
                className="relative group border rounded overflow-hidden"
              >
                <Image
                  src={src}
                  alt={`Preview ${i}`}
                  width={200}
                  height={200}
                  loading="lazy"
                  className="object-cover w-full h-102"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreviews((prev) =>
                      prev.filter((_, idx) => idx !== i)
                    );
                    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                >
                  <FiX className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
