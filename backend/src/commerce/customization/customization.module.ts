import { Module } from '@nestjs/common';
import { CustomizationService } from './customization.service';

@Module({
  providers: [CustomizationService],
  exports: [CustomizationService],
})
export class CommerceCustomizationModule {}
