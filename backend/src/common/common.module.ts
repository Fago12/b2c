import { Module, Global } from '@nestjs/common';
import { LockService } from './services/lock.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';

@Global()
@Module({
  providers: [LockService, IdempotencyInterceptor],
  exports: [LockService, IdempotencyInterceptor],
})
export class CommonModule {}
