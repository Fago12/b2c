"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import AnnouncementBar from "../homepage/AnnouncementBar";
import { Category } from "@/types";
import { Announcement } from "@/types/homepage";

interface StorefrontNavProps {
    categories: Category[];
    announcement: Announcement | null;
}

export function StorefrontNav({ categories, announcement }: StorefrontNavProps) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Trigger glassmorphism when user starts scrolling (50px threshold)
            setScrolled(window.scrollY > 50);
        };

        // Check initial scroll position on mount
        handleScroll();

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Force fixed for Home at top with glass state for all else
    const wrapperClasses = isHome
        ? "fixed top-0 left-0"
        : "sticky top-0";

    return (
        <div className={`z-50 w-full transition-all duration-500 ease-in-out ${wrapperClasses}`}>
            <AnnouncementBar announcement={announcement} isScrolled={scrolled} />
            <Header categories={categories} isScrolled={scrolled} />
        </div>
    );
}
