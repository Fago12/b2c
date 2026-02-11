import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DiscountType } from '@prisma/client';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // Public endpoint for validating coupons at checkout
  @Post('validate')
  validateCoupon(@Body() data: { code: string; orderTotal: number }) {
    return this.couponsService.validateCoupon(data.code, data.orderTotal);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll(
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.couponsService.findAll({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('admin/stats')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.couponsService.getStats();
  }

  @Get('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Post('admin/create')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() data: {
    code: string;
    discountType: DiscountType;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: string;
    isActive?: boolean;
  }) {
    return this.couponsService.create(data);
  }

  @Patch('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() data: {
      code?: string;
      discountType?: DiscountType;
      value?: number;
      minOrderAmount?: number;
      maxUses?: number;
      expiresAt?: string;
      isActive?: boolean;
    },
  ) {
    return this.couponsService.update(id, data);
  }

  @Delete('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
