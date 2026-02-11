import { Product, ProductQuery, Category } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getProducts(query?: ProductQuery, limit?: number): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch products");
    
    let products: any[] = await res.json();

    // Map Backend Product to Frontend Product Type
    products = products.map((p) => ({
      ...p,
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

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) {
       console.warn("Failed to fetch categories, status:", res.status);
       return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
