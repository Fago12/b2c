const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ServerCartItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface ServerCart {
  items: ServerCartItem[];
  updatedAt: string;
  sessionId: string;
}

export const cartApi = {
  /**
   * Get cart from server
   */
  async getCart(): Promise<ServerCart> {
    const response = await fetch(`${API_URL}/cart`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    return response.json();
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity: number = 1): Promise<ServerCart> {
    const response = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add item' }));
      throw new Error(error.message || 'Failed to add item');
    }
    return response.json();
  },

  /**
   * Update item quantity
   */
  async updateQuantity(productId: string, quantity: number): Promise<ServerCart> {
    const response = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update quantity' }));
      throw new Error(error.message || 'Failed to update quantity');
    }
    return response.json();
  },

  /**
   * Remove item from cart
   */
  async removeItem(productId: string): Promise<ServerCart> {
    const response = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to remove item');
    }
    return response.json();
  },

  /**
   * Clear cart
   */
  async clearCart(): Promise<void> {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  },

  /**
   * Merge guest cart to user cart (for when user logs in)
   */
  async mergeCart(fromSessionId: string): Promise<ServerCart> {
    const response = await fetch(`${API_URL}/cart/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fromSessionId }),
    });
    if (!response.ok) {
      throw new Error('Failed to merge cart');
    }
    return response.json();
  },
};

export default cartApi;
