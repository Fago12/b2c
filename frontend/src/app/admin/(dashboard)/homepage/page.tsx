"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, LayoutTemplate, CreditCard, ShoppingBag, Tag, ArrowRight, Star, Flame } from "lucide-react";
import Link from "next/link";

const sections = [
    {
        title: "Announcements",
        description: "Manage top banner notifications.",
        icon: Megaphone,
        href: "/admin/homepage/announcements",
        color: "text-blue-500"
    },
    {
        title: "Hero Section",
        description: "Update the main hero banner image and text.",
        icon: LayoutTemplate,
        href: "/admin/homepage/hero",
        color: "text-purple-500"
    },
    {
        title: "Trust Strip",
        description: "Edit the marquee items (Free Shipping, etc.).",
        icon: CreditCard,
        href: "/admin/homepage/marquee",
        color: "text-green-500"
    },
    {
        title: "Featured Collections",
        description: "Select which collections appear on the home page.",
        icon: ShoppingBag,
        href: "/admin/homepage/featured",
        color: "text-orange-500"
    },
    {
        title: "Promo Banners",
        description: "Manage marketing banners for Men/Women.",
        icon: Tag,
        href: "/admin/homepage/promos",
        color: "text-pink-500"
    },
    {
        title: "Most Popular",
        description: "Configure trending product displays.",
        icon: Star,
        href: "/admin/homepage/layout", // These are layout-level configurations
        color: "text-yellow-500"
    },
    {
        title: "Flash Sales",
        description: "Set up countdown timers and sale sections.",
        icon: Flame,
        href: "/admin/homepage/layout", // These are layout-level configurations
        color: "text-red-500"
    }
];

export default function HomepageDashboard() {
    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Homepage Management</h1>
                    <p className="text-muted-foreground">Control both the layout and the individual content blocks of your store.</p>
                </div>
            </div>

            {/* Layout Master Control */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400">
                            Master Control
                        </div>
                        <h2 className="text-3xl font-black">Page Layout & Ordering</h2>
                        <p className="text-slate-400 max-w-md">
                            Decide exactly where each section goes. Toggle visibility, reorder blocks, and add new dynamic components like Flash Sales.
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-14 text-lg font-bold shadow-lg transition-all group-hover:scale-105">
                        <Link href="/admin/homepage/layout">
                            Open Layout Manager <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold">Section Content</h3>
                    <p className="text-sm text-muted-foreground">Manage the images, text, and products inside each section.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                        <Card key={section.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {section.title}
                                </CardTitle>
                                <section.icon className={`h-4 w-4 ${section.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-2"></div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {section.description}
                                </p>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href={section.href}>
                                        Manage <ArrowRight className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
