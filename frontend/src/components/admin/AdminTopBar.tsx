"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export function AdminTopBar() {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Logo placeholder for mobile / Search */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders, products, customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[300px] pl-9 bg-slate-50"
                    />
                </div>
            </div>

            {/* Right: Notifications + User Menu */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                3
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="p-3 font-medium border-b">Notifications</div>
                        <div className="py-2">
                            <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                                <p className="text-sm font-medium">Low Stock Alert</p>
                                <p className="text-xs text-muted-foreground">Ankara Print Dress is running low (5 left)</p>
                            </div>
                            <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                                <p className="text-sm font-medium">New Order</p>
                                <p className="text-xs text-muted-foreground">Order #10234 received - ₦45,000</p>
                            </div>
                            <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                                <p className="text-sm font-medium">Payment Failed</p>
                                <p className="text-xs text-muted-foreground">Order #10232 payment failed</p>
                            </div>
                        </div>
                        <div className="p-2 border-t">
                            <Button variant="ghost" className="w-full text-sm">View all notifications</Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium hidden md:inline">{user?.email || "Admin"}</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-medium">{user?.email}</div>
                        <div className="px-2 py-1 text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center gap-2">
                                View Store
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive">
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
