import { Module } from '@nestjs/common';
import { CommerceOrdersService } from './orders.service';
import { CommercePricingModule } from '../pricing/pricing.module';
import { CommerceShippingModule } from '../shipping/shipping.module';
import { CommerceCustomizationModule } from '../customization/customization.module';
import { CommerceCurrencyModule } from '../currency/currency.module';
import { CommerceRegionModule } from '../region/region.module';

@Module({
  imports: [
    CommercePricingModule,
    CommerceShippingModule,
    CommerceCustomizationModule,
    CommerceCurrencyModule,
    CommerceRegionModule,
  ],
  providers: [CommerceOrdersService],
  exports: [CommerceOrdersService],
})
export class CommerceOrdersModule {}
