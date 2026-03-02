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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await Promise.all([
                this.ensureShippingConfig(),
                this.ensureStoreSettings(),
            ]);
        }
        catch (error) {
            console.error('SettingsService onModuleInit failed', error);
        }
    }
    async ensureShippingConfig() {
        const config = await this.prisma.shippingConfig.findFirst();
        if (!config) {
            await this.prisma.shippingConfig.create({
                data: {
                    usFlatRateInCents: 1500,
                    nigeriaFlatRateInCents: 2500,
                    indiaFlatRateInCents: 2500,
                    ghanaFlatRateInCents: 2500,
                    chinaFlatRateInCents: 2500,
                    internationalFlatRateInCents: 2500,
                },
            });
        }
    }
    async ensureStoreSettings() {
        const settings = await this.prisma.storeSettings.findFirst();
        if (!settings) {
            await this.prisma.storeSettings.create({
                data: {
                    storeName: 'Woven Kulture',
                    currency: 'NGN',
                },
            });
        }
    }
    async getShippingConfig() {
        return this.prisma.shippingConfig.findFirst();
    }
    async updateShippingConfig(data) {
        const config = await this.prisma.shippingConfig.findFirst();
        if (!config) {
            return this.prisma.shippingConfig.create({
                data: {
                    usFlatRateInCents: data.usFlatRateInCents || 1500,
                    nigeriaFlatRateInCents: data.nigeriaFlatRateInCents || 2500,
                    indiaFlatRateInCents: data.indiaFlatRateInCents || 2500,
                    ghanaFlatRateInCents: data.ghanaFlatRateInCents || 2500,
                    chinaFlatRateInCents: data.chinaFlatRateInCents || 2500,
                    internationalFlatRateInCents: data.internationalFlatRateInCents || 2500,
                },
            });
        }
        return this.prisma.shippingConfig.update({
            where: { id: config.id },
            data,
        });
    }
    async getStoreSettings() {
        return this.prisma.storeSettings.findFirst();
    }
    async updateStoreSettings(data) {
        const settings = await this.prisma.storeSettings.findFirst();
        if (!settings) {
            return this.prisma.storeSettings.create({
                data: {
                    ...data,
                    storeName: data.storeName || 'Woven Kulture',
                    currency: data.currency || 'NGN',
                },
            });
        }
        return this.prisma.storeSettings.update({
            where: { id: settings.id },
            data,
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map