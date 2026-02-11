"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockService = void 0;
const common_1 = require("@nestjs/common");
const redlock_1 = __importStar(require("redlock"));
const redis_service_1 = require("../../redis/redis.service");
let LockService = LockService_1 = class LockService {
    redisService;
    redlock;
    logger = new common_1.Logger(LockService_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    getRedlock() {
        if (!this.redlock) {
            this.redlock = new redlock_1.default([this.redisService.getClient()], {
                driftFactor: 0.01,
                retryCount: 3,
                retryDelay: 200,
                retryJitter: 100,
                automaticExtensionThreshold: 500,
            });
            this.redlock.on('error', (error) => {
                if (!(error instanceof redlock_1.ExecutionError)) {
                    this.logger.error('Redlock error:', error);
                }
            });
        }
        return this.redlock;
    }
    async acquire(resource, options = {}) {
        const { duration = 2000, retryCount = 3, retryDelay = 200, retryJitter = 100, } = options;
        const lockKey = `lock:${resource}`;
        try {
            const redlock = this.getRedlock();
            const lock = await redlock.acquire([lockKey], duration, {
                retryCount,
                retryDelay,
                retryJitter,
            });
            this.logger.debug(`Lock acquired: ${lockKey}`);
            return lock;
        }
        catch (error) {
            if (error instanceof redlock_1.ExecutionError) {
                this.logger.warn(`Failed to acquire lock for ${lockKey}: resource is locked`);
                return null;
            }
            this.logger.error(`Error acquiring lock for ${lockKey}:`, error);
            throw error;
        }
    }
    async release(lock) {
        try {
            await lock.release();
            this.logger.debug('Lock released');
        }
        catch (error) {
            this.logger.warn('Error releasing lock:', error);
        }
    }
    async withLock(resource, fn, options = {}) {
        const lock = await this.acquire(resource, options);
        if (!lock) {
            throw new Error(`Unable to acquire lock for resource: ${resource}`);
        }
        try {
            return await fn();
        }
        finally {
            await this.release(lock);
        }
    }
    async tryWithLock(resource, fn, options = {}) {
        const lock = await this.acquire(resource, { ...options, retryCount: 0 });
        if (!lock) {
            return null;
        }
        try {
            return await fn();
        }
        finally {
            await this.release(lock);
        }
    }
};
exports.LockService = LockService;
exports.LockService = LockService = LockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], LockService);
//# sourceMappingURL=lock.service.js.map