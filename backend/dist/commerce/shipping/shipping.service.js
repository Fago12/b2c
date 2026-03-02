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
var ShippingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const settings_service_1 = require("../../settings/settings.service");
let ShippingService = ShippingService_1 = class ShippingService {
    prisma;
    settingsService;
    logger = new common_1.Logger(ShippingService_1.name);
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async calculateShipping(countryCode, totalWeightKg = 0) {
        const config = await this.settingsService.getShippingConfig();
        const upperCode = countryCode.toUpperCase();
        if (upperCode === 'US') {
            const rate = config?.usFlatRateInCents || 1500;
            this.logger.log(`[SHIPPING] Applying US Flat Rate: $${(rate / 100).toFixed(2)}`);
            return rate;
        }
        let ratePerKG = 2500;
        if (config) {
            if (upperCode === 'NG' || upperCode === 'NIGERIA') {
                ratePerKG = config.nigeriaFlatRateInCents || 2500;
            }
            else if (upperCode === 'GH' || upperCode === 'GHANA') {
                ratePerKG = config.ghanaFlatRateInCents || 2500;
            }
            else if (upperCode === 'IN' || upperCode === 'INDIA') {
                ratePerKG = config.indiaFlatRateInCents || 2500;
            }
            else if (upperCode === 'CN' || upperCode === 'CHINA') {
                ratePerKG = config.chinaFlatRateInCents || 2500;
            }
            else {
                ratePerKG = config.internationalFlatRateInCents || 2500;
            }
        }
        const billableWeight = Math.ceil(totalWeightKg || 1);
        const shippingTotal = billableWeight * ratePerKG;
        this.logger.log(`[SHIPPING] ${upperCode} Order: ${totalWeightKg.toFixed(2)}kg -> ${billableWeight}kg billable @ $${(ratePerKG / 100).toFixed(2)}/kg. Total: $${(shippingTotal / 100).toFixed(2)}`);
        return shippingTotal;
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = ShippingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map