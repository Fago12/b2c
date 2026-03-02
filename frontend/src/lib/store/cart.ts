import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { cartApi, ServerCart } from '@/lib/api/cart';
import { toast } from 'sonner';
export interface CartItem {
  id: string; // Composite ID: productId-variantId
  productId: string;
  variantId?: string;
  cartItemId: string;
  quantity: number;
  price: number;
  unitPriceUSD: number;
  unitPriceFinal: number;
  customization: any;
  name: string;
  images: string[];
}

interface CartState {
  items: CartItem[];
  displayCurrency: string;
  displaySubtotal: number;
  displayTotal: number;
  chargeCurrency: string;
  chargeTotal: number;
  
  // Legacy Aliases
  total: number;
  subtotal: number;
  currency: string;

  regionCode: string;
  shippingCost: number;
  isLoading: boolean;
  
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, customization?: any, variantId?: string) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
}

const mapServerCartToState = (cart: any) => ({
  items: (cart.items || []).map((item: any) => ({
    id: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
    productId: item.productId,
    variantId: item.variantId,
    cartItemId: item.productId,
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    unitPriceUSD: Number(item.unitPriceUSD || 0),
    unitPriceFinal: Number(item.unitPriceFinal || 0),
    customization: item.customization,
    name: item.name || 'Product',
    images: item.image ? [item.image] : [],
  })),
  displayCurrency: cart.displayCurrency || 'USD',
  displaySubtotal: Number(cart.displaySubtotal || 0),
  displayTotal: Number(cart.displayTotal || 0),
  chargeCurrency: cart.chargeCurrency || 'USD',
  chargeTotal: Number(cart.chargeTotal || 0),
  
  // Legacy Mappings
  currency: cart.displayCurrency || 'USD',
  subtotal: Number(cart.displaySubtotal || 0),
  total: Number(cart.displayTotal || 0),
  
  shippingCost: Number(cart.shippingCost || 0),
  regionCode: cart.regionCode || 'US',
});

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      displayCurrency: 'USD',
      displaySubtotal: 0,
      displayTotal: 0,
      chargeCurrency: 'USD',
      chargeTotal: 0,
      currency: 'USD',
      subtotal: 0,
      total: 0,
      shippingCost: 0,
      regionCode: 'US',
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.getCart();
          set(mapServerCartToState(cart));
        } catch (error) {
          console.error('Failed to fetch cart', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      addItem: async (productId, quantity = 1, customization, variantId) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.addItem(productId, quantity, customization, variantId);
          set(mapServerCartToState(cart));
        } catch (error: any) {
          // If the backend threw an error (e.g. out of stock), show it
          toast.error(error.message || "Failed to add to bag");
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (productId, variantId) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.removeItem(productId, variantId);
          set(mapServerCartToState(cart));
        } catch (error) {
          console.error('Failed to remove item', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (productId, quantity, variantId) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.updateQuantity(productId, quantity, variantId);
          set(mapServerCartToState(cart));
        } catch (error: any) {
          toast.error(error.message || "Failed to update quantity");
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartApi.clearCart();
          set({ items: [], subtotal: 0, shippingCost: 0, total: 0 });
        } catch (error) {
          console.error('Failed to clear cart', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'shopping-cart-v2', // Change name to avoid conflicts with old structure
    }
  )
);
