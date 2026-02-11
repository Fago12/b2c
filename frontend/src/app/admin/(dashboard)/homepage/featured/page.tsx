"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Edit, Save, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FeaturedPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    // Product Selection State
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCollections = async () => {
        try {
            // Need to fetch collections. Assuming GET /admin/homepage/featured endpoint
            // Wait, I implemented findMany in controller but route is /admin/homepage/featured ?
            // Let's check controller. 
            // Controller has: @Get('featured-collections') ... NO I missed adding it to controller!
            // I only added Announcement, Hero, Marquee.
            // I need to update AdminHomepageController to include Featured and Promos.

            // For now, I'll write the frontend assuming the endpoint exists, 
            // and then I will update the controller immediately after.
            const data = await fetchApi("/admin/homepage/featured-collections");
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            // Need a product search endpoint or list
            // Assuming /products endpoint exists from previous work?
            // Page 1 of products
            const data = await fetchApi("/products?limit=100");
            // data might be { data: [], meta: {} }
            if (data.data) {
                setProducts(data.data);
            } else if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCollections();
        fetchProducts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                title,
                description,
                isActive,
                productIds: selectedProductIds
            };

            if (editingItem) {
                await fetchApi(`/admin/homepage/featured-collections/${editingItem.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body)
                });
            } else {
                await fetchApi("/admin/homepage/featured-collections", {
                    method: "POST",
                    body: JSON.stringify(body)
                });
            }
            setIsDialogOpen(false);
            fetchCollections();
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle("");
        setDescription("");
        setIsActive(true);
        setSelectedProductIds([]);
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setTitle(item.title);
        setDescription(item.description || "");
        setIsActive(item.isActive);
        setSelectedProductIds(item.productIds || []);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this collection?")) return;
        try {
            await fetchApi(`/admin/homepage/featured-collections/${id}`, { method: "DELETE" });
            fetchCollections();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleProduct = (id: string) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(p => p !== id));
        } else {
            setSelectedProductIds(prev => [...prev, id]);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Featured Collections</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Collection</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Collection" : "New Collection"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Select Products ({selectedProductIds.length})</Label>
                                <div className="border rounded-md p-2">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Search className="h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="border-none shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="h-48 overflow-y-auto space-y-1">
                                        {filteredProducts.map(product => (
                                            <div key={product.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
                                                <Switch
                                                    id={`prod-${product.id}`}
                                                    checked={selectedProductIds.includes(product.id)}
                                                    onCheckedChange={() => toggleProduct(product.id)}
                                                />
                                                <Label htmlFor={`prod-${product.id}`} className="cursor-pointer flex-1 truncate">
                                                    {product.name}
                                                </Label>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    ₦{product.price}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                                <Label htmlFor="active">Active</Label>
                            </div>

                            <Button type="submit" className="w-full">Save Collection</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {collections.map(item => (
                    <div key={item.id} className="border rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            <p className="text-xs mt-2 font-medium bg-gray-100 inline-block px-2 py-1 rounded">
                                {item.productIds?.length || 0} Products
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
