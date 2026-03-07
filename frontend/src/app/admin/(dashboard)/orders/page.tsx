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
import { Badge } from "@/components/ui/badge";
import { fetchApi, fetchAdminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface Order {
    id: string;
    email: string;
    status: string;
    total: number;
    totalUSD: number;
    createdAt: string;
    shippingAddress: any;
    user?: { email: string } | null;
    isCustomOrder?: boolean;
    customerPhone?: string;
    currency?: string;
    carrier?: string | null;
    trackingNumber?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        variantId?: string;
        customization?: any;
        product: { name: string; images: string[]; variants?: any[] };
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

            const data = await fetchAdminApi(`/orders/admin/list?${params}`);
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

    const handleStatusUpdate = async (orderId: string, newStatus: string, metadata?: any) => {
        setUpdating(true);
        try {
            await fetchAdminApi(`/orders/admin/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: newStatus,
                    ...metadata
                }),
            });
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({
                    ...selectedOrder,
                    status: newStatus,
                    ...metadata
                });
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
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-vogue">Orders</h1>
                    <p className="text-muted-foreground font-sans">Manage and track all orders</p>
                </div>
                <Button onClick={fetchOrders} variant="outline" size="sm" className="font-sans">
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
                            <thead className="bg-slate-50 border-b font-sans">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Total</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Date</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    {order.id.slice(0, 8)}...
                                                    {order.isCustomOrder && (
                                                        <Badge className="bg-[#480100] text-[#F7DFB9] text-[9px] h-4">CUSTOM</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span>{order.email}</span>
                                                    {order.customerPhone && <span className="text-[10px] text-muted-foreground">{order.customerPhone}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-none text-[9px] uppercase font-bold tracking-widest ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{formatPrice(order.totalUSD, 'USD')}</td>
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

                                {/* Shipping Info Display */}
                                {(selectedOrder.carrier || selectedOrder.trackingNumber) && (
                                    <div className="bg-[#480100]/5 p-4 border border-[#480100]/10 rounded-lg">
                                        <h3 className="text-[10px] font-bold uppercase text-[#480100] mb-2">Shipping Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Carrier</p>
                                                <p className="text-sm font-bold">{selectedOrder.carrier}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Tracking #</p>
                                                <p className="text-sm font-mono font-bold">{selectedOrder.trackingNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Email</h3>
                                        <p className="text-sm">{selectedOrder.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Contact Phone</h3>
                                        <p className="text-sm">{selectedOrder.customerPhone || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-1">
                                        {selectedOrder.shippingAddress ? (
                                            <>
                                                <p className="font-bold text-slate-900">{selectedOrder.shippingAddress.name}</p>
                                                <p>{selectedOrder.shippingAddress.line1 || selectedOrder.shippingAddress.address}</p>
                                                {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip || selectedOrder.shippingAddress.postalCode}</p>
                                                <p className="uppercase font-bold text-[10px] tracking-widest text-[#480100] pt-1">{selectedOrder.shippingAddress.country}</p>
                                                {selectedOrder.shippingAddress.phone && (
                                                    <p className="text-[11px] text-muted-foreground pt-2 border-t mt-2">
                                                        <b>Tel:</b> {selectedOrder.shippingAddress.phone}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground italic">No address provided</p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase text-muted-foreground mb-3">Items & Customizations</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="bg-slate-50 border rounded-lg overflow-hidden">
                                                <div className="flex justify-between items-center p-3 border-b bg-white">
                                                    <div>
                                                        <p className="font-bold text-sm font-vogue">{item.product.name}</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <p className="text-[10px] text-muted-foreground font-sans">Qty: {item.quantity}</p>
                                                            {/* Display Variant Options */}
                                                            {(() => {
                                                                const variant = (item.product as any).variants?.find((v: any) => v.id === item.variantId || v.sku === item.variantId);
                                                                if (variant?.options) {
                                                                    return Object.entries(variant.options).map(([key, value]) => (
                                                                        <Badge key={key} variant="outline" className="text-[9px] h-4 uppercase tracking-tighter bg-slate-50">
                                                                            {key}: {value as string}
                                                                        </Badge>
                                                                    ));
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <p className="font-bold font-sans text-sm">{formatPrice((item as any).totalUSD || (item.price * item.quantity), 'USD')}</p>
                                                </div>
                                                {item.customization && (
                                                    <div className="p-3 bg-muted/30 space-y-2">
                                                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Customization Details:</h4>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {item.customization.embroideryName && (
                                                                <div className="text-xs bg-white p-2 rounded shadow-sm border border-[#480100]/10 flex justify-between">
                                                                    <span>Embroidery: <b className="text-[#480100]">{item.customization.embroideryName}</b></span>
                                                                </div>
                                                            )}
                                                            {item.customization.customColorRequest && (
                                                                <div className="text-xs bg-white p-2 rounded shadow-sm border border-[#480100]/10">
                                                                    <span>Custom Color: <b>{item.customization.customColorRequest}</b></span>
                                                                </div>
                                                            )}
                                                            {item.customization.specificInstructions && (
                                                                <div className="text-xs bg-white p-2 rounded shadow-sm border border-[#480100]/10 italic">
                                                                    &ldquo;{item.customization.specificInstructions}&rdquo;
                                                                </div>
                                                            )}
                                                            {(item.customization.contactEmail || item.customization.contactPhone) && (
                                                                <div className="text-[10px] bg-white p-2 rounded shadow-sm border border-[#480100]/5 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                                                                    {item.customization.contactEmail && (
                                                                        <span><b>Custom Email:</b> {item.customization.contactEmail}</span>
                                                                    )}
                                                                    {item.customization.contactPhone && (
                                                                        <span><b>Custom Phone:</b> {item.customization.contactPhone}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="font-bold">Total</span>
                                    <span className="text-xl font-bold text-[#480100]">{formatPrice(selectedOrder.totalUSD, 'USD')}</span>
                                </div>

                                {/* Actions */}
                                <div className="space-y-4 pt-4 border-t">
                                    {selectedOrder.status === "PAID" || selectedOrder.status === "PROCESSING" ? (
                                        <div className="space-y-4 bg-slate-50 p-4 border rounded-lg">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#480100]">Mark as Shipped</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold uppercase text-muted-foreground">Carrier</label>
                                                    <Input
                                                        placeholder="e.g. DHL, FedEx"
                                                        className="h-8 text-xs"
                                                        id="ship-carrier"
                                                        defaultValue={selectedOrder.carrier || ''}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold uppercase text-muted-foreground">Tracking Number</label>
                                                    <Input
                                                        placeholder="e.g. 12345678"
                                                        className="h-8 text-xs font-mono"
                                                        id="ship-tracking"
                                                        defaultValue={selectedOrder.trackingNumber || ''}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    const carrier = (document.getElementById('ship-carrier') as HTMLInputElement).value;
                                                    const tracking = (document.getElementById('ship-tracking') as HTMLInputElement).value;
                                                    handleStatusUpdate(selectedOrder.id, "SHIPPED", { carrier, trackingNumber: tracking });
                                                }}
                                                disabled={updating}
                                                className="w-full bg-[#480100] hover:bg-[#300100] text-white h-10 text-xs"
                                            >
                                                Dispatch Order & Notify Customer
                                            </Button>
                                        </div>
                                    ) : selectedOrder.status === "SHIPPED" ? (
                                        <Button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, "DELIVERED")}
                                            disabled={updating}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-xs"
                                        >
                                            Confirm Delivery & Notify Customer
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
