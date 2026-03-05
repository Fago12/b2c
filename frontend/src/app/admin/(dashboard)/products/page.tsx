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
import { fetchApi, fetchAdminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ProductForm, ProductFormValues } from "../../_components/ProductForm";
import { toast } from "sonner";

// Fallback if toast not available or use console
const safeToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can add real toast here later
};

interface Product {
    [key: string]: any;
    id: string;
    name: string;
    description: string;
    basePriceUSD_cents: number;
    salePriceUSD_cents?: number;
    // Map these for ProductForm compatibility
    basePrice: number;
    salePrice?: number;
    stock: number;
    images: string[];
    categoryId: string;
    category: { id: string; name: string };
    tags: string[];
    hasVariants: boolean;
    variants?: any[];
    _count?: { orderItems: number };
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
    const [saving, setSaving] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);

            const data = await fetchAdminApi(`/products/admin/list?${params}`);
            const mappedProducts = (data.products || []).map((p: any) => ({
                ...p,
                basePrice: p.basePriceUSD_cents ? p.basePriceUSD_cents / 100 : 0,
                salePrice: p.salePriceUSD_cents ? p.salePriceUSD_cents / 100 : undefined
            }));
            setProducts(mappedProducts);
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
            const data = await fetchAdminApi("/categories");
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
        setSaving(true);
        console.log("Saving product data:", data);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("basePrice", String(data.basePrice || 0));
            formData.append("stock", String(data.stock || 0));
            formData.append("categoryId", data.categoryId);
            formData.append("slug", data.slug || "");
            formData.append("weightKG", String(data.weightKG || 0));

            if (data.tags) formData.append("tags", JSON.stringify(data.tags));
            if (data.attributes) formData.append("attributes", JSON.stringify(data.attributes));
            if (data.customizationOptions) formData.append("customizationOptions", JSON.stringify(data.customizationOptions));

            // Structured Product Images logic
            const productImages: any[] = [];
            const filesToUpload: File[] = [];

            // Map to track file indices
            const fileMap = new Map<File, number>();

            data.images?.forEach((img: any, index: number) => {
                if (typeof img === "string") {
                    productImages.push({ imageUrl: img, sortOrder: index });
                } else if (img instanceof File) {
                    fileMap.set(img, filesToUpload.length);
                    filesToUpload.push(img);
                    formData.append("images", img);
                    productImages.push({ imageUrl: `__FILE_INDEX_${fileMap.get(img)}__`, sortOrder: index });
                }
            });

            formData.append("productImages", JSON.stringify(productImages));

            // Map Variants
            if (data.variants) {
                const mappedVariants = data.variants.map((v: any) => {
                    const variantImages: { imageUrl: string; sortOrder: number }[] = [...(v.variantImages || [])];
                    let imageUrl = v.imageUrl; // Initialize imageUrl for potential use later

                    if (v.variantFiles && v.variantFiles.length > 0) {
                        v.variantFiles.forEach((file: File) => {
                            if (!fileMap.has(file)) {
                                fileMap.set(file, filesToUpload.length);
                                filesToUpload.push(file);
                                formData.append("images", file);
                            }
                            variantImages.push({
                                imageUrl: `__FILE_INDEX_${fileMap.get(file)}__`,
                                sortOrder: variantImages.length
                            });
                        });
                    }

                    // Fallback to base product image if no variant-specific images are set
                    if (variantImages.length === 0) {
                        if (v.imageIndex !== undefined && data.images[v.imageIndex]) {
                            const img = data.images[v.imageIndex];
                            let fallbackUrl = "";
                            if (typeof img === 'string') {
                                fallbackUrl = img;
                            } else if (img instanceof File) {
                                if (!fileMap.has(img)) {
                                    fileMap.set(img, filesToUpload.length);
                                    filesToUpload.push(img);
                                    formData.append("images", img);
                                }
                                fallbackUrl = `__FILE_INDEX_${fileMap.get(img)}__`;
                            }
                            if (fallbackUrl) {
                                variantImages.push({ imageUrl: fallbackUrl, sortOrder: 0 });
                                imageUrl = fallbackUrl;
                            }
                        }
                    } else {
                        imageUrl = variantImages[0].imageUrl;
                    }

                    let pattern = v.pattern;
                    const possibleFile = pattern?.patternFile || pattern?.previewImageUrl;

                    if (pattern && possibleFile instanceof File) {
                        const file = possibleFile;
                        if (!fileMap.has(file)) {
                            fileMap.set(file, filesToUpload.length);
                            filesToUpload.push(file);
                            formData.append("images", file);
                        }
                        pattern = {
                            ...pattern,
                            previewImageUrl: `__FILE_INDEX_${fileMap.get(file)}__`
                        };
                        delete (pattern as any).patternFile;
                    }

                    const { imageIndex, variantFile, variantFiles, variantImages: _vi, ...rest } = v;
                    return { ...rest, imageUrl, pattern, images: variantImages };
                });
                formData.append("variants", JSON.stringify(mappedVariants));
            }

            if (data.salePrice) {
                formData.append("salePrice", String(data.salePrice));
            } else {
                formData.append("salePrice", "null");
            }

            if (editingProduct) {
                await fetchAdminApi(`/products/admin/${editingProduct.id}`, {
                    method: "PATCH",
                    body: formData,
                });
                toast.success("Product updated successfully");
            } else {
                await fetchAdminApi("/products/admin/create", {
                    method: "POST",
                    body: formData,
                });
                toast.success("Product created successfully");
            }
            setDialogOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product:", error);
            toast.error("Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingProduct) return;
        try {
            await fetchAdminApi(`/products/admin/${deletingProduct.id}`, {
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
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-vogue">Products</h1>
                    <p className="text-muted-foreground font-sans">Manage your product catalog</p>
                </div>
                <div className="flex gap-2 font-sans">
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
            <Card className="font-sans">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 font-sans"
                            />
                        </div>
                        <Select value={categoryFilter || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
                            <SelectTrigger className="w-[180px] font-sans">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="font-sans">
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
            <Card className="font-sans">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b font-sans">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Product</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Category</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Price</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="font-sans">
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-sans">
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-sans">
                                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const hasVariants = product.hasVariants || (product.variants && (product.variants as any[]).length > 0);
                                        const totalStock = hasVariants
                                            ? (product.variants as any[]).reduce((sum, v) => sum + (parseInt(v.stock?.toString() || '0')), 0)
                                            : product.stock;
                                        const status = getStockStatus(totalStock);
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
                                                            <p className="font-bold text-sm">{product.name}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider line-clamp-1">{product.description.slice(0, 50)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{product.category?.name || "—"}</td>
                                                <td className="px-4 py-3 text-sm font-bold">{formatPrice(product.basePriceUSD_cents || 0)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {hasVariants ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[#480100]">{totalStock} Total</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Variant Managed</span>
                                                        </div>
                                                    ) : (
                                                        <span>{totalStock}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-none text-[9px] uppercase font-bold tracking-widest ${status.color}`}>
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
                <DialogContent className="max-w-6xl">
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
                        loading={saving}
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
