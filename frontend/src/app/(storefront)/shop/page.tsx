"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/common/ProductCard";
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [currentCurrency, setCurrentCurrency] = useState("USD");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [sortBy, setSortBy] = useState("NEWEST");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsData, categoriesData, regions] = await Promise.all([
                    fetchApi("/products"),
                    fetchApi("/categories"),
                    fetchApi("/regions")
                ]);

                // Determine current region and currency context
                const regionCode = typeof window !== 'undefined'
                    ? document.cookie.split('; ').find(row => row.startsWith('region_code='))?.split('=')[1] || 'US'
                    : 'US';

                const region = regions.find((r: any) => r.code === regionCode) || regions[0];
                const currency = region?.currency || "USD";
                setCurrentCurrency(currency);

                setProducts(productsData);

                // If categories API returns empty, extract them from products
                if (categoriesData.length === 0 && productsData.length > 0) {
                    const extractedCategories: Category[] = [];
                    const seenIds = new Set();

                    productsData.forEach((p: Product) => {
                        // Type guard to ensure we have a full category object
                        if (p.category && typeof p.category === 'object' && p.category.id && p.category.slug) {
                            if (!seenIds.has(p.category.id)) {
                                extractedCategories.push(p.category as Category);
                                seenIds.add(p.category.id);
                            }
                        }
                    });

                    // Sort alphabetically for consistent UI display
                    extractedCategories.sort((a, b) => a.name.localeCompare(b.name));
                    setCategories(extractedCategories);
                } else {
                    setCategories(categoriesData);
                }

                // Set dynamic price range based on actual product data in the current currency
                const prices = productsData.map((p: Product) =>
                    (p.regional?.finalPrice || p.salePriceUSD || p.basePriceUSD || 0) / 100
                );
                const max = Math.ceil(Math.max(...prices, 1000));
                setMaxPrice(max);

                // Read category from URL if present
                const params = new URLSearchParams(window.location.search);
                const catFromUrl = params.get('category');
                if (catFromUrl) {
                    setSelectedCategory(catFromUrl);
                }

                setPriceRange([0, max]);
                setError(null);

            } catch (err) {
                console.error("Shop Fetch Error:", err);
                setError("We couldn't load the collection right now. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Sync URL when category changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (selectedCategory === "ALL") {
            params.delete('category');
        } else {
            params.set('category', selectedCategory);
        }
        const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState(null, '', newRelativePathQuery);
    }, [selectedCategory]);

    // Calculate category counts
    const categoryCounts = categories.reduce((acc: Record<string, number>, cat) => {
        acc[cat.slug] = products.filter(p => {
            const pCat = typeof p.category === 'string' ? p.category : p.category?.slug;
            return pCat === cat.slug;
        }).length;
        return acc;
    }, {});

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const pCatSlug = typeof product.category === 'string' ? product.category : product.category?.slug;
        const matchesCategory = selectedCategory === "ALL" || pCatSlug === selectedCategory;

        // Filtering should happen in the active regional currency
        const regionalPrice = (product.regional?.finalPrice || product.salePriceUSD || product.basePriceUSD || 0) / 100;
        const matchesPrice = regionalPrice >= priceRange[0] && regionalPrice <= priceRange[1];

        return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === "PRICE_ASC") {
            const priceA = a.regional?.finalPrice || a.salePriceUSD || a.basePriceUSD || 0;
            const priceB = b.regional?.finalPrice || b.salePriceUSD || b.basePriceUSD || 0;
            return priceA - priceB;
        }
        if (sortBy === "PRICE_DESC") {
            const priceA = a.regional?.finalPrice || a.salePriceUSD || a.basePriceUSD || 0;
            const priceB = b.regional?.finalPrice || b.salePriceUSD || b.basePriceUSD || 0;
            return priceB - priceA;
        }
        return 0; // Default (Newest - assuming array is sorted by date from backend)
    });

    return (
        <div className="bg-white min-h-screen pt-24 pb-20">
            {/* Minimalist Hero Section */}
            <div className="container mx-auto px-4 mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-7xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-4"
                >
                    Shop All
                </motion.h1>
                <div className="h-px w-20 bg-[#480100] mx-auto mb-6" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground italic">
                    Timeless craftsmanship for the modern lifestyle.
                </p>
            </div>

            {/* Modern Control Bar */}
            <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-y border-slate-100 py-4 mb-12">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 rounded-none border border-slate-200 hover:bg-slate-50 uppercase text-[10px] font-bold tracking-widest px-6 h-10">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] rounded-none border-r border-[#480100]/10 p-0">
                                <div className="h-full flex flex-col p-8 bg-white">
                                    <SheetHeader className="text-left mb-8 pb-4 border-b">
                                        <SheetTitle className="text-2xl font-vogue font-bold uppercase tracking-widest text-[#480100]">Refine</SheetTitle>
                                        <SheetDescription className="sr-only">
                                            Adjust collection filters and price ranges.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-10 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                        {/* Categories */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#480100]/40">Collection</h4>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setSelectedCategory("ALL")}
                                                    className={cn(
                                                        "text-left text-xs font-bold uppercase tracking-widest py-1 transition-colors",
                                                        selectedCategory === "ALL" ? "text-black" : "text-black/30 hover:text-black/60"
                                                    )}
                                                >
                                                    All Pieces
                                                </button>
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(cat.slug)}
                                                        className={cn(
                                                            "text-left text-xs font-bold uppercase tracking-widest py-1 transition-colors flex justify-between items-center group",
                                                            selectedCategory === cat.slug ? "text-black" : "text-black/30 hover:text-black/60"
                                                        )}
                                                    >
                                                        <span>{cat.name}</span>
                                                        <span className="text-[9px] opacity-40 group-hover:opacity-100 transition-opacity">
                                                            ({categoryCounts[cat.slug] || 0})
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#480100]/40">Price Range ({currentCurrency})</h4>
                                            <div className="px-2">
                                                <Slider
                                                    defaultValue={[0, maxPrice]}
                                                    max={maxPrice}
                                                    step={Math.ceil(maxPrice / 40)}
                                                    value={priceRange}
                                                    onValueChange={(val: any) => setPriceRange(val)}
                                                    className="mb-4"
                                                />
                                                <div className="flex justify-between text-[10px] font-bold tracking-widest opacity-60">
                                                    <span>{currentCurrency === 'USD' ? '$' : currentCurrency + ' '}{priceRange[0]}</span>
                                                    <span>{currentCurrency === 'USD' ? '$' : currentCurrency + ' '}{priceRange[1]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t mt-auto">
                                        <Button
                                            className="w-full rounded-none bg-[#480100] text-white uppercase text-[10px] font-bold tracking-[0.2em] h-12"
                                            onClick={() => {
                                                setSelectedCategory("ALL");
                                                setPriceRange([0, 1000]);
                                                setSearch("");
                                            }}
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="hidden md:flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                <Input
                                    placeholder="SEARCH PIECES..."
                                    className="pl-9 h-10 border-slate-200 rounded-none w-48 lg:w-64 uppercase text-[9px] font-bold tracking-widest placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-[#480100]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="hidden sm:block text-[9px] font-bold uppercase tracking-widest opacity-40">
                            Showing {filteredProducts.length} Results
                        </p>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                        <select
                            className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest cursor-pointer pr-4"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="NEWEST">Newest</option>
                            <option value="PRICE_ASC">Price: Low to High</option>
                            <option value="PRICE_DESC">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-[#480100]" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Curating the collection...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-16 h-px bg-slate-200" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{error || "No pieces found matching your criteria."}</p>
                        <Button
                            variant="link"
                            className="text-[#480100] uppercase text-[10px] font-bold tracking-widest"
                            onClick={() => {
                                if (error) {
                                    window.location.reload();
                                } else {
                                    setSelectedCategory("ALL");
                                    setPriceRange([0, 1000]);
                                    setSearch("");
                                }
                            }}
                        >
                            {error ? "Retry" : "Clear all filters"}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
