"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface HeaderIconButtonProps extends ButtonProps {
    children: React.ReactNode;
    isScrolled?: boolean;
}

export const HeaderIconButton = React.forwardRef<HTMLButtonElement, HeaderIconButtonProps>(
    ({ className, children, isScrolled = false, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                size="icon"
                {...props}
                className={cn(
                    "rounded-none h-11 w-11 flex items-center justify-center transition-all duration-300 shadow-none border-0",
                    "bg-transparent hover:bg-transparent hover:scale-110",
                    isScrolled ? "text-black hover:text-black" : "text-white hover:text-white",
                    className
                )}
            >
                {/* Clone the child to ensure it inherits the current color */}
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            className: cn("h-6 w-6", (child.props as any).className),
                        });
                    }
                    return child;
                })}
            </Button>
        );
    }
);

HeaderIconButton.displayName = "HeaderIconButton";
