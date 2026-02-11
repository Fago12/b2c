import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN') // Restrict access to admins
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('charts')
  async getSalesChart(@Query('days') days: string) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.analyticsService.getSalesChart(numDays);
  }
}
