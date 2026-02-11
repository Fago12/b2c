import { ProductQuery } from "@/types";
import { Product } from "@/types";
import { ProductCard } from "@/components/common/ProductCard";
import { getProducts } from "@/lib/data";
// import { Skeleton } from "@/components/ui/skeleton"; // We'll implement loading state in a client wrapper or suspense if needed.
// For now, this is a Server Component, so it fetches directly.

interface ProductsSectionProps {
    title: string;
    query?: ProductQuery;
    limit?: number;
}

export async function ProductsSection({ title, query, limit }: ProductsSectionProps) {
    const products = await getProducts(query, limit);

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 tracking-tight">{title}</h2>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-10">No products found.</p>
                )}
            </div>
        </section>
    );
}
