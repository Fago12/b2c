"use client";

import { HeroSection } from "@/types/homepage";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronsDown } from "lucide-react";

interface HeroBannerProps {
    hero: HeroSection | null;
}

export default function HeroBanner({ hero }: HeroBannerProps) {
    if (!hero || !hero.isActive) return null;

    return (
        <section className="fixed inset-0 w-full h-screen bg-black z-0 overflow-hidden pointer-events-none">
            {/* Background Media */}
            <div className="absolute inset-0">
                {hero.mediaType === "VIDEO" && hero.videoUrl ? (
                    <video
                        src={hero.videoUrl}
                        autoPlay={true}
                        muted={true}
                        loop={true}
                        playsInline={true}
                        className="w-full h-full object-cover opacity-50"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                ) : hero.imageUrl ? (
                    <Image
                        src={hero.imageUrl}
                        alt={hero.title}
                        fill
                        className="w-full h-full object-cover opacity-50"
                        priority
                        sizes="100vw"
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
            </div>

            {/* Content Container (No headline) */}
            <div className="relative z-10 h-full w-full" />

            {/* Scroll Indicator: Underlined text + Chevrons beside each other */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-16 left-0 w-full flex justify-center z-20"
            >
                <div className="flex items-center gap-3 text-white">
                    <span className="text-sm font-black uppercase tracking-[0.25em] border-b-2 border-white pb-1">
                        Scroll Down
                    </span>
                    <ChevronsDown className="w-6 h-6 stroke-[3px]" />
                </div>
            </motion.div>
        </section>
    );
}
