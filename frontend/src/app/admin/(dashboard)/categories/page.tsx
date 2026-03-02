"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Tag,
    Eye,
    EyeOff,
    Clock,
    GripVertical,
    Save
} from "lucide-react";
import { fetchApi, fetchAdminApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Category {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    isComingSoon: boolean;
    displayOrder: number;
    imageUrl?: string | null;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAdminApi("/categories");
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const isNew = editingCategory.id.includes('temp');
            const method = isNew ? 'POST' : 'PATCH';
            const url = isNew ? '/categories' : `/categories/${editingCategory.id}`;

            const formData = new FormData();
            formData.append('name', editingCategory.name);
            formData.append('slug', editingCategory.slug);
            formData.append('displayOrder', editingCategory.displayOrder.toString());
            formData.append('isActive', editingCategory.isActive.toString());
            formData.append('isComingSoon', editingCategory.isComingSoon.toString());

            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (editingCategory.imageUrl) {
                formData.append('imageUrl', editingCategory.imageUrl);
            }

            await fetchAdminApi(url, {
                method,
                body: formData,
            });

            toast.success("Category saved successfully");
            setDialogOpen(false);
            setPreviewUrl(null);
            setSelectedFile(null);
            fetchCategories();
        } catch (err) {
            toast.error("Failed to save category");
        }
    };

    const toggleComingSoon = async (id: string, current: boolean) => {
        try {
            await fetchAdminApi(`/categories/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isComingSoon: !current }),
            });
            toast.success("Updated status");
            fetchCategories();
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-vogue">Categories</h1>
                    <p className="text-muted-foreground font-sans">Manage product collections and specialized landing pages.</p>
                </div>
                <div className="flex gap-2 font-sans">
                    <Button onClick={fetchCategories} variant="outline" size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => {
                        setEditingCategory({
                            id: `temp-${Date.now()}`,
                            name: '',
                            slug: '',
                            isActive: true,
                            isComingSoon: false,
                            displayOrder: categories.length
                        } as any);
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setDialogOpen(true);
                    }} className="bg-[#480100] text-[#F7DFB9] font-sans">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading && categories.length === 0 ? (
                    <Card><CardContent className="py-10 text-center">Loading...</CardContent></Card>
                ) : categories.length === 0 ? (
                    <Card><CardContent className="py-10 text-center text-muted-foreground">No categories found.</CardContent></Card>
                ) : (
                    categories.sort((a, b) => a.displayOrder - b.displayOrder).map((cat) => (
                        <Card key={cat.id} className="hover:border-[#480100]/30 transition-colors">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-muted rounded cursor-move">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border">
                                    {cat.imageUrl ? (
                                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag className="h-5 w-5 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold">{cat.name}</h3>
                                        {cat.isComingSoon && (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 gap-1 h-5">
                                                <Clock className="h-3 w-3" /> Coming Soon
                                            </Badge>
                                        )}
                                        {!cat.isActive && (
                                            <Badge variant="outline" className="text-muted-foreground h-5">Inactive</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Display</span>
                                        <div className="flex items-center gap-2">
                                            {cat.isActive ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                                            <Switch checked={cat.isActive} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Coming Soon</span>
                                        <Switch checked={cat.isComingSoon} onCheckedChange={() => toggleComingSoon(cat.id, cat.isComingSoon)} />
                                    </div>

                                    <div className="flex gap-1 border-l pl-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                            setEditingCategory(cat);
                                            setPreviewUrl(cat.imageUrl || null);
                                            setSelectedFile(null);
                                            setDialogOpen(true);
                                        }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCategory?.id.includes('temp') ? 'Add Category' : 'Edit Category'}</DialogTitle>
                        <DialogDescription>Set the name, slug and status filters for this collection.</DialogDescription>
                    </DialogHeader>
                    {editingCategory && (
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-24 w-24 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag className="h-8 w-8 text-slate-200" />
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <label className="text-xs font-bold uppercase text-slate-500">Category Image</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-xs h-9 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Recommend 800x1000px (4:5 ratio)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase">Category Name</label>
                                <Input value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase">URL Slug</label>
                                <Input value={editingCategory.slug} onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase">Display Order</label>
                                    <Input type="number" value={editingCategory.displayOrder} onChange={e => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value) })} />
                                </div>
                                <div className="flex items-center gap-4 pt-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium">Active</span>
                                        <Switch checked={editingCategory.isActive} onCheckedChange={val => setEditingCategory({ ...editingCategory, isActive: val })} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-[#480100] text-[#F7DFB9]">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
