import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export declare class CurrencyService implements OnModuleInit {
    private prisma;
    private configService;
    private redis;
    private readonly logger;
    private supportedCurrencies;
    private readonly CACHE_TTL;
    private readonly REFRESH_INTERVAL;
    constructor(prisma: PrismaService, configService: ConfigService, redis: RedisService);
    private get apiKey();
    onModuleInit(): Promise<void>;
    private loadSupportedCurrencies;
    private ensureDefaultRates;
    refreshRates(): Promise<void>;
    getRate(currency: string): Promise<string>;
    isStripeSupported(currency: string): boolean;
}
