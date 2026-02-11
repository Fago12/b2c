"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, DollarSign, ShoppingCart, Package, Users, Star } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface AnalyticsData {
    orders: {
        total: number;
        byStatus: Record<string, number>;
        totalRevenue: number;
    };
    products: {
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
    };
    customers: {
        total: number;
        admins: number;
        customers: number;
        verified: number;
    };
    reviews: {
        total: number;
        averageRating: number;
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersStats, productsStats, customersStats, reviewsStats] = await Promise.all([
                fetchApi("/orders/admin/stats"),
                fetchApi("/products/admin/stats"),
                fetchApi("/users/admin/stats"),
                fetchApi("/reviews/admin/stats").catch(() => ({ total: 0, averageRating: 0 })),
            ]);

            setData({
                orders: ordersStats,
                products: productsStats,
                customers: customersStats,
                reviews: reviewsStats,
            });
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading || !data) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    const orderStatusColors: Record<string, string> = {
        PENDING: "bg-yellow-500",
        PAID: "bg-blue-500",
        PROCESSING: "bg-purple-500",
        SHIPPED: "bg-indigo-500",
        DELIVERED: "bg-green-500",
        CANCELLED: "bg-red-500",
        REFUNDED: "bg-gray-500",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-muted-foreground">Overview of your store performance</p>
                </div>
                <Button onClick={fetchAnalytics} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Revenue Highlight */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="py-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 rounded-full">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-green-100">Total Revenue</p>
                            <p className="text-4xl font-bold">₦{(data.orders.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" /> Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.orders.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" /> Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.products.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.products.inStock} in stock • {data.products.lowStock} low
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" /> Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.customers.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.customers.verified} verified
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Star className="h-4 w-4" /> Avg Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.reviews.averageRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.reviews.total} reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Order Status Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" /> Order Status Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(data.orders.byStatus).map(([status, count]) => {
                            const percentage = data.orders.total > 0 ? (count / data.orders.total) * 100 : 0;
                            return (
                                <div key={status} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{status}</span>
                                        <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${orderStatusColors[status] || "bg-gray-400"} transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" /> Inventory Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{data.products.inStock}</div>
                            <p className="text-sm text-green-700">In Stock</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{data.products.lowStock}</div>
                            <p className="text-sm text-yellow-700">Low Stock</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{data.products.outOfStock}</div>
                            <p className="text-sm text-red-700">Out of Stock</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Umami Integration Note */}
            <Card className="border-dashed border-2">
                <CardContent className="py-6">
                    <div className="text-center">
                        <h3 className="font-medium mb-1">Want Website Analytics?</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Integrate <strong>Umami</strong> for privacy-focused website traffic analytics
                        </p>
                        <a
                            href="https://umami.is"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                        >
                            Learn more at umami.is →
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
