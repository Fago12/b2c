"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface QuickVariantSelectProps {
    product: Product;
    onClose: () => void;
    isVisible: boolean;
}

export function QuickVariantSelect({ product, onClose, isVisible }: QuickVariantSelectProps) {
    const [selections, setSelections] = useState<Record<string, string>>({});
    const addItem = useCart((state) => state.addItem);
    const [isAdding, setIsAdding] = useState(false);

    // Get active variant
    const activeVariant = useMemo(() => {
        if (!product.variants || !product.options) return null;
        const optionKeys = Object.keys(product.options);
        if (Object.keys(selections).length !== optionKeys.length) return null;

        return (product.variants as any[]).find(v => {
            // Robust matching: Normalize keys to avoid casing mismatches
            return optionKeys.every(key => {
                const variantValue = v.options[key] || v.options[key.toLowerCase()] || v.options[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()];
                return variantValue === selections[key];
            });
        });
    }, [product.variants, product.options, selections]);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!activeVariant) {
            toast.error("Please select all options");
            return;
        }

        if (activeVariant.stock <= 0) {
            toast.error("Out of stock");
            return;
        }

        setIsAdding(true);
        try {
            await addItem(product.id, 1, {}, activeVariant.id || activeVariant.sku);
            toast.success("Added to bag", {
                description: `${product.name} (${Object.values(selections).join(", ")})`
            });
            onClose();
        } catch (error) {
            // Error handled by store toast
        } finally {
            setIsAdding(false);
        }
    };

    // Calculate price for selected variant
    const rate = product.regional?.exchangeRateUsed ? parseFloat(product.regional.exchangeRateUsed) : 1;

    // 1. Get the base USD price (Sale-aware)
    const baseUSD = product.salePriceUSD || product.basePriceUSD || 0;

    // 2. Determine variant USD price (override or inherit)
    const variantUSD = (activeVariant && activeVariant.priceUSD > 0) ? activeVariant.priceUSD : baseUSD;

    // 3. Convert to regional
    const currentPrice = Math.round(variantUSD * rate);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "absolute inset-0 z-40 bg-white/95 backdrop-blur-sm transition-all duration-300 flex flex-col p-4",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#480100]">Select Options</h4>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="h-4 w-4 text-slate-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                {product.options && Object.entries(product.options as Record<string, string[]>).map(([name, values]) => (
                    <div key={name} className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{name}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {values.map(val => {
                                const isSelected = selections[name] === val;
                                return (
                                    <button
                                        key={val}
                                        onClick={() => setSelections(prev => ({ ...prev, [name]: val }))}
                                        className={cn(
                                            "px-2.5 py-1 text-[10px] border transition-all rounded-none",
                                            isSelected
                                                ? "border-[#480100] bg-[#480100] text-white"
                                                : "border-slate-200 hover:border-slate-400 text-slate-600"
                                        )}
                                    >
                                        {val}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {activeVariant && (
                    <div className="pt-2 animate-in fade-in slide-in-from-bottom-1">
                        <p className="text-[9px] font-bold text-[#480100] uppercase tracking-tighter">
                            {activeVariant.stock > 0 ? `${activeVariant.stock} available` : "Out of stock"}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <Button
                    onClick={handleAddToCart}
                    disabled={!activeVariant || activeVariant.stock <= 0 || isAdding}
                    className="w-full h-10 bg-[#480100] hover:bg-[#300100] text-white rounded-none uppercase text-[10px] tracking-widest font-bold flex gap-2"
                >
                    {isAdding ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <ShoppingCart className="h-3 w-3" />
                            Add — {formatPrice(currentPrice, product.regional?.currency || 'USD')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
