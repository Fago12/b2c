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

    const steps = [
        {
            icon: <Wind className="h-6 w-6" />,
            title: "Sourcing",
            desc: "We select only the finest raw fibers from local sustainable farms."
        },
        {
            icon: <Scissors className="h-6 w-6" />,
            title: "Spinning",
            desc: "Traditional hand-spinning techniques ensure strength and texture."
        },
        {
            icon: <Hammer className="h-6 w-6" />,
            title: "Weaving",
            desc: "Master weavers spend weeks on a single piece using ancient looms."
        },
        {
            icon: <Heart className="h-6 w-6" />,
            title: "Finishing",
            desc: "Every item is hand-inspected and finished with artisan care."
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-24 pb-24">
            {/* Split Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-7xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-6">
                        {page?.title || "Our Craft"}
                    </h1>
                    <div className="h-0.5 w-24 bg-[#480100] mb-8" />
                    <div
                        className="prose prose-slate prose-lg font-medium text-slate-600 leading-relaxed italic"
                        dangerouslySetInnerHTML={{ __html: page?.content || "" }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative aspect-square md:aspect-[4/3] overflow-hidden"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1605652573215-64906f25be25?q=80&w=2670&auto=format&fit=crop"
                        alt="Weaving Loom"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 border-[20px] border-white/10" />
                </motion.div>
            </section>

            {/* The Process - Icon Grid */}
            <section className="bg-slate-50 py-24 md:py-32">
                <div className="container mx-auto px-4 text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-4">The Process</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">From Fiber to Fine Art</p>
                </div>

                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white shadow-xl shadow-[#480100]/5 flex items-center justify-center mx-auto mb-6 text-[#480100] group-hover:bg-[#480100] group-hover:text-white transition-all duration-500">
                                {step.icon}
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">{step.title}</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Video / Visual Detail Section */}
            <section className="container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-stretch">
                    <div className="flex-1 relative aspect-video bg-slate-900 overflow-hidden">
                        {/* Placeholder for video as requested */}
                        <Image
                            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2680&auto=format&fit=crop"
                            alt="Detail Works"
                            fill
                            className="object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border border-white/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent translate-x-1" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 bg-[#480100] p-12 flex flex-col justify-center gap-6">
                        <h3 className="text-2xl font-vogue font-bold text-[#F7DFB9] uppercase tracking-widest">Mastery in every thread</h3>
                        <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                            "Our weaving technique is passed down through seven generations,
                            ensuring that the soul of the artisan lives on in every garment."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
