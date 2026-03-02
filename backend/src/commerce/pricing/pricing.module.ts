import { Module } from '@nestjs/common';
import { CommercePricingService } from './pricing.service';
import { CommerceCurrencyModule } from '../currency/currency.module';
import { CommerceRegionModule } from '../region/region.module';

@Module({
  imports: [CommerceCurrencyModule, CommerceRegionModule],
  providers: [CommercePricingService],
  exports: [CommercePricingService],
})
export class CommercePricingModule {}
