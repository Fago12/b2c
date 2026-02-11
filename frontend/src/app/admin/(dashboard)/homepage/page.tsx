"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, LayoutTemplate, CreditCard, ShoppingBag, Tag, ArrowRight } from "lucide-react";
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
    }
];

export default function HomepageDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Homepage Content</h1>
                <p className="text-muted-foreground">Manage the content blocks of your homepage without code.</p>
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
    );
}
