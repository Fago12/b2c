import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SettingsModule } from '../../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class CommerceShippingModule {}
