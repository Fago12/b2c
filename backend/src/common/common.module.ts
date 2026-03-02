import { Module, Global } from '@nestjs/common';
import { LockService } from './services/lock.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';
import { PricingService } from './pricing.service';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Global()
@Module({
  controllers: [CurrencyController],
  providers: [LockService, IdempotencyInterceptor, PricingService, CurrencyService],
  exports: [LockService, IdempotencyInterceptor, PricingService, CurrencyService],
})
export class CommonModule {}
