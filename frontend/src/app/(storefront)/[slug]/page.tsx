"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CmsPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    isActive: boolean;
}

export default function DynamicCmsPage() {
    const { slug } = useParams();
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                // Fetch the page by slug
                const data = await fetchApi(`/cms/${slug}`);
                if (!data || !data.isActive) {
                    setPage(null);
                } else {
                    setPage(data);
                }
            } catch (err) {
                console.error("CMS Page Fetch Error:", err);
                setPage(null);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;

    // If not found, Next.js handles it with notFound()
    if (!page) return notFound();

    return (
        <article className="min-h-screen bg-white">
            {/* Minimalist Header */}
            <div className="bg-[#480100]/5 py-20 md:py-32">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-vogue font-bold text-primary uppercase tracking-[0.2em] mb-4">
                        {page.title}
                    </h1>
                    <div className="h-0.5 w-16 bg-[#480100] mx-auto opacity-30" />
                </div>
            </div>

            {/* Page Content */}
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div
                    className={cn(
                        "max-w-3xl mx-auto prose prose-slate prose-headings:font-vogue prose-headings:uppercase prose-headings:tracking-widest",
                        "prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg",
                        "prose-a:text-[#480100] prose-a:font-bold hover:prose-a:underline"
                    )}
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </div>

            {/* Subtle Footer Accent */}
            <div className="container mx-auto px-4 pb-20">
                <div className="max-w-3xl mx-auto border-t border-slate-100 pt-8 flex justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground opacity-40">
                        Woven Kulture &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </article>
    );
}
