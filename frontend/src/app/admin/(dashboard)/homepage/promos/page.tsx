"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Edit, Save, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PromosPage() {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Form
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [ctaText, setCtaText] = useState("");
    const [ctaLink, setCtaLink] = useState("");
    const [targetAudience, setTargetAudience] = useState("ALL");
    const [isActive, setIsActive] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchPromos = async () => {
        try {
            // Missing endpoint again, need to add to controller
            const data = await fetchApi("/admin/homepage/promos");
            setPromos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle("");
        setSubtitle("");
        setCtaText("");
        setCtaLink("");
        setTargetAudience("ALL");
        setIsActive(true);
        setFile(null);
        setPreview(null);
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setTitle(item.title);
        setSubtitle(item.subtitle || "");
        setCtaText(item.ctaText);
        setCtaLink(item.ctaLink);
        setTargetAudience(item.targetAudience);
        setIsActive(item.isActive);
        setPreview(item.imageUrl);
        setIsDialogOpen(true);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("subtitle", subtitle);
            formData.append("ctaText", ctaText);
            formData.append("ctaLink", ctaLink);
            formData.append("targetAudience", targetAudience);
            formData.append("isActive", String(isActive));

            if (file) {
                formData.append("image", file);
            } else if (editingItem) {
                formData.append("imageUrl", editingItem.imageUrl);
            }

            let url = "/admin/homepage/promos";
            let method = "POST";

            if (editingItem) {
                url = `/admin/homepage/promos/${editingItem.id}`;
                method = "PATCH";
            }

            // Using fetchApi which handles FormData and auth headers
            await fetchApi(url, {
                method,
                body: formData,
            });

            setIsDialogOpen(false);
            fetchPromos();
            resetForm();
            alert("Saved successfully!");
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete promo?")) return;
        try {
            await fetchApi(`/admin/homepage/promos/${id}`, { method: "DELETE" });
            fetchPromos();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Promo Banners</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Promo</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Promo" : "New Promo"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Image</Label>
                                <div className="border border-dashed p-2 rounded flex justify-center hover:bg-gray-50 cursor-pointer relative h-32">
                                    {preview ? (
                                        <Image src={preview} alt="Preview" fill className="object-cover rounded" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Upload className="w-6 h-6 mb-1" />
                                            <span className="text-xs">Upload</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtitle</Label>
                                <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CTA Text</Label>
                                    <Input value={ctaText} onChange={e => setCtaText(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA Link</Label>
                                    <Input value={ctaLink} onChange={e => setCtaLink(e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <Select value={targetAudience} onValueChange={setTargetAudience}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All</SelectItem>
                                        <SelectItem value="MEN">Men</SelectItem>
                                        <SelectItem value="WOMEN">Women</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                                <Label htmlFor="active">Active</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Promo
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {promos.map(item => (
                    <div key={item.id} className="border rounded-xl overflow-hidden relative group">
                        <div className="relative h-48">
                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 text-white">
                                <h3 className="font-bold text-xl">{item.title}</h3>
                                <p className="text-sm opacity-90">{item.subtitle}</p>
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center bg-gray-50">
                            <span className="text-xs font-mono uppercase bg-gray-200 px-2 py-1 rounded">{item.targetAudience}</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(item.id)}>Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
