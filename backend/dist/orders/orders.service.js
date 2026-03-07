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
const types_1 = require("./types");
const lock_service_1 = require("../common/services/lock.service");
const pricing_service_1 = require("../common/pricing.service");
const shipping_service_1 = require("../commerce/shipping/shipping.service");
const currency_service_1 = require("../commerce/currency/currency.service");
const region_service_1 = require("../commerce/region/region.service");
const mail_service_1 = require("../mail/mail.service");
const queue_service_1 = require("../queues/queue.service");
const coupons_service_1 = require("../coupons/coupons.service");
const decimal_js_1 = __importDefault(require("decimal.js"));
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    lockService;
    pricingService;
    shippingService;
    currencyService;
    regionService;
    mailService;
    queueService;
    couponsService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, lockService, pricingService, shippingService, currencyService, regionService, mailService, queueService, couponsService) {
        this.prisma = prisma;
        this.lockService = lockService;
        this.pricingService = pricingService;
        this.shippingService = shippingService;
        this.currencyService = currencyService;
        this.regionService = regionService;
        this.mailService = mailService;
        this.queueService = queueService;
        this.couponsService = couponsService;
    }
    async create(data) {
        const { items, email, shippingAddress, userId, isCustomOrder, customerPhone, couponCode } = data;
        const productIds = items.map((item) => item.productId);
        const lockKey = `order:${productIds.sort().join(',')}`;
        this.logger.debug(`[CREATE ORDER] Acquiring lock for key: ${lockKey}`);
        try {
            const lockStartTime = Date.now();
            return await this.lockService.withLock(lockKey, async () => {
                this.logger.debug(`[CREATE ORDER] Lock acquired in ${Date.now() - lockStartTime}ms`);
                this.logger.debug(`[CREATE ORDER] Step 1: Verifying products... Keys: ${lockKey}`);
                const products = (await this.prisma.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true, stock: true, basePriceUSD_cents: true, customizationOptions: true, hasVariants: true, variants: { include: { color: true, pattern: true } } },
                }));
                this.logger.debug(`[CREATE ORDER] Found ${products.length} products.`);
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
                const regionCode = data.regionCode || shippingAddress?.country || 'US';
                const region = await this.regionService.getRegion(regionCode);
                if (!region)
                    throw new common_1.HttpException(`Region ${regionCode} not found`, common_1.HttpStatus.NOT_FOUND);
                const frozenRate = await this.currencyService.getRate(region.currency);
                const rateDec = new decimal_js_1.default(frozenRate);
                this.logger.debug(`[CREATE ORDER] Step 2: Calculations for region ${regionCode}...`);
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
                    const unitPriceRegional_cents = await this.pricingService.calculateProductPrice(item.productId, item.customization, item.variantId);
                    const unitPriceUSD_cents = product.basePriceUSD_cents;
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
                const displaySubtotalRegional_cents = new decimal_js_1.default(subtotalUSD_cents)
                    .mul(rateDec)
                    .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                    .toNumber();
                const shippingRegional_cents = new decimal_js_1.default(baseShippingUSD_cents)
                    .mul(rateDec)
                    .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                    .toNumber();
                let discountRegional_cents = 0;
                let displayTotalRegional_cents = displaySubtotalRegional_cents + shippingRegional_cents;
                let appliedCouponId = null;
                if (couponCode) {
                    const validation = await this.couponsService.validateCoupon(couponCode, displaySubtotalRegional_cents);
                    if (!validation.valid || !validation.coupon) {
                        throw new common_1.HttpException(validation.error || 'Invalid coupon', common_1.HttpStatus.BAD_REQUEST);
                    }
                    discountRegional_cents = validation.discount;
                    displayTotalRegional_cents = displaySubtotalRegional_cents - discountRegional_cents + shippingRegional_cents;
                    appliedCouponId = validation.coupon.id;
                }
                const isSupported = this.currencyService.isStripeSupported(region.currency);
                const chargeCurrency = isSupported ? region.currency : 'USD';
                const discountUSD_cents = couponCode ? new decimal_js_1.default(discountRegional_cents)
                    .div(rateDec)
                    .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                    .toNumber() : 0;
                const totalUSD_cents = canonicalTotalUSD_cents - discountUSD_cents;
                let chargeTotal_cents = 0;
                if (isSupported) {
                    chargeTotal_cents = displayTotalRegional_cents;
                }
                else {
                    chargeTotal_cents = totalUSD_cents;
                }
                this.logger.debug(`[CREATE ORDER] Step 6: Starting transaction...`);
                return this.prisma.$transaction(async (tx) => {
                    this.logger.debug(`[CREATE ORDER] Inside transaction...`);
                    for (const item of items) {
                        const product = (await tx.product.findUnique({
                            where: { id: item.productId },
                            select: { id: true, stock: true, variants: true, hasVariants: true }
                        }));
                        if (!product)
                            continue;
                        if (item.variantId && product.hasVariants) {
                            const variant = product.variants.find(v => v.id === item.variantId || v.sku === item.variantId);
                            if (variant) {
                                this.logger.debug(`[CREATE ORDER] Decrementing variant stock: ${variant.id || variant._id}`);
                                await tx.variant.update({
                                    where: { id: variant.id || variant._id },
                                    data: { stock: { decrement: item.quantity } },
                                });
                            }
                        }
                        else {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } },
                            });
                        }
                        if (appliedCouponId) {
                            await tx.coupon.update({
                                where: { id: appliedCouponId },
                                data: { usedCount: { increment: 1 } },
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
                            status: types_1.OrderStatus.PENDING,
                            email,
                            customerPhone: customerPhone || shippingAddress?.phone || null,
                            shippingAddress: {
                                ...(typeof shippingAddress === 'object' ? shippingAddress : {}),
                                firstName: data.firstName || shippingAddress?.firstName,
                                lastName: data.lastName || shippingAddress?.lastName,
                            },
                            displayCurrency: region.currency,
                            displayTotal: displayTotalRegional_cents,
                            chargeCurrency,
                            chargeTotal: chargeTotal_cents,
                            totalUSD: totalUSD_cents,
                            total: displayTotalRegional_cents,
                            currency: region.currency,
                            shippingCost: shippingCostRegional_cents,
                            exchangeRateUsed: frozenRate,
                            regionCode: regionCode,
                            couponCode: couponCode || null,
                            discountAmount: discountRegional_cents,
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
                    this.logger.debug(`[CREATE ORDER] Transaction complete.`);
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
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                user: true,
                region: true
            }
        });
        if (!order)
            return null;
        const rate = parseFloat(order.exchangeRateUsed) || 1;
        const totalUSD = order.totalUSD || Math.round(order.total / rate);
        return {
            ...order,
            totalUSD,
            items: order.items.map(item => ({
                ...item,
                totalUSD: Math.round(item.price / rate)
            }))
        };
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
                    items: {
                        include: {
                            product: {
                                include: { variants: true }
                            }
                        }
                    },
                    user: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            orders: orders.map(order => {
                const rate = parseFloat(order.exchangeRateUsed) || 1;
                const totalUSD = order.totalUSD || Math.round(order.total / rate);
                return {
                    ...order,
                    totalUSD,
                    items: order.items.map(item => ({
                        ...item,
                        totalUSD: Math.round(item.price / rate)
                    }))
                };
            }),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async updateStatus(id, status, metadata) {
        return this.updateOrderStatus(id, status, metadata);
    }
    async updateOrderStatus(id, newStatus, metadata) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } }, user: true },
        });
        if (!order)
            throw new common_1.HttpException('Order not found', common_1.HttpStatus.NOT_FOUND);
        const updateData = { status: newStatus };
        if (newStatus === types_1.OrderStatus.PAID) {
            updateData.paidAt = new Date();
        }
        else if (newStatus === types_1.OrderStatus.SHIPPED) {
            if (!metadata?.carrier || !metadata?.trackingNumber) {
                throw new common_1.HttpException('Carrier and Tracking Number are required for SHIPPED status.', common_1.HttpStatus.BAD_REQUEST);
            }
            updateData.shippedAt = new Date();
            updateData.carrier = metadata.carrier;
            updateData.trackingNumber = metadata.trackingNumber;
        }
        else if (newStatus === types_1.OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                items: {
                    include: {
                        product: {
                            include: { variants: true }
                        }
                    }
                },
                user: true
            },
        });
        try {
            if (newStatus === types_1.OrderStatus.PAID) {
                const subtotal = updatedOrder.displayTotal - updatedOrder.shippingCost + (updatedOrder.discountAmount || 0);
                const addr = updatedOrder.shippingAddress;
                const firstName = addr.firstName || updatedOrder.user?.firstName || updatedOrder.customerName?.split(' ')[0] || '';
                const lastName = addr.lastName || updatedOrder.user?.lastName || updatedOrder.customerName?.split(' ').slice(1).join(' ') || '';
                await this.queueService.sendPurchaseReceipt(updatedOrder.email, updatedOrder.id, updatedOrder.displayTotal, updatedOrder.items.map(item => {
                    const variant = item.product.variants?.find(v => v.id === item.variantId || v.sku === item.variantId);
                    const variantDetails = variant?.options ?
                        Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`).join(', ') :
                        undefined;
                    return {
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.unitPriceFinal,
                        variantDetails,
                        customization: item.customization
                    };
                }), subtotal, updatedOrder.shippingCost, updatedOrder.discountAmount || 0, updatedOrder.displayCurrency, {
                    firstName,
                    lastName,
                    phone: updatedOrder.customerPhone || addr.phone || addr.customerPhone || 'Not available',
                    date: updatedOrder.createdAt.toLocaleDateString(),
                    shippingAddress: {
                        line1: addr.line1 || addr.address || '',
                        city: addr.city || '',
                        state: addr.state || '',
                        country: addr.country || ''
                    }
                });
            }
            else if (newStatus === types_1.OrderStatus.SHIPPED) {
                await this.queueService.sendShippingNotification(updatedOrder);
            }
            else if (newStatus === types_1.OrderStatus.DELIVERED) {
                await this.queueService.sendDeliveryConfirmation(updatedOrder);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send email for order ${id} status ${newStatus}:`, error);
        }
        return updatedOrder;
    }
    async getOrderStats() {
        const [total, pending, paid, shipped, delivered, cancelled] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: types_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { status: types_1.OrderStatus.PAID } }),
            this.prisma.order.count({ where: { status: types_1.OrderStatus.SHIPPED } }),
            this.prisma.order.count({ where: { status: types_1.OrderStatus.DELIVERED } }),
            this.prisma.order.count({ where: { status: types_1.OrderStatus.CANCELLED } }),
        ]);
        const revenue = await this.prisma.order.aggregate({
            where: { status: { in: [types_1.OrderStatus.PAID, types_1.OrderStatus.SHIPPED, types_1.OrderStatus.DELIVERED] } },
            _sum: { totalUSD: true },
        });
        return {
            total,
            byStatus: { pending, paid, shipped, delivered, cancelled },
            totalRevenue: revenue._sum.totalUSD || 0,
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
        region_service_1.RegionService,
        mail_service_1.MailService,
        queue_service_1.QueueService,
        coupons_service_1.CouponsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map