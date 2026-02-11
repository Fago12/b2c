import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative w-full h-[600px] bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Background Image Placeholder - ideally use one of the provided images or a dedicated hero image */}
            <div
                className="absolute inset-0 z-0 opacity-40 bg-[url('/images/products/Hoodie.jpg')] bg-cover bg-center"
                aria-hidden="true"
            />

            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
                    Redefining Elegance
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-sm">
                    Discover the latest collection from Woven Kulture. Premium quality, timeless design.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/shop">
                        <Button size="lg" className="text-lg px-8">
                            Shop Now
                        </Button>
                    </Link>
                    <Link href="/about">
                        <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-black">
                            Learn More
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
