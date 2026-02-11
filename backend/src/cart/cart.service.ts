import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: Date;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

  constructor(
    private redisService: RedisService,
    private prisma: PrismaService,
  ) {}

  /**
   * Get cart for a session
   */
  async getCart(sessionId: string): Promise<Cart> {
    const data = await this.redisService.getCart(sessionId);
    if (!data) {
      return { items: [], updatedAt: new Date() };
    }
    return data;
  }

  /**
   * Add item to cart
   */
  async addItem(sessionId: string, productId: string, quantity: number): Promise<Cart> {
    // Verify product exists and get details
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, stock: true, images: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available`);
    }

    const cart = await this.getCart(sessionId);
    const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images?.[0],
      });
    }

    cart.updatedAt = new Date();
    await this.redisService.setCart(sessionId, cart, this.CART_TTL);
    return cart;
  }

  /**
   * Update item quantity
   */
  async updateQuantity(sessionId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex < 0) {
      throw new Error('Item not in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify stock
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true },
      });

      if (product && quantity > product.stock) {
        throw new Error(`Only ${product.stock} items available`);
      }

      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await this.redisService.setCart(sessionId, cart, this.CART_TTL);
    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(sessionId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = new Date();
    await this.redisService.setCart(sessionId, cart, this.CART_TTL);
    return cart;
  }

  /**
   * Clear entire cart
   */
  async clearCart(sessionId: string): Promise<void> {
    await this.redisService.deleteCart(sessionId);
  }

  /**
   * Merge guest cart into user cart (for lazy registration)
   */
  async mergeCart(fromSessionId: string, toSessionId: string): Promise<Cart> {
    const [guestCart, userCart] = await Promise.all([
      this.getCart(fromSessionId),
      this.getCart(toSessionId),
    ]);

    // Merge items from guest cart into user cart
    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        (item) => item.productId === guestItem.productId,
      );

      if (existingIndex >= 0) {
        // Add quantities together
        userCart.items[existingIndex].quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    userCart.updatedAt = new Date();
    
    // Save merged cart and delete guest cart
    await Promise.all([
      this.redisService.setCart(toSessionId, userCart, this.CART_TTL),
      this.redisService.deleteCart(fromSessionId),
    ]);

    this.logger.log(`Merged cart from ${fromSessionId} to ${toSessionId}`);
    return userCart;
  }

  /**
   * Get cart total
   */
  getCartTotal(cart: Cart): { subtotal: number; itemCount: number } {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
    return { subtotal, itemCount };
  }
}
