import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAllAdmin({
      search,
      role,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('admin/stats')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.usersService.getCustomerStats();
  }

  @Get('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('admin/:id/role')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    return this.usersService.updateRole(id, role);
  }
}

