"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiPlus, FiEdit, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tag {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  categoryId?: string | null;
  children?: Tag[];
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  tags: Tag[];
  categories: Category[];
  backendToken: string;
}

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function TagManagementClient({
  tags: initialTags,
  categories,
  backendToken,
}: Props) {
  const {data:session} = useSession()
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [newTag, setNewTag] = useState({ name: "", slug: "", categoryId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({
    name: "",
    slug: "",
    categoryId: "" as string | null,
  });
  const [subTagInputs, setSubTagInputs] = useState<
    Record<string, { name: string; slug: string }>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`,
        {
          headers: { Authorization: `Bearer ${backendToken}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) setTags(data.tags);
      else throw new Error(data.message);
    } catch {
      toast.error("Failed to refresh tags");
    }
  };

  const handleCreate = async () => {
    if (!newTag.name || !newTag.slug || !newTag.categoryId) {
      return toast.error("Name and category required");
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify(newTag),
        }
      );
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      toast.success("Tag created");
      setNewTag({ name: "", slug: "", categoryId: "" });
      fetchTags();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.name || !editValue.slug) {
      return toast.error("Name required");
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify(editValue),
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
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${backendToken}` },
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
    if (!sub?.name || !sub?.slug) return toast.error("Subtag name required");

    const parent = tags.find((t) => t.id === parentId);
    if (!parent?.categoryId) return toast.error("Parent must have category");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({
            ...sub,
            parentId,
            categoryId: parent.categoryId,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Subtag created");
      setSubTagInputs((p) => ({ ...p, [parentId]: { name: "", slug: "" } }));
      fetchTags();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create subtag"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId: string | null | undefined) =>
    categories.find((c) => c.id === catId)?.name || "Unassigned";

  if (!session || session.user.isAdmin!==true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }
    
  const renderTags = (list: Tag[], level = 0): React.ReactNode => {
    return list.map((tag) => (
      <li key={tag.id} className="p-3">
        <div className="flex justify-between items-start gap-4">
          {editingId === tag.id ? (
            <div className="flex flex-col gap-2 w-full">
              <Input
                value={editValue.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditValue({
                    ...editValue,
                    name,
                    slug: generateSlug(name),
                  });
                }}
                placeholder="Name"
              />
              {!tag.parentId && (
                <div className="text-sm text-muted-foreground">
                  Category: {getCategoryName(editValue.categoryId)}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleUpdate(tag.id)}
                  disabled={loading}
                >
                  <FiCheck className="text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  disabled={loading}
                >
                  <FiX className="text-red-600" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="font-medium">{tag.name}</div>
                <div className="text-xs text-blue-500">
                  Category: {getCategoryName(tag.categoryId)}
                </div>
              </div>
              <div className="flex">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(tag.id);
                    setEditValue({
                      name: tag.name,
                      slug: tag.slug,
                      categoryId: tag.categoryId || null,
                    });
                  }}
                  disabled={loading}
                >
                  <FiEdit className="text-blue-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(tag.id)}
                  disabled={loading}
                >
                  <FiTrash2 className="text-red-600" />
                </Button>
              </div>
            </>
          )}
        </div>

        {level === 0 && (
          <div className="mt-3 flex gap-2">
            <Input
              className="py-5"
              placeholder="Subtag name"
              value={subTagInputs[tag.id]?.name || ""}
              onChange={(e) => {
                const name = e.target.value;
                setSubTagInputs((prev) => ({
                  ...prev,
                  [tag.id]: {
                    ...(prev[tag.id] || {}),
                    name,
                    slug: generateSlug(name),
                  },
                }));
              }}
            />
            <Button
              className="py-5"
              size="icon"
              variant="outline"
              onClick={() => handleCreateSubtag(tag.id)}
              disabled={loading}
            >
              <FiPlus />
            </Button>
          </div>
        )}

        {tag.children?.length ? (
          <ul className="ml-6 mt-2 border-b border-gray-700">
            {renderTags(tag.children, level + 1)}
          </ul>
        ) : null}
      </li>
    ));
  };

  return (
    <Card className="my-2 px-8">
      <CardHeader>
        <CardTitle>Tag Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            value={newTag.name}
            onChange={(e) => {
              const name = e.target.value;
              setNewTag({ ...newTag, name, slug: generateSlug(name) });
            }}
            placeholder="New tag name"
            disabled={loading}
            className="py-5"
          />
          <Select
            value={newTag.categoryId}
            onValueChange={(value) =>
              setNewTag((prev) => ({ ...prev, categoryId: value }))
            }
            disabled={loading}
          >
            <SelectTrigger className="w-full py-5">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleCreate}
            disabled={loading || !newTag.name || !newTag.categoryId}
          >
            <FiPlus className="mr-1" /> Add
          </Button>
        </div>

        <div className="border rounded-md">
          {tags.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No tags available
            </p>
          ) : (
            <ul>{renderTags(tags)}</ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
