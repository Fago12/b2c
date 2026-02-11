"use client";

import { HeroSection } from "@/types/homepage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface HeroBannerProps {
    hero: HeroSection | null;
}

export default function HeroBanner({ hero }: HeroBannerProps) {
    if (!hero || !hero.isActive) return null;

    return (
        <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={hero.imageUrl}
                    alt={hero.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Overlay Gradient for readability */}
                <div className="absolute inset-0 bg-black/20 md:bg-black/10" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="container px-4 md:px-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                            {hero.title}
                        </h1>
                        {hero.subtitle && (
                            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
                                {hero.subtitle}
                            </p>
                        )}
                        <div className="pt-4">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8 h-12 text-base font-semibold bg-white text-black hover:bg-white/90 border-0"
                            >
                                <Link href={hero.ctaLink}>
                                    {hero.ctaText}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
