"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { QuickVariantSelect } from "../common/QuickVariantSelect";

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
    const [quickSelectId, setQuickSelectId] = useState<string | null>(null);
    const addItem = useCart((state) => state.addItem);

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

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        const hasVariants = product.hasVariants || (product.variants && product.variants.length > 0);
        if (hasVariants) {
            setQuickSelectId(product.id);
        } else {
            addItem(product.id, 1);
        }
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
                            <Card className="group/card overflow-hidden border-0 shadow-none bg-transparent rounded-none">
                                <CardContent className="p-0 relative aspect-[4/5] bg-slate-50 rounded-none overflow-hidden mb-4">
                                    <Link href={`/products/${product.slug}`}>
                                        <Image
                                            src={product.images[0] || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors duration-500" />

                                        {product.regional && product.regional.finalPrice < product.regional.basePrice && (
                                            <Badge className="absolute top-4 left-4 bg-black text-white rounded-none border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                                                Sale
                                            </Badge>
                                        )}

                                        {/* Add to Cart (+) Button */}
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="absolute bottom-4 right-4 z-30 bg-white text-black p-2 rounded-none shadow-md transition-all duration-300 transform scale-0 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 group/plus overflow-hidden"
                                            title="Add to cart"
                                            style={{
                                                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                                            }}
                                        >
                                            <Plus className="h-5 w-5 transition-transform duration-500 group-hover/plus:rotate-90" />
                                        </button>

                                        {/* Quick Variant Selection Overlay */}
                                        {product.variants && product.variants.length > 0 && (
                                            <QuickVariantSelect
                                                product={product}
                                                isVisible={quickSelectId === product.id}
                                                onClose={() => setQuickSelectId(null)}
                                            />
                                        )}
                                    </Link>
                                </CardContent>
                                <CardFooter className="p-0 block text-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{product.category?.name}</p>
                                        <h3 className="text-sm font-medium text-primary uppercase tracking-widest truncate group-hover/card:text-primary/60 transition-colors">
                                            <Link href={`/products/${product.slug}`}>
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center justify-center gap-2">
                                            {product.regional ? (
                                                <>
                                                    <span className="text-sm font-bold text-primary">
                                                        {formatPrice(product.regional.finalPrice, product.regional.currency || 'USD')}
                                                    </span>
                                                    {product.regional.finalPrice < product.regional.basePrice && (
                                                        <span className="text-xs text-muted-foreground line-through opacity-50">
                                                            {formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm font-bold text-primary tracking-tighter">
                                                    {formatPrice(product.basePriceUSD || 0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
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
