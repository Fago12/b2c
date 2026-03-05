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
var CommercePricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercePricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const currency_service_1 = require("../currency/currency.service");
const decimal_js_1 = __importDefault(require("decimal.js"));
let CommercePricingService = CommercePricingService_1 = class CommercePricingService {
    prisma;
    currencyService;
    logger = new common_1.Logger(CommercePricingService_1.name);
    constructor(prisma, currencyService) {
        this.prisma = prisma;
        this.currencyService = currencyService;
    }
    async getProductPrice(productId, regionCode, variantId) {
        let region = await this.prisma.region.findUnique({ where: { code: regionCode } });
        if (!region) {
            this.logger.warn(`Region ${regionCode} not found, falling back to US`);
            region = await this.prisma.region.findUnique({ where: { code: 'US' } });
            if (!region)
                throw new Error(`Fallback region US not found in database`);
        }
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true }
        });
        if (!product)
            throw new Error(`Product ${productId} not found`);
        const frozenRate = await this.currencyService.getRate(region.currency);
        const rateDec = new decimal_js_1.default(frozenRate);
        const override = await this.prisma.productRegionalPrice.findUnique({
            where: {
                productId_regionCode: {
                    productId,
                    regionCode: region.code,
                },
            },
        });
        if (override) {
            const convertedBase = new decimal_js_1.default(product.basePriceUSD_cents)
                .mul(rateDec)
                .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
                .toNumber();
            return {
                basePrice: convertedBase,
                finalPrice: override.price,
                currency: region.currency,
                symbol: region.symbol,
                exchangeRateUsed: frozenRate,
                isOverride: true,
            };
        }
        let finalUSD = product.salePriceUSD_cents ?? product.basePriceUSD_cents;
        if (variantId) {
            const variant = await this.prisma.variant.findUnique({ where: { id: variantId } });
            if (variant && variant.productId === productId) {
                if (variant.salePriceUSD_cents != null && variant.salePriceUSD_cents > 0) {
                    finalUSD = variant.salePriceUSD_cents;
                }
                else if (variant.priceUSD_cents != null && variant.priceUSD_cents > 0) {
                    finalUSD = variant.priceUSD_cents;
                }
            }
        }
        const conversionBase = new decimal_js_1.default(product.basePriceUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
            .toNumber();
        const conversionFinal = new decimal_js_1.default(finalUSD)
            .mul(rateDec)
            .toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP)
            .toNumber();
        return {
            basePrice: conversionBase,
            finalPrice: conversionFinal,
            currency: region.currency,
            symbol: region.symbol,
            exchangeRateUsed: frozenRate,
            isOverride: false,
            variantId
        };
    }
};
exports.CommercePricingService = CommercePricingService;
exports.CommercePricingService = CommercePricingService = CommercePricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService])
], CommercePricingService);
//# sourceMappingURL=pricing.service.js.map