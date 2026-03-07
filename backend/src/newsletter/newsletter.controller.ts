import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body('email') email: string, @Body('source') source?: string) {
    return this.newsletterService.subscribe(email, source);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.newsletterService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('admin/stats')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getStats() {
    return this.newsletterService.getStats();
  }

  @Post('admin/delete') // Using POST for delete for simplicity with fetchAdminApi
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async delete(@Body('email') email: string) {
    return this.newsletterService.deleteSubscription(email);
  }
}
