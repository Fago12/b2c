"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; images: string[] };
}

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function AccountOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchApi("/orders/my")
                .then(setOrders)
                .catch((err) => console.error("Failed to fetch orders:", err))
                .finally(() => setLoading(false));
        }
    }, [user, authLoading, router]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price / 100);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    if (loading) return <div className="container py-10">Loading orders...</div>;

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <Button variant="ghost" asChild className="mb-4 gap-2">
                <Link href="/account"><ArrowLeft className="h-4 w-4" /> Back to Account</Link>
            </Button>

            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-7 w-7" /> My Orders
            </h1>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        You haven't placed any orders yet.
                        <div className="mt-4">
                            <Button asChild><Link href="/shop">Start Shopping</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.product.name} x {item.quantity}</span>
                                            <span>{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
