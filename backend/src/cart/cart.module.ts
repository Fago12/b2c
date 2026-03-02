import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommercePricingModule } from '../commerce/pricing/pricing.module';
import { CommerceCurrencyModule } from '../commerce/currency/currency.module';
import { CommerceShippingModule } from '../commerce/shipping/shipping.module';
import { CommerceRegionModule } from '../commerce/region/region.module';
import { CommerceCustomizationModule } from '../commerce/customization/customization.module';

@Module({
  imports: [
    PrismaModule,
    CommercePricingModule,
    CommerceCurrencyModule,
    CommerceShippingModule,
    CommerceRegionModule,
    CommerceCustomizationModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

