import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommercePricingService } from '../commerce/pricing/pricing.service';
import { ShippingService } from '../commerce/shipping/shipping.service';
import { CustomizationService } from '../commerce/customization/customization.service';
import { CurrencyService } from '../commerce/currency/currency.service';
import { RegionService } from '../commerce/region/region.service';
export interface CartItem {
    productId: string;
    variantId?: string;
    selectedOptions?: any;
    quantity: number;
    unitPriceUSD: number;
    unitSalePriceUSD?: number;
    exchangeRateUsed: string;
    unitPriceFinal: number;
    price: number;
    weightKG: number;
    customization: any;
    name?: string;
    image?: string;
}
export interface Cart {
    items: CartItem[];
    regionCode: string;
    displayCurrency: string;
    displaySubtotal: number;
    displayTotal: number;
    chargeCurrency: string;
    chargeTotal: number;
    exchangeRateUsed: string;
    shippingCost: number;
    updatedAt: Date;
}
export declare class CartService {
    private redisService;
    private prisma;
    private pricingService;
    private shippingService;
    private customizationService;
    private currencyService;
    private readonly regionService;
    private readonly logger;
    private readonly CART_TTL;
    constructor(redisService: RedisService, prisma: PrismaService, pricingService: CommercePricingService, shippingService: ShippingService, customizationService: CustomizationService, currencyService: CurrencyService, regionService: RegionService);
    getCart(sessionId: string, regionCode?: string): Promise<Cart>;
    addItem(sessionId: string, productId: string, quantity: number, customization?: any, regionCode?: string, variantId?: string): Promise<Cart>;
    updateQuantity(sessionId: string, productId: string, quantity: number, regionCode?: string, variantId?: string): Promise<Cart>;
    recalculateCart(sessionId: string, cart: Cart): Promise<Cart>;
    removeItem(sessionId: string, productId: string, regionCode?: string, variantId?: string): Promise<Cart>;
    clearCart(sessionId: string): Promise<void>;
    mergeCart(fromSessionId: string, toSessionId: string, regionCode?: string): Promise<Cart>;
    setRegion(sessionId: string, regionCode: string): Promise<Cart>;
    getCartTotal(cart: Cart): {
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
    };
}
