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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../commerce/pricing/pricing.service");
const shipping_service_1 = require("../commerce/shipping/shipping.service");
const customization_service_1 = require("../commerce/customization/customization.service");
const currency_service_1 = require("../commerce/currency/currency.service");
const region_service_1 = require("../commerce/region/region.service");
const decimal_js_1 = __importDefault(require("decimal.js"));
let CartService = CartService_1 = class CartService {
    redisService;
    prisma;
    pricingService;
    shippingService;
    customizationService;
    currencyService;
    regionService;
    logger = new common_1.Logger(CartService_1.name);
    CART_TTL = 30 * 24 * 60 * 60;
    constructor(redisService, prisma, pricingService, shippingService, customizationService, currencyService, regionService) {
        this.redisService = redisService;
        this.prisma = prisma;
        this.pricingService = pricingService;
        this.shippingService = shippingService;
        this.customizationService = customizationService;
        this.currencyService = currencyService;
        this.regionService = regionService;
    }
    async getCart(sessionId, regionCode = 'US') {
        this.logger.debug(`[getCart] Fetching cart for session ${sessionId}, region: ${regionCode}`);
        const data = await this.redisService.getCart(sessionId);
        if (!data) {
            return {
                items: [],
                regionCode: regionCode,
                displayCurrency: 'USD',
                displaySubtotal: 0,
                displayTotal: 0,
                chargeCurrency: 'USD',
                chargeTotal: 0,
                exchangeRateUsed: '1',
                shippingCost: 0,
                updatedAt: new Date()
            };
        }
        const needsHeal = data.items.length > 0 && (!data.displaySubtotal || isNaN(data.displaySubtotal) || data.displayTotal === 0);
        if (needsHeal) {
            this.logger.warn(`Cart ${sessionId} appears poisoned or stale. Healing...`);
            return this.recalculateCart(sessionId, data);
        }
        return data;
    }
    async addItem(sessionId, productId, quantity, customization, regionCode = 'US', variantId) {
        const product = (await this.prisma.product.findUnique({
            where: { id: productId },
        }));
        if (!product) {
            throw new Error('Product not found');
        }
        const hasVariants = product.hasVariants || false;
        if (!hasVariants && product.stock < quantity) {
            throw new Error(`Only ${product.stock} items available`);
        }
        const cart = await this.getCart(sessionId);
        cart.regionCode = regionCode;
        let unitPriceUSD = product.basePriceUSD;
        let selectedOptions = null;
        let variantImage = product.images?.[0];
        let variantStock = product.stock;
        let displayName = product.name;
        const variants = product.variants || [];
        if (variantId && variants.length > 0) {
            const variant = variants.find(v => v.id === variantId || v.sku === variantId);
            if (variant) {
                const vBase = variant.priceUSD || product.basePriceUSD;
                const vSale = variant.salePriceUSD || product.salePriceUSD;
                unitPriceUSD = vBase;
                const unitSalePriceUSD = (vSale && vSale > 0) ? vSale : undefined;
                selectedOptions = variant.options;
                variantStock = variant.stock;
                if (variant.image)
                    variantImage = variant.image;
                const effectivePrice = unitSalePriceUSD ?? unitPriceUSD;
                const weightKG = product.weightKG || 0;
                const optionsStr = Object.entries(variant.options || {})
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(', ');
                if (optionsStr) {
                    displayName = `${product.name} — ${optionsStr}`;
                }
            }
            else {
                throw new Error('Requested variant not found');
            }
        }
        else if (hasVariants) {
            throw new Error('Please select a specific variant');
        }
        const basePriceSnapshot = variantId ? (unitPriceUSD) : product.basePriceUSD;
        const salePriceSnapshot = variantId ? (unitPriceUSD === product.basePriceUSD ? product.salePriceUSD : undefined) : product.salePriceUSD;
        let finalBaseUSD = product.basePriceUSD;
        let finalSaleUSD = product.salePriceUSD || undefined;
        if (variantId && product.variants) {
            const v = product.variants.find(v => v.id === variantId || v.sku === variantId);
            if (v) {
                finalBaseUSD = v.priceUSD || product.basePriceUSD;
                finalSaleUSD = v.salePriceUSD || undefined;
            }
        }
        const existingItemIndex = cart.items.findIndex((item) => item.productId === productId && item.variantId === variantId);
        if (existingItemIndex >= 0) {
            const totalRequested = cart.items[existingItemIndex].quantity + quantity;
            if (variantStock < totalRequested) {
                throw new Error(`Cannot add more. Only ${variantStock} items available in total.`);
            }
            cart.items[existingItemIndex].quantity = totalRequested;
            cart.items[existingItemIndex].customization = customization || cart.items[existingItemIndex].customization;
            cart.items[existingItemIndex].name = displayName;
        }
        else {
            cart.items.push({
                productId,
                variantId,
                selectedOptions,
                quantity,
                unitPriceUSD: finalBaseUSD,
                unitSalePriceUSD: finalSaleUSD,
                weightKG: product.weightKG || 0,
                exchangeRateUsed: '1',
                unitPriceFinal: 0,
                price: 0,
                customization: customization || {},
                name: displayName,
                image: variantImage,
            });
        }
        return this.recalculateCart(sessionId, cart);
    }
    async updateQuantity(sessionId, productId, quantity, regionCode = 'US', variantId) {
        const cart = await this.getCart(sessionId, regionCode);
        const itemIndex = cart.items.findIndex((item) => item.productId === productId && item.variantId === variantId);
        if (itemIndex < 0) {
            throw new Error('Item not in cart');
        }
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            const product = (await this.prisma.product.findUnique({
                where: { id: productId },
            }));
            if (!product)
                throw new Error('Product not found');
            const hasVariants = product.hasVariants || false;
            let availableStock = product.stock;
            if (variantId && product.variants) {
                const variant = product.variants.find(v => v.id === variantId || v.sku === variantId);
                if (variant)
                    availableStock = variant.stock;
            }
            else if (hasVariants) {
                throw new Error('Selection requires a variant');
            }
            if (quantity > availableStock) {
                throw new Error(`Only ${availableStock} items available`);
            }
            cart.items[itemIndex].quantity = quantity;
        }
        return this.recalculateCart(sessionId, cart);
    }
    async recalculateCart(sessionId, cart) {
        this.logger.log(`[RECALC] Beginning for session ${sessionId}, region: ${cart.regionCode}`);
        let region = await this.regionService.getRegion(cart.regionCode);
        if (!region) {
            this.logger.warn(`Region ${cart.regionCode} not found, falling back to US.`);
            cart.regionCode = 'US';
            region = await this.regionService.getRegion('US');
        }
        if (!region) {
            this.logger.error(`CRITICAL: US region also missing from DB!`);
            throw new Error('Fallback region missing');
        }
        this.logger.debug(`[RECALC] Using region ${region.code} (${region.currency})`);
        const frozenRate = await this.currencyService.getRate(region.currency);
        if (!frozenRate || isNaN(Number(frozenRate))) {
            throw new Error(`Invalid exchange rate for ${region.currency}: ${frozenRate}`);
        }
        cart.displayCurrency = region.currency;
        cart.exchangeRateUsed = frozenRate;
        const rateDec = new decimal_js_1.default(frozenRate);
        let subtotalUSD_cents = 0;
        let totalWeightKg = 0;
        let displaySubtotal_cents = 0;
        for (const item of cart.items) {
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(item.productId);
            if (!isObjectId) {
                this.logger.warn(`Skipping malformed productId in cart: ${item.productId}`);
                continue;
            }
            const product = (await this.prisma.product.findUnique({ where: { id: item.productId } }));
            if (!product) {
                this.logger.warn(`Product not found for ID: ${item.productId}`);
                continue;
            }
            const weightKG = item.weightKG ?? product.weightKG ?? 0;
            totalWeightKg += (weightKG * item.quantity);
            const frozenUSD = item.unitSalePriceUSD || item.unitPriceUSD || product.basePriceUSD;
            const unitPriceFinalRegional = new decimal_js_1.default(frozenUSD)
                .mul(rateDec)
                .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                .toNumber();
            const extraUSD_cents = Number(this.customizationService.calculateExtraCostUSD(item.customization, product.customizationOptions) || 0);
            const extraRegional_cents = new decimal_js_1.default(extraUSD_cents)
                .mul(rateDec)
                .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                .toNumber();
            item.unitPriceFinal = unitPriceFinalRegional + extraRegional_cents;
            item.price = Number(item.unitPriceFinal) * Number(item.quantity || 1);
            displaySubtotal_cents += item.price;
            const lineSubtotalUSD = (frozenUSD + extraUSD_cents) * item.quantity;
            if (isNaN(lineSubtotalUSD)) {
                throw new Error(`Line total is NaN for product ${product.id}`);
            }
            subtotalUSD_cents += lineSubtotalUSD;
        }
        const baseShippingUSD_cents = Number(await this.shippingService.calculateShipping(cart.regionCode, totalWeightKg) || 0);
        cart.shippingCost = new decimal_js_1.default(baseShippingUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
            .toNumber();
        cart.displaySubtotal = displaySubtotal_cents;
        cart.displayTotal = displaySubtotal_cents + cart.shippingCost;
        const canonicalTotalUSD_cents = subtotalUSD_cents + baseShippingUSD_cents;
        if (isNaN(cart.displayTotal) || isNaN(cart.displaySubtotal)) {
            throw new Error(`Final calculation resulted in NaN. Session: ${sessionId}`);
        }
        const isSupported = this.currencyService.isStripeSupported(region.currency);
        this.logger.debug(`[RECALC] isStripeSupported(${region.currency}) = ${isSupported}`);
        if (isSupported) {
            cart.chargeCurrency = region.currency;
            cart.chargeTotal = cart.displayTotal;
        }
        else {
            cart.chargeCurrency = 'USD';
            cart.chargeTotal = canonicalTotalUSD_cents;
            this.logger.log(`[STRATEGY] Currency ${region.currency} unsupported. Falling back to USD: ${cart.chargeTotal} cents.`);
        }
        cart.updatedAt = new Date();
        this.logger.log({
            type: 'RECALC_SUCCESS',
            sessionId,
            subtotalUSD_cents,
            displaySubtotal_cents: cart.displaySubtotal,
            displayTotal_cents: cart.displayTotal,
            exchangeRateUsed: cart.exchangeRateUsed,
            chargeTotal_cents: cart.chargeTotal,
            chargeCurrency: cart.chargeCurrency,
            itemsCount: cart.items.length
        });
        await this.redisService.setCart(sessionId, cart, this.CART_TTL);
        return cart;
    }
    async removeItem(sessionId, productId, regionCode = 'US', variantId) {
        const cart = await this.getCart(sessionId, regionCode);
        cart.items = cart.items.filter((item) => !(item.productId === productId && item.variantId === variantId));
        return this.recalculateCart(sessionId, cart);
    }
    async clearCart(sessionId) {
        await this.redisService.deleteCart(sessionId);
    }
    async mergeCart(fromSessionId, toSessionId, regionCode = 'US') {
        const [guestCart, userCart] = await Promise.all([
            this.getCart(fromSessionId, regionCode),
            this.getCart(toSessionId, regionCode),
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
        return this.recalculateCart(toSessionId, userCart);
    }
    async setRegion(sessionId, regionCode) {
        const cart = await this.getCart(sessionId, regionCode);
        cart.regionCode = regionCode;
        return this.recalculateCart(sessionId, cart);
    }
    getCartTotal(cart) {
        const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
        return {
            itemCount,
            shippingCost: cart.shippingCost,
            total: cart.displayTotal,
            currency: cart.displayCurrency,
            chargeTotal: cart.chargeTotal,
            chargeCurrency: cart.chargeCurrency
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = CartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        prisma_service_1.PrismaService,
        pricing_service_1.CommercePricingService,
        shipping_service_1.ShippingService,
        customization_service_1.CustomizationService,
        currency_service_1.CurrencyService,
        region_service_1.RegionService])
], CartService);
//# sourceMappingURL=cart.service.js.map