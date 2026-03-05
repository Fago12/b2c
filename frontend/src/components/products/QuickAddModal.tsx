"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, Color, Pattern } from "@/types";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Minus, Plus, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "../common/AddToCartButton";

interface QuickAddModalProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ product, open, onOpenChange }: QuickAddModalProps) {
    const [selections, setSelections] = useState<Record<string, string | Color | Pattern>>({});
    const [quantity, setQuantity] = useState(1);
    const [imageIndex, setImageIndex] = useState(0);
    const addItem = useCart((state) => state.addItem);
    const [isAdding, setIsAdding] = useState(false);

    // 1. Derive available options from variants and FIX duplicate keys
    const options = useMemo(() => {
        if (!product.variants) return {};

        const opts: Record<string, Map<string, any>> = {
            Size: new Map(),
            Color: new Map(),
            Pattern: new Map(),
        };

        product.variants.forEach(v => {
            if (v.size) opts.Size.set(v.size, v.size);
            if (v.color) opts.Color.set(v.color.id, v.color);
            if (v.pattern) opts.Pattern.set(v.pattern.id, v.pattern);
        });

        const finalOpts: Record<string, any[]> = {};
        if (opts.Size.size > 0) finalOpts.Size = Array.from(opts.Size.values());
        if (opts.Color.size > 0) finalOpts.Color = Array.from(opts.Color.values());
        if (opts.Pattern.size > 0) finalOpts.Pattern = Array.from(opts.Pattern.values());

        return finalOpts;
    }, [product.variants]);

    // Initial selections: select first available option for each type
    useEffect(() => {
        if (open) {
            const initial: Record<string, any> = {};
            Object.entries(options).forEach(([name, values]) => {
                if (values.length > 0) {
                    initial[name] = values[0];
                }
            });
            setSelections(initial);
            setQuantity(1);
            setImageIndex(0);
        }
    }, [open, options]);

    // Get active variant based on selections
    const activeVariant = useMemo(() => {
        if (!product.variants) return null;

        return product.variants.find(v => {
            const matchSize = !options.Size || (selections.Size as string) === v.size;
            const matchColor = !options.Color || (selections.Color as Color)?.id === v.colorId;
            const matchPattern = !options.Pattern || (selections.Pattern as Pattern)?.id === v.patternId;
            return matchSize && matchColor && matchPattern;
        });
    }, [product.variants, options, selections]);

    // Images to display in gallery - prioritize variant images
    const galleryImages = useMemo(() => {
        const images: string[] = [];

        // 1. If active variant has images, use ONLY those
        if (activeVariant?.imageUrl) images.push(activeVariant.imageUrl);
        if (activeVariant?.images && activeVariant.images.length > 0) {
            activeVariant.images.forEach(img => {
                if (img.imageUrl !== activeVariant.imageUrl) images.push(img.imageUrl);
            });
        }

        // 2. ONLY if no variant images, or if explicitly requested to merge (not currently), add base product images
        // For now, if variant images exist, we don't append base product images to avoid confusion
        if (images.length === 0 && product.images) {
            product.images.forEach(img => {
                if (!images.includes(img)) images.push(img);
            });
        }

        return images.length > 0 ? images : ["/placeholder.jpg"];
    }, [activeVariant, product.images]);

    // Reset image index when active variant changes
    useEffect(() => {
        setImageIndex(0);
    }, [activeVariant]);

