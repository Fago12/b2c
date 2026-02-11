import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'idempotent';

/**
 * Decorator to mark a controller method as idempotent.
 * When applied, the IdempotencyInterceptor will:
 * 1. Require an Idempotency-Key header
 * 2. Return cached responses for duplicate requests
 * 3. Prevent duplicate processing of the same request
 */
export const Idempotent = () => SetMetadata(IDEMPOTENT_KEY, true);
