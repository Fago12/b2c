"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Percent,
    ArrowRight,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DashboardStats {
    revenue: { total: number; today: number; change: number };
    orders: { total: number; today: number; change: number };
    customers: { total: number; change: number };
}

interface ChartData {
    date: string;
    amount: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, chartDataResponse] = await Promise.all([
                    fetchApi("/analytics/dashboard"),
                    fetchApi("/analytics/charts?days=7"),
                ]);
                setStats(statsData);
                setChartData(chartDataResponse);
            } catch (error) {
                console.error("Failed to load analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    const cards = [
        {
            title: "Total Revenue",
            value: `₦${(stats?.revenue.total || 0).toLocaleString()}`,
            change: stats?.revenue.change || 0,
            icon: DollarSign,
        },
        {
            title: "Total Orders",
            value: stats?.orders.total.toString() || "0",
            change: stats?.orders.change || 0,
            icon: ShoppingCart,
        },
        {
            title: "Total Customers",
            value: stats?.customers.total.toString() || "0",
            change: stats?.customers.change || 0,
            icon: Users,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here&apos;s existing analytics for your store.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((kpi) => {
                    const Icon = kpi.icon;
                    const isPositive = kpi.change >= 0;
                    return (
                        <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {kpi.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                        {isPositive ? "+" : ""}{kpi.change}% from yesterday
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Revenue over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return `${date.getDate()}/${date.getMonth() + 1}`;
                                    }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => `₦${value.toLocaleString()}`}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Orders Placeholder - keeping it simple for now or fetching later */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                            Real-time feed coming soon...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
