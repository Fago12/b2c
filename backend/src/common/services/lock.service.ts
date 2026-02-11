import { Injectable, Logger } from '@nestjs/common';
import Redlock, { Lock, ExecutionError } from 'redlock';
import { RedisService } from '../../redis/redis.service';

export interface LockOptions {
  duration?: number;      // Lock TTL in milliseconds (default 2000ms)
  retryCount?: number;    // Number of retry attempts (default 3)
  retryDelay?: number;    // Delay between retries in ms (default 200)
  retryJitter?: number;   // Random jitter added to retry (default 100)
}

@Injectable()
export class LockService {
  private redlock: Redlock;
  private readonly logger = new Logger(LockService.name);

  constructor(private readonly redisService: RedisService) {}

  private getRedlock(): Redlock {
    if (!this.redlock) {
      this.redlock = new Redlock([this.redisService.getClient()], {
        driftFactor: 0.01,
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 100,
        automaticExtensionThreshold: 500,
      });

      this.redlock.on('error', (error) => {
        if (!(error instanceof ExecutionError)) {
          this.logger.error('Redlock error:', error);
        }
      });
    }
    return this.redlock;
  }

  /**
   * Acquire a distributed lock for a resource
   * @param resource The resource key to lock (e.g., 'product:123')
   * @param options Lock configuration options
   * @returns The lock object, or null if acquisition failed
   */
  async acquire(resource: string, options: LockOptions = {}): Promise<Lock | null> {
    const {
      duration = 2000,
      retryCount = 3,
      retryDelay = 200,
      retryJitter = 100,
    } = options;

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
    } catch (error) {
      if (error instanceof ExecutionError) {
        this.logger.warn(`Failed to acquire lock for ${lockKey}: resource is locked`);
        return null;
      }
      this.logger.error(`Error acquiring lock for ${lockKey}:`, error);
      throw error;
    }
  }

  /**
   * Release a distributed lock
   * @param lock The lock to release
   */
  async release(lock: Lock): Promise<void> {
    try {
      await lock.release();
      this.logger.debug('Lock released');
    } catch (error) {
      this.logger.warn('Error releasing lock:', error);
    }
  }

  /**
   * Execute a function with a distributed lock
   * Will automatically acquire and release the lock
   * @param resource The resource key to lock
   * @param fn The function to execute while holding the lock
   * @param options Lock configuration options
   * @returns The result of the function, or throws if lock cannot be acquired
   */
  async withLock<T>(
    resource: string,
    fn: () => Promise<T>,
    options: LockOptions = {},
  ): Promise<T> {
    const lock = await this.acquire(resource, options);

    if (!lock) {
      throw new Error(`Unable to acquire lock for resource: ${resource}`);
    }

    try {
      return await fn();
    } finally {
      await this.release(lock);
    }
  }

  /**
   * Attempt to execute with lock, return null if lock unavailable
   * Non-blocking version that doesn't throw on lock failure
   */
  async tryWithLock<T>(
    resource: string,
    fn: () => Promise<T>,
    options: LockOptions = {},
  ): Promise<T | null> {
    const lock = await this.acquire(resource, { ...options, retryCount: 0 });

    if (!lock) {
      return null;
    }

    try {
      return await fn();
    } finally {
      await this.release(lock);
    }
  }
}
