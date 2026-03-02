import { HomepageData } from "@/types/homepage";
import HeroBanner from "@/components/homepage/HeroBanner";
import MarqueeStrip from "@/components/homepage/MarqueeStrip";
import FeaturedGrid from "@/components/homepage/FeaturedGrid";
import PromoSection from "@/components/homepage/PromoSection";
import FlashSaleBanner from "@/components/homepage/FlashSaleBanner";
import ProductSwiper from "@/components/homepage/ProductSwiper";
import CategoryShowcase from "@/components/homepage/CategoryShowcase";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import { REGION_COOKIE_NAME } from "@/lib/region";

// This is a Server Component by default in App Router
export default async function Home() {
  let homepageData: HomepageData | null = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not defined');

    const cookieStore = await cookies();
    const regionCode = cookieStore.get(REGION_COOKIE_NAME)?.value || 'US';

    const res = await fetch(`${apiUrl}/homepage`, {
      headers: {
        'x-region-code': regionCode
      },
      next: { revalidate: 0 } // Ensure it's never cached for layout sync
    });

    if (res.ok) {
      homepageData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
  }

  if (!homepageData || homepageData.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Store content is coming soon.</p>
      </div>
    );
  }

  // Find the first HERO section to determine the parallax split
  const firstHeroIndex = homepageData.findIndex(s => s.type === 'HERO');

  // Separate sections into three buckets
  const preHeroSections = firstHeroIndex !== -1 ? homepageData.slice(0, firstHeroIndex) : [];
  const heroSection = firstHeroIndex !== -1 ? homepageData[firstHeroIndex] : null;
  const postHeroSections = firstHeroIndex !== -1 ? homepageData.slice(firstHeroIndex + 1) : homepageData;

  const renderSection = (section: any) => {
    switch (section.type) {
      case 'MARQUEE':
        return <MarqueeStrip key={section.id} items={section.data} />;
      case 'FEATURED':
        return <FeaturedGrid key={section.id} collections={section.data ? [section.data] : []} />;
      case 'PROMO':
        return <PromoSection key={section.id} promos={section.data} />;
      case 'NEW_ARRIVALS':
        return (
          <ProductSwiper
            key={section.id}
            title={section.data.title || 'New Arrivals'}
            description="Explore our latest collection of premium African-inspired fashion."
            products={section.data.products || []}
          />
        );
      case 'MOST_POPULAR':
        return (
          <ProductSwiper
            key={section.id}
            title={section.data.title || 'Most Popular'}
            description="The styles our community is loving right now."
            products={section.data.products || []}
          />
        );
      case 'FLASH_SALE':
        return (
          <FlashSaleBanner
            key={section.id}
            title={section.data.title}
            description={section.data.description}
            endsAt={section.data.endsAt}
            products={section.data.products}
          />
        );
      case 'CATEGORIES':
        return <CategoryShowcase key={section.id} categories={section.data} />;
      case 'HERO':
        // If we are rendering in a list, normal HERO is just the banner
        // But we handle the parallax HERO specifically below
        return null;
      default:
        console.warn(`Unknown section type: ${section.type}`);
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-0">
      {/* 1. Pre-Hero Content (Relative, scrolls away) */}
      {preHeroSections.length > 0 && (
        <div className="relative z-20 bg-background">
          {preHeroSections.map(renderSection)}
        </div>
      )}

      {/* 2. The Hero (Fixed Parallax Background) */}
      {heroSection && (
        <HeroBanner hero={heroSection.data} />
      )}

      {/* 3. Scrolling Foreground Content */}
      <div className={cn(
        "relative z-10 bg-background shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pb-12",
        heroSection ? "mt-[100dvh]" : "mt-0"
      )}>
        {postHeroSections.map(renderSection)}
      </div>
    </div>
  );
}
