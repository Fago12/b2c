"use client";

import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState("");
    const { data: session } = authClient.useSession();

    // Guest Form State
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState({
        line1: "",
        city: "",
        zip: "",
        country: ""
    });

    useEffect(() => {
        if (items.length > 0) {
            fetchApi("/payments/create-payment-intent", {
                method: "POST",
                body: JSON.stringify({ amount: totalPrice() * 100 }), // Amount in cents? Wait, totalPrice() usually returns amount in smallest unit or currency? 
                // In cart store: usually integer. Let's check logic. 
                // formatPrice divides by 100. So totalPrice returns integer cents.
                // Stripe expects integer cents.
                // Backend controller accepts amount directly.
            }).then((data) => {
                setClientSecret(data.client_secret);
            }).catch(err => console.error("Failed to init stripe", err));
        }
    }, [items, totalPrice]);

    if (items.length === 0) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Button onClick={() => router.push("/shop")}>Go Shopping</Button>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 100);
    };

    const handleCreateOrder = async (): Promise<string | null> => {
        // Validate
        if (!email || !address.line1 || !address.city || !address.zip || !address.country) {
            alert("Please fill in all fields");
            return null;
        }

        try {
            const orderData = {
                items: items.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                total: totalPrice(),
                email,
                shippingAddress: address,
                userId: session?.user?.id,
            };

            const response = await fetchApi('/orders', {
                method: 'POST',
                headers: {
                    'Idempotency-Key': uuidv4(),
                },
                body: JSON.stringify(orderData),
            });

            console.log("Order created:", response);
            // Don't clear cart here - it unmounts the Stripe Elements!
            // clearCart(); 
            return response.id;
        } catch (error: any) {
            alert(error.message || "Failed to place order");
            return null;
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 grid md:grid-cols-2 gap-8">
            {/* Left: Guest Form */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Guest Checkout</CardTitle>
                        <CardDescription>Enter your details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jdoe@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <Separator className="my-4" />
                        <h3 className="font-medium">Shipping Address</h3>

                        <div className="space-y-2">
                            <Label htmlFor="line1">Address Line 1</Label>
                            <Input
                                id="line1"
                                required
                                value={address.line1}
                                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    required
                                    value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip">Zip / Postal Code</Label>
                                <Input
                                    id="zip"
                                    required
                                    value={address.zip}
                                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                required
                                value={address.country}
                                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Order Summary & Payment */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 text-sm">
                                    <div className="relative h-16 w-16 bg-muted rounded overflow-hidden shrink-0">
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice())}</span>
                        </div>

                        <Separator className="my-4" />

                        {/* Stripe Elements */}
                        {clientSecret ? (
                            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm
                                    amount={totalPrice()}
                                    onBeforeSubmit={handleCreateOrder}
                                    clientSecret={clientSecret}
                                />
                            </Elements>
                        ) : (
                            <div className="flex justify-center py-4">
                                <span>Loading payment secure gateway...</span>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
