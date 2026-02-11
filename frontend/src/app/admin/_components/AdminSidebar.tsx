"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    MessageSquare,
    Settings,
    Shield,
    Tag,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const sidebarItems = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/admin",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Commerce",
        items: [
            {
                title: "Products",
                href: "/admin/products",
                icon: Package,
            },
            {
                title: "Categories",
                href: "/admin/categories",
                icon: Tag,
            },
            {
                title: "Orders",
                href: "/admin/orders",
                icon: ShoppingBag,
            },
            {
                title: "Customers",
                href: "/admin/customers",
                icon: Users,
            },
            {
                title: "Reviews",
                href: "/admin/reviews",
                icon: MessageSquare,
            },
        ],
    },
    {
        title: "Operations",
        items: [
            {
                title: "Coupons",
                href: "/admin/coupons",
                icon: Tag,
            },
            {
                title: "Settings",
                href: "/admin/settings",
                icon: Settings,
            },
        ],
    },
    {
        title: "System",
        items: [
            {
                title: "Team",
                href: "/admin/settings/team",
                icon: Shield,
            },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 md:block w-64 overflow-y-auto">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <Shield className="h-6 w-6" />
                        <span className="">Acme Admin</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {sidebarItems.map((group, index) => (
                            <div key={index} className="py-2">
                                <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                                    {group.title}
                                </h3>
                                <div className="grid gap-1">
                                    {group.items.map((item, itemIndex) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={itemIndex}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                                    pathname === item.href
                                                        ? "bg-muted text-primary"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

export function MobileAdminSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 text-lg font-semibold"
                        onClick={() => setOpen(false)}
                    >
                        <Shield className="h-6 w-6" />
                        <span className="sr-only">Acme Admin</span>
                    </Link>
                    {sidebarItems.map((group, index) => (
                        <div key={index} className="py-2">
                            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                                {group.title}
                            </h3>
                            <div className="grid gap-1">
                                {group.items.map((item, itemIndex) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={itemIndex}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                                                pathname === item.href
                                                    ? "bg-muted text-foreground"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
