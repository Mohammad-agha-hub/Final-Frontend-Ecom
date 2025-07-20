"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subheading?: string;
  paragraph?: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  active: boolean;
}

export default function ManageBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<Partial<Banner>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos`);
    const data = await res.json();
    setBanners(data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();

    if (imageFile) formData.append("image", imageFile);
    formData.append("title", form.title || "");
    formData.append("subheading", form.subheading || "");
    formData.append("paragraph", form.paragraph || "");
    formData.append("linkUrl", form.linkUrl || "");
    formData.append("position", String(form.position || 0));
    formData.append("active", String(form.active ?? true));

    const url = editingId
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos/${editingId}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos`;

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: formData,
    });

    setForm({});
    setImageFile(null);
    setEditingId(null);
    await fetchBanners();
    setLoading(false);
  };

  const handleEdit = (banner: Banner) => {
    setForm(banner);
    setEditingId(banner.id);
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos/${id}`, {
      method: "DELETE",
    });
    fetchBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos/${banner.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, active: !banner.active }),
      }
    );
    fetchBanners();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {editingId ? "Edit Banner" : "Create New Banner"}
      </h1>

      <div className="space-y-4 border p-6 rounded bg-gray-50">
        <input
          placeholder="Title"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="Subheading"
          value={form.subheading || ""}
          onChange={(e) => setForm({ ...form, subheading: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Paragraph"
          value={form.paragraph || ""}
          onChange={(e) => setForm({ ...form, paragraph: e.target.value })}
          className="w-full p-2 border rounded resize-none"
        />
        <input
          placeholder="Link URL"
          value={form.linkUrl || ""}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Position"
          value={form.position ?? ""}
          onChange={(e) =>
            setForm({ ...form, position: Number(e.target.value) })
          }
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImageFile(file);
          }}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Saving..."
            : editingId
            ? "Update Banner"
            : "Create Banner"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Current Banners</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="border p-4 rounded shadow-sm bg-white"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${banner.imageUrl}`}
              alt={banner.title}
              width={400}
              height={200}
              className="rounded object-cover mb-2"
            />
            <div className="text-lg font-medium">{banner.title}</div>
            {banner.subheading && (
              <div className="text-md text-gray-800 font-semibold">
                {banner.subheading}
              </div>
            )}
            {banner.paragraph && (
              <p className="text-sm text-gray-500 mt-1">{banner.paragraph}</p>
            )}
            <div className="text-sm text-gray-600">Link: {banner.linkUrl}</div>
            <div className="text-sm text-gray-600">
              Position: {banner.position}
            </div>
            <div className="text-sm">
              Status:{" "}
              <span
                className={banner.active ? "text-green-600" : "text-red-600"}
              >
                {banner.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleEdit(banner)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(banner)}
                className="text-yellow-600 text-sm"
              >
                Toggle
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
