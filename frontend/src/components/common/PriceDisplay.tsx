"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
    amount: number; // in cents (USD base)
    currency?: string;
    className?: string;
    showSymbol?: boolean;
}

export function PriceDisplay({ amount, currency = "NGN", className, showSymbol = true }: PriceDisplayProps) {
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [rate, setRate] = useState<number>(1);

    useEffect(() => {
        const getRate = async () => {
            try {
                // Fetch rates (cache this in a real app)
                const rates = await fetchApi('/currency/rates');
                const target = rates.find((r: any) => r.currency === currency.toUpperCase());
                if (target) {
                    setRate(target.rate);
                    setConvertedAmount(Math.round(amount * target.rate));
                } else {
                    setConvertedAmount(amount);
                }
            } catch (err) {
                console.error("Rate fetch failed", err);
                setConvertedAmount(amount);
            }
        };

        if (currency === 'USD') {
            setConvertedAmount(amount);
        } else {
            getRate();
        }
    }, [amount, currency]);

    if (convertedAmount === null) return <span className="animate-pulse opacity-50">...</span>;

    const localeMap: Record<string, string> = {
        'NGN': 'en-NG',
        'GHS': 'en-GH',
        'USD': 'en-US',
        'INR': 'en-IN',
        'CNY': 'zh-CN',
        'GBP': 'en-GB',
        'EUR': 'de-DE'
    };

    const locale = localeMap[currency.toUpperCase()] || 'en-US';

    const formatted = formatPrice(convertedAmount, currency, locale);

    return <span className={className}>{formatted}</span>;
}
