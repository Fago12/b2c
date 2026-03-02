"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryShowcaseProps {
    categories: {
        id: string;
        name: string;
        slug: string;
        imageUrl?: string | null;
    }[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-20 relative overflow-hidden bg-[#FDFBF7]">
            {/* Background Pattern with Opacity */}
            <div
                className="absolute inset-0 z-0 opacity-[0.4]"
                style={{
                    backgroundImage: 'url("/pattern-wrapper.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-16">
                    {categories.slice(0, 4).map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-full max-w-[280px] sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-2rem)]"
                        >
                            <Link href={`/shop?category=${category.slug}`} className="block group">
                                <div className="bg-[#EBE1D3] rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                                    <div className="relative aspect-square overflow-hidden m-4 rounded-lg">
                                        {category.imageUrl ? (
                                            <Image
                                                src={category.imageUrl}
                                                alt={category.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                                <span className="text-[10px] uppercase tracking-widest font-bold">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 pb-8 px-6 text-center flex flex-col items-center">
                                        <h3 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-2 leading-tight">
                                            {category.name}
                                        </h3>
                                        <span className="text-sm font-semibold text-[#4A4A4A] border-b border-[#4A4A4A] pb-0.5 transition-colors group-hover:text-black group-hover:border-black">
                                            Shop Now
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <AnimatedShowcaseButton
                        href="/shop"
                        label="Shop Collections"
                        className="bg-[#A0522D] hover:bg-[#8B4513] text-white"
                    />
                    <AnimatedShowcaseButton
                        href="/contact"
                        label="Customize Yours"
                        variant="outline"
                        className="border-[#B58900] text-[#B58900] hover:bg-transparent hover:text-[#B58900] border-2"
                    />
                </div>
            </div>
        </section>
    );
}

function AnimatedShowcaseButton({ href, label, className, variant = "default" }: { href: string; label: string; className?: string; variant?: any }) {
    const [isHovered, setIsHovered] = useState(false);

    const textVariants = {
        initial: { y: 0 },
        hover: { y: -52 },
    };

    const secondTextVariants = {
        initial: { y: 52 },
        hover: { y: 0 },
    };

    return (
        <Button
            asChild
            variant={variant}
            className={cn(
                "rounded-lg uppercase text-[13px] font-bold tracking-[0.1em] h-[52px] overflow-hidden relative group transition-all duration-300 border-0 shadow-sm",
                "w-full max-w-[280px] sm:w-auto sm:px-12",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={href} className="relative block h-full">
                <div className="relative h-full flex items-center justify-center">
                    <motion.span
                        variants={textVariants}
                        animate={isHovered ? "hover" : "initial"}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="block"
                    >
                        {label}
                    </motion.span>
                    <motion.span
                        variants={secondTextVariants}
                        animate={isHovered ? "hover" : "initial"}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute block"
                    >
                        {label}
                    </motion.span>
                </div>
            </Link>
        </Button>
    );
}
