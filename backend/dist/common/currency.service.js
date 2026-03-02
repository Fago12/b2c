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
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CurrencyService = class CurrencyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async convertFromUSD(amountInUSD, targetCurrency) {
        if (targetCurrency.toUpperCase() === 'USD')
            return amountInUSD;
        const rateEntry = await this.prisma.exchangeRate.findUnique({
            where: { currency: targetCurrency.toUpperCase() },
        });
        if (!rateEntry || !rateEntry.isActive) {
            console.warn(`No active exchange rate found for ${targetCurrency}`);
            return amountInUSD;
        }
        return Math.round(amountInUSD * rateEntry.rate);
    }
    async getRates() {
        return this.prisma.exchangeRate.findMany({
            where: { isActive: true },
        });
    }
    formatPrice(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map