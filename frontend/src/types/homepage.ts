export interface Announcement {
    id: string;
    message: string;
    ctaText?: string;
    ctaLink?: string;
    isActive: boolean;
    backgroundColor: string;
    textColor: string;
}

export interface HeroSection {
    id: string;
    title: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType: 'IMAGE' | 'VIDEO';
    isActive: boolean;
}

export interface MarqueeItem {
    id: string;
    icon?: string; // We'll map string to Lucide icon
    text: string;
    order: number;
    isActive: boolean;
}

export interface Product { // Simplified product for cards
    id: string;
    name: string;
    slug: string;
    basePriceUSD: number;
    salePriceUSD?: number;
    images: string[];
    category: { name: string };
    regional?: {
        basePrice: number;
        finalPrice: number;
        currency: string;
        symbol: string;
    };
}

export interface FeaturedCollection {
    id: string;
    title: string;
    description?: string;
    isActive: boolean;
    products: Product[];
}

export interface PromoBanner {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    targetAudience: 'MEN' | 'WOMEN' | 'ALL';
    isActive: boolean;
}

export type SectionType = 'ANNOUNCEMENT' | 'HERO' | 'MARQUEE' | 'FEATURED' | 'PROMO' | 'NEW_ARRIVALS' | 'MOST_POPULAR' | 'FLASH_SALE';

export interface HomepageSection {
    id: string;
    type: SectionType;
    order: number;
    data: any; // Type-specific data (Announcement | HeroSection | MarqueeItem[] | etc.)
}

export type HomepageData = HomepageSection[];
