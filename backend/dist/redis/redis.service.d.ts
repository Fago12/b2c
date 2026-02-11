import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    private isConnected;
    private readonly logger;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isAvailable(): boolean;
    getClient(): Redis | null;
    getIdempotencyKey(key: string): Promise<string | null>;
    setIdempotencyKey(key: string, value: string, ttlSeconds?: number): Promise<void>;
    setIdempotencyProcessing(key: string, ttlSeconds?: number): Promise<boolean>;
    markIdempotencyComplete(key: string, response: {
        statusCode: number;
        body: any;
    }, ttlSeconds?: number): Promise<void>;
    getCart(sessionId: string): Promise<any>;
    setCart(sessionId: string, cart: any, ttlSeconds?: number): Promise<void>;
    deleteCart(sessionId: string): Promise<void>;
}
