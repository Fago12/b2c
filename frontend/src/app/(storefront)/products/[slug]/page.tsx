"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
    Heart,
    Share2,
    MessageCircle,
    ShieldCheck,
    Truck,
    RefreshCcw,
    Minus,
    Plus,
    CheckCircle2,
    Info,
    Palette,
    TextCursorInput,
    ShoppingCart
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
import { VariantSelector } from "@/components/products/VariantSelector";
import { Color, Pattern } from "@/types";
import { AddToCartButton } from "@/components/common/AddToCartButton";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selections, setSelections] = useState<Record<string, any>>({});

    // Customization State
    const [customization, setCustomization] = useState<Record<string, string>>({
        embroideryName: "",
        customColorRequest: "",
        specificInstructions: "",
        contactEmail: "",
        contactPhone: "",
    });

    const addItem = useCart((state) => state.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await fetchApi(`/products/slug/${slug}`);
                setProduct(data);

                // Derive initial selections from variants
                if (data.variants && data.variants.length > 0) {
                    const firstInStock = data.variants.find((v: any) => v.stock > 0) || data.variants[0];
                    if (firstInStock) {
                        const initial: Record<string, any> = {};
                        if (firstInStock.size) initial.Size = firstInStock.size;
                        if (firstInStock.color) initial.Color = firstInStock.color;
                        if (firstInStock.pattern) initial.Pattern = firstInStock.pattern;
                        setSelections(initial);
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

    // 1. Derive available options from variants and FIX duplicate keys
    const options = useMemo(() => {
        if (!product?.variants) return {};

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
    }, [product?.variants]);

    // 2. Identify active variant
    const activeVariant = useMemo(() => {
        if (!product?.variants) return null;
        return product.variants.find(v => {
            const matchSize = !options.Size || selections.Size === v.size;
            const matchColor = !options.Color || selections.Color?.id === v.colorId;
            const matchPattern = !options.Pattern || selections.Pattern?.id === v.patternId;
            return matchSize && matchColor && matchPattern;
        });
    }, [product?.variants, options, selections]);

    // 3. Build Gallery (Product Images + Variant Images)
    const gallery = useMemo(() => {
        if (!product) return [];

        // Base images
        const pImgs = (product.productImages || [])
            .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((i: any) => i.imageUrl);

        const legacyImgs = product.images || [];
        const baseImgs = pImgs.length > 0 ? pImgs : legacyImgs;

        // Variant specific images
        let variantImgs: string[] = [];
        if (activeVariant) {
            const vImgs = (activeVariant.images || [])
                .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((i: any) => i.imageUrl);

            variantImgs = vImgs.length > 0 ? vImgs : (activeVariant.imageUrl ? [activeVariant.imageUrl] : []);
        }

        if (variantImgs.length > 0) {
            return variantImgs;
        }

        return baseImgs.length > 0 ? baseImgs : ['/placeholder.png'];
    }, [product, activeVariant]);

    // Reset selected image when gallery changes
    useEffect(() => {
        setSelectedImage(0);
    }, [gallery]);

    if (loading) return <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 border-4 border-[#480100]/20 border-t-[#480100] rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Loading Collection...</p>
    </div>;

    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    const handleAddToCart = async () => {
        if (product.hasVariants && !activeVariant) {
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

        await addItem(product.id, quantity, customization, activeVariant?.id);
        // Note: addItem now triggers setOpen(true) internally on success
    };

    // Pricing Logic
    const rate = product.regional?.exchangeRateUsed ? parseFloat(product.regional.exchangeRateUsed) : 1;

    // Base USD in cents
    const basePriceUSD_cents = product.basePriceUSD_cents || 0;
    const salePriceUSD_cents = product.salePriceUSD_cents || null;

    // Active USD in cents
    let activeUSD_cents = salePriceUSD_cents || basePriceUSD_cents;
    if (activeVariant) {
        if (activeVariant.priceUSD_cents && activeVariant.priceUSD_cents > 0) {
            activeUSD_cents = activeVariant.salePriceUSD_cents || activeVariant.priceUSD_cents;
        }
    }

    const currentPriceRegional_cents = Math.round(activeUSD_cents * rate);
    const totalPrice_cents = currentPriceRegional_cents * quantity;

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">

                    {/* Left: Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden group">
                            <Image
                                src={gallery[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                            />
                            {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                <Badge className="absolute top-6 left-6 bg-red-600 text-white border-none rounded-none px-4 py-1 uppercase tracking-widest text-[10px] font-vogue">Sale</Badge>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={cn(
                                            "relative aspect-square bg-slate-50 overflow-hidden border transition-all",
                                            selectedImage === idx ? "border-[#480100] opacity-100" : "border-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="space-y-4 mb-10">
                            <div className="flex items-center justify-between font-sans">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                    {typeof product.category === 'object' ? product.category.name : product.category}
                                </p>
                                <div className="flex gap-4">
                                    <button className="text-muted-foreground hover:text-black transition-colors"><Share2 className="h-4 w-4" /></button>
                                    <button className="text-muted-foreground hover:text-red-500 transition-colors"><Heart className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-vogue font-bold text-primary leading-tight uppercase tracking-wider">{product.name}</h1>

                            <div className="flex items-center gap-4 font-sans">
                                <span className="text-2xl font-bold text-[#480100] tracking-tighter">
                                    {formatPrice(currentPriceRegional_cents, product.regional?.currency || 'USD')}
                                </span>
                                {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                    <span className="text-lg text-muted-foreground line-through opacity-50 italic">
                                        {formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed max-w-xl font-sans">{product.description}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-8 py-8">
                            <VariantSelector
                                options={options}
                                selections={selections}
                                onSelect={(name, val) => setSelections(prev => ({ ...prev, [name]: val }))}
                            />

                            {activeVariant && (
                                <div className="flex items-center gap-4 py-4 border-t border-b border-slate-50">
                                    <Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-widest font-bold px-3 py-1">
                                        {activeVariant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </Badge>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                                        Ref: {activeVariant.sku}
                                    </span>
                                </div>
                            )}

                            {/* Customization Inputs */}
                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                {product.customizationOptions?.embroidery?.enabled && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#480100]">Embroidery Name</h3>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                                                +{formatPrice(Math.round((product.customizationOptions.embroidery.price || 0) * rate), product.regional?.currency || 'USD')}
                                            </span>
                                        </div>
                                        <Input
                                            placeholder="Enter name to embroider"
                                            className="rounded-none border-slate-200 focus:border-[#480100] transition-colors font-sans text-xs h-12"
                                            value={customization.embroideryName}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, embroideryName: e.target.value }))}
                                        />
                                        <p className="text-[9px] text-muted-foreground italic">Optional: Leave blank if not required.</p>
                                    </div>
                                )}

                                {product.customizationOptions?.customColor?.enabled && (
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#480100]">Custom Color Request</h3>
                                        <Textarea
                                            placeholder="Describe the color or provide a hex code"
                                            className="rounded-none border-slate-200 focus:border-[#480100] transition-colors font-sans text-xs min-h-[80px] resize-none"
                                            value={customization.customColorRequest}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, customColorRequest: e.target.value }))}
                                        />
                                        <p className="text-[9px] text-muted-foreground italic">Request a specific color for this item.</p>
                                    </div>
                                )}

                                {(product.customizationOptions?.embroidery?.enabled || product.customizationOptions?.customColor?.enabled) && (
                                    <>
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#480100]">Specific Instructions</h3>
                                            <Textarea
                                                placeholder="Provide any additional details or requirements for your customization"
                                                className="rounded-none border-slate-200 focus:border-[#480100] transition-colors font-sans text-xs min-h-[100px] resize-none"
                                                value={customization.specificInstructions}
                                                onChange={(e) => setCustomization(prev => ({ ...prev, specificInstructions: e.target.value }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                            <div className="space-y-2">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Follow-up Email</h3>
                                                <Input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    className="rounded-none border-slate-200 focus:border-[#480100] transition-colors font-sans text-xs h-10"
                                                    value={customization.contactEmail}
                                                    onChange={(e) => setCustomization(prev => ({ ...prev, contactEmail: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Follow-up Phone</h3>
                                                <Input
                                                    type="tel"
                                                    placeholder="+1 (555) 000-0000"
                                                    className="rounded-none border-slate-200 focus:border-[#480100] transition-colors font-sans text-xs h-10"
                                                    value={customization.contactPhone}
                                                    onChange={(e) => setCustomization(prev => ({ ...prev, contactPhone: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="mt-auto space-y-6">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <div className="flex items-center border border-slate-200 h-14 bg-white">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-14 h-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="flex-1 sm:w-10 text-center font-bold font-sans text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-14 h-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <AddToCartButton
                                    onClick={handleAddToCart}
                                    disabled={product.hasVariants && (!activeVariant || activeVariant.stock <= 0)}
                                    priceLabel={formatPrice(totalPrice_cents, product.regional?.currency || 'USD')}
                                    label="Add"
                                    className="flex-1 h-14"
                                />
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-100 font-sans">
                                <div className="flex flex-col items-center text-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#480100]/5 transition-colors">
                                        <Truck className="h-5 w-5 text-muted-foreground group-hover:text-[#480100] transition-colors" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Worldwide Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#480100]/5 transition-colors">
                                        <ShieldCheck className="h-5 w-5 text-muted-foreground group-hover:text-[#480100] transition-colors" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Ethical Luxury</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#480100]/5 transition-colors">
                                        <RefreshCcw className="h-5 w-5 text-muted-foreground group-hover:text-[#480100] transition-colors" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Secure Checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