    const handleAddToCart = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!activeVariant) {
            toast.error("Please select all options");
            return;
        }

        if (activeVariant.stock < quantity) {
            toast.error("Not enough stock available");
            return;
        }

        setIsAdding(true);
        try {
            await addItem(product.id, quantity, {}, activeVariant.id);
            const selectionLabel = Object.entries(selections)
                .map(([k, v]) => typeof v === 'string' ? v : (v as any).name)
                .join(", ");

            toast.success("Added to bag", {
                description: `${product.name} x${quantity} (${selectionLabel})`
            });
            onOpenChange(false);
        } catch (error) {
            // Error handled by store/toast
        } finally {
            setIsAdding(false);
        }
    };

    // Price calculation
    const rate = product.regional?.exchangeRateUsed ? parseFloat(product.regional.exchangeRateUsed) : 1;
    const baseUSD_cents = product.salePriceUSD_cents || product.basePriceUSD_cents || 0;
    const variantUSD_cents = (activeVariant && activeVariant.priceUSD_cents && activeVariant.priceUSD_cents > 0)
        ? (activeVariant.salePriceUSD_cents || activeVariant.priceUSD_cents)
        : baseUSD_cents;

    const currentPriceRegional_cents = Math.round(variantUSD_cents * rate);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 rounded-none border-none sm:rounded-none bg-white max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* Left: Image Gallery */}
                    <div className="relative aspect-square md:aspect-auto md:h-full bg-stone-50 overflow-hidden group/gallery">
                        <Image
                            src={galleryImages[imageIndex]}
                            alt={product.name}
                            fill
                            className="object-contain transition-all duration-700 ease-in-out p-4 md:p-8"
                            priority
                        />

                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setImageIndex(prev => prev > 0 ? prev - 1 : galleryImages.length - 1); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black hover:text-white z-10"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setImageIndex(prev => prev < galleryImages.length - 1 ? prev + 1 : 0); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black hover:text-white z-10"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {galleryImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setImageIndex(idx); }}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all duration-300",
                                                idx === imageIndex ? "bg-black w-6" : "bg-black/20 hover:bg-black/40"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeVariant && activeVariant.salePriceUSD_cents && (
                            <div className="absolute top-6 left-6 bg-[#480100] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 z-10 shadow-lg">
                                Member Offer
                            </div>
                        )}
                    </div>

                    {/* Right: Options & Checkout */}
                    <div className="flex flex-col h-[600px] md:h-full bg-white max-h-[90vh]">
                        <div className="p-8 md:p-10 border-b border-stone-50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
                                    {typeof product.category === 'object' ? (product.category as any).name : product.category}
                                </p>
                                <DialogTitle className="text-2xl md:text-3xl font-bold uppercase tracking-tighter leading-none font-sans">
                                    {product.name}
                                </DialogTitle>
                            </div>
                            <div className="flex items-center gap-5 mt-4">
                                <span className="text-2xl font-bold text-[#480100] tracking-tight">
                                    {formatPrice(currentPriceRegional_cents, product.regional?.currency || 'USD')}
                                </span>
                                {variantUSD_cents < (product.basePriceUSD_cents || 0) && (
                                    <span className="text-lg text-muted-foreground line-through opacity-30 font-light">
                                        {formatPrice(Math.round((product.basePriceUSD_cents || 0) * rate), product.regional?.currency || 'USD')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                            <div className="space-y-10">
                                <VariantSelector
                                    options={options}
                                    selections={selections}
                                    onSelect={(name: string, val: string | Color | Pattern) => setSelections(prev => ({ ...prev, [name]: val }))}
                                />

                                {/* Quantity Selector */}
                                <div className="space-y-4 pt-4 border-t border-black/5">
                                    <label className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Quantity</label>
                                    <div className="flex items-center w-36 h-12 border border-stone-200">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                                            className="w-12 h-full flex items-center justify-center hover:bg-stone-50 transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <div className="flex-1 text-center text-sm font-bold font-mono">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setQuantity(Math.min(activeVariant?.stock || 99, quantity + 1)); }}
                                            className="w-12 h-full flex items-center justify-center hover:bg-stone-50 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 border-t border-stone-100 bg-stone-50/30 space-y-6">
                            <AddToCartButton
                                onClick={handleAddToCart}
                                disabled={!activeVariant || activeVariant.stock <= 0}
                                isAdding={isAdding}
                                label={activeVariant && activeVariant.stock > 0 ? "Add to Bag" : "Currently Unavailable"}
                                className="w-full h-16"
                            />

                            <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-[0.2em]">
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="flex items-center text-muted-foreground hover:text-black transition-all group/link"
                                    onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2 transition-transform group-hover/link:translate-x-1" />
                                    Full Product Details
                                </Link>
                                {activeVariant && (
                                    <span className={cn(
                                        "px-3 py-1 flex items-center gap-2",
                                        activeVariant.stock < 5 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", activeVariant.stock < 5 ? "bg-red-600" : "bg-emerald-600")} />
                                        {activeVariant.stock < 5 ? `Only ${activeVariant.stock} Left` : "In Stock"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
