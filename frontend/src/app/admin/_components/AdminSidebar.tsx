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
    Truck,
    Globe,
    FileText,
    Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
            {
                title: "Newsletter",
                href: "/admin/newsletter",
                icon: Users,
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
                title: "Shipping",
                href: "/admin/shipping",
                icon: Truck,
            },
            {
                title: "Currency",
                href: "/admin/currency",
                icon: Globe,
            },
            {
                title: "Settings",
                href: "/admin/settings",
                icon: Settings,
            },
        ],
    },
    {
        title: "Content",
        items: [
            {
                title: "CMS Pages",
                href: "/admin/cms",
                icon: FileText,
            },
            {
                title: "Gallery",
                href: "/admin/gallery",
                icon: Image,
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

import { WKLogo } from "@/components/layout/WKLogo";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

interface AdminSidebarProps {
    isCollapsed?: boolean;
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AdminSidebar({ isCollapsed = false }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "hidden border-r bg-muted/40 md:flex flex-col h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Fixed Logo Section - Synchronized Height with AdminHeader (h-14 / lg:h-[60px]) */}
            <div className="flex h-14 items-center justify-center border-b px-4 shrink-0 overflow-hidden bg-background/50 backdrop-blur-sm sticky top-0 z-20 transition-all duration-300 lg:h-[60px]">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    {isCollapsed ? (
                        <WKLogo className="h-8 w-auto" />
                    ) : (
                        <div className="scale-75 origin-center">
                            <AnimatedLogo isScrolled={true} className="h-10 w-auto" />
                        </div>
                    )}
                </Link>
            </div>

            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <TooltipProvider delayDuration={0}>
                    <nav className="grid items-start px-3 py-4 text-sm font-medium gap-1">
                        {sidebarItems.map((group, index) => (
                            <div key={index} className="py-2 first:pt-0">
                                {!isCollapsed && (
                                    <h3 className="mb-2 px-3 text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-70">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="grid gap-1">
                                    {group.items.map((item, itemIndex) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;

                                        const LinkContent = (
                                            <Link
                                                key={itemIndex}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-none px-3 py-2.5 transition-all duration-200 group relative font-sans",
                                                    isActive
                                                        ? "bg-[#480100] text-white"
                                                        : "text-muted-foreground hover:bg-muted hover:text-primary",
                                                    isCollapsed && "justify-center px-0"
                                                )}
                                            >
                                                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-[#F7DFB9]" : "")} />
                                                {!isCollapsed && (
                                                    <span className="truncate tracking-widest uppercase text-[11px] font-bold">{item.title}</span>
                                                )}
                                                {isActive && !isCollapsed && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F7DFB9]" />
                                                )}
                                            </Link>
                                        );

                                        if (isCollapsed) {
                                            return (
                                                <Tooltip key={itemIndex}>
                                                    <TooltipTrigger asChild>
                                                        {LinkContent}
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" sideOffset={10}>
                                                        {item.title}
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        }

                                        return LinkContent;
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </TooltipProvider>
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
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>
                        Access all admin dashboard sections.
                    </SheetDescription>
                </SheetHeader>
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
