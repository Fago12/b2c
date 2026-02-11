"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Order {
    id: string;
    email: string;
    status: string;
    total: number;
    createdAt: string;
    shippingAddress: any;
    user?: { email: string } | null;
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: { name: string; images: string[] };
    }>;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const ORDER_STATUSES = [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
] as const;

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        PAID: "bg-green-100 text-green-800",
        PROCESSING: "bg-blue-100 text-blue-800",
        SHIPPED: "bg-indigo-100 text-indigo-800",
        DELIVERED: "bg-emerald-100 text-emerald-800",
        CANCELLED: "bg-red-100 text-red-800",
        REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", pagination.page.toString());
            params.append("limit", "10");
            if (statusFilter) params.append("status", statusFilter);
            if (search) params.append("search", search);

            const data = await fetchApi(`/orders/admin/list?${params}`);
            setOrders(data.orders);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, statusFilter, search]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdating(true);
        try {
            await fetchApi(`/orders/admin/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdating(false);
        }
    };

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                    <p className="text-muted-foreground">Manage and track all orders</p>
                </div>
                <Button onClick={fetchOrders} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order ID or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {ORDER_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                                            <td className="px-4 py-3">{order.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">₦{order.total.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)}>
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Order Details</SheetTitle>
                                <SheetDescription>Order ID: {selectedOrder.id}</SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Status */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <Select
                                        value={selectedOrder.status}
                                        onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                                        disabled={updating}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ORDER_STATUSES.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer</h3>
                                    <p>{selectedOrder.email}</p>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                                    <div className="bg-slate-50 p-3 rounded-lg text-sm">
                                        {selectedOrder.shippingAddress ? (
                                            <>
                                                <p>{selectedOrder.shippingAddress.name}</p>
                                                <p>{selectedOrder.shippingAddress.address}</p>
                                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                                                <p>{selectedOrder.shippingAddress.phone}</p>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">No address provided</p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Items</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="font-medium">Total</span>
                                    <span className="text-xl font-bold">₦{selectedOrder.total.toLocaleString()}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4">
                                    {selectedOrder.status === "PAID" && (
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, "SHIPPED")}
                                            disabled={updating}
                                            className="flex-1"
                                        >
                                            Mark as Shipped
                                        </Button>
                                    )}
                                    {selectedOrder.status === "SHIPPED" && (
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, "DELIVERED")}
                                            disabled={updating}
                                            className="flex-1"
                                        >
                                            Mark as Delivered
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
