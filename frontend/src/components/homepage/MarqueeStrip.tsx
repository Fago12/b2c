"use client";

import { MarqueeItem } from "@/types/homepage";
import Image from "next/image";

interface MarqueeStripProps {
    items: MarqueeItem[];
}

export default function MarqueeStrip({ items }: MarqueeStripProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full bg-[#E6DED3] py-4 border-y border-black/5 overflow-hidden whitespace-nowrap select-none">
            <div className="flex animate-marquee-reverse whitespace-nowrap w-max">
                {/* Two identical sets for a perfect, seamless loop using the -50% technique */}
                {[...items, ...items].map((item, idx) => {
                    return (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-6 text-sm md:text-base font-black uppercase tracking-[0.1em] text-[#480100] px-12 flex-shrink-0">
                            <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                                <Image
                                    src="/icons/Asset 19.svg"
                                    alt="Brand Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span>{item.text}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
