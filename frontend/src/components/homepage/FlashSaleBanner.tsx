"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
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
            <div className="bg-gradient-to-br from-[#2D0A0A] via-[#5C1616] to-[#2D0A0A] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border border-white/5 group">
                {/* Dynamic background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none group-hover:bg-red-500/20 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-12 p-10 md:p-16 relative z-10">
                    {/* Left: Content */}
                    <div className="flex-1 w-full text-center lg:text-left text-white space-y-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-white/10 animate-pulse-subtle">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Flash Sale Live
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-6xl lg:text-8xl font-vogue font-bold tracking-tighter leading-[0.9] uppercase italic">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-lg md:text-xl text-white/70 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Countdown - Premium Design */}
                        <div className="flex justify-center lg:justify-start items-center gap-3 sm:gap-6 pt-4">
                            {[
                                { label: "Hours", value: timeLeft.hours.toString().padStart(2, '0') },
                                { label: "Minutes", value: timeLeft.minutes.toString().padStart(2, '0') },
                                { label: "Seconds", value: timeLeft.seconds.toString().padStart(2, '0') },
                            ].map((unit, idx) => (
                                <div key={unit.label} className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 min-w-[70px] md:min-w-[100px] text-center shadow-xl border border-white/5 hover:border-white/20 transition-all group/unit">
                                            <div className="text-3xl md:text-5xl font-black font-mono tracking-tighter group-hover/unit:scale-110 transition-transform">
                                                {unit.value}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest mt-2 text-white/40">{unit.label}</div>
                                    </div>
                                    {idx < 2 && (
                                        <div className="text-2xl md:text-4xl font-black text-white/20 mb-6">:</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 flex justify-center lg:justify-start">
                            <Link
                                href="/shop?sale=true"
                                className="inline-flex items-center justify-center px-10 h-16 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                            >
                                Shop the Sale
                            </Link>
                        </div>
                    </div>

                    {/* Right: Product Grid (Responsive Fixes) */}
                    <div className="flex-1 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {products.slice(0, 4).map((product) => (
                            <Link
                                href={`/products/${product.slug}`}
                                key={product.id}
                                className="group bg-white/5 backdrop-blur-md rounded-[2rem] p-5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
                            >
                                <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-4 shadow-xl">
                                    <Image
                                        src={product.images[0] || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl uppercase tracking-tighter">
                                            Save {formatPrice(product.regional.basePrice - product.regional.finalPrice, product.regional.currency || 'USD')}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white text-base font-bold truncate group-hover:text-red-300 transition-colors uppercase tracking-tight">{product.name}</h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        {product.regional ? (
                                            <>
                                                <span className="text-white text-lg font-black">{formatPrice(product.regional.finalPrice, product.regional.currency || 'USD')}</span>
                                                {product.regional.finalPrice < product.regional.basePrice && (
                                                    <span className="text-white/40 text-xs line-through font-medium">{formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-white text-lg font-black">{formatPrice(product.basePriceUSD_cents || 0)}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
