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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateProductPrice(productId, customization) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { basePriceUSD: true, customizationOptions: true },
        });
        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        }
        let finalPriceUSD_cents = product.basePriceUSD;
        if (customization && product.customizationOptions) {
            const options = product.customizationOptions;
            if (customization.embroidery?.enabled && options.allowEmbroidery) {
                finalPriceUSD_cents += options.embroideryPriceUSD || 0;
            }
        }
        return finalPriceUSD_cents;
    }
    async calculateTotal(items) {
        let totalUSD_cents = 0;
        for (const item of items) {
            const pricePerUnitUSD_cents = await this.calculateProductPrice(item.productId, item.customization);
            totalUSD_cents += pricePerUnitUSD_cents * item.quantity;
        }
        return totalUSD_cents;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map