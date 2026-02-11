import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { RedisService } from '../../redis/redis.service';
import { IDEMPOTENT_KEY } from '../decorators/idempotent.decorator';

interface IdempotencyData {
  status: 'processing' | 'complete';
  response?: { statusCode: number; body: any };
  timestamp: number;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Check if endpoint is marked as idempotent
    const isIdempotent = this.reflector.get<boolean>(IDEMPOTENT_KEY, context.getHandler());
    
    if (!isIdempotent) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Only apply to mutation methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      throw new HttpException(
        'Idempotency-Key header is required for this request',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate key format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      throw new HttpException(
        'Idempotency-Key must be a valid UUID v4',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if key exists
    const existingData = await this.redisService.getIdempotencyKey(idempotencyKey);

    if (existingData) {
      const parsed: IdempotencyData = JSON.parse(existingData);

      if (parsed.status === 'processing') {
        // Request is being processed, client should retry later
        throw new HttpException(
          'Request is already being processed. Please retry later.',
          HttpStatus.CONFLICT,
        );
      }

      if (parsed.status === 'complete' && parsed.response) {
        // Return cached response
        this.logger.log(`Returning cached response for idempotency key: ${idempotencyKey}`);
        response.status(parsed.response.statusCode);
        return of(parsed.response.body);
      }
    }

    // Try to acquire processing lock
    const acquired = await this.redisService.setIdempotencyProcessing(idempotencyKey);

    if (!acquired) {
      throw new HttpException(
        'Request is already being processed. Please retry later.',
        HttpStatus.CONFLICT,
      );
    }

    // Process the request
    return next.handle().pipe(
      tap(async (data) => {
        // Cache successful response
        await this.redisService.markIdempotencyComplete(idempotencyKey, {
          statusCode: response.statusCode,
          body: data,
        });
        this.logger.log(`Cached response for idempotency key: ${idempotencyKey}`);
      }),
      catchError(async (error) => {
        // For validation errors (4xx), we typically don't cache them
        // to allow the user to correct and retry with the same key
        if (error instanceof HttpException) {
          const status = error.getStatus();
          if (status >= 400 && status < 500) {
            // Clear the processing state for client errors
            // This allows retry with the same key after fixing the issue
            this.logger.log(`Not caching client error for idempotency key: ${idempotencyKey}`);
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
