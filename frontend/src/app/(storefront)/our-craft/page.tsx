"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, Scissors, Wind, Hammer, Heart } from "lucide-react";

interface CmsPage {
    id: string;
    title: string;
    content: string;
    metadata?: {
        section1Title?: string;
        section1Desc?: string;
        section1Image?: string;
        section3Title?: string;
        section3Desc?: string;
        section3Image?: string;
        section2Title?: string;
        section2Desc?: string;
        section2Image?: string;
    };
}

export default function OurCraftPage() {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await fetchApi("/cms/our-craft");
                setPage(data);
            } catch (err) {
                console.error("Our Craft Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#480100]" />
        </div>
    );

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            <div className="pt-12 lg:pt-24">
                {/* Section 1: Handcrafted Design - Text Left, Image Right */}
                <section className="relative overflow-hidden">
                    <div className="container mx-auto px-4 lg:px-24 grid lg:grid-cols-2 min-h-[70vh] items-center gap-12 lg:gap-24 py-12 lg:py-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-2 lg:order-1 text-center lg:text-left"
                        >
                            <h2 className="text-3xl md:text-5xl font-vogue font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-8 leading-tight">
                                {page?.metadata?.section1Title || "Handcrafted Design"}
                            </h2>
                            <div className="h-1 w-12 bg-[#480100] mb-12 mx-auto lg:mx-0" />
                            <div className="space-y-6">
                                {(page?.metadata?.section1Desc || page?.content || "").split('\n\n').map((para, i) => (
                                    <p key={i} className="text-lg font-medium text-slate-700 leading-relaxed italic">
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="order-1 lg:order-2 relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-sm shadow-2xl"
                        >
                            <Image
                                src={page?.metadata?.section1Image || "https://images.unsplash.com/photo-1605652573215-64906f25be25?q=80&w=2670&auto=format&fit=crop"}
                                alt="Handcrafted Design"
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Section 2: Curated Selection - Image Left, Text Right */}
                <section className="relative overflow-hidden bg-white">
                    <div className="container mx-auto px-4 lg:px-24 grid lg:grid-cols-2 min-h-[70vh] items-center gap-12 lg:gap-24 py-12 lg:py-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-sm shadow-2xl order-1"
                        >
                            <Image
                                src={page?.metadata?.section2Image || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2680&auto=format&fit=crop"}
                                alt="Curated Selection"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left order-2"
                        >
                            <h2 className="text-3xl md:text-5xl font-vogue font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-8 leading-tight">
                                {page?.metadata?.section2Title || "Curated Selection"}
                            </h2>
                            <div className="h-1 w-12 bg-[#480100] mb-12 mx-auto lg:mx-0" />
                            <div className="space-y-6">
                                {(page?.metadata?.section2Desc || "").split('\n\n').map((para, i) => (
                                    <p key={i} className="text-lg font-medium text-slate-700 leading-relaxed">
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 3: Exquisite Craftsmanship - Text Left, Image Right */}
                <section className="relative overflow-hidden bg-[#FAF9F6]">
                    <div className="container mx-auto px-4 lg:px-24 grid lg:grid-cols-2 min-h-[70vh] items-center gap-12 lg:gap-24 py-12 lg:py-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-2 lg:order-1 text-center lg:text-left"
                        >
                            <h2 className="text-3xl md:text-5xl font-vogue font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-8 leading-tight">
                                {page?.metadata?.section3Title || "Exquisite Craftsmanship"}
                            </h2>
                            <div className="h-1 w-12 bg-[#480100] mb-12 mx-auto lg:mx-0" />
                            <div className="space-y-6">
                                {(page?.metadata?.section3Desc || "").split('\n\n').map((para, i) => (
                                    <p key={i} className="text-lg font-medium text-slate-700 leading-relaxed">
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="order-1 lg:order-2 relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-sm shadow-2xl"
                        >
                            <Image
                                src={page?.metadata?.section3Image || "https://images.unsplash.com/photo-1627731995964-6d9b359f59f6?q=80&w=2670&auto=format&fit=crop"}
                                alt="Exquisite Craftsmanship"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    );
}
