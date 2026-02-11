import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private isConnected = false;
  private readonly logger = new Logger(RedisService.name);

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
        this.client = new Redis(redisUrl, options);
      } else {
        this.client = new Redis({
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
    } catch (error) {
      this.logger.warn('Failed to initialize Redis - running in degraded mode');
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  getClient(): Redis | null {
    return this.client;
  }

  // Idempotency methods
  async getIdempotencyKey(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(`idempotency:${key}`);
  }

  async setIdempotencyKey(
    key: string, 
    value: string, 
    ttlSeconds: number = 86400
  ): Promise<void> {
    if (!this.client) return;
    await this.client.setex(`idempotency:${key}`, ttlSeconds, value);
  }

  async setIdempotencyProcessing(key: string, ttlSeconds: number = 30): Promise<boolean> {
    if (!this.client) return true; // Allow processing if Redis unavailable
    const result = await this.client.set(
      `idempotency:${key}`, 
      JSON.stringify({ status: 'processing', timestamp: Date.now() }), 
      'EX', 
      ttlSeconds, 
      'NX'
    );
    return result === 'OK';
  }

  async markIdempotencyComplete(
    key: string, 
    response: { statusCode: number; body: any },
    ttlSeconds: number = 86400
  ): Promise<void> {
    if (!this.client) return;
    await this.client.setex(
      `idempotency:${key}`, 
      ttlSeconds, 
      JSON.stringify({ status: 'complete', response, timestamp: Date.now() })
    );
  }

  // Cart methods
  async getCart(sessionId: string): Promise<any> {
    if (!this.client) return null;
    const data = await this.client.get(`cart:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async setCart(sessionId: string, cart: any, ttlSeconds: number = 2592000): Promise<void> {
    if (!this.client) return;
    await this.client.setex(`cart:${sessionId}`, ttlSeconds, JSON.stringify(cart));
  }

  async deleteCart(sessionId: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(`cart:${sessionId}`);
  }
}

