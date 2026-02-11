"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CheckCircle2, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { useAuth } from "@/context/AuthContext";

export default function OrderSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const redirectStatus = searchParams.get('redirect_status');
    const { clearCart } = useCart();
    const { isAuthenticated, isLoading } = useAuth(); // NEW: Hook

    useEffect(() => {
        if (orderId || redirectStatus === 'succeeded') {
            clearCart();
        }
    }, [orderId, redirectStatus, clearCart]);
    const email = searchParams.get("email");

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>; // Simple loading state
    }

    return (
        <div className="container max-w-lg mx-auto py-20 px-4">
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
                    <CardDescription>
                        Thank you for your order. A confirmation has been sent to your email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {orderId && (
                        <p className="text-sm text-muted-foreground">
                            Order ID: <span className="font-mono">{orderId.slice(0, 8)}...</span>
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {/* Guest User View */}
                    {!isAuthenticated && (
                        <div className="w-full p-4 bg-muted rounded-lg space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <UserPlus className="h-5 w-5" />
                                <span className="font-medium">Save your order history</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Create an account to track your order and access it anytime.
                            </p>
                            <Button asChild className="w-full gap-2">
                                <Link href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}>
                                    Create Account <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="text-sm text-muted-foreground mt-2">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Authenticated User View */}
                    {isAuthenticated && (
                        <Button asChild className="w-full" variant="secondary">
                            <Link href="/account/orders">
                                View Your Orders <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}

                    <Button variant="outline" asChild className="w-full">
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
