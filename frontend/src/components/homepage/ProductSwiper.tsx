"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/common/ProductCard";

interface ProductSwiperProps {
    title: string;
    description?: string;
    products: any[];
    autoPlay?: boolean;
}

export default function ProductSwiper({ title, description, products, autoPlay = false }: ProductSwiperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 20);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    };

    useEffect(() => {
        const current = scrollRef.current;
        if (current) {
            current.addEventListener("scroll", checkScroll);
            checkScroll();
            window.addEventListener("resize", checkScroll);
        }
        return () => {
            if (current) current.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    // Auto-play logic (disabled by default)
    useEffect(() => {
        if (!autoPlay || !scrollRef.current || products.length < 4) return;

        const interval = setInterval(() => {
            if (!scrollRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

            if (scrollLeft >= scrollWidth - clientWidth - 5) {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [autoPlay, products.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 350;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-16 group/section">
            <div className="flex flex-col items-center justify-center text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-vogue font-bold tracking-[0.1em] text-primary uppercase mb-2">{title}</h2>
                {description && (
                    <p className="text-xs text-foreground/50 font-medium tracking-widest max-w-xl uppercase">{description}</p>
                )}
            </div>

            <div className="relative group/swiper">
                {/* Navigation Arrows - Absolute Overlay */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 md:left-4 z-20 opacity-0 group-hover/swiper:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => scroll('left')}
                        className={cn(
                            "rounded-full shadow-lg h-10 w-10 md:h-12 md:w-12 transition-all border-none hover:bg-primary hover:text-secondary",
                            !showLeftArrow && "opacity-0 pointer-events-none"
                        )}
                        disabled={!showLeftArrow}
                    >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 right-0 md:right-4 z-20 opacity-0 group-hover/swiper:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => scroll('right')}
                        className={cn(
                            "rounded-full shadow-lg h-10 w-10 md:h-12 md:w-12 transition-all border-none hover:bg-primary hover:text-secondary",
                            !showRightArrow && "opacity-0 pointer-events-none"
                        )}
                        disabled={!showRightArrow}
                    >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-4 md:gap-8 pb-8 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="min-w-[260px] md:min-w-[340px] snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
