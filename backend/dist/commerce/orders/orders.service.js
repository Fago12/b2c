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
var CommerceOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommerceOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pricing_service_1 = require("../pricing/pricing.service");
const shipping_service_1 = require("../shipping/shipping.service");
const customization_service_1 = require("../customization/customization.service");
const currency_service_1 = require("../currency/currency.service");
const region_service_1 = require("../region/region.service");
const client_1 = require("@prisma/client");
const decimal_js_1 = __importDefault(require("decimal.js"));
let CommerceOrdersService = CommerceOrdersService_1 = class CommerceOrdersService {
    prisma;
    pricingService;
    shippingService;
    customizationService;
    currencyService;
    regionService;
    logger = new common_1.Logger(CommerceOrdersService_1.name);
    constructor(prisma, pricingService, shippingService, customizationService, currencyService, regionService) {
        this.prisma = prisma;
        this.pricingService = pricingService;
        this.shippingService = shippingService;
        this.customizationService = customizationService;
        this.currencyService = currencyService;
        this.regionService = regionService;
    }
    async createOrderedTransaction(data) {
        const region = await this.regionService.getRegion(data.regionCode);
        if (!region)
            throw new Error(`Region ${data.regionCode} not found`);
        const frozenRate = await this.currencyService.getRate(region.currency);
        const rateDec = new decimal_js_1.default(frozenRate);
        let totalWeightKg = 0;
        for (const item of data.cartItems) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                select: { attributes: true }
            });
            if (product) {
                const weight = product.attributes?.weight_kg || product.attributes?.weight || 0.5;
                totalWeightKg += weight * item.quantity;
            }
        }
        const baseShippingUSD_cents = await this.shippingService.calculateShipping(data.regionCode, totalWeightKg);
        const shippingCostRegional_cents = new decimal_js_1.default(baseShippingUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
            .toNumber();
        let subtotalUSD_cents = 0;
        const orderItemsData = [];
        for (const item of data.cartItems) {
            const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
            if (!product)
                continue;
            const pricing = await this.pricingService.getProductPrice(item.productId, data.regionCode);
            const extraUSD_cents = this.customizationService.calculateExtraCostUSD(item.customization, product.customizationOptions);
            const extraRegional_cents = new decimal_js_1.default(extraUSD_cents)
                .mul(rateDec)
                .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                .toNumber();
            const unitPriceFinal_cents = pricing.finalPrice + extraRegional_cents;
            const lineTotalRegional_cents = unitPriceFinal_cents * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPriceUSD: product.basePriceUSD_cents,
                exchangeRateUsed: frozenRate,
                unitPriceFinal: unitPriceFinal_cents,
                price: lineTotalRegional_cents,
                customization: item.customization || {},
            });
            subtotalUSD_cents += (product.basePriceUSD_cents + extraUSD_cents) * item.quantity;
        }
        const canonicalTotalUSD_cents = subtotalUSD_cents + baseShippingUSD_cents;
        const displayTotalRegional_cents = new decimal_js_1.default(canonicalTotalUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
            .toNumber();
        const isSupported = this.currencyService.isStripeSupported(region.currency);
        const chargeCurrency = isSupported ? region.currency : 'USD';
        const chargeTotal_cents = isSupported ? displayTotalRegional_cents : canonicalTotalUSD_cents;
        if (!isSupported) {
            this.logger.log(`[ORDER-STRATEGY] Currency ${region.currency} unsupported. Snapping charge to USD: ${chargeTotal_cents} cents.`);
        }
        return this.prisma.order.create({
            data: {
                userId: data.userId,
                email: data.email,
                status: client_1.OrderStatus.PENDING,
                displayCurrency: region.currency,
                displayTotal: displayTotalRegional_cents,
                chargeCurrency: chargeCurrency,
                chargeTotal: chargeTotal_cents,
                totalUSD: canonicalTotalUSD_cents,
                total: displayTotalRegional_cents,
                currency: region.currency,
                shippingAddress: data.shippingAddress,
                regionCode: data.regionCode,
                exchangeRateUsed: frozenRate,
                shippingCost: shippingCostRegional_cents,
                customerPhone: data.customerPhone,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: true,
            },
        });
    }
};
exports.CommerceOrdersService = CommerceOrdersService;
exports.CommerceOrdersService = CommerceOrdersService = CommerceOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.CommercePricingService,
        shipping_service_1.ShippingService,
        customization_service_1.CustomizationService,
        currency_service_1.CurrencyService,
        region_service_1.RegionService])
], CommerceOrdersService);
//# sourceMappingURL=orders.service.js.map