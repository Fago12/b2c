"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, Package } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ProductForm, ProductFormValues } from "../../_components/ProductForm";

// Fallback if toast not available or use console
const safeToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can add real toast here later
};

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
    category: { id: string; name: string };
    tags: string[];
    createdAt: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);

            const data = await fetchApi(`/products/admin/list?${params}`);
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            safeToast("Failed to fetch products", "error");
        } finally {
            setLoading(false);
        }
    }, [search, categoryFilter]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await fetchApi("/categories");
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const openCreateDialog = () => {
        setEditingProduct(null);
        setDialogOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("price", String(data.price));
            formData.append("stock", String(data.stock));
            formData.append("categoryId", data.categoryId);

            // Separate existing URLs from new File objects
            const existingImages: string[] = [];
            data.images?.forEach((img: any) => {
                if (typeof img === "string") {
                    existingImages.push(img);
                } else if (img instanceof File) {
                    formData.append("images", img);
                }
            });

            if (existingImages.length > 0) {
                formData.append("existingImages", JSON.stringify(existingImages));
            }

            if (editingProduct) {
                await fetchApi(`/products/admin/${editingProduct.id}`, {
                    method: "PATCH",
                    body: formData,
                });
                safeToast("Product updated successfully");
            } else {
                await fetchApi("/products/admin/create", {
                    method: "POST",
                    body: formData,
                });
                safeToast("Product created successfully");
            }
            setDialogOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product:", error);
            safeToast("Failed to save product", "error");
        }
    };

    const handleDelete = async () => {
        if (!deletingProduct) return;
        try {
            await fetchApi(`/products/admin/${deletingProduct.id}`, {
                method: "DELETE",
            });
            safeToast("Product deleted successfully");
            setDeleteDialogOpen(false);
            setDeletingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            safeToast("Failed to delete product", "error");
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
        if (stock <= 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
        return { label: "In Stock", color: "bg-green-100 text-green-800" };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                    <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchProducts} variant="outline" size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={categoryFilter || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const status = getStockStatus(product.stock);
                                        return (
                                            <tr key={product.id} className="border-b hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                                                            {product.images[0] ? (
                                                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Package className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description.slice(0, 50)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{product.category?.name || "—"}</td>
                                                <td className="px-4 py-3">₦{product.price.toLocaleString()}</td>
                                                <td className="px-4 py-3">{product.stock}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                            onClick={() => {
                                                                setDeletingProduct(product);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? "Update the product details below." : "Fill in the product details below."}
                        </DialogDescription>
                    </DialogHeader>

                    <ProductForm
                        categories={categories}
                        onSubmit={handleSave}
                        defaultValues={editingProduct || undefined}
                        submitLabel={editingProduct ? "Update Product" : "Create Product"}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
