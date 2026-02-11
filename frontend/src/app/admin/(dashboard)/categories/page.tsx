"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                <p className="text-muted-foreground">Manage product categories</p>
            </div>
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Category management coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
