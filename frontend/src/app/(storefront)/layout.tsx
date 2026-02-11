import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCategories } from "@/lib/data";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default async function StorefrontLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const categories = await getCategories();

    return (
        <div className="flex flex-col min-h-screen">
            <Header categories={categories} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}
