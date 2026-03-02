"use client";

import { FeaturedCollection } from "@/types/homepage";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface FeaturedGridProps {
    collections: FeaturedCollection[];
}

export default function FeaturedGrid({ collections }: FeaturedGridProps) {
    if (!collections || collections.length === 0) return null;

    return (
        <div className="space-y-16 py-12">
            {collections.map((collection) => (
                <section key={collection.id} className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-vogue font-bold tracking-[0.1em] text-primary uppercase mb-2">{collection.title}</h2>
                        {collection.description && (
                            <p className="text-xs text-foreground/50 font-medium tracking-widest max-w-xl uppercase">{collection.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {collection.products.map((product) => (
                            <Card key={product.id} className="group overflow-hidden border-0 shadow-none bg-transparent rounded-none">
                                <CardContent className="p-0 relative aspect-[4/5] bg-slate-50 rounded-none overflow-hidden mb-4">
                                    <Link href={`/products/${product.slug}`}>
                                        <Image
                                            src={product.images[0] || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                    </Link>
                                </CardContent>
                                <CardFooter className="p-0 block text-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{product.category?.name}</p>
                                        <h3 className="text-sm font-medium text-primary uppercase tracking-widest truncate group-hover:text-primary/60 transition-colors">
                                            <Link href={`/products/${product.slug}`}>
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center justify-center gap-2">
                                            {product.regional ? (
                                                <>
                                                    <span className="text-sm font-bold text-primary">
                                                        {formatPrice(product.regional.finalPrice, product.regional.currency || 'USD')}
                                                    </span>
                                                    {product.regional.finalPrice < product.regional.basePrice && (
                                                        <span className="text-xs text-muted-foreground line-through opacity-50">
                                                            {formatPrice(product.regional.basePrice, product.regional.currency || 'USD')}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm font-bold text-primary tracking-tighter">
                                                    {formatPrice(product.basePriceUSD || 0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
