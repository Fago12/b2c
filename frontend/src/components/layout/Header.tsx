"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, User, ChevronDown, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Category } from "@/types";
import { CartSheet } from "@/components/common/CartSheet";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
    categories: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
    const { user, isAuthenticated, logout } = useAuth();

    const navLinks = [
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <nav className="flex flex-col gap-4 mt-8">
                                <Link href="/" className="text-lg font-bold">Home</Link>
                                {categories.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-muted-foreground">Categories</span>
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/shop?category=${cat.slug}`}
                                                className="pl-4 text-lg hover:text-primary transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <div className="border-t my-2" />
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">Woven Kulture</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>

                    <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">
                        Shop
                    </Link>

                    {categories.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-auto p-0 text-sm font-medium hover:bg-transparent hover:text-primary data-[state=open]:text-primary flex gap-1 items-center">
                                    Categories <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {categories.map((cat) => (
                                    <DropdownMenuItem key={cat.id} asChild>
                                        <Link href={`/shop?category=${cat.slug}`}>{cat.name}</Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                        Contact
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center relative mr-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-[200px] pl-8 h-9 rounded-md bg-muted/50 focus:bg-background transition-colors"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="sm:hidden">
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Account - Conditional based on auth state */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <div className="px-2 py-1.5 text-sm font-medium">{user?.email}</div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/account" className="flex items-center gap-2">
                                        <User className="h-4 w-4" /> Account
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/account/orders" className="flex items-center gap-2">
                                        <Package className="h-4 w-4" /> Orders
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                                    <LogOut className="h-4 w-4" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}

                    <div className="ml-2">
                        <CartSheet />
                    </div>
                </div>
            </div>
        </header>
    );
}

