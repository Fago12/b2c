import { StorefrontNav } from "@/components/layout/StorefrontNav";
import { Footer } from "@/components/layout/Footer";
import { getCategories } from "@/lib/data";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { GeoHydrator } from "@/components/common/GeoHydrator";

export const dynamic = 'force-dynamic';

export default async function StorefrontLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const categories = await getCategories();

    // Fetch announcement data
    let announcement = null;
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
        const res = await fetch(`${apiUrl}/homepage/announcement`, { next: { revalidate: 60 } });
        if (res.ok && res.status !== 204) {
            const text = await res.text();
            if (text) {
                announcement = JSON.parse(text);
            }
        }
    } catch (e) {
        console.error("Failed to fetch announcement for layout:", e);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <GeoHydrator />
            <StorefrontNav categories={categories} announcement={announcement} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}
