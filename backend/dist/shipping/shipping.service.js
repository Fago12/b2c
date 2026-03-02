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
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ShippingService = class ShippingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateShippingCost(country, state = '*') {
        const countryCode = country.toUpperCase();
        const zone = await this.prisma.shippingZone.findFirst({
            where: {
                countryCode: countryCode === 'US' || countryCode === 'USA' ? 'US' : countryCode,
            },
        });
        if (zone) {
            return Math.round(zone.flatRateUSD * 100);
        }
        const globalDefault = await this.prisma.shippingZone.findFirst({
            where: { type: client_1.ShippingZoneType.GLOBAL_DEFAULT },
        });
        return globalDefault ? Math.round(globalDefault.flatRateUSD * 100) : 5000;
    }
    async getDefaultUSRate() {
        const zone = await this.prisma.shippingZone.findFirst({
            where: { countryCode: 'US' },
        });
        return zone ? zone.flatRateUSD * 100 : 1000;
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map