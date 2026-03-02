import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommerceCurrencyModule } from '../commerce/currency/currency.module';
import { CommerceRegionModule } from '../commerce/region/region.module';
import { CommerceShippingModule } from '../commerce/shipping/shipping.module';

@Module({
  imports: [
    PrismaModule,
    CommerceCurrencyModule,
    CommerceRegionModule,
    CommerceShippingModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

