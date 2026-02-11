"use client";

import { FeaturedCollection } from "@/types/homepage";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeaturedGridProps {
    collections: FeaturedCollection[];
}

export default function FeaturedGrid({ collections }: FeaturedGridProps) {
    if (!collections || collections.length === 0) return null;

    return (
        <div className="space-y-16 py-12">
            {collections.map((collection) => (
                <section key={collection.id} className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{collection.title}</h2>
                            {collection.description && (
                                <p className="text-muted-foreground mt-2">{collection.description}</p>
                            )}
                        </div>
                        {/* Potential 'View All' link could go here */}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {collection.products.map((product) => (
                            <Card key={product.id} className="group overflow-hidden border-0 shadow-none">
                                <CardContent className="p-0 relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4">
                                    <Link href={`/products/${product.slug}`}>
                                        <Image
                                            src={product.images[0] || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        {/* Badges could be calculated here */}
                                        {product.salePrice && product.salePrice < product.price && (
                                            <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
                                                Sale
                                            </Badge>
                                        )}
                                    </Link>
                                </CardContent>
                                <CardFooter className="p-0 block">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{product.category?.name}</p>
                                            <h3 className="font-medium truncate pr-4" title={product.name}>
                                                <Link href={`/products/${product.slug}`} className="hover:underline">
                                                    {product.name}
                                                </Link>
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            {product.salePrice && product.salePrice < product.price ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-red-600">
                                                        ₦{product.salePrice.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        ₦{product.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-bold">
                                                    ₦{product.price.toLocaleString()}
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
