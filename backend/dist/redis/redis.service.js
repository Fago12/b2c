"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    client = null;
    isConnected = false;
    logger = new common_1.Logger(RedisService_1.name);
    async onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        const options = {
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            connectTimeout: 10000,
            lazyConnect: false,
            tls: {
                rejectUnauthorized: false
            }
        };
        try {
            if (redisUrl) {
                this.client = new ioredis_1.default(redisUrl, options);
            }
            else {
                this.client = new ioredis_1.default({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD || undefined,
                    ...options,
                });
            }
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log('Redis connected successfully');
            });
            this.client.on('error', (err) => {
                this.isConnected = false;
                this.logger.warn('Redis connection error:', err.message);
            });
            this.client.on('close', () => {
                this.isConnected = false;
                this.logger.warn('Redis connection closed');
            });
        }
        catch (error) {
            this.logger.warn('Failed to initialize Redis - running in degraded mode');
            this.client = null;
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    isAvailable() {
        return this.client !== null && this.isConnected;
    }
    getClient() {
        return this.client;
    }
    async getIdempotencyKey(key) {
        if (!this.client)
            return null;
        return this.client.get(`idempotency:${key}`);
    }
    async setIdempotencyKey(key, value, ttlSeconds = 86400) {
        if (!this.client)
            return;
        await this.client.setex(`idempotency:${key}`, ttlSeconds, value);
    }
    async setIdempotencyProcessing(key, ttlSeconds = 30) {
        if (!this.client)
            return true;
        const result = await this.client.set(`idempotency:${key}`, JSON.stringify({ status: 'processing', timestamp: Date.now() }), 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }
    async markIdempotencyComplete(key, response, ttlSeconds = 86400) {
        if (!this.client)
            return;
        await this.client.setex(`idempotency:${key}`, ttlSeconds, JSON.stringify({ status: 'complete', response, timestamp: Date.now() }));
    }
    async getCart(sessionId) {
        if (!this.client)
            return null;
        const data = await this.client.get(`cart:${sessionId}`);
        return data ? JSON.parse(data) : null;
    }
    async setCart(sessionId, cart, ttlSeconds = 2592000) {
        if (!this.client)
            return;
        await this.client.setex(`cart:${sessionId}`, ttlSeconds, JSON.stringify(cart));
    }
    async deleteCart(sessionId) {
        if (!this.client)
            return;
        await this.client.del(`cart:${sessionId}`);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map