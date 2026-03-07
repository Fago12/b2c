import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommerceCurrencyModule } from '../commerce/currency/currency.module';
import { CommerceRegionModule } from '../commerce/region/region.module';
import { CommerceShippingModule } from '../commerce/shipping/shipping.module';
import { CouponsModule } from '../coupons/coupons.module';
import { QueueModule } from '../queues/queue.module';

@Module({
  imports: [
    PrismaModule,
    CommerceCurrencyModule,
    CommerceRegionModule,
    CommerceShippingModule,
    CouponsModule,
    QueueModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

