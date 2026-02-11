"use client";

import { MarqueeItem } from "@/types/homepage";
import { CheckCircle, Globe, Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";

interface MarqueeStripProps {
    items: MarqueeItem[];
}

const iconMap: Record<string, any> = {
    "truck": Truck,
    "globe": Globe,
    "rotate-ccw": RotateCcw,
    "check-circle": CheckCircle,
    "shield-check": ShieldCheck,
    "credit-card": CreditCard
};

export default function MarqueeStrip({ items }: MarqueeStripProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full bg-emerald-50 py-4 border-y border-emerald-100">
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-center gap-6 md:gap-12 items-center text-emerald-900">
                    {items.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon.toLowerCase()] : CheckCircle;

                        return (
                            <div key={item.id} className="flex items-center gap-2 font-medium text-sm md:text-base">
                                {Icon && <Icon className="w-5 h-5 text-emerald-600" />}
                                <span>{item.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
