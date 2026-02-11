import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN') // Only Super Admin can change system settings
  async updateSettings(@Body() data: {
    storeName?: string;
    description?: string;
    currency?: string;
    supportEmail?: string;
    socialLinks?: any;
  }) {
    return this.settingsService.updateSettings(data);
  }
}
