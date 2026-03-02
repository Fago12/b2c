"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface BrandButtonProps extends ButtonProps {
    children: React.ReactNode;
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                {...props}
                className={cn(
                    "rounded-none font-bold px-5 py-3 text-base shadow-lg border-none active:scale-95 transition-all duration-500 ease-out uppercase tracking-wider",
                    "bg-[linear-gradient(to_right,#480100_50%,#F7DFB9_50%)] bg-[length:200%_100%] bg-[position:100%_0] hover:bg-[position:0_0]",
                    "text-[#480100] hover:text-[#F7DFB9]",
                    className
                )}
            >
                {children}
            </Button>
        );
    }
);

BrandButton.displayName = "BrandButton";
