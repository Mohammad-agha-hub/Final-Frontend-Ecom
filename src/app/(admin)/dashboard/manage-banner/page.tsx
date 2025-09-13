"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
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
  const {data:session} = useSession()
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<Partial<Banner>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.backendToken}`,
        },
      body: formData,
    });

    setForm({});
    setImageFile(null);
    setEditingId(null);
    setLoading(false);
    setOpen(false);
    toast.success("Created banner successfully!")
    await fetchBanners();
  };

  const handleEdit = (banner: Banner) => {
    setForm(banner);
    setEditingId(banner.id);
    setImageFile(null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user.backendToken}`,
      },
    });
    toast.success("Banner deleted successfully!")
    fetchBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos/${banner.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.backendToken}`,
        },
        body: JSON.stringify({ ...banner, active: !banner.active }),
      }
    );
    fetchBanners();
  };
  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-10 justify-between">
        <h1 className="text-2xl font-bold">Manage Banners</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setForm({});
                setEditingId(null);
                setOpen(true);
              }}
            >
              + Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Banner" : "Create Banner"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details and save to{" "}
                {editingId ? "update" : "create"} a banner.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="Subheading"
                value={form.subheading || ""}
                onChange={(e) =>
                  setForm({ ...form, subheading: e.target.value })
                }
              />
              <Textarea
                placeholder="Paragraph"
                value={form.paragraph || ""}
                onChange={(e) =>
                  setForm({ ...form, paragraph: e.target.value })
                }
              />
              <Input
                placeholder="Link URL"
                value={form.linkUrl || ""}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Position"
                value={form.position ?? ""}
                onChange={(e) =>
                  setForm({ ...form, position: Number(e.target.value) })
                }
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.active ?? true}
                  onCheckedChange={(value) =>
                    setForm({ ...form, active: value })
                  }
                />
                <span>Active</span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Banner"
                  : "Create Banner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              width={400}
              height={400}
              loading="lazy"
              className="w-full h-100 object-top object-cover"
            />
            <div className="p-4 space-y-1">
              <div className="font-semibold text-lg">{banner.title}</div>
              {banner.subheading && (
                <div className="text-sm text-gray-700">{banner.subheading}</div>
              )}
              {banner.paragraph && (
                <p className="text-sm text-gray-500">{banner.paragraph}</p>
              )}
              <div className="text-sm text-muted-foreground">
                Link: {banner.linkUrl}
              </div>
              <div className="text-sm">Position: {banner.position}</div>
              <div className="text-sm">
                Status:{" "}
                <span
                  className={banner.active ? "text-green-600" : "text-red-600"}
                >
                  {banner.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-3 mt-3 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(banner)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(banner)}
                >
                  Toggle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(banner.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
