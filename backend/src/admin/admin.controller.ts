import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(BetterAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('team')
  @Roles('SUPER_ADMIN', 'ADMIN', 'STAFF') // Allow all internal roles to viewing the team
  async getTeam() {
    return this.adminService.getTeam();
  }

  @Post('invite')
  @Roles('SUPER_ADMIN')
  async invite(@Body('email') email: string, @Req() req) {
    const inviterName = req.user?.name || 'Administrator';
    return this.adminService.inviteAdmin(email, inviterName);
  }
}

