"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/homepage";
import { BrandButton } from "../common/BrandButton";
import Image from "next/image";
import Link from "next/link";
import { Timer } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface FlashSaleBannerProps {
    title: string;
    description?: string;
    endsAt: string;
    products: Product[];
}

export default function FlashSaleBanner({ title, description, endsAt, products }: FlashSaleBannerProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(endsAt) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();
        return () => clearInterval(timer);
    }, [endsAt]);

    if (!products || products.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="bg-gradient-to-br from-[#480100] via-[#850200] to-[#480100] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-12 p-8 md:p-12 lg:p-16 relative z-10">
                    {/* Left: Content */}
                    <div className="flex-1 text-center lg:text-left text-white space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-2">
                            <Timer className="h-4 w-4" />
                            Flash Sale Ending Soon
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-vogue font-bold tracking-tight leading-tight uppercase">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-xl text-white/90 max-w-xl font-medium">
                                {description}
                            </p>
                        )}

                        {/* Countdown */}
                        <div className="flex justify-center lg:justify-start gap-4 pt-4">
                            {[
                                { label: "Hrs", value: timeLeft.hours.toString().padStart(2, '0') },
                                { label: "Min", value: timeLeft.minutes.toString().padStart(2, '0') },
                                { label: "Sec", value: timeLeft.seconds.toString().padStart(2, '0') },
                            ].map((unit) => (
                                <div key={unit.label} className="bg-[#F7DFB9] text-[#480100] rounded-2xl p-4 min-w-[80px] text-center shadow-lg transform hover:scale-105 transition-transform">
                                    <div className="text-3xl font-bold">{unit.value}</div>
                                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">{unit.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <BrandButton asChild>
                                <Link href="/shop?sale=true">
                                    Shop the Sale
                                </Link>
                            </BrandButton>
                        </div>
                    </div>

                    {/* Right: Product Grid (Mini) */}
                    <div className="flex-1 w-full max-w-2xl grid grid-cols-2 gap-4">
                        {products.slice(0, 4).map((product) => (
                            <Link
                                href={`/products/${product.slug}`}
                                key={product.id}
                                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-all border border-white/10"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                                    <Image
                                        src={product.images[0] || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                        <div className="absolute top-2 right-2 bg-[#F7DFB9] text-[#480100] text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                            -{formatPrice(product.regional.basePrice - product.regional.finalPrice, product.regional.currency || 'USD')}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white text-sm font-bold truncate mb-1">{product.name}</h4>
                                <div className="flex items-center gap-2">
                                    {product.regional ? (
                                        <>
                                            <span className="text-white font-black">{formatPrice(product.regional.finalPrice, product.regional.currency || 'USD')}</span>
                                            {product.regional.finalPrice < product.regional.basePrice && (
                                                <span className="text-white/60 text-xs line-through italic">{formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-white font-black">{formatPrice(product.basePriceUSD || 0)}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
