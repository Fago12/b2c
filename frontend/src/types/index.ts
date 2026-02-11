export interface Attribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents/kobo
  images: string[];
  inStock: boolean;
  slug: string;
  category?: string;
  attributes?: Attribute[];
  tags?: string[];
  createdAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}


export interface ProductQuery {
  featured?: boolean;
  tags?: string | string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

