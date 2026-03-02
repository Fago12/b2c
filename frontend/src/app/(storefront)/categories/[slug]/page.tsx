"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
    Clock,
    Bell,
    ArrowRight,
    LayoutGrid,
    Filter,
    ChevronDown,
    Hourglass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/api";
import { ProductCard } from "@/components/common/ProductCard";
import { Category, Product } from "@/types";
import { toast } from "sonner";

export default function CategoryPage() {
    const { slug } = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories to find the current one and its metadata
                const categories: Category[] = await fetchApi('/categories');
                const currentCat = categories.find(c => c.slug === slug);

                if (!currentCat) {
                    setLoading(false);
                    return;
                }

                setCategory(currentCat);

                // Fetch products for this category
                const productData = await fetchApi(`/products?categoryId=${currentCat.id}`);
                setProducts(productData);

            } catch (err) {
                console.error("Error fetching category data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchData();
    }, [slug]);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading category...</div>;
    if (!category) return <div className="min-h-[60vh] flex items-center justify-center">Category not found.</div>;

    // COMING SOON VIEW
    if (category.isComingSoon) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#480100] blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#480100] blur-3xl" />
                </div>

                <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#480100]/5 text-[#480100] rounded-full border border-[#480100]/10 mb-4">
                        <Hourglass className="h-4 w-4 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">A New Collection is Dawning</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-vogue font-bold text-primary uppercase tracking-tighter leading-none mb-4">
                        {category.name}
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed italic">
                        "Elegance is the only beauty that never fades." — We are weaving something extraordinary for you.
                    </p>

                    <div className="bg-white border border-[#480100]/10 p-8 md:p-12 shadow-2xl rounded-sm space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Join the Exclusive List</h3>
                            <p className="text-sm text-muted-foreground">Be the first to know when the {category.name} collection drops and receive an early access invite.</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <Input
                                placeholder="Enter your email address"
                                className="h-14 rounded-none border-slate-200 focus:border-[#480100]"
                            />
                            <Button className="h-14 px-8 bg-[#480100] hover:bg-black rounded-none text-[#F7DFB9] font-bold uppercase tracking-widest flex gap-2">
                                Notify Me <Bell className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Zero Spam. Just Pure Craftsmanship.</p>
                    </div>

                    <div className="pt-12">
                        <Button variant="ghost" className="text-primary hover:text-[#480100] flex gap-2 items-center group" asChild>
                            <a href="/">
                                Explore Current Collections <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // NORMAL CATEGORY VIEW
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Category Header */}
            <div className="relative h-[40vh] md:h-[50vh] bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="relative z-20 text-center space-y-4 px-4">
                    <h1 className="text-4xl md:text-7xl font-vogue font-bold text-white uppercase tracking-[0.2em]">{category.name}</h1>
                    <div className="h-1 w-24 bg-white mx-auto opacity-60" />
                    <p className="text-sm md:text-base text-white/80 font-medium max-w-2xl mx-auto tracking-wide uppercase italic">
                        Discover the essence of Woven Kulture in our {category.name} curation.
                    </p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm px-4 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-60 transition-opacity">
                            <Filter className="h-3 w-3" /> Filter
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-60 transition-opacity">
                            Sort: Featured <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {products.length} Items Found
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-12">
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
                        <p className="text-muted-foreground italic">No pieces currently available in this category.</p>
                        <Button variant="outline" className="rounded-none border-primary text-primary tracking-widest uppercase text-xs" asChild>
                            <a href="/">Back to Shop</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
