import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Woven Kulture</h3>
                        <p className="text-muted-foreground text-sm">
                            Your destination for quality fashion and style. Redefining elegance, one thread at a time.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/shop" className="hover:text-primary">All Products</Link></li>
                            <li><Link href="/shop?category=new-arrivals" className="hover:text-primary">New Arrivals</Link></li>
                            <li><Link href="/shop?category=featured" className="hover:text-primary">Featured</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-primary">FAQs</Link></li>
                            <li><Link href="/shipping" className="hover:text-primary">Shipping & Returns</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Stay Connected</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe to our newsletter for updates.
                        </p>
                        {/* Newsletter input placeholder */}
                        <div className="flex gap-2">
                            {/* Ideally use Input + Button here */}
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Woven Kulture. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
