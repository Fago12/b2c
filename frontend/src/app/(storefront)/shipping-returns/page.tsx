"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, Truck, RotateCcw, ShieldCheck, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface CmsPage {
    id: string;
    title: string;
    content: string;
}

export default function ShippingReturnsPage() {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await fetchApi("/cms/shipping-returns");
                setPage(data);
            } catch (err) {
                console.error("Shipping Fetch Error:", err);
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

    const policies = [
        {
            icon: <Truck className="h-5 w-5" />,
            title: "Shipping Times",
            desc: "Domestic (US): 3-5 business days. International: 7-14 business days. All orders include tracking."
        },
        {
            icon: <RotateCcw className="h-5 w-5" />,
            title: "Returns",
            desc: "30-day return window for unworn items in original packaging. Returns are processed within 5 business days."
        },
        {
            icon: <Globe className="h-5 w-5" />,
            title: "International",
            desc: "We ship to over 50 countries. Please note that customs duties and taxes may apply depending on your region."
        },
        {
            icon: <ShieldCheck className="h-5 w-5" />,
            title: "Our Guarantee",
            desc: "We stand behind our craftsmanship. If your item has a defect, we will replace it free of charge."
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-24 pb-24">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-6">
                        {page?.title || "Shipping & Returns"}
                    </h1>
                    <div className="h-0.5 w-16 bg-[#480100] mx-auto mb-12" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 mb-24">
                    <div className="space-y-12">
                        {policies.slice(0, 2).map((policy, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3 text-[#480100]">
                                    {policy.icon}
                                    <h3 className="text-xs font-bold uppercase tracking-widest">{policy.title}</h3>
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed italic border-l border-slate-100 pl-6">
                                    {policy.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-12">
                        {policies.slice(2, 4).map((policy, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3 text-[#480100]">
                                    {policy.icon}
                                    <h3 className="text-xs font-bold uppercase tracking-widest">{policy.title}</h3>
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed italic border-l border-slate-100 pl-6">
                                    {policy.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50/50 p-12 md:p-20 border border-slate-100">
                    <div
                        className="prose prose-slate prose-lg max-w-none font-medium text-slate-600 leading-relaxed text-center italic"
                        dangerouslySetInnerHTML={{ __html: page?.content || "" }}
                    />
                </div>
            </div>
        </div>
    );
}
