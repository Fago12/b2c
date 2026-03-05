import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards, Request, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderStatus } from './types';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotent()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const result = await this.ordersService.create(createOrderDto);
    console.log('[OrdersController] returning:', result);
    return result;
  }

  @Get('my')
  @UseGuards(BetterAuthGuard)
  findMyOrders(@Request() req) {
    return this.ordersService.findByUserId(req.user.id, req.user.email);
  }

  @Get()
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAllAdmin(
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      return await this.ordersService.findAllAdmin({
        status,
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      });
    } catch (error: any) {
      console.error('[OrdersController.findAllAdmin] FATAL ERROR:', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    @Body('carrier') carrier?: string,
    @Body('trackingNumber') trackingNumber?: string,
  ) {
    return this.ordersService.updateStatus(id, status, { carrier, trackingNumber });
  }
}

