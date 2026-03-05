"use client";

import { FeaturedCollection } from "@/types/homepage";
import { ProductCard } from "@/components/common/ProductCard";

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
                            <div key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
