"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Category {
  id: string;
  name: string;
}

  // Fetch all categories
  export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [loading, setLoading] = useState(false);
    const { data:session } = useSession();
   
  
    const fetchCategories = useCallback(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
          {
            headers: {
              Authorization: `Bearer ${session?.user.backendToken}`,
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
  
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load categories");
      }
    }, [session?.user?.backendToken]);
  
    useEffect(() => {
      if (session) {
        fetchCategories();
      }
    }, [session, fetchCategories]);

  // Create new category
  const handleCreate = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({ name: newCategory }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Creation failed");
      }

      toast.success("Category created!");
      setNewCategory("");
      await fetchCategories();
    } catch (error) {
      console.error("Create error:", error);
      toast.error(error instanceof Error ? error.message : "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const saveEdit = async (id: string) => {
    if (!editValue.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({ name: editValue }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Category updated!");
      setEditingId(null);
      await fetchCategories();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Deletion failed");
      }

      toast.success("Category deleted!");
      await fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Deletion failed");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a category
  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Category Management</h2>

      {/* Create Category Form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading}
        />
        <button
          onClick={handleCreate}
          disabled={loading || !newCategory.trim()}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            loading || !newCategory.trim()
              ? "bg-gray-300 text-gray-500"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          <FiPlus /> Add
        </button>
      </div>

      {/* Categories List */}
      <div className="border rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="p-3 hover:bg-gray-50">
                {editingId === category.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(category.id)}
                      disabled={loading}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(category)}
                        disabled={loading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
