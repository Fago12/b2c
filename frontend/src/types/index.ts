export interface Attribute {
  name: string;
  value: string;
}

export interface Color {
  id: string;
  name: string;
  hexCode: string;
}

export interface Pattern {
  id: string;
  name: string;
  previewImageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePriceUSD_cents: number;
  salePriceUSD_cents?: number;
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
  options?: Record<string, string[]>;
  productImages?: Array<{ id: string; imageUrl: string; sortOrder: number }>;
  variants?: Array<{
    id: string;
    sku: string;
    priceUSD_cents?: number;
    salePriceUSD_cents?: number;
    stock: number;
    size?: string;
    colorId?: string;
    color?: Color;
    patternId?: string;
    pattern?: Pattern;
    imageUrl?: string;
    images?: Array<{ id: string; imageUrl: string; sortOrder: number }>;
  }>;
  customizationOptions?: {
    embroidery?: { enabled: boolean; price: number };
    customColor?: { enabled: boolean };
    customerNote?: { enabled: boolean };
  };
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

