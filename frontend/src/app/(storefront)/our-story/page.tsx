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
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const imageTranslateY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <motion.div ref={containerRef} className="bg-[#FAF9F6] min-h-[200vh]">
            {/* Header Sticky Container */}
            <section className="sticky top-0 h-screen flex flex-col md:flex-row items-center overflow-hidden">

                {/* Left Side: Content */}
                <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-8 md:p-24 space-y-8 z-10 bg-[#FAF9F6]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-7xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-4">
                            {page?.title || "Our Story"}
                        </h1>
                        <div className="h-0.5 w-24 bg-[#480100] mb-12" />
                    </motion.div>

                    <motion.div
                        style={{ opacity: textOpacity }}
                        className="prose prose-slate prose-lg max-w-xl font-medium text-slate-600 leading-relaxed italic"
                        dangerouslySetInnerHTML={{ __html: page?.content || "" }}
                    />
                </div>

                {/* Right Side: Parallax Image */}
                <div className="w-full md:w-1/2 h-full relative overflow-hidden">
                    <motion.div
                        style={{ y: imageTranslateY }}
                        className="absolute inset-0 w-full h-[120%]"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1590736962030-cf178f69f20e?q=80&w=2671&auto=format&fit=crop"
                            alt="Craftsmanship"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-[#480100]/10 mix-blend-multiply" />
                    </motion.div>
                </div>
            </section>

            {/* Second Section: Designers / Designers Story */}
            <section className="relative min-h-screen bg-white py-24 md:py-48 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-32">

                        {/* Designers Content */}
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <motion.h2
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-4xl md:text-6xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-8"
                            >
                                Designers
                            </motion.h2>
                            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
                                <p>
                                    At Woven Kulture, our designers are the heart and soul of everything we create.
                                    Each member of our team brings a unique background, rich in artistry and skilled craftsmanship,
                                    blending traditional methods with innovative design.
                                </p>
                                <p className="italic border-l-2 border-[#480100] pl-6 py-2">
                                    "With a shared passion for preserving authentic craftsmanship, our designers carefully select
                                    and work with materials to tell a story with every piece they create."
                                </p>
                            </div>
                        </div>

                        {/* Designers Images */}
                        <div className="lg:w-1/2 order-1 lg:order-2 grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="aspect-[3/4] relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
                            >
                                <Image
                                    src="https://images.unsplash.com/photo-1487309078313-fe80c3e15805?q=80&w=2512&auto=format&fit=crop"
                                    alt="Designer Profile"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="aspect-[3/4] relative overflow-hidden mt-12 grayscale hover:grayscale-0 transition-all duration-700"
                            >
                                <Image
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop"
                                    alt="Creative Process"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Visual Quote Section */}
            <section className="relative h-[60vh] md:h-screen flex items-center justify-center overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2670&auto=format&fit=crop"
                    alt="Process"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-[#480100]/40 backdrop-blur-[2px]" />
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-2xl md:text-5xl font-vogue font-bold text-white uppercase tracking-[0.3em] leading-tight"
                    >
                        Preserving the past,<br />weaving the future.
                    </motion.p>
                </div>
            </section>
        </motion.div>
    );
}
