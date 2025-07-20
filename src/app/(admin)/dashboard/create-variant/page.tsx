"use client";
import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface Variant {
  id: string;
  key: string;
  value: string;
  createdAt: string;
}
type VariantInput = { key: string; value: string };


export default function VariantManagement() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({ key: "", value: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({ key: "", value: "" });
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`,
        
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      const flatVariants = Object.values(data.variants || {}).flat();
      setVariants(flatVariants as Variant[]);
      
    } catch (err) {
      toast.error("Failed to load variants");
      console.log(err)
      setVariants([]); // fallback in case of error
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (session) fetchVariants();
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<VariantInput>>
  ) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!newVariant.key || !newVariant.value) {
      toast.error("Fill both fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.backendToken}`,
          },
          body: JSON.stringify(newVariant),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Variant created");
      setNewVariant({ key: "", value: "" });
      fetchVariants();
    } catch (err) {
      console.log(err)
      toast.error("Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editValue.key || !editValue.value) {
      toast.error("Fill both fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants/${id}`,
        {
          method: "PUT",
          headers: {
           "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.backendToken}`,
          },
          body: JSON.stringify(editValue),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Variant updated");
      setEditingId(null);
      fetchVariants();
    } catch (err) {
      console.log(err)
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Variant deleted");
      fetchVariants();
    } catch (err) {
      console.log(err)
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-6">Variant Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
        <input
          type="text"
          name="key"
          value={newVariant.key}
          onChange={(e) => handleChange(e, setNewVariant)}
          placeholder="Key (e.g., Color)"
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="value"
          value={newVariant.value}
          onChange={(e) => handleChange(e, setNewVariant)}
          placeholder="Value (e.g., Red)"
          className="p-2 border rounded"
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          <FiPlus className="inline-block mr-1" /> Add
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Key</th>
            <th className="px-4 py-2 text-left">Value</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {variants.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                No variants found
              </td>
            </tr>
          ) : (
            variants.map((variant) => (
              <tr key={variant.id}>
                {editingId === variant.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        name="key"
                        value={editValue.key}
                        onChange={(e) => handleChange(e, setEditValue)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        name="value"
                        value={editValue.value}
                        onChange={(e) => handleChange(e, setEditValue)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(variant.id)}
                        disabled={loading}
                      >
                        <FiCheck className="text-green-600" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                      >
                        <FiX className="text-red-600" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 font-medium">{variant.key}</td>
                    <td className="px-4 py-2">{variant.value}</td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setEditingId(variant.id);
                          setEditValue({
                            key: variant.key,
                            value: variant.value,
                          });
                        }}
                      >
                        <FiEdit className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        disabled={loading}
                      >
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
