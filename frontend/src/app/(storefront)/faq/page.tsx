"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CmsPage {
    id: string;
    title: string;
    content: string;
}

export default function FaqPage() {
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await fetchApi("/cms/faq");
                setPage(data);
            } catch (err) {
                console.error("FAQ Fetch Error:", err);
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

    // Placeholder FAQs since content is managed. 
    // Usually, you'd parse CMS content if it were JSON, but for now we'll assume the CMS provides the intro and maybe use the content as-is or supplement it.
    const faqs = [
        {
            q: "How long does shipping take?",
            a: "Standard shipping within the US takes 3-5 business days. International shipping varies by location but typically ranges from 7 to 14 business days."
        },
        {
            q: "Do you offer custom designs?",
            a: "Yes! We love collaborating on custom pieces. Please contact us via our contact form or email to start a conversation about your vision."
        },
        {
            q: "What is your return policy?",
            a: "We accept returns on unworn items in their original packaging within 30 days of delivery. Custom pieces and sale items are final sale."
        },
        {
            q: "How should I care for my woven garments?",
            a: "We recommend hand washing in cold water with mild detergent and laying flat to dry. Avoid direct sunlight during the drying process to preserve color vibrancy."
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-24 pb-24">
            <div className="container mx-auto px-4 py-16 md:py-24 text-center">
                <h1 className="text-4xl md:text-6xl font-vogue font-bold uppercase tracking-[0.2em] text-[#480100] mb-6">
                    {page?.title || "FAQ"}
                </h1>
                <div className="h-0.5 w-16 bg-[#480100] mx-auto mb-12" />
                <div
                    className="max-w-2xl mx-auto text-slate-500 font-medium italic mb-16"
                    dangerouslySetInnerHTML={{ __html: page?.content || "Common questions about our craftsmanship and services." }}
                />

                <div className="max-w-3xl mx-auto text-left space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-slate-100 last:border-0 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full py-6 flex items-center justify-between text-left group"
                            >
                                <span className={cn(
                                    "text-sm font-bold uppercase tracking-widest transition-colors",
                                    openIndex === index ? "text-[#480100]" : "text-black group-hover:text-[#480100]/60"
                                )}>
                                    {faq.q}
                                </span>
                                <div className="shrink-0 ml-4">
                                    {openIndex === index ? (
                                        <Minus className="h-4 w-4 text-[#480100]" />
                                    ) : (
                                        <Plus className="h-4 w-4 text-slate-300" />
                                    )}
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="pb-8 text-slate-500 font-medium leading-relaxed pr-8 italic">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
