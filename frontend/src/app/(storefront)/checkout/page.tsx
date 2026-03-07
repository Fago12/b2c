"use client";

import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { formatPrice as utilsFormatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { authClient } from "@/lib/auth-client";
import { Loader2, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Country, State } from "country-state-city";

const COUNTRIES = Country.getAllCountries().map(c => ({
    code: c.isoCode,
    name: c.name
}));

export default function CheckoutPage() {
    const {
        items,
        displayTotal,
        displayCurrency,
        chargeTotal,
        chargeCurrency,
        subtotal,
        shippingCost,
        currency,
        couponCode,
        discountAmount,
        fetchCart,
        clearCart,
        applyCoupon,
        removeCoupon
    } = useCart();
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState("");
    const { data: session } = authClient.useSession();
    const [mounted, setMounted] = useState(false);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    // Form State
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState({
        line1: "",
        city: "",
        state: "",
        zip: "",
        country: ""
    });
    const [couponInput, setCouponInput] = useState("");

    const [availableStates, setAvailableStates] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        fetchCart();

        // Load cached checkout data
        const cachedData = localStorage.getItem('checkout_form');
        if (cachedData) {
            try {
                const { email, firstName, lastName, phone, address } = JSON.parse(cachedData);
                if (email) setEmail(email);
                if (firstName) setFirstName(firstName);
                if (lastName) setLastName(lastName);
                if (phone) setPhone(phone);
                if (address) setAddress(address);
            } catch (e) {
                console.error("Failed to load cached checkout data", e);
            }
        }
    }, [fetchCart]);

    // Save checkout data to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('checkout_form', JSON.stringify({
                email,
                firstName,
                lastName,
                address
            }));
        }
    }, [email, firstName, lastName, phone, address, mounted]);

    useEffect(() => {
        if (address.country) {
            const states = State.getStatesOfCountry(address.country);
            setAvailableStates(states);
        }
    }, [address.country]);

    // Update Shipping when country changes
    useEffect(() => {
        if (mounted && address.country) {
            handleCalculateShipping();
        }
    }, [address.country, mounted]);

    const handleCalculateShipping = async () => {
        setCalculatingShipping(true);
        try {
            await fetchApi("/cart/region", {
                method: "POST",
                body: JSON.stringify({ regionCode: address.country })
            });
            await fetchCart();
        } catch (err) {
            console.error("Failed to update shipping region", err);
        } finally {
            setCalculatingShipping(false);
        }
    };

    // Initialize Stripe Payment Intent - Secruely calculated on server
    useEffect(() => {
        if (mounted && items.length > 0) {
            (async () => {
                try {
                    // We NO LONGER pass the amount from the client.
                    // The server will calculate it from the session cart.
                    const cartData = await fetchApi("/cart");
                    const data = await fetchApi("/payments/create-payment-intent", {
                        method: "POST",
                        body: JSON.stringify({
                            sessionId: cartData.sessionId
                        }), // Amount is calculated on server
                    });
                    setClientSecret(data.client_secret);
                } catch (err) {
                    console.error("Failed to init stripe", err);
                }
            })();
        }
    }, [items.length, mounted]);

    const formatPrice = (price: number) => {
        return utilsFormatPrice(price, displayCurrency || 'USD');
    };

    const formatChargePrice = (price: number) => {
        return utilsFormatPrice(price, chargeCurrency || 'USD');
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Initializing Checkout...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-6 container">
                <h1 className="text-3xl font-vogue uppercase tracking-widest text-primary">Your bag is empty</h1>
                <Button variant="outline" className="rounded-none border-primary text-primary px-12 py-6 uppercase tracking-widest text-xs" onClick={() => router.push('/')}>
                    Return to Shop
                </Button>
            </div>
        );
    }


    const handleCreateOrder = async (): Promise<string | null> => {
        if (!email || !firstName || !lastName || !address.line1 || !address.city || !address.country) {
            toast.error("Incomplete Details", { description: "Please provide your contact info and full shipping address." });
            return null;
        }

        const isCustomOrder = items.some(item =>
            item.customization?.embroidery ||
            item.customization?.customColor ||
            item.customization?.note
        );

        try {
            const orderData = {
                items: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    customization: item.customization
                })),
                total: displayTotal,
                displayTotal: displayTotal,
                displayCurrency: displayCurrency,
                chargeTotal: chargeTotal,
                chargeCurrency: chargeCurrency,
                email,
                customerName: `${firstName} ${lastName}`,
                customerPhone: phone,
                firstName,
                lastName,
                shippingAddress: address,
                shippingCost,
                isCustomOrder,
                userId: session?.user?.id,
                couponCode: couponCode || null,
                regionCode: address.country // FIX: Ensure regional pricing is applied
            };

            const response = await fetchApi('/orders', {
                method: 'POST',
                headers: {
                    'Idempotency-Key': uuidv4(),
                },
                body: JSON.stringify(orderData),
            });

            return response.id;
        } catch (error: any) {
            toast.error("Checkout Failed", { description: error.message || "Something went wrong." });
            return null;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* LEFT: Shipping Details */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-vogue font-bold text-primary uppercase tracking-widest">Secure Checkout</h1>
                            <p className="text-sm text-muted-foreground italic">"Simplicity is the ultimate sophistication." — Complete your order below.</p>
                        </div>

                        <Card className="rounded-none border-none shadow-sm">
                            <CardHeader className="border-b border-slate-50">
                                <CardTitle className="text-xs uppercase tracking-[0.3em] font-bold">1. Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest">Email Address</Label>
                                    <Input
                                        type="email"
                                        className="h-12 rounded-none focus:border-[#480100] bg-slate-50 border-slate-100"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">First Name</Label>
                                        <Input
                                            className="h-12 rounded-none focus:border-[#480100]"
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">Last Name</Label>
                                        <Input
                                            className="h-12 rounded-none focus:border-[#480100]"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-[#480100]">Phone Number</Label>
                                    <Input
                                        className="h-12 rounded-none focus:border-[#480100]"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="e.g. +1 555 000 0000"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-none shadow-sm">
                            <CardHeader className="border-b border-slate-50 text-xs uppercase tracking-[0.3em] font-bold">
                                <div className="flex justify-between items-center">
                                    <span>2. Shipping Address</span>
                                    {calculatingShipping && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">Country</Label>
                                        <Select
                                            value={address.country}
                                            onValueChange={v => setAddress({ ...address, country: v, state: '' })}
                                        >
                                            <SelectTrigger className="h-12 rounded-none">
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COUNTRIES.map(c => (
                                                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">Address Line 1</Label>
                                        <Input
                                            className="h-12 rounded-none"
                                            value={address.line1}
                                            onChange={e => setAddress({ ...address, line1: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">City</Label>
                                        <Input
                                            className="h-12 rounded-none"
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">State / Province</Label>
                                        {availableStates.length > 0 ? (
                                            <Select
                                                value={address.state}
                                                onValueChange={v => setAddress({ ...address, state: v })}
                                            >
                                                <SelectTrigger className="h-12 rounded-none">
                                                    <SelectValue placeholder="Select State" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStates.map(s => (
                                                        <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                className="h-12 rounded-none"
                                                value={address.state}
                                                onChange={e => setAddress({ ...address, state: e.target.value })}
                                                placeholder="Enter State/Province"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold tracking-widest">Zip / Postal</Label>
                                        <Input
                                            className="h-12 rounded-none"
                                            value={address.zip}
                                            onChange={e => setAddress({ ...address, zip: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-5 space-y-6 sticky top-24">
                        <Card className="rounded-none border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="bg-primary text-secondary p-6">
                                <CardTitle className="text-xs uppercase tracking-[0.4em] font-bold">Your Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item) => (
                                        <div key={item.cartItemId} className="flex gap-4">
                                            <div className="relative h-20 w-16 bg-slate-50 shadow-sm shrink-0 border border-slate-100">
                                                <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                                                <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h3 className="text-xs font-bold uppercase tracking-wider line-clamp-1">{item.name}</h3>
                                                {item.customization?.embroidery && (
                                                    <p className="text-[9px] text-muted-foreground uppercase flex items-center gap-1">
                                                        <span className="text-[#480100] font-bold font-vogue">Besope:</span> "{item.customization.embroidery}"
                                                    </p>
                                                )}
                                                <p className="text-[10px] font-bold text-primary mt-1 font-sans">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="bg-slate-100" />

                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="DISCOUNT CODE"
                                            className="h-10 rounded-none text-[10px] font-bold tracking-widest uppercase"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        />
                                        <Button
                                            variant="outline"
                                            className="rounded-none h-10 border-primary text-[10px] font-bold tracking-widest uppercase px-6"
                                            onClick={() => applyCoupon(couponInput)}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                    {couponCode && (
                                        <div className="flex justify-between items-center bg-slate-50 p-2 border border-dashed border-slate-200">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#480100]">Coupon Applied</span>
                                                <span className="text-[9px] text-muted-foreground uppercase">{couponCode}</span>
                                            </div>
                                            <button
                                                onClick={() => removeCoupon()}
                                                className="text-[10px] uppercase font-bold text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 text-sm font-sans">
                                    <div className="flex justify-between text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    {discountAmount ? (
                                        <div className="flex justify-between text-[#480100] uppercase text-[10px] font-bold tracking-widest">
                                            <span>Discount</span>
                                            <span>-{formatPrice(discountAmount)}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                                        <span>Estimated Shipping</span>
                                        <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                                    </div>
                                    <Separator className="bg-slate-50" />
                                    <div className="flex justify-between items-center text-primary pt-2">
                                        <span className="font-vogue text-xl uppercase tracking-widest font-bold">Total</span>
                                        <span className="text-xl font-bold tracking-tighter text-[#480100] font-sans">{formatPrice(displayTotal)}</span>
                                    </div>
                                    {displayCurrency !== chargeCurrency && (
                                        <p className="text-[10px] text-right text-muted-foreground italic mt-1">
                                            You will be charged: <span className="font-bold">{formatChargePrice(chargeTotal)}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="pt-6 space-y-4">
                                    {clientSecret ? (
                                        <Elements key={clientSecret} stripe={stripePromise} options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'stripe',
                                                variables: { colorPrimary: '#480100' }
                                            }
                                        }}>
                                            <CheckoutForm
                                                amount={chargeTotal}
                                                currency={chargeCurrency}
                                                onBeforeSubmit={handleCreateOrder}
                                                clientSecret={clientSecret}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-slate-50/50 rounded-sm italic text-muted-foreground text-xs">
                                            <CreditCard className="h-8 w-8 opacity-10 animate-pulse text-[#480100]" />
                                            <span>Establishing secure link...</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 flex items-center gap-3 border border-slate-100 shadow-sm">
                                <Truck className="h-5 w-5 text-primary opacity-50" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Verified Delivery</p>
                                    <p className="text-[8px] text-muted-foreground tracking-tighter">Real-time regional rates</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 flex items-center gap-3 border border-slate-100 shadow-sm">
                                <ShieldCheck className="h-5 w-5 text-primary opacity-50" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Secure Escrow</p>
                                    <p className="text-[8px] text-muted-foreground tracking-tighter">Payments held until delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
