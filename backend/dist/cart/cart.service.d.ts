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
export declare class CartService {
    private redisService;
    private prisma;
    private readonly logger;
    private readonly CART_TTL;
    constructor(redisService: RedisService, prisma: PrismaService);
    getCart(sessionId: string): Promise<Cart>;
    addItem(sessionId: string, productId: string, quantity: number): Promise<Cart>;
    updateQuantity(sessionId: string, productId: string, quantity: number): Promise<Cart>;
    removeItem(sessionId: string, productId: string): Promise<Cart>;
    clearCart(sessionId: string): Promise<void>;
    mergeCart(fromSessionId: string, toSessionId: string): Promise<Cart>;
    getCartTotal(cart: Cart): {
        subtotal: number;
        itemCount: number;
    };
}
