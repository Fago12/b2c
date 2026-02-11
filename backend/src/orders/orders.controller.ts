import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderStatus } from '@prisma/client';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotent()
  async create(@Body() createOrderDto: any) {
    const result = await this.ordersService.create(createOrderDto);
    console.log('[OrdersController] returning:', result);
    return result;
  }

  @Get('my')
  @UseGuards(BetterAuthGuard)
  findMyOrders(@Request() req) {
    return this.ordersService.findByUserId(req.user.id);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAllAdmin(
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAllAdmin({
      status,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('admin/stats')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.ordersService.getOrderStats();
  }

  @Patch('admin/:id/status')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}

