"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CouponForm } from "../../_components/CouponForm";
import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag, RefreshCw, Trash2, Edit } from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    value: number;
    usedCount: number;
    minOrderAmount?: number | null;
    expiresAt?: string | null;
    isActive: boolean;
    maxUses?: number | null;
}

interface CouponStats {
    total: number;
    active: number;
    expired: number;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [stats, setStats] = useState<CouponStats>({ total: 0, active: 0, expired: 0 });
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listData, statsData] = await Promise.all([
                fetchApi("/coupons/admin/list"),
                fetchApi("/coupons/admin/stats"),
            ]);
            setCoupons(listData.coupons || listData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await fetchApi(`/coupons/admin/${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to delete coupon:", error);
        }
    };

    const handleEdit = (coupon: Coupon) => {
        // Format date for input type="date"
        const formattedCoupon = {
            ...coupon,
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : undefined
        };
        setEditingCoupon(formattedCoupon as any);
        setIsCreateOpen(true);
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditingCoupon(null);
        fetchData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage discount codes and promotions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => { setEditingCoupon(null); setIsCreateOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Coupon
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Tag className="h-4 w-4" /> Total Coupons
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-green-600">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-red-600">Expired/Inactive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading coupons...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No coupons found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {coupon.discountType === "PERCENTAGE" ? `${coupon.value}%` : `₦${coupon.value.toLocaleString()}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : "used"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                                    onClick={() => handleEdit(coupon)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                    onClick={() => handleDelete(coupon.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Sheet open={isCreateOpen} onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) setEditingCoupon(null);
            }}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</SheetTitle>
                        <SheetDescription>
                            {editingCoupon ? "Update coupon details below." : "Add a new discount code for your customers."}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        {/* Cast to any to avoid strict type mismatch between API response (nulls) and Form (undefined) */}
                        <CouponForm initialData={editingCoupon as any} onSuccess={handleSuccess} />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
