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
    const { items, removeItem, updateQuantity, total, subtotal, shippingCost, currency, fetchCart, getTotalItems } = useCart();
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
        <Sheet>
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
                    <SheetTitle className="font-vogue uppercase tracking-widest">Your Cart ({itemCount})</SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold">Your cart is empty</p>
                        <Button asChild variant="outline" className="rounded-none uppercase tracking-widest text-xs font-bold">
                            <SheetTrigger asChild>
                                <Link href="/shop">Start Shopping</Link>
                            </SheetTrigger>
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-8 py-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-muted">
                                            <Image
                                                src={item.images[0] || '/placeholder.png'}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest line-clamp-2 leading-tight pr-4">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeItem(item.productId, item.variantId)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">{formatPrice(item.unitPriceFinal)}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center border border-muted-foreground/20">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                                                        className="p-1 hover:bg-muted transition-colors"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold font-sans">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                                        className="p-1 hover:bg-muted transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-widest font-sans">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="space-y-4 pt-6">
                            <Separator />
                            <div className="space-y-1.5 px-1 font-sans">
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-60">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-60">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                                </div>
                            </div>
                            <Separator className="opacity-50" />
                            <div className="flex items-center justify-between py-2 text-sm uppercase tracking-[0.2em] font-bold">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <Button asChild className="w-full rounded-none py-6 uppercase tracking-[0.3em] font-bold text-xs" disabled={items.length === 0}>
                                <Link href="/checkout">Proceed to Checkout</Link>
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
