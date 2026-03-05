"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice as utilsFormatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CartSheetProps {
    isScrolled?: boolean;
}

export function CartSheet({ isScrolled = false }: CartSheetProps) {
    const { items, removeItem, updateQuantity, total, subtotal, shippingCost, currency, fetchCart, getTotalItems, isOpen, setOpen } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCart();
    }, [fetchCart]);

    const itemCount = mounted ? getTotalItems() : 0;

    const formatPrice = (price: number) => {
        return utilsFormatPrice(price, currency || 'USD');
    };

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className={cn(
                    "relative flex items-center justify-center h-11 w-11 transition-all duration-300 hover:scale-110 group",
                    isScrolled ? "text-black hover:text-black" : "text-white hover:text-white"
                )}>
                    <div className="relative">
                        <ShoppingBag className="h-6 w-6" />
                        <span className="absolute -top-2 -right-2 text-[9px] font-black bg-primary text-primary-foreground h-4 w-4 rounded-full flex items-center justify-center border-2 border-background pointer-events-none">{itemCount}</span>
                    </div>
                </button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="font-vogue uppercase tracking-[0.2em] text-sm">Your Bag ({itemCount})</SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Your bag is currently empty</p>
                        <Button asChild variant="outline" className="rounded-none uppercase tracking-widest text-[10px] font-bold h-10 px-8" onClick={() => setOpen(false)}>
                            <Link href="/shop">Explore Collection</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-6 py-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-100 italic transition-transform duration-500 group-hover:scale-[1.02]">
                                            <Image
                                                src={item.images[0] || '/placeholder.png'}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-[11px] font-bold uppercase tracking-widest line-clamp-2 leading-tight pr-4 text-balance">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeItem(item.productId, item.variantId)}
                                                        className="text-slate-300 hover:text-destructive transition-colors shrink-0"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>



                                                <div className="flex items-center gap-2">
                                                    {item.unitBasePriceFinal && item.unitBasePriceFinal > item.unitPriceFinal && (
                                                        <span className="text-[9px] text-muted-foreground line-through opacity-50 font-sans">
                                                            {formatPrice(item.unitBasePriceFinal)}
                                                        </span>
                                                    )}
                                                    <p className="text-[10px] text-[#480100] uppercase tracking-widest font-sans font-bold italic">
                                                        {formatPrice(item.unitPriceFinal)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-slate-200">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                                                        className="h-7 w-7 flex items-center justify-center hover:bg-slate-50 transition-colors border-r border-slate-200"
                                                    >
                                                        <Minus className="h-2.5 w-2.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-[11px] font-bold font-sans">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                                        className="h-7 w-7 flex items-center justify-center hover:bg-slate-50 transition-colors border-l border-slate-200"
                                                    >
                                                        <Plus className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] font-bold uppercase tracking-widest font-sans">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div className="space-y-2 px-1 font-sans">
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-40">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-40">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? "Complimentary" : formatPrice(shippingCost)}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-4 text-sm uppercase tracking-[0.2em] font-bold border-t border-slate-100 border-dashed">
                                <span>Total Estimate</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 pb-6">
                                <Button asChild className="w-full rounded-none py-7 bg-[#480100] hover:bg-[#480100]/90 text-white uppercase tracking-[0.3em] font-bold text-[10px] shadow-lg shadow-[#480100]/10 transition-all active:scale-[0.98]" disabled={items.length === 0}>
                                    <Link href="/checkout">Secure Checkout</Link>
                                </Button>
                                <Button variant="ghost" className="uppercase tracking-widest text-[9px] font-bold opacity-50 hover:opacity-100 h-8" onClick={() => setOpen(false)}>
                                    Continue Browsing
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
