"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCart((state) => state.addItem);

    // Format price helper (can be moved to utils later)
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 100);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if clicking button inside Link wrapper
        addItem(product);
        // Optional: Add toast notification here
    };

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border-none shadow-sm bg-card/50">
            <Link href={`/product/${product.slug}`} className="cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-t-lg">
                    <Image
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {!product.inStock && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                            Out of Stock
                        </Badge>
                    )}
                    {product.category && (
                        <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                            {product.category}
                        </Badge>
                    )}
                </div>
            </Link>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <Link href={`/product/${product.slug}`} className="hover:underline">
                        <CardTitle className="text-lg font-medium line-clamp-1">{product.name}</CardTitle>
                    </Link>
                    <span className="font-bold whitespace-nowrap text-primary">
                        {formatPrice(product.price)}
                    </span>
                </div>
                {product.description && (
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardFooter className="p-4 pt-auto mt-auto">
                <Button className="w-full" disabled={!product.inStock} size="sm" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
