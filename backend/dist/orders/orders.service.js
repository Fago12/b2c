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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const lock_service_1 = require("../common/services/lock.service");
const pricing_service_1 = require("../common/pricing.service");
const shipping_service_1 = require("../commerce/shipping/shipping.service");
const currency_service_1 = require("../commerce/currency/currency.service");
const region_service_1 = require("../commerce/region/region.service");
const decimal_js_1 = __importDefault(require("decimal.js"));
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    lockService;
    pricingService;
    shippingService;
    currencyService;
    regionService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, lockService, pricingService, shippingService, currencyService, regionService) {
        this.prisma = prisma;
        this.lockService = lockService;
        this.pricingService = pricingService;
        this.shippingService = shippingService;
        this.currencyService = currencyService;
        this.regionService = regionService;
    }
    async create(data) {
        const { items, email, shippingAddress, userId, isCustomOrder, customerPhone } = data;
        const productIds = items.map((item) => item.productId);
        const lockKey = `order:${productIds.sort().join(',')}`;
        try {
            return await this.lockService.withLock(lockKey, async () => {
                const products = (await this.prisma.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true, stock: true, basePriceUSD: true, customizationOptions: true, hasVariants: true, variants: true },
                }));
                for (const item of items) {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) {
                        throw new common_1.HttpException(`Product ${item.productId} not found`, common_1.HttpStatus.NOT_FOUND);
                    }
                    let availableStock = product.stock;
                    const hasVariants = product.hasVariants || false;
                    if (item.variantId && product.variants) {
                        const variant = product.variants.find(v => v.id === item.variantId || v.sku === item.variantId);
                        if (variant) {
                            availableStock = variant.stock;
                        }
                        else {
                            throw new common_1.HttpException(`Variant ${item.variantId} not found for ${product.name}`, common_1.HttpStatus.BAD_REQUEST);
                        }
                    }
                    else if (hasVariants) {
                        throw new common_1.HttpException(`Selection requires a variant for ${product.name}`, common_1.HttpStatus.BAD_REQUEST);
                    }
                    if (availableStock < item.quantity) {
                        throw new common_1.HttpException(`Insufficient stock for ${product.name}${item.variantId ? ` (${item.variantId})` : ''}`, common_1.HttpStatus.BAD_REQUEST);
                    }
                }
                const regionCode = data.regionCode || 'US';
                const region = await this.regionService.getRegion(regionCode);
                if (!region)
                    throw new common_1.HttpException(`Region ${regionCode} not found`, common_1.HttpStatus.NOT_FOUND);
                const frozenRate = await this.currencyService.getRate(region.currency);
                const rateDec = new decimal_js_1.default(frozenRate);
                let totalWeightKg = 0;
                for (const item of items) {
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        totalWeightKg += (product.weightKG || 0) * item.quantity;
                    }
                }
                const baseShippingUSD_cents = await this.shippingService.calculateShipping(shippingAddress.country, totalWeightKg);
                const shippingCostRegional_cents = new decimal_js_1.default(baseShippingUSD_cents)
                    .mul(rateDec)
                    .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                    .toNumber();
                let subtotalUSD_cents = 0;
                const orderItemsData = [];
                for (const item of items) {
                    const product = products.find(p => p.id === item.productId);
                    if (!product)
                        continue;
                    const unitPriceRegional_cents = await this.pricingService.calculateProductPrice(item.productId, item.customization);
                    const unitPriceUSD_cents = product.basePriceUSD;
                    const extraUSD_cents = item.customization ? unitPriceRegional_cents - unitPriceUSD_cents : 0;
                    const itemPriceUSD_cents = unitPriceRegional_cents;
                    orderItemsData.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPriceUSD: itemPriceUSD_cents,
                        exchangeRateUsed: frozenRate,
                        unitPriceFinal: new decimal_js_1.default(itemPriceUSD_cents).mul(rateDec).toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                        weightKG: product.weightKG || 0,
                        price: new decimal_js_1.default(itemPriceUSD_cents).mul(rateDec).toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP).mul(item.quantity).toNumber(),
                        customization: item.customization || {},
                    });
                    subtotalUSD_cents += itemPriceUSD_cents * item.quantity;
                }
                const canonicalTotalUSD_cents = subtotalUSD_cents + baseShippingUSD_cents;
                const displayTotalRegional_cents = new decimal_js_1.default(canonicalTotalUSD_cents)
                    .mul(rateDec)
                    .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                    .toNumber();
                const isSupported = this.currencyService.isStripeSupported(region.currency);
                const chargeCurrency = isSupported ? region.currency : 'USD';
                const chargeTotal_cents = isSupported ? displayTotalRegional_cents : canonicalTotalUSD_cents;
                return this.prisma.$transaction(async (tx) => {
                    for (const item of items) {
                        const product = (await tx.product.findUnique({
                            where: { id: item.productId },
                            select: { id: true, stock: true, variants: true, hasVariants: true }
                        }));
                        if (!product)
                            continue;
                        if (item.variantId && product.variants && product.hasVariants) {
                            const variants = product.variants.map(v => {
                                if (v.id === item.variantId || v.sku === item.variantId) {
                                    return { ...v, stock: Math.max(0, parseInt(v.stock?.toString() || '0') - item.quantity) };
                                }
                                return v;
                            });
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { variants },
                            });
                        }
                        else {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } },
                            });
                        }
                    }
                    let finalUserId = userId;
                    if (!finalUserId && email) {
                        const user = await tx.user.findUnique({ where: { email } });
                        if (user)
                            finalUserId = user.id;
                    }
                    const order = await tx.order.create({
                        data: {
                            status: client_1.OrderStatus.PENDING,
                            email,
                            shippingAddress,
                            userId: finalUserId || null,
                            isCustomOrder: isCustomOrder || false,
                            customerPhone,
                            displayCurrency: region.currency,
                            displayTotal: displayTotalRegional_cents,
                            chargeCurrency,
                            chargeTotal: chargeTotal_cents,
                            total: displayTotalRegional_cents,
                            currency: region.currency,
                            shippingCost: shippingCostRegional_cents,
                            exchangeRateUsed: frozenRate,
                            regionCode: regionCode,
                            items: {
                                create: orderItemsData.map((oid, idx) => ({
                                    ...oid,
                                    variantId: items[idx].variantId
                                })),
                            },
                        },
                        include: { items: true },
                    });
                    this.logger.log(`Created order: ${order.id} (${chargeTotal_cents} ${chargeCurrency})`);
                    return order;
                });
            }, { duration: 5000 });
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Order creation failed:', error);
            throw new common_1.HttpException('Order processing failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: { items: true, user: true }
        });
    }
    async findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                user: true
            }
        });
    }
    async attachGuestOrders(email, userId) {
        return this.prisma.order.updateMany({
            where: { email, userId: null },
            data: { userId },
        });
    }
    async findByUserId(userId, email) {
        if (email) {
            await this.attachGuestOrders(email, userId);
        }
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllAdmin(params) {
        const { status, search, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
            ];
            if (isObjectId) {
                where.OR.push({ id: search });
            }
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    items: { include: { product: true } },
                    user: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async updateStatus(id, status) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: { include: { product: true } },
                user: true
            },
        });
    }
    async getOrderStats() {
        const [total, pending, paid, shipped, delivered, cancelled] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.PAID } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.SHIPPED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.DELIVERED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.CANCELLED } }),
        ]);
        const revenue = await this.prisma.order.aggregate({
            where: { status: { in: [client_1.OrderStatus.PAID, client_1.OrderStatus.SHIPPED, client_1.OrderStatus.DELIVERED] } },
            _sum: { total: true },
        });
        return {
            total,
            byStatus: { pending, paid, shipped, delivered, cancelled },
            revenue: revenue._sum.total || 0,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        lock_service_1.LockService,
        pricing_service_1.PricingService,
        shipping_service_1.ShippingService,
        currency_service_1.CurrencyService,
        region_service_1.RegionService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map