"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import {Table, TableHeader, TableHead, TableBody, TableRow, TableCell,

} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";
import { useSession } from "next-auth/react";
export interface Variant {
  id: string;
  key: string;
  value: string;
  createdAt: string;
}
type VariantInput = { key: string; value: string };

export default function VariantManagementClient({
  serverVariants,
  token,
}: {
  serverVariants: Variant[];
  token?: string;
}) {
  const {data:session} = useSession()
  const [variants, setVariants] = useState<Variant[]>(serverVariants || []);
  const [newVariant, setNewVariant] = useState({ key: "", value: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({ key: "", value: "" });
  const [loading, setLoading] = useState(false);
  const [initialLoading] = useState(false);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`);
      const data = await res.json();
      const flatVariants = Object.values(data.variants || {}).flat();
      setVariants(flatVariants as Variant[]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVariant),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Variant created");
      setNewVariant({ key: "", value: "" });
      fetchVariants();
    } catch (err) {
      console.error(err);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editValue),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Variant updated");
      setEditingId(null);
      fetchVariants();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Variant deleted");
      fetchVariants();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };
 if(!session || session.user.isAdmin !== true){
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );}
    
  return (
    <Card className="mt-2 px-10">
      <CardHeader>
        <CardTitle>Variant Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Input
            name="key"
            placeholder="Key (e.g., Color)"
            value={newVariant.key}
            onChange={(e) => handleChange(e, setNewVariant)}
            disabled={loading}
          />
          <Input
            name="value"
            placeholder="Value (e.g., Red)"
            value={newVariant.value}
            onChange={(e) => handleChange(e, setNewVariant)}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !newVariant.key || !newVariant.value}
          >
            <FiPlus className="mr-2" /> Add
          </Button>
        </form>

        {initialLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No variants found
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((variant) => (
                  <TableRow key={variant.id}>
                    {editingId === variant.id ? (
                      <>
                        <TableCell>
                          <Input
                            name="key"
                            value={editValue.key}
                            onChange={(e) => handleChange(e, setEditValue)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            name="value"
                            value={editValue.value}
                            onChange={(e) => handleChange(e, setEditValue)}
                          />
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(variant.id)}
                            disabled={loading}
                          >
                            <FiCheck />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                          >
                            <FiX />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">
                          {variant.key}
                        </TableCell>
                        <TableCell>{variant.value}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setEditingId(variant.id);
                              setEditValue({
                                key: variant.key,
                                value: variant.value,
                              });
                            }}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(variant.id)}
                            disabled={loading}
                          >
                            <FiTrash2 className="text-red-600" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
