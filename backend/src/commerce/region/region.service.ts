import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RegionService implements OnModuleInit {
  private readonly logger = new Logger(RegionService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultRegions();
  }

  private async ensureDefaultRegions() {
    const defaultRegions = [
      { name: 'United States', code: 'US', currency: 'USD', symbol: '$', isDefault: true },
      { name: 'Nigeria', code: 'NG', currency: 'NGN', symbol: '₦', isDefault: false },
      { name: 'Ghana', code: 'GH', currency: 'GHS', symbol: '₵', isDefault: false },
      { name: 'India', code: 'IN', currency: 'INR', symbol: '₹', isDefault: false },
      { name: 'China', code: 'CN', currency: 'CNY', symbol: '¥', isDefault: false },
      { name: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£', isDefault: false },
      { name: 'Canada', code: 'CA', currency: 'CAD', symbol: 'CA$', isDefault: false },
    ];

    for (const regionData of defaultRegions) {
      const existing = await this.prisma.region.findUnique({ where: { code: regionData.code } });
      if (!existing) {
        this.logger.log(`Seeding missing region: ${regionData.code}`);
        await this.prisma.region.create({
          data: { ...regionData, isActive: true } as any,
        });
      }
    }
  }

  async getRegion(code: string) {
    return this.prisma.region.findUnique({
      where: { code },
    });
  }

  async getDefaultRegion() {
    return this.prisma.region.findFirst({
      where: { isDefault: true },
    }) || this.prisma.region.findFirst();
  }

  async getAllActiveRegions() {
    return this.prisma.region.findMany({
      where: { isActive: true },
    });
  }
}
