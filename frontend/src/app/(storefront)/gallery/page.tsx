"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    Play,
    Maximize2,
    Tag,
    Camera,
    Layers,
    X
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface GalleryItem {
    id: string;
    title: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    tag?: string;
}

export default function GalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTag, setActiveTag] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    const tags = ['ALL', 'BTS', 'CAMPAIGN', 'COLLECTION', 'CRAFT'];

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await fetchApi('/gallery');
                setItems(data);
            } catch (err) {
                console.error("Gallery Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const filteredItems = activeTag === 'ALL'
        ? items
        : items.filter(item => item.tag === activeTag);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Immersing in the Kulture...</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Minimalist Header */}
            <div className="pt-24 pb-12 text-center container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-vogue font-bold text-primary uppercase tracking-[0.3em] mb-6">Gallery</h1>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest italic max-w-xl mx-auto border-t border-slate-100 pt-6">
                    A visual journey through craftsmanship, heritage, and the soul of Woven Kulture.
                </p>
            </div>

            {/* Integrated Filter Bar */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 container mx-auto px-4">
                {tags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={cn(
                            "px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border rounded-none",
                            activeTag === tag
                                ? "bg-[#480100] text-white border-[#480100] shadow-lg shadow-[#480100]/20"
                                : "bg-transparent text-muted-foreground border-slate-100 hover:border-primary hover:text-primary"
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Visual Grid */}
            <div className="container mx-auto px-4 pb-24">
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="relative group cursor-pointer break-inside-avoid overflow-hidden bg-slate-50"
                            onClick={() => setSelectedItem(item)}
                        >
                            {item.type === 'IMAGE' ? (
                                <Image
                                    src={item.url}
                                    alt={item.title || "Gallery Item"}
                                    width={600}
                                    height={800}
                                    className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="relative aspect-[9/16] bg-slate-900 flex items-center justify-center">
                                    <video
                                        src={item.url}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                        muted
                                        loop
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-125 transition-transform">
                                            <Play className="h-6 w-6 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 z-20">
                                <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-none rounded-none text-[8px] tracking-widest uppercase">
                                        {item.tag || 'Moment'}
                                    </Badge>
                                    <h3 className="text-white font-vogue font-bold uppercase tracking-widest text-lg">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox / Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors z-50"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="max-w-5xl w-full max-h-[85vh] relative flex items-center justify-center">
                            {selectedItem.type === 'IMAGE' ? (
                                <Image
                                    src={selectedItem.url}
                                    alt={selectedItem.title}
                                    width={1400}
                                    height={1000}
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                />
                            ) : (
                                <video
                                    src={selectedItem.url}
                                    className="max-w-full max-h-full shadow-2xl"
                                    controls
                                    autoPlay
                                />
                            )}
                        </div>
                    </div>

                    <div className="p-12 text-center space-y-2">
                        <p className="text-[#F7DFB9] font-vogue font-bold text-2xl uppercase tracking-[0.3em]">{selectedItem.title}</p>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{selectedItem.tag}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
