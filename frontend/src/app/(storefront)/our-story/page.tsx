"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Loader2 } from "lucide-react";

interface CmsPage {
    id: string;
    title: string;
    content: string;
    metadata?: {
        heroImage?: string;
        designersTitle?: string;
        designersDescription?: string;
        designersQuote?: string;
        designerImage1?: string;
        designerImage2?: string;
        finalQuote?: string;
        finalImage?: string;
    };
}

export default function OurStoryPage() {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchPage = async () => {
            try {
                const data = await fetchApi("/cms/our-story");
                setPage(data);
            } catch (err) {
                console.error("Our Story Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, []);

    if (!mounted || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#480100]" />
        </div>
    );

    return <OurStoryContent page={page} />;
}

function OurStoryContent({ page }: { page: CmsPage | null }) {
    return (
        <div className="bg-[#FAF9F6]">
            {/* Hero Section */}
            <section className="relative flex flex-col pt-20">
                <div className="container mx-auto px-4 lg:px-24 grid lg:grid-cols-2 gap-12 items-start py-8 md:py-16">
                    {/* Content Side */}
                    <div className="order-2 lg:order-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className="text-5xl md:text-8xl font-vogue font-bold uppercase tracking-[0.1em] text-[#480100] leading-none mb-6">
                                {page?.title || "Our Story"}
                            </h1>
                            <div className="h-1 w-24 bg-[#480100]" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="prose prose-slate prose-xl max-w-xl font-medium text-slate-700 leading-relaxed italic"
                            dangerouslySetInnerHTML={{ __html: page?.content || "" }}
                        />
                    </div>

                    {/* Image Side */}
                    <div className="order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl"
                        >
                            <Image
                                src={page?.metadata?.heroImage || "https://images.unsplash.com/photo-1590736962030-cf178f69f20e?q=80&w=2671&auto=format&fit=crop"}
                                alt="Craftsmanship"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-[#480100]/5 mix-blend-multiply" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Second Section: Designers */}
            <section className="relative bg-white py-16 md:py-24 z-10 border-y border-slate-100">
                <div className="container mx-auto px-4 lg:px-24">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                        {/* Designers Images */}
                        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6 relative">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 1 }}
                                className="aspect-[3/4] relative overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000 shadow-xl"
                            >
                                <Image
                                    src={page?.metadata?.designerImage1 || "https://images.unsplash.com/photo-1487309078313-fe80c3e15805?q=80&w=2512&auto=format&fit=crop"}
                                    alt="Designer Profile"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 80 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="aspect-[3/4] relative overflow-hidden rounded-sm mt-12 grayscale hover:grayscale-0 transition-all duration-1000 shadow-xl"
                            >
                                <Image
                                    src={page?.metadata?.designerImage2 || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop"}
                                    alt="Creative Process"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#480100]/5 -z-10 rounded-full blur-3xl opacity-50" />
                        </div>

                        {/* Designers Content */}
                        <div className="w-full lg:w-1/2 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-4xl md:text-6xl font-vogue font-bold uppercase tracking-[0.1em] text-[#480100] mb-8">
                                    {page?.metadata?.designersTitle || "Designers"}
                                </h2>
                                <div className="space-y-8 text-slate-700 text-lg leading-relaxed">
                                    <p className="font-medium">
                                        {page?.metadata?.designersDescription || (
                                            <>
                                                At Woven Kulture, our designers are the heart and soul of everything we create.
                                                Each member of our team brings a unique background, rich in artistry and skilled craftsmanship,
                                                blending traditional methods with innovative design.
                                            </>
                                        )}
                                    </p>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="italic border-l-4 border-[#480100] pl-8 py-4 text-2xl font-serif text-[#480100]/80"
                                    >
                                        "{page?.metadata?.designersQuote || "With a shared passion for preserving authentic craftsmanship, our designers carefully select and work with materials to tell a story with every piece they create."}"
                                    </motion.p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Visual Quote Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={page?.metadata?.finalImage || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2670&auto=format&fit=crop"}
                        alt="Process"
                        fill
                        className="object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-[#480100]/50 backdrop-blur-[1px]" />

                <div className="relative z-10 text-center px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="space-y-6"
                    >
                        <div className="w-16 h-0.5 bg-white/50 mx-auto mb-10" />
                        <h3 className="text-3xl md:text-6xl font-vogue font-bold text-white uppercase tracking-[0.2em] leading-tight">
                            {page?.metadata?.finalQuote ? (
                                page.metadata.finalQuote.split('\n').map((line, i) => (
                                    <span key={i} className="block">
                                        {line}
                                    </span>
                                ))
                            ) : (
                                <>
                                    Preserving the past,<br />weaving the future.
                                </>
                            )}
                        </h3>
                        <div className="w-16 h-0.5 bg-white/50 mx-auto mt-10" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
