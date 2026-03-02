import { Product, ProductQuery, Category } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function getProducts(query?: ProductQuery, limit?: number): Promise<Product[]> {
  try {
    const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch products");
    
    let products: any[] = await res.json();

    // Map Backend Product to Frontend Product Type
    products = products.map((p) => ({
      ...p,
      price: p.basePrice, // Safety mapping for legacy components
      category: p.category?.name || "Uncategorized", // Map nested category object to string name
      inStock: p.stock > 0,
    }));

    // Client-side Filtering (since backend findAll returns everything)
    if (query?.featured) {
      products = products.filter(p => p.tags?.includes("featured"));
    }
    
    if (query?.tags) {
       const tagFilter = Array.isArray(query.tags) ? query.tags : [query.tags];
       // Check if product intersects with any of the requested tags
       products = products.filter(p => {
          if (tagFilter.includes("new") && p.tags?.includes("new")) return true;
          if (tagFilter.includes("bestseller") && p.tags?.includes("bestseller")) return true;
          return false;
       });
    }

    if (limit) {
      products = products.slice(0, limit);
    }

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${apiUrl}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const product = await res.json();
    return {
      ...product,
      price: product.basePrice,
      category: product.category?.name || "Uncategorized",
      inStock: product.stock > 0,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${apiUrl}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getOrder(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${apiUrl}/orders/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch order");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}
