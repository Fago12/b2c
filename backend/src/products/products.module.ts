import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CommercePricingModule } from '../commerce/pricing/pricing.module';
import { CommerceRegionModule } from '../commerce/region/region.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, CommercePricingModule, CommerceRegionModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
