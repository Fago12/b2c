import { fetchApi } from '@/lib/api';

export interface ServerCartItem {
  productId: string;
  quantity: number;
  unitPriceUSD: number;
  exchangeRateUsed: number;
  unitPriceFinal: number;
  price: number; 
  customization: any;
  name?: string;
  image?: string;
}

export interface ServerCart {
  items: ServerCartItem[];
  regionCode: string;
  currency: string;
  exchangeRateUsed: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  updatedAt: string;
}

export const cartApi = {
  /**
   * Get cart from server
   */
  async getCart(): Promise<ServerCart> {
    return fetchApi('/cart');
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity: number = 1, customization?: any, variantId?: string): Promise<ServerCart> {
    return fetchApi('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, customization, variantId }),
    });
  },

  /**
   * Update item quantity
   */
  async updateQuantity(productId: string, quantity: number, variantId?: string): Promise<ServerCart> {
    return fetchApi(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, variantId }),
    });
  },

  /**
   * Remove item from cart
   */
  async removeItem(productId: string, variantId?: string): Promise<ServerCart> {
    const url = variantId 
      ? `/cart/items/${productId}?variantId=${variantId}`
      : `/cart/items/${productId}`;
      
    return fetchApi(url, {
      method: 'DELETE',
    });
  },

  /**
   * Clear cart
   */
  async clearCart(): Promise<void> {
    return fetchApi('/cart', {
      method: 'DELETE',
    });
  },

  /**
   * Merge guest cart to user cart (for when user logs in)
   */
  async mergeCart(fromSessionId: string): Promise<ServerCart> {
    return fetchApi('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ fromSessionId }),
    });
  },
};

export default cartApi;
