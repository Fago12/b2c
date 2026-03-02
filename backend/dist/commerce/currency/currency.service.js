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
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    prisma;
    configService;
    redis;
    logger = new common_1.Logger(CurrencyService_1.name);
    supportedCurrencies = ['usd'];
    CACHE_TTL = 28800;
    REFRESH_INTERVAL = 28800 * 1000;
    constructor(prisma, configService, redis) {
        this.prisma = prisma;
        this.configService = configService;
        this.redis = redis;
    }
    get apiKey() {
        return this.configService.get('EXCHANGERATE_API_KEY') || '062a1e9b672e1dc18af81632';
    }
    async onModuleInit() {
        try {
            this.loadSupportedCurrencies();
            await this.ensureDefaultRates();
            await this.refreshRates();
            setInterval(() => {
                this.logger.log('Running scheduled exchange rate refresh...');
                this.refreshRates().catch(err => this.logger.error('Scheduled rate refresh failed', err));
            }, this.REFRESH_INTERVAL);
        }
        catch (error) {
            this.logger.error('CurrencyService onModuleInit failed', error);
        }
    }
    loadSupportedCurrencies() {
        const currencies = this.configService.get('STRIPE_SUPPORTED_CURRENCIES');
        if (currencies) {
            this.supportedCurrencies = currencies.split(',').map(c => c.trim().toLowerCase());
        }
    }
    async ensureDefaultRates() {
        const defaults = [
            { currency: 'NGN', rate: '1500.00' },
            { currency: 'GHS', rate: '14.50' },
            { currency: 'GBP', rate: '0.79' },
            { currency: 'EUR', rate: '0.92' },
            { currency: 'INR', rate: '83.00' },
            { currency: 'CNY', rate: '7.20' },
            { currency: 'CAD', rate: '1.35' },
        ];
        for (const item of defaults) {
            const existing = await this.prisma.exchangeRate.findUnique({
                where: { currency: item.currency },
            });
            if (!existing) {
                await this.prisma.exchangeRate.create({ data: item });
                this.logger.log(`Created default exchange rate for ${item.currency}`);
            }
        }
    }
    async refreshRates() {
        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/USD`);
            const data = await response.json();
            if (data.result === 'success') {
                const rates = data.conversion_rates;
                const updates = [];
                for (const [currency, rate] of Object.entries(rates)) {
                    const existing = await this.prisma.exchangeRate.findUnique({ where: { currency } });
                    if (existing) {
                        updates.push(this.prisma.exchangeRate.update({
                            where: { currency },
                            data: { rate: rate.toString() },
                        }));
                        if (this.redis.isAvailable()) {
                            await this.redis.getClient()?.setex(`fx:USD:${currency}`, this.CACHE_TTL, rate.toString());
                        }
                    }
                }
                await Promise.all(updates);
                this.logger.log('Exchange rates refreshed successfully from API.');
            }
        }
        catch (error) {
            this.logger.error('Failed to refresh exchange rates', error);
        }
    }
    async getRate(currency) {
        if (currency === 'USD')
            return '1';
        if (this.redis.isAvailable()) {
            const cached = await this.redis.getClient()?.get(`fx:USD:${currency}`);
            if (cached)
                return cached;
        }
        const entry = await this.prisma.exchangeRate.findUnique({
            where: { currency },
        });
        if (entry) {
            if (this.redis.isAvailable()) {
                this.redis.getClient()?.setex(`fx:USD:${currency}`, this.CACHE_TTL, entry.rate);
            }
            return entry.rate;
        }
        return '1';
    }
    isStripeSupported(currency) {
        return this.supportedCurrencies.includes(currency.toLowerCase());
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map