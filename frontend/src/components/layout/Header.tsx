"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, User, ChevronDown, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "./NavLink";
import { CartSheet } from "@/components/common/CartSheet";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { AnimatedLogo } from "../layout/AnimatedLogo";
import { HeaderIconButton } from "../common/HeaderIconButton";
import { RegionSelector } from "./RegionSelector";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Category } from "@/types";

interface HeaderProps {
    isScrolled?: boolean;
    categories?: Category[];
}

export function Header({ isScrolled = false, categories = [] }: HeaderProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const pathname = usePathname();
    const isHome = pathname === "/";
    const shouldShowScrolledStyle = !isHome || isScrolled;

    return (
        <header className={cn(
            "w-full transition-all duration-700 ease-out",
            !shouldShowScrolledStyle
                ? "bg-transparent border-none text-white"
                : "border-b bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-md text-black"
        )}>
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo - SVG Animated Style - Left Aligned */}
                <Link href="/" className="group flex items-center scale-90 origin-left">
                    <AnimatedLogo className="h-10 w-auto" isScrolled={shouldShowScrolledStyle} />
                </Link>

                {/* Desktop Nav - Centered */}
                <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
                    <NavLink href="/shop" label="Shop All" isScrolled={shouldShowScrolledStyle} />
                    <NavLink href="/our-story" label="Our Story" isScrolled={shouldShowScrolledStyle} />
                    <NavLink href="/our-craft" label="Our Craft" isScrolled={shouldShowScrolledStyle} />
                    <NavLink href="/gallery" label="Gallery" isScrolled={shouldShowScrolledStyle} />
                    <NavLink
                        href="#"
                        label="More"
                        isScrolled={shouldShowScrolledStyle}
                        items={[
                            { label: "Shipping & Returns", href: "/shipping-returns" },
                            { label: "FAQ", href: "/faq" },
                            { label: "Contact", href: "/contact" }
                        ]}
                    />
                </nav>

                {/* Actions on the Right */}
                <div className="flex items-center gap-1 md:gap-2">
                    {/* Desktop-only Search Icon */}
                    <div className="hidden lg:block">
                        <HeaderIconButton isScrolled={shouldShowScrolledStyle}>
                            <Search className="h-4 w-4" />
                        </HeaderIconButton>
                    </div>

                    {/* Account - Desktop only in header */}
                    <div className="hidden lg:block">
                        {isAuthenticated ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <HeaderIconButton isScrolled={shouldShowScrolledStyle}>
                                        <User className="h-4 w-4" />
                                    </HeaderIconButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-none">
                                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest opacity-50">{user?.email}</div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="rounded-none uppercase text-[10px] tracking-widest font-bold">
                                        <Link href="/account" className="flex items-center gap-2">
                                            Account
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout} className="rounded-none uppercase text-[10px] tracking-widest font-bold text-destructive">
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <HeaderIconButton isScrolled={shouldShowScrolledStyle}>
                                    <User className="h-4 w-4" />
                                </HeaderIconButton>
                            </Link>
                        )}
                    </div>

                    {/* Region Selector - Desktop only in header */}
                    <div className="hidden lg:block">
                        <RegionSelector isScrolled={shouldShowScrolledStyle} />
                    </div>

                    <CartSheet isScrolled={shouldShowScrolledStyle} />

                    {/* Mobile Menu Trigger */}
                    <div className="lg:hidden ml-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={!shouldShowScrolledStyle ? "text-white" : "text-black"}>
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Navigation Menu</SheetTitle>
                                </SheetHeader>
                                <div className="mt-8 flex items-center justify-between border-b pb-4">
                                    <RegionSelector isScrolled={true} />
                                    <div className="flex items-center gap-2">
                                        <Search className="h-5 w-5 opacity-50" />
                                        {isAuthenticated ? (
                                            <Link href="/account">
                                                <User className="h-5 w-5 opacity-50" />
                                            </Link>
                                        ) : (
                                            <Link href="/login">
                                                <User className="h-5 w-5 opacity-50" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <nav className="flex flex-col gap-6 mt-8 overflow-y-auto">
                                    <Link href="/" className="text-2xl font-vogue font-bold uppercase tracking-tighter">Home</Link>
                                    <Link href="/shop" className="text-2xl font-vogue font-bold uppercase tracking-tighter">Shop All</Link>
                                    <Link href="/our-story" className="text-2xl font-vogue font-bold uppercase tracking-tighter">Our Story</Link>
                                    <Link href="/our-craft" className="text-2xl font-vogue font-bold uppercase tracking-tighter">Our Craft</Link>
                                    <Link href="/gallery" className="text-2xl font-vogue font-bold uppercase tracking-tighter">Gallery</Link>
                                    <div className="h-[1px] bg-slate-100 my-2" />
                                    <Link href="/shipping-returns" className="text-lg font-vogue font-bold uppercase tracking-tighter opacity-70">Shipping & Returns</Link>
                                    <Link href="/faq" className="text-lg font-vogue font-bold uppercase tracking-tighter opacity-70">FAQ</Link>
                                    <Link href="/contact" className="text-lg font-vogue font-bold uppercase tracking-tighter opacity-70">Contact</Link>
                                </nav>
                                {isAuthenticated && (
                                    <button
                                        onClick={logout}
                                        className="mt-auto mb-8 text-left text-destructive font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                )}
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
