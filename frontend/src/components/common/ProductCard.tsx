"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { PriceDisplay } from "./PriceDisplay";
import { formatPrice } from "@/lib/utils";
import { QuickVariantSelect } from "./QuickVariantSelect";
import { useState } from "react";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCart((state) => state.addItem);
    const [showQuickSelect, setShowQuickSelect] = useState(false);

    const hasVariants = (product as any).hasVariants || (product.variants && product.variants.length > 0);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation if clicking button inside Link wrapper

        if (hasVariants) {
            setShowQuickSelect(true);
        } else {
            addItem(product.id, 1);
        }
    };

    return (
        <Card className="overflow-hidden group/card border-0 shadow-none bg-transparent rounded-none flex flex-col h-full transition-all relative">
            <Link href={`/products/${product.slug}`} className="cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 rounded-none">
                    <Image
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors duration-500" />

                    {(() => {
                        const totalStock = hasVariants
                            ? (product as any).variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
                            : product.stock || 0;

                        if (totalStock <= 0) {
                            return (
                                <Badge variant="destructive" className="absolute top-4 right-4 rounded-none bg-black text-white border-none uppercase text-[10px] tracking-widest px-2 py-0.5 z-10">
                                    Sold Out
                                </Badge>
                            );
                        }
                        return null;
                    })()}

                    {/* Functional Add to Cart (+) Button */}
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-4 right-4 z-30 bg-white text-black p-2 rounded-none shadow-md transition-all duration-300 transform scale-0 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 group/plus overflow-hidden"
                        title={hasVariants ? "Select options" : "Add to cart"}
                        style={{
                            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}
                    >
                        {hasVariants ? (
                            <div className="flex items-center gap-1.5 px-0.5">
                                <Plus className="h-4 w-4 transition-transform duration-500 group-hover/plus:rotate-90" />
                                <span className="text-[9px] font-bold uppercase tracking-tighter">View Options</span>
                            </div>
                        ) : (
                            <Plus className="h-5 w-5 transition-transform duration-500 group-hover/plus:rotate-90" />
                        )}
                    </button>

                    {/* Quick Variant Selection Overlay */}
                    {hasVariants && (
                        <QuickVariantSelect
                            product={product}
                            isVisible={showQuickSelect}
                            onClose={() => setShowQuickSelect(false)}
                        />
                    )}
                </div>
            </Link>
            <CardHeader className="p-4 pt-4 block text-center space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] font-sans">
                    {typeof product.category === 'object' ? product.category.name : product.category || 'Category'}
                </p>
                <Link href={`/products/${product.slug}`} className="block">
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] line-clamp-1 group-hover:text-primary transition-colors font-sans">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 justify-center">
                            {product.regional ? (
                                <>
                                    <span className="text-[11px] font-bold text-primary tracking-widest font-sans">
                                        {formatPrice(product.regional.finalPrice, product.regional.currency || 'USD')}
                                    </span>
                                    {product.regional.finalPrice < product.regional.basePrice && (
                                        <span className="text-[9px] text-muted-foreground line-through opacity-50 font-sans">
                                            {formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <PriceDisplay
                                    amount={product.salePriceUSD || product.basePriceUSD || 0}
                                    className="text-[11px] font-bold text-primary tracking-widest font-sans"
                                />
                            )}
                        </div>
                    </div>
                </Link>
            </CardHeader>
        </Card>
    );
}
