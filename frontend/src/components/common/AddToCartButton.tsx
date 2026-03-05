"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isAdding?: boolean;
    priceLabel?: string;
    label?: string;
    className?: string;
}

export function AddToCartButton({
    onClick,
    disabled = false,
    isAdding = false,
    priceLabel,
    label = "Add to Bag",
    className,
}: AddToCartButtonProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled || isAdding}
            className={cn(
                "h-14 md:h-16 bg-[#480100] hover:bg-[#300100] text-white rounded-none uppercase text-[11px] tracking-[0.2em] md:tracking-[0.3em] font-bold transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 font-sans",
                className
            )}
        >
            {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <div className="flex items-center gap-3">
                    <ShoppingCart className="h-4 w-4" />
                    <span>
                        {label}
                        {priceLabel && <span className="ml-2">— {priceLabel}</span>}
                    </span>
                </div>
            )}
        </Button>
    );
}
