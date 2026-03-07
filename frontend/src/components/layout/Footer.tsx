"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { BrandFooterLogo } from "./BrandFooterLogo";
import { cn } from "@/lib/utils";
import { RegionSelector } from "./RegionSelector";

export function Footer() {
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

    return (
        <footer className="relative z-20 border-t border-gray-200/50 pt-12 md:pt-16 pb-4 mt-auto overflow-hidden bg-[#F8F7F4]">
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

            <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-12 lg:gap-16">
                    {/* Brand Logo Section */}
                    <div className="w-full lg:w-1/2 max-w-[360px]">
                        <Link href="/" className="block group">
                            <BrandFooterLogo
                                className="w-full h-auto transition-opacity duration-300 group-hover:opacity-80"
                                color="#480100"
                            />
                        </Link>
                    </div>

                    {/* Links Sections Container */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 w-full lg:w-auto">
                        {/* Navigation Column */}
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold uppercase tracking-[0.3em] text-black font-vogue">Navigation</h4>
                            <ul className="space-y-2 font-sans">
                                <li>
                                    <Link href="/shop" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Shop
                                    </Link>
                                </li>
                                <li className="space-y-2">
                                    <button
                                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                        className="flex items-center gap-2 text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors group"
                                    >
                                        Categories
                                        {isCategoriesOpen ? (
                                            <Minus className="h-3 w-3 transition-transform" />
                                        ) : (
                                            <Plus className="h-3 w-3 transition-transform group-hover:rotate-90 duration-300" />
                                        )}
                                    </button>
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300 ease-in-out pl-4 space-y-2 border-l border-gray-200 font-sans",
                                        isCategoriesOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0"
                                    )}>
                                        <Link href="/shop?category=clothing" className="block text-[12px] uppercase font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                                            Clothing
                                        </Link>
                                        <Link href="/shop?category=accessories" className="block text-[12px] uppercase font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                                            Accessories
                                        </Link>
                                        <Link href="/shop" className="block text-[12px] uppercase font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                                            All Collections
                                        </Link>
                                        <Link href="/categories/mens" className="block text-[12px] uppercase font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                                            Men's Kulture
                                        </Link>
                                        <Link href="/categories/womens" className="block text-[12px] uppercase font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                                            Women's Kulture
                                        </Link>
                                        <Link href="/gallery" className="block text-[12px] uppercase font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                                            The Gallery / BTS
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <Link href="/about" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        About
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Info Column */}
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold uppercase tracking-[0.3em] text-black font-vogue">Info</h4>
                            <ul className="space-y-2 font-sans">
                                <li>
                                    <Link href="/contact" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Support
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Our Story
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shipping-policy" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Shipping & Returns
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy-policy" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Privacy Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Social Column */}
                        <div className="space-y-4 col-span-2 md:col-span-1">
                            <h4 className="font-vogue text-[15px] font-bold uppercase tracking-[0.2em] text-black">Social</h4>
                            <ul className="space-y-2 font-sans">
                                <li>
                                    <a href="#" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Facebook
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        Instagram
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-[13px] uppercase font-bold tracking-[0.2em] text-black/50 hover:text-black transition-colors">
                                        X/Twitter
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="w-full lg:w-1/3 space-y-4">
                        <h4 className="font-vogue text-[15px] font-bold uppercase tracking-[0.2em] text-black">Stay in the Loop</h4>
                        <p className="text-[13px] text-black/60 font-sans">
                            Get updates on new collections and exclusive offers.
                        </p>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const email = new FormData(form).get('email') as string;
                                try {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/newsletter/subscribe`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email, source: 'footer' })
                                    });
                                    if (res.ok) {
                                        alert('Thanks for subscribing!');
                                        form.reset();
                                    } else {
                                        alert('Failed to subscribe. Please try again.');
                                    }
                                } catch (err) {
                                    alert('An error occurred. Please try again.');
                                }
                            }}
                            className="flex flex-col sm:flex-row gap-2 mt-4"
                        >
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="YOUR EMAIL ADDRESS"
                                className="flex-1 bg-white/50 border border-black/10 px-4 py-3 text-[12px] uppercase font-bold tracking-[0.1em] focus:outline-none focus:border-black/30 placeholder:text-black/30 w-full"
                            />
                            <button
                                type="submit"
                                className="bg-[#480100] text-white px-8 py-3 text-[11px] uppercase font-bold tracking-[0.2em] hover:bg-black transition-colors duration-300"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-gray-400/30 flex justify-center items-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/40 font-sans">
                        © {new Date().getFullYear()} Woven Kulture
                    </p>
                </div>
            </div>
        </footer>
    );
}
