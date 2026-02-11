import { fetchApi } from "@/lib/api";
import { HomepageData } from "@/types/homepage";
import AnnouncementBar from "@/components/homepage/AnnouncementBar";
import HeroBanner from "@/components/homepage/HeroBanner";
import MarqueeStrip from "@/components/homepage/MarqueeStrip";
import FeaturedGrid from "@/components/homepage/FeaturedGrid";
import PromoSection from "@/components/homepage/PromoSection";

// This is a Server Component by default in App Router
export default async function Home() {
  let homepageData: HomepageData | null = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/homepage`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds (active content)
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

  return (
    <div className="flex flex-col gap-0 pb-12">
      {Array.isArray(homepageData) ? homepageData.map((section) => {
        switch (section.type) {
          case 'ANNOUNCEMENT':
            return <AnnouncementBar key={section.id} announcement={section.data} />;

          case 'HERO':
            return <HeroBanner key={section.id} hero={section.data} />;

          case 'MARQUEE':
            return <MarqueeStrip key={section.id} items={section.data} />;

          case 'FEATURED':
            return (
              <FeaturedGrid
                key={section.id}
                collections={section.data ? [section.data] : []}
              />
            );

          case 'PROMO':
            return <PromoSection key={section.id} promos={section.data} />;

          case 'NEW_ARRIVALS':
            return (
              <FeaturedGrid
                key={section.id}
                collections={[{
                  id: 'new-arrivals',
                  title: section.data.title || 'New Arrivals',
                  description: 'Explore the latest additions to our collection.',
                  isActive: true,
                  products: section.data.products || []
                }]}
              />
            );

          default:
            console.warn(`Unknown section type: ${section.type}`);
            return null;
        }
      }) : (
        <div className="p-8 text-center text-muted-foreground">
          Invalid homepage data format.
        </div>
      )}
    </div>
  );
}
