import { Lock } from 'redlock';
import { RedisService } from '../../redis/redis.service';
export interface LockOptions {
    duration?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
}
export declare class LockService {
    private readonly redisService;
    private redlock;
    private readonly logger;
    constructor(redisService: RedisService);
    private getRedlock;
    acquire(resource: string, options?: LockOptions): Promise<Lock | null>;
    release(lock: Lock): Promise<void>;
    withLock<T>(resource: string, fn: () => Promise<T>, options?: LockOptions): Promise<T>;
    tryWithLock<T>(resource: string, fn: () => Promise<T>, options?: LockOptions): Promise<T | null>;
}
