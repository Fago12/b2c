"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
    Heart,
    Share2,
    MessageCircle,
    ShoppingCart,
    ShieldCheck,
    Truck,
    RefreshCcw,
    Minus,
    Plus,
    CheckCircle2,
    Info,
    Palette,
    TextCursorInput
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/lib/api";
import { useCart } from "@/lib/store/cart";
import { Product } from "@/types";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selections, setSelections] = useState<Record<string, string>>({});

    // Customization state
    const [customization, setCustomization] = useState<{
        embroidery?: string;
        customColor?: string;
        note?: string;
    }>({});

    const addItem = useCart((state) => state.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await fetchApi(`/products/slug/${slug}`);
                setProduct(data);

                // Auto-select first in-stock variant if hasVariants is true
                if ((data as any).hasVariants && data.variants && data.variants.length > 0) {
                    const firstInStock = (data.variants as any[]).find(v => v.stock > 0);
                    if (firstInStock) {
                        setSelections(firstInStock.options);
                    } else if (data.variants[0]) {
                        // Fallback to first variant if none are in stock
                        setSelections(data.variants[0].options);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                toast.error("Product not found");
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProduct();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    const activeVariant = product.variants ? (product.variants as any[]).find(v => {
        const optionKeys = Object.keys(product.options || {});
        if (optionKeys.length === 0) return false;

        // Robust matching: Normalize keys to avoid casing mismatches
        return optionKeys.every(key => {
            const variantValue = v.options[key] || v.options[key.toLowerCase()] || v.options[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()];
            return variantValue === selections[key];
        });
    }) : null;

    const handleAddToCart = () => {
        const hasOptions = product.options && Object.keys(product.options).length > 0;

        if (hasOptions && !activeVariant) {
            toast.error("Please select all options");
            return;
        }

        if (activeVariant && activeVariant.stock <= 0) {
            toast.error("This combination is currently out of stock");
            return;
        }

        const maxStock = activeVariant ? activeVariant.stock : product.stock;
        if (quantity > maxStock) {
            toast.error(`Only ${maxStock} items available`);
            return;
        }

        // PRE-FLIGHT: If product hasVariants is true, activeVariant MUST be found
        if ((product as any).hasVariants && !activeVariant) {
            toast.error("Please select a specific variant");
            return;
        }

        // Identify the correct variant ID (fallback to SKU if ID is missing in JSON)
        const vid = activeVariant?.id || activeVariant?.sku;

        console.log(`[PDP] Adding to cart: Product=${product.id}, Variant=${vid}, Qty=${quantity}`);
        addItem(product.id, quantity, customization, vid);

        toast.success("Added to cart", {
            description: `${product.name} has been added to your bag.`
        });
    };

    // PRIORITY CHAIN (Mirroring Backend):
    // 1. Variant Sale Price > 2. Variant Price > 3. Product Sale Price > 4. Product Base Price

    const rate = product.regional?.exchangeRateUsed ? parseFloat(product.regional.exchangeRateUsed) : 1;
    let priceToConvert = product.salePriceUSD ?? product.basePriceUSD;

    if (activeVariant) {
        if (activeVariant.salePriceUSD != null && activeVariant.salePriceUSD > 0) {
            priceToConvert = activeVariant.salePriceUSD;
        } else if (activeVariant.priceUSD != null && activeVariant.priceUSD > 0) {
            priceToConvert = activeVariant.priceUSD;
        }
    }

    const currentPrice = Math.round(priceToConvert * rate);

    const embroideryPriceUSD = product.customizationOptions?.embroidery?.enabled ? (product.customizationOptions.embroidery.price || 0) : 0;
    const embroideryPrice = Math.round(embroideryPriceUSD * rate);

    // Total price in regional currency if available
    const totalPrice = (currentPrice + (customization.embroidery ? embroideryPrice : 0)) * quantity;
    const currencySymbol = product.regional?.symbol || "$";

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">

                    {/* Left: Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden group">
                            <Image
                                src={product.images[selectedImage] || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                            />
                            {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                <Badge className="absolute top-6 left-6 bg-red-600 text-white border-none rounded-none px-4 py-1 uppercase tracking-widest text-[10px] font-vogue">Sale</Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={cn(
                                        "relative aspect-square bg-slate-50 overflow-hidden border-2 transition-all",
                                        selectedImage === idx ? "border-[#480100]" : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between font-sans">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                    {typeof product.category === 'string' ? product.category : (product.category as any)?.name}
                                </p>
                                <div className="flex gap-4">
                                    <button className="text-muted-foreground hover:text-black transition-colors"><Share2 className="h-4 w-4" /></button>
                                    <button className="text-muted-foreground hover:text-red-500 transition-colors"><Heart className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-vogue font-bold text-primary leading-tight uppercase tracking-wider">{product.name}</h1>
                            <div className="flex items-center gap-4 font-sans">
                                <span className="text-2xl font-bold text-[#480100] tracking-tighter">{formatPrice(currentPrice, product.regional?.currency || 'USD')}</span>
                                {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                    <span className="text-lg text-muted-foreground line-through opacity-50 italic">{formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}</span>
                                )}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed max-w-xl font-sans">{product.description}</p>
                        </div>

                        {/* Variant Selectors */}
                        {product.options && Object.keys(product.options).length > 0 && (
                            <div className="space-y-6 mb-8">
                                {Object.entries(product.options as Record<string, string[]>).map(([optionName, values]) => (
                                    <div key={optionName} className="space-y-3">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{optionName}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => setSelections(prev => ({ ...prev, [optionName]: val }))}
                                                    className={cn(
                                                        "px-4 py-2 text-xs border transition-all",
                                                        selections[optionName] === val
                                                            ? "border-[#480100] bg-[#480100] text-white"
                                                            : "border-slate-200 hover:border-slate-400"
                                                    )}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {activeVariant && (
                                    <div className="text-[10px] font-bold text-[#480100] uppercase tracking-tighter">
                                        SKU: {activeVariant.sku} • {activeVariant.stock > 0 ? `${activeVariant.stock} in stock` : "Out of Stock"}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customization Section */}
                        {(product.customizationOptions?.embroidery?.enabled ||
                            product.customizationOptions?.customColor?.enabled ||
                            product.customizationOptions?.customerNote?.enabled) && (
                                <div className="space-y-6 mb-8 p-6 bg-[#480100]/5 border border-[#480100]/10 rounded-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Palette className="h-4 w-4 text-[#480100]" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#480100] font-vogue">Bespoke Customization</h3>
                                    </div>

                                    {product.customizationOptions?.embroidery?.enabled && (
                                        <div className="space-y-2 font-sans">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase flex items-center gap-1">
                                                    <TextCursorInput className="h-3 w-3" /> Embroidery <span className="text-muted-foreground font-normal">
                                                        (+{embroideryPrice > 0 ? formatPrice(embroideryPrice, product.regional?.currency || 'USD') : 'FREE'})
                                                    </span>
                                                </label>
                                            </div>
                                            <Input
                                                placeholder="Enter text to embroider (e.g. Your Initials)"
                                                value={customization.embroidery || ''}
                                                onChange={e => setCustomization({ ...customization, embroidery: e.target.value })}
                                                className="bg-white border-[#480100]/10 focus:border-[#480100] font-sans"
                                            />
                                        </div>
                                    )}

                                    {product.customizationOptions?.customColor?.enabled && (
                                        <div className="space-y-2 font-sans">
                                            <label className="text-[10px] font-bold uppercase">Request Custom Color</label>
                                            <Input
                                                placeholder="Describe your preferred color"
                                                value={customization.customColor || ''}
                                                onChange={e => setCustomization({ ...customization, customColor: e.target.value })}
                                                className="bg-white border-[#480100]/10 focus:border-[#480100] font-sans"
                                            />
                                        </div>
                                    )}

                                    {product.customizationOptions?.customerNote?.enabled && (
                                        <div className="space-y-2 font-sans">
                                            <label className="text-[10px] font-bold uppercase">Special Instructions / Gift Note</label>
                                            <Textarea
                                                placeholder="Any special handling or a note for the recipient?"
                                                value={customization.note || ''}
                                                onChange={e => setCustomization({ ...customization, note: e.target.value })}
                                                className="bg-white border-[#480100]/10 focus:border-[#480100] resize-none h-20 font-sans"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* Add to Cart Actions */}
                        <div className="mt-auto space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center border border-[#480100]/20 h-12 font-sans">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center font-bold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 h-12 bg-[#480100] hover:bg-[#300100] text-[#F7DFB9] rounded-none uppercase tracking-widest font-bold flex gap-3 font-sans"
                                >
                                    <ShoppingCart className="h-4 w-4" /> Add to Bag — {formatPrice(totalPrice, product.regional?.currency || 'USD')}
                                </Button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-2 pt-8 border-t border-slate-100 font-sans">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Truck className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Fast Regional Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Authentic Craftsmanship</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Secure Payments</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
