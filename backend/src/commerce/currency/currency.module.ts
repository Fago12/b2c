import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CommerceCurrencyModule {}
