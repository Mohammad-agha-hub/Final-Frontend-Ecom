"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Tag {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Tag[];
}

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<{
    name: string;
    slug: string;
    parentId?: string | null;
  }>({ name: "", slug: "", parentId: null });
  const [loading, setLoading] = useState(false);
  const [subTagInputs, setSubTagInputs] = useState<
    Record<string, { name: string; slug: string }>
  >({});
  const { data: session } = useSession();

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setTags(data.tags);
      } else {
        throw new Error(data.message || "Failed to fetch tags");
      }
    } catch {
      toast.error("Failed to load tags");
    }
  }, [session?.user?.backendToken]);

  // then use it in useEffect
  useEffect(() => {
    if (session?.user?.backendToken) fetchTags();
  }, [session, fetchTags]);

  const handleCreate = async () => {
    if (!newTag.name.trim() || !newTag.slug.trim()) {
      return toast.error("Name and slug are required");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({
            name: newTag.name,
            slug: newTag.slug,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Tag created");
      setNewTag({ name: "", slug: "" });
      fetchTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.name.trim() || !editValue.slug.trim()) {
      return toast.error("Name and slug are required");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({
            name: editValue.name,
            slug: editValue.slug,
            parentId: editValue.parentId || null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Tag updated");
      setEditingId(null);
      fetchTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Tag deleted");
      fetchTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtag = async (parentId: string) => {
    const sub = subTagInputs[parentId];
    if (!sub?.name?.trim() || !sub?.slug?.trim()) {
      return toast.error("Subtag name and slug are required");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({ ...sub, parentId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Subtag created");
      setSubTagInputs((prev) => ({
        ...prev,
        [parentId]: { name: "", slug: "" },
      }));
      fetchTags();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create subtag"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTags = (tags: Tag[], level = 0) => {
    return tags.map((tag) => (
      <li
        key={tag.id}
        className={`p-3 ${level === 0 ? "bg-gray-50" : "bg-white"} border-t`}
      >
        <div className="flex justify-between items-start gap-4">
          {editingId === tag.id ? (
            <div className="flex flex-col gap-2 w-full">
              <input
                type="text"
                placeholder="Name"
                value={editValue.name}
                onChange={(e) =>
                  setEditValue({ ...editValue, name: e.target.value })
                }
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Slug"
                value={editValue.slug}
                onChange={(e) =>
                  setEditValue({ ...editValue, slug: e.target.value })
                }
                className="p-2 border rounded"
              />
              <select
                value={editValue.parentId || ""}
                onChange={(e) =>
                  setEditValue({
                    ...editValue,
                    parentId: e.target.value || null,
                  })
                }
                className="p-2 border rounded"
              >
                <option value="">No Parent</option>
                {tags
                  .filter((t) => t.id !== tag.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(tag.id)} disabled={loading}>
                  <FiCheck className="text-green-600" />
                </button>
                <button onClick={() => setEditingId(null)} disabled={loading}>
                  <FiX className="text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="font-medium">{tag.name}</div>
                <div className="text-sm text-gray-500">{tag.slug}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(tag.id);
                    setEditValue({
                      name: tag.name,
                      slug: tag.slug,
                      parentId: tag.parentId || null,
                    });
                  }}
                >
                  <FiEdit className="text-blue-600" />
                </button>
                <button onClick={() => handleDelete(tag.id)} disabled={loading}>
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            </>
          )}
        </div>

        {level === 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Subtag name"
              value={subTagInputs[tag.id]?.name || ""}
              onChange={(e) =>
                setSubTagInputs((prev) => ({
                  ...prev,
                  [tag.id]: { ...(prev[tag.id] || {}), name: e.target.value },
                }))
              }
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Subtag slug"
              value={subTagInputs[tag.id]?.slug || ""}
              onChange={(e) =>
                setSubTagInputs((prev) => ({
                  ...prev,
                  [tag.id]: { ...(prev[tag.id] || {}), slug: e.target.value },
                }))
              }
              className="p-2 border rounded"
            />
            <button
              onClick={() => handleCreateSubtag(tag.id)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              <FiPlus />
            </button>
          </div>
        )}

        {tag.children && tag.children.length > 0 && (
          <ul className="ml-6 mt-2 border-l border-gray-200">
            {renderTags(tag.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-6">Tag Management</h2>

      {/* Create Tag */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="New tag name"
          value={newTag.name}
          onChange={(e) =>
            setNewTag((prev) => ({ ...prev, name: e.target.value }))
          }
          className="p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="New tag slug"
          value={newTag.slug}
          onChange={(e) =>
            setNewTag((prev) => ({ ...prev, slug: e.target.value }))
          }
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !newTag.name.trim() || !newTag.slug.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          <FiPlus className="inline-block mr-1" /> Add
        </button>
      </div>

      {/* Render Tags */}
      <div className="border rounded">
        {tags.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No tags available</p>
        ) : (
          <ul>{renderTags(tags)}</ul>
        )}
      </div>
    </div>
  );
}
