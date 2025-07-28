"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Loader2 } from "lucide-react";

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
  tags: Tag[];
  images: { id: string; url: string }[];
}

export default function EditProductClient({
  product,
  categories,
  tags,
  token,
}: {
  product: Product;
  categories: Category[];
  tags: Tag[];
  token: string | undefined;
}) {
  const router = useRouter();

  const dedupedTags = Array.from(
    new Map(tags.map((t) => [t.name, t])).values()
  );

  const [form, setForm] = useState<Product>({
    ...product,
    tags: product.tags ?? [],
  });

  const [images, setImages] = useState<(File | { url: string })[]>(
    product.images || []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const updateField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm({ ...form, [key]: value });
  };

  const toggleTag = (id: string) => {
    const exists = form.tags.some((t) => t.id === id);
    const updated = exists
      ? form.tags.filter((t) => t.id !== id)
      : [...form.tags, dedupedTags.find((t) => t.id === id)!];
    setForm({ ...form, tags: updated });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));
    if (validImages.length > 0) {
      setImages([...images, ...validImages]);
    } else {
      alert("Please select valid image files.");
    }
  };

  const saveProduct = async () => {
    const { name, slug, description, price, categoryId } = form;
    if (
      !name ||
      !slug ||
      !description ||
      !price ||
      !categoryId ||
      form.tags.length === 0
    ) {
      alert(
        "Fill in all the required fields and select at least one tag and subtag"
      );
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      const keys: (keyof Product)[] = [
        "name",
        "slug",
        "description",
        "price",
        "discount",
        "categoryId",
      ];
      keys.forEach((key) => fd.append(key, String(form[key])));
      form.tags.forEach((t) => fd.append("tagIds", t.id));
      images.forEach((img) => {
        if (img instanceof File) {
          fd.append("images", img);
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/details/${form.id}`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              saveProduct();
            }}
          >
            {images.length > 0 && (
              <div className="flex gap-4 flex-wrap justify-center">
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={
                      img instanceof File ? URL.createObjectURL(img) : img.url
                    }
                    alt="Product Image"
                    width={160}
                    height={160}
                    loading="lazy"
                    className="rounded object-cover border"
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="Slug"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Description"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Images</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImage}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateField("price", Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount (%)
                </label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(e) =>
                    updateField("discount", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Select
                  onValueChange={(value) => updateField("categoryId", value)}
                  value={form.categoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {dedupedTags
                  .filter((tag) => !tag.parent)
                  .map((tag) => {
                    const selected = form.tags.some((t) => t.id === tag.id);
                    return (
                      <Button
                        key={tag.id}
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag.id)}
                        className="rounded-full"
                        type="button"
                      >
                        {tag.name}
                      </Button>
                    );
                  })}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Subtags</label>
              <div className="flex flex-wrap gap-2">
                {dedupedTags
                  .filter((tag) => tag.parent)
                  .map((tag) => {
                    const selected = form.tags.some((t) => t.id === tag.id);
                    return (
                      <Button
                        key={tag.id}
                        variant={selected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag.id)}
                        className="rounded-full"
                        type="button"
                      >
                        {tag.name}
                      </Button>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Product"}
              </Button>
              <Button
                type="button"
                onClick={deleteProduct}
                variant="destructive"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
