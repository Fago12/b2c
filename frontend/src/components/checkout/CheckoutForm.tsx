"use client";

import { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

import { fetchApi } from "@/lib/api";

export function CheckoutForm({ amount, onBeforeSubmit, clientSecret }: { amount: number, onBeforeSubmit: () => Promise<string | null>, clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        // 1. Create Order in Backend
        // 1. Create Order in Backend
        const orderId = await onBeforeSubmit();
        if (!orderId) {
            setIsLoading(false);
            return;
        }

        // 2. Update PaymentIntent with Metadata (OrderId)
        const paymentIntentId = clientSecret.split('_secret_')[0];

        try {
            await fetchApi('/payments/update-payment-intent', {
                method: 'POST',
                body: JSON.stringify({
                    paymentIntentId,
                    metadata: { orderId }
                })
            });
        } catch (err) {
            console.error("Failed to link order to payment:", err);
            setMessage("Failed to prepare payment. Please try again.");
            setIsLoading(false);
            return;
        }

        // 3. Confirm Payment
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full" size="lg">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner">Processing...</div> : `Pay $${(amount / 100).toFixed(2)}`}
                </span>
            </Button>
            {message && <div id="payment-message" className="text-red-500 text-sm">{message}</div>}
        </form>
    );
}
