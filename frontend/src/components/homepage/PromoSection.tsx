"use client";

import { PromoBanner } from "@/types/homepage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface PromoSectionProps {
    promos: PromoBanner[];
}

export default function PromoSection({ promos }: PromoSectionProps) {
    if (!promos || promos.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promos.map((promo) => (
                    <div key={promo.id} className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
                        <Image
                            src={promo.imageUrl}
                            alt={promo.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                            <h3 className="text-3xl md:text-4xl font-bold mb-4">{promo.title}</h3>
                            {promo.subtitle && (
                                <p className="text-lg text-white/90 mb-6 max-w-md">{promo.subtitle}</p>
                            )}
                            <div>
                                <Button asChild variant="secondary" size="lg" className="rounded-full">
                                    <Link href={promo.ctaLink}>
                                        {promo.ctaText}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
