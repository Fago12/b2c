import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getSettings() {
    return this.settingsService.getStoreSettings();
  }

  @Patch()
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateSettings(@Body() data: any) {
    return this.settingsService.updateStoreSettings(data);
  }

  @Get('shipping')
  getShippingConfig() {
    return this.settingsService.getShippingConfig();
  }

  @Patch('shipping')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateShippingConfig(
    @Body() data: {
      usFlatRateInCents?: number;
      nigeriaFlatRateInCents?: number;
      indiaFlatRateInCents?: number;
      ghanaFlatRateInCents?: number;
      chinaFlatRateInCents?: number;
      internationalFlatRateInCents?: number;
    },
  ) {
    return this.settingsService.updateShippingConfig(data);
  }
}
