"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, RefreshCw, Package, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Product {
    id: string;
    name: string;
    stock: number;
    images: string[];
    category: { name: string };
}

interface Stats {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "inStock" | "lowStock" | "outOfStock">("all");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [newStock, setNewStock] = useState(0);
    const [saving, setSaving] = useState(false);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, statsData] = await Promise.all([
                fetchApi("/products/admin/list?limit=100"),
                fetchApi("/products/admin/stats"),
            ]);
            setProducts(productsData.products);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const openStockDialog = (product: Product) => {
        setSelectedProduct(product);
        setNewStock(product.stock);
        setDialogOpen(true);
    };

    const handleUpdateStock = async () => {
        if (!selectedProduct) return;
        setSaving(true);
        try {
            await fetchApi(`/products/admin/${selectedProduct.id}/stock`, {
                method: "PATCH",
                body: JSON.stringify({ stock: newStock }),
            });
            setDialogOpen(false);
            fetchInventory();
        } catch (error) {
            console.error("Failed to update stock:", error);
        } finally {
            setSaving(false);
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: XCircle };
        if (stock <= 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
        return { label: "In Stock", color: "bg-green-100 text-green-800", icon: CheckCircle };
    };

    const filteredProducts = products.filter((product) => {
        // Search filter
        if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        // Status filter
        if (filter === "inStock" && product.stock <= 10) return false;
        if (filter === "lowStock" && (product.stock === 0 || product.stock > 10)) return false;
        if (filter === "outOfStock" && product.stock !== 0) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
                    <p className="text-muted-foreground">Track and manage stock levels</p>
                </div>
                <Button onClick={fetchInventory} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                    className={`cursor-pointer transition-colors ${filter === "all" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-colors ${filter === "inStock" ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => setFilter("inStock")}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> In Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-colors ${filter === "lowStock" ? "ring-2 ring-yellow-500" : ""}`}
                    onClick={() => setFilter("lowStock")}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Low Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-colors ${filter === "outOfStock" ? "ring-2 ring-red-500" : ""}`}
                    onClick={() => setFilter("outOfStock")}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Out of Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Current Stock</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                            Loading inventory...
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const status = getStockStatus(product.stock);
                                        const StatusIcon = status.icon;
                                        return (
                                            <tr key={product.id} className="border-b hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center">
                                                            {product.images[0] ? (
                                                                <img src={product.images[0]} alt={product.name} className="h-10 w-10 object-cover rounded" />
                                                            ) : (
                                                                <Package className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground">{product.category?.name || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-lg font-semibold">{product.stock}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button variant="outline" size="sm" onClick={() => openStockDialog(product)}>
                                                        Adjust Stock
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Stock Adjustment Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            Update stock for {selectedProduct?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-medium">New Stock Quantity</label>
                        <Input
                            type="number"
                            value={newStock}
                            onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                            className="mt-1"
                            min={0}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                            Current: {selectedProduct?.stock} → New: {newStock}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStock} disabled={saving}>
                            {saving ? "Updating..." : "Update Stock"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
