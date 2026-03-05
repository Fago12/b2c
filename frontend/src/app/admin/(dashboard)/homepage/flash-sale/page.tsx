"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Save, Flame, Calendar, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function FlashSaleManagementPage() {
    const [flashSales, setFlashSales] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State for Create/Edit
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "Flash Sale",
        description: "Limited time offers on our best sellers!",
        endsAt: "",
        isActive: true,
        productIds: [] as string[]
    });

    const fetchData = async () => {
        try {
            const [salesData, productsResponse] = await Promise.all([
                fetchAdminApi("/admin/homepage/flash-sale"),
                fetchAdminApi("/products/admin/list?limit=100")
            ]);
            setFlashSales(salesData);
            // Only show products that are actually on sale or available for selection
            const productItems = productsResponse.products || [];
            setProducts(productItems.filter((p: any) => p.salePriceUSD_cents || p.isActive));
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing && editingId) {
                await fetchAdminApi(`/admin/homepage/flash-sale/${editingId}`, {
                    method: "PATCH",
                    body: JSON.stringify(formData)
                });
                toast({ title: "Success", description: "Flash sale updated" });
            } else {
                await fetchAdminApi("/admin/homepage/flash-sale", {
                    method: "POST",
                    body: JSON.stringify(formData)
                });
                toast({ title: "Success", description: "Flash sale created" });
            }
            setIsEditing(false);
            setEditingId(null);
            setFormData({ title: "Flash Sale", description: "", endsAt: "", isActive: true, productIds: [] });
            fetchData();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save flash sale", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flash sale configuration?")) return;
        try {
            await fetchAdminApi(`/admin/homepage/flash-sale/${id}`, { method: "DELETE" });
            toast({ title: "Deleted", description: "Flash sale configuration removed" });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (sale: any) => {
        setEditingId(sale.id);
        setFormData({
            title: sale.title,
            description: sale.description || "",
            endsAt: new Date(sale.endsAt).toISOString().slice(0, 16),
            isActive: sale.isActive,
            productIds: sale.productIds || []
        });
        setIsEditing(true);
    };

    const toggleProduct = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            productIds: prev.productIds.includes(productId)
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId].slice(0, 4) // Max 4 for the banner
        }));
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Flash Sale Management</h1>
                    <p className="text-muted-foreground">Configure countdowns and featured sale products.</p>
                </div>
                <Flame className="h-10 w-10 text-red-500 opacity-20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle>{isEditing ? "Edit Config" : "New Flash Sale"}</CardTitle>
                            <CardDescription>This config can be linked to a Flash Sale block on the homepage.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Campaign Title</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="FLASH SALE"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ends At</Label>
                                        <div className="relative">
                                            <Input
                                                type="datetime-local"
                                                value={formData.endsAt}
                                                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Limited time offers on our best sellers!"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-bold">Featured Products (Max 4)</Label>
                                        <Badge variant="outline">{formData.productIds.length} / 4 Selected</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
                                        {products.map(product => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => toggleProduct(product.id)}
                                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${formData.productIds.includes(product.id)
                                                    ? "border-red-500 ring-2 ring-red-100 ring-offset-2"
                                                    : "border-slate-100 hover:border-slate-300 opacity-60 hover:opacity-100"
                                                    }`}
                                            >
                                                <img
                                                    src={product.images?.[0] || "/placeholder.png"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Package className="text-white h-6 w-6" />
                                                </div>
                                                {formData.productIds.includes(product.id) && (
                                                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg">
                                                        <Save className="h-3 w-3" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 inset-x-0 bg-white/90 p-1.5 text-[10px] font-bold truncate">
                                                    {product.name}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.isActive}
                                            onCheckedChange={val => setFormData({ ...formData, isActive: val })}
                                        />
                                        <Label>Live Campaign</Label>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditingId(null);
                                                    setFormData({ title: "Flash Sale", description: "", endsAt: "", isActive: true, productIds: [] });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button disabled={submitting} className="bg-slate-900 hover:bg-slate-800 min-w-[120px]">
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            {isEditing ? "Update" : "Create"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List Section */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Active Configurations
                    </h3>
                    <div className="space-y-4">
                        {flashSales.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-muted-foreground">
                                No campaigns found.
                            </div>
                        ) : (
                            flashSales.map(sale => (
                                <Card key={sale.id} className={`group hover:shadow-md transition-all border-l-4 ${sale.isActive ? "border-l-green-500" : "border-l-slate-300"}`}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{sale.title}</h4>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    ID: {sale.id.slice(-6)}
                                                </p>
                                            </div>
                                            <Badge variant={sale.isActive ? "default" : "secondary"} className="scale-75 origin-top-right">
                                                {sale.isActive ? "Active" : "Paused"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                                            <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px]" onClick={() => handleEdit(sale)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(sale.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
