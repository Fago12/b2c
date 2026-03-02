export interface Attribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePriceUSD: number;
  salePriceUSD?: number;
  weightKG?: number;
  regional?: {
    basePrice: number;
    finalPrice: number;
    currency: string;
    symbol: string;
    exchangeRateUsed?: string;
  };
  images: string[];
  inStock: boolean;
  stock: number;
  slug: string;
  category?: string | Category;
  attributes?: Attribute[];
  tags?: string[];
  hasVariants?: boolean;
  createdAt?: Date;
  customizationOptions?: {
    embroidery?: { enabled: boolean; price: number };
    customColor?: { enabled: boolean };
    customerNote?: { enabled: boolean };
  };
  options?: Record<string, string[]>;
  variants?: Array<{
    id?: string;
    sku: string;
    priceUSD?: number;
    stock: number;
    options: Record<string, string>;
    image?: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  isComingSoon?: boolean;
  displayOrder?: number;
}


export interface ProductQuery {
  featured?: boolean;
  tags?: string | string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

