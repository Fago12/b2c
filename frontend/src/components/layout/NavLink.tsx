"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLinkProps {
    href: string;
    label: string;
    items?: { label: string; href: string }[];
    isScrolled?: boolean;
}

export function NavLink({ href, label, items, isScrolled = false }: NavLinkProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const textVariants = {
        initial: { y: 0 },
        hover: { y: -32 },
        exit: { y: 0 }
    };

    const secondTextVariants = {
        initial: { y: 32 },
        hover: { y: 0 },
        exit: { y: 32 }
    };

    const content = (
        <div
            className="relative overflow-hidden h-8 flex items-center px-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                variants={textVariants}
                animate={isHovered || isOpen ? "hover" : "initial"}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2"
            >
                <span className="nav-link-text text-sm md:text-[13px] font-black tracking-widest">{label}</span>
                {items && (
                    <motion.div
                        animate={{ rotate: isHovered || isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Plus className="h-3 w-3" />
                    </motion.div>
                )}
            </motion.div>

            <motion.div
                variants={secondTextVariants}
                animate={isHovered || isOpen ? "hover" : "initial"}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center gap-2 px-3"
            >
                <span className="nav-link-text text-sm md:text-[13px] font-black tracking-widest">{label}</span>
                {items && (
                    <motion.div
                        animate={{ rotate: isHovered || isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Plus className="h-3 w-3" />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );

    if (items) {
        return (
            <div
                className="relative"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "outline-none transition-colors duration-300",
                            isScrolled ? "text-black" : "text-white"
                        )}>
                            {content}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="center"
                        sideOffset={12}
                        className="rounded-none border-none bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] min-w-[160px] p-0 overflow-hidden"
                        onMouseEnter={() => setIsOpen(true)}
                        onMouseLeave={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            className="flex flex-col"
                        >
                            {items.map((item, index) => (
                                <DropdownMenuItem
                                    key={item.href}
                                    asChild
                                    className="relative flex flex-col justify-center outline-none cursor-pointer focus:bg-transparent data-[highlighted]:bg-transparent transition-colors duration-300 group/item"
                                >
                                    <Link
                                        href={item.href}
                                        className="w-full h-10 flex items-center px-4"
                                    >
                                        <span className="nav-link-text text-sm md:text-[13px] font-black uppercase tracking-widest text-black/50 group-hover/item:text-black transition-colors duration-300">
                                            {item.label}
                                        </span>
                                        {index !== items.length - 1 && (
                                            <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gray-50 pointer-events-none" />
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </motion.div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <Link
            href={href}
            className={cn(
                "transition-colors duration-300",
                isScrolled ? "text-black" : "text-white"
            )}
        >
            {content}
        </Link>
    );
}
