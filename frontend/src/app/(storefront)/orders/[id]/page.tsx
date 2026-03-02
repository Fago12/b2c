import { getOrder } from "@/lib/data";
import { notFound } from "next/navigation";
import { Package, Truck, CheckCircle2, Clock, MapPin, Mail, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

interface OrderPageProps {
    params: Promise<{ id: string }>;
}

const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    PAID: { label: "Paid", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50" },
    SHIPPED: { label: "Shipped", icon: Truck, color: "text-blue-500", bg: "bg-blue-50" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    CANCELLED: { label: "Cancelled", icon: Package, color: "text-gray-500", bg: "bg-gray-50" },
};

export default async function OrderPage({ params }: OrderPageProps) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link
                                href="/"
                                className="text-sm font-medium text-gray-500 hover:text-black transition-colors mb-2 inline-block"
                            >
                                &larr; Back to shop
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Details</h1>
                            <p className="mt-1 text-sm text-gray-500">Order ID: #{order.id}</p>
                        </div>
                        <div className={cn("px-4 py-2 rounded-full flex items-center gap-2 font-medium", status.bg, status.color)}>
                            <status.icon className="w-5 h-5" />
                            {status.label}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Items
                                </h2>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {order.items.map((item: any) => (
                                    <li key={item.id} className="p-6 flex gap-6">
                                        <div className="relative w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            {item.product?.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                        {item.product?.name || "Product Deleted"}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatPrice(item.price * item.quantity, order.currency || 'NGN')}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold mb-6">Payment Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-900 font-medium">{formatPrice(order.total, order.currency || 'NGN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <Hr />
                                <div className="flex justify-between text-base font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-black text-xl">{formatPrice(order.total, order.currency || 'NGN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer info</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <span className="text-gray-900 truncate">{order.email}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <span>
                                            {typeof order.shippingAddress === 'object' && order.shippingAddress !== null ? (
                                                <>
                                                    {order.shippingAddress.line1}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.zip}
                                                </>
                                            ) : (
                                                order.shippingAddress || "Local Pickup"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Hr() {
    return <div className="h-px bg-gray-100 my-4" />;
}
