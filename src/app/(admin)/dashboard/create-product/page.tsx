"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiX, FiChevronDown, FiCheck } from "react-icons/fi";
import { useSession } from "next-auth/react";
import Image from "next/image";


interface Category {
  id: string;
  name: string;
}

interface Subtag {
  id: string;
  name: string;
  tagId: string;
}

interface Tag {
  id: string;
  name: string;
  children?: Subtag[]; // 👈 important
}


interface Variant {
  id: string;
  key: string;
  value: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  discount: number;
  categoryId: string;
}

export default function CreateProductForm() {
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
    stock: 0,
    discount: 0,
    categoryId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, tagsRes, variantsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${session?.user?.backendToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`, {
            headers: { Authorization: `Bearer ${session?.user?.backendToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`, {
            headers: { Authorization: `Bearer ${session?.user?.backendToken}` },
          }),
        ]);

        if (!categoriesRes.ok || !tagsRes.ok || !variantsRes.ok) {
          throw new Error("One or more fetches failed");
        }

        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();
        const variantsData = await variantsRes.json();

        const grouped = variantsData.variants || {};
        const flatVariants = Object.values(grouped).flat();

        setCategories(categoriesData.categories || []);

        // Store both parent and subtags
        setTags(tagsData.tags || []);
        setVariants(flatVariants as Variant[]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load required data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchData();
  }, [session]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "stock", "discount"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };
  

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleVariantSelect = (key: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, categoryId }));
    setIsCategoryOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !imageFiles) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("slug", formData.slug);
      fd.append("description", formData.description);
      fd.append("price", String(formData.price));
      fd.append("stock", String(formData.stock));
      fd.append("discount", String(formData.discount));
      fd.append("categoryId", formData.categoryId);
      fd.append(
        "combinations",
        JSON.stringify([
          {
            variants: selectedVariants,
            stock: formData.stock,
            price: formData.price,
          },
        ])
      );
      selectedTags.forEach((tagId) => fd.append("tagIds", tagId));
      imageFiles.forEach((file) => {
        fd.append("images", file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: fd,
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to create product");

      router.push(`/dashboard/edit-product/${data.product.id}`);
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const groupedVariants = Array.isArray(variants)
    ? variants.reduce((acc, variant) => {
        if (!acc[variant.key]) acc[variant.key] = [];
        if (!acc[variant.key].includes(variant.value)) {
          acc[variant.key].push(variant.value);
        }
        return acc;
      }, {} as Record<string, string[]>)
    : {};

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Product
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (in cents) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  disabled={loading || categories.length === 0}
                  className={`w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left ${
                    loading || categories.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span>{selectedCategory?.name || "Select a category"}</span>
                  <FiChevronDown
                    className={`transition-transform ${
                      isCategoryOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                          formData.categoryId === category.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <span>{category.name}</span>
                        {formData.categoryId === category.id && (
                          <FiCheck className="text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {categories.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  No categories available
                </p>
              )}
            </div>

            {/* TAGS SECTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              {tags.length === 0 && !loading ? (
                <p className="text-sm text-gray-500">No tags available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtags
              </label>
              {tags.every((tag) => !tag.children?.length) && !loading ? (
                <p className="text-sm text-gray-500">No subtags available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags
                    .flatMap((tag) => tag.children || [])
                    .map((subtag) => (
                      <button
                        key={subtag.id}
                        type="button"
                        onClick={() => handleTagToggle(subtag.id)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(subtag.id)
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {subtag.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          {/* Variant Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variants
            </label>
            {Object.entries(groupedVariants).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(groupedVariants).map(([key, values]) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600 capitalize">
                      {key}
                    </label>
                    <select
                      value={selectedVariants[key] || ""}
                      onChange={(e) => handleVariantSelect(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="">Select {key}</option>
                      {values.map((value) => (
                        <option key={`${key}-${value}`} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No variants available</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <label
                  className={`cursor-pointer ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
                    <FiUpload className="inline mr-2" />
                    Upload Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  
                    disabled={loading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB (JPEG, PNG, etc.)
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative border rounded-md overflow-hidden group"
                  >
                    <Image
                      src={src}
                      alt={`Preview ${idx}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviews((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                        setImageFiles((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } flex items-center justify-center min-w-32`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
