"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = CartService_1 = class CartService {
    redisService;
    prisma;
    logger = new common_1.Logger(CartService_1.name);
    CART_TTL = 30 * 24 * 60 * 60;
    constructor(redisService, prisma) {
        this.redisService = redisService;
        this.prisma = prisma;
    }
    async getCart(sessionId) {
        const data = await this.redisService.getCart(sessionId);
        if (!data) {
            return { items: [], updatedAt: new Date() };
        }
        return data;
    }
    async addItem(sessionId, productId, quantity) {
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
        }
        else {
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
    async updateQuantity(sessionId, productId, quantity) {
        const cart = await this.getCart(sessionId);
        const itemIndex = cart.items.findIndex((item) => item.productId === productId);
        if (itemIndex < 0) {
            throw new Error('Item not in cart');
        }
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
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
    async removeItem(sessionId, productId) {
        const cart = await this.getCart(sessionId);
        cart.items = cart.items.filter((item) => item.productId !== productId);
        cart.updatedAt = new Date();
        await this.redisService.setCart(sessionId, cart, this.CART_TTL);
        return cart;
    }
    async clearCart(sessionId) {
        await this.redisService.deleteCart(sessionId);
    }
    async mergeCart(fromSessionId, toSessionId) {
        const [guestCart, userCart] = await Promise.all([
            this.getCart(fromSessionId),
            this.getCart(toSessionId),
        ]);
        for (const guestItem of guestCart.items) {
            const existingIndex = userCart.items.findIndex((item) => item.productId === guestItem.productId);
            if (existingIndex >= 0) {
                userCart.items[existingIndex].quantity += guestItem.quantity;
            }
            else {
                userCart.items.push(guestItem);
            }
        }
        userCart.updatedAt = new Date();
        await Promise.all([
            this.redisService.setCart(toSessionId, userCart, this.CART_TTL),
            this.redisService.deleteCart(fromSessionId),
        ]);
        this.logger.log(`Merged cart from ${fromSessionId} to ${toSessionId}`);
        return userCart;
    }
    getCartTotal(cart) {
        const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
        return { subtotal, itemCount };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = CartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map