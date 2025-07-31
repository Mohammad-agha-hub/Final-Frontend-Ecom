"use client";

import React, {useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  image?: string;
}

interface Props {
  initialCategories: Category[];
}

export default function CategoryManagement({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch {
      toast.error("Failed to reload categories");
    }
  };

  const handleCreate = async () => {
    if (!newCategory.trim()) return toast.error("Empty name");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newCategory);
      if (newImage) formData.append("image", newImage);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error();
      toast.success("Created!");
      setNewCategory("");
      setNewImage(null);
      fetchCategories();
    } catch {
      toast.error("Create failed");
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return toast.error("Empty edit");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editValue);
      if (editImage) formData.append("image", editImage);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error();
      toast.success("Updated!");
      setEditingId(null);
      setEditImage(null);
      fetchCategories();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
        }
      );

      if (!res.ok) throw new Error();
      toast.success("Deleted!");
      fetchCategories();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreate();
  };

  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }

  return (
    <Card className="mt-2 px-5">
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleFormSubmit}
          className="flex justify-center gap-6 mb-6 items-center"
        >
          <Input
            className="w-[40%] py-5"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            disabled={loading}
          />
          <Input
            type="file"
            className="w-[35%] py-2"
            onChange={(e) =>
              setNewImage(e.target.files ? e.target.files[0] : null)
            }
          />
          <Button
            type="submit"
            disabled={loading || !newCategory.trim()}
            className="shrink-0 w-[10%] py-5"
          >
            <FiPlus className="mr-1" /> Add
          </Button>
        </form>

        <div className="rounded-lg border divide-y">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No categories
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="p-3 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {editingId === category.id ? (
                  <div className="w-full flex flex-col md:flex-row gap-3 items-center">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEdit(category.id);
                        }
                      }}
                    />
                    <Input
                      type="file"
                      className="w-full md:w-64"
                      onChange={(e) =>
                        setEditImage(e.target.files ? e.target.files[0] : null)
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveEdit(category.id)}
                      >
                        <FiCheck className="text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(null)}
                      >
                        <FiX className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      {category.image && (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover"
                        />
                      )}
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditValue(category.name);
                        }}
                      >
                        <FiEdit className="text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <FiTrash2 className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
