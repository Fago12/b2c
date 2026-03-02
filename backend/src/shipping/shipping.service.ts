import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShippingZoneType } from '@prisma/client';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculates shipping cost based on the country and state/region.
   * Migrated to use the new ShippingZone model.
   */
  async calculateShippingCost(country: string, state: string = '*'): Promise<number> {
    const countryCode = country.toUpperCase();
    
    // 1. Try to find a matching zone
    const zone = await this.prisma.shippingZone.findFirst({
      where: {
        countryCode: countryCode === 'US' || countryCode === 'USA' ? 'US' : countryCode,
      },
    });

    if (zone) {
      // Returns cents
      return Math.round(zone.flatRateUSD * 100);
    }

    // 2. Global Default
    const globalDefault = await this.prisma.shippingZone.findFirst({
      where: { type: ShippingZoneType.GLOBAL_DEFAULT },
    });

    return globalDefault ? Math.round(globalDefault.flatRateUSD * 100) : 5000; // Default $50.00
  }

  private async getDefaultUSRate(): Promise<number> {
    const zone = await this.prisma.shippingZone.findFirst({
      where: { countryCode: 'US' },
    });
    return zone ? zone.flatRateUSD * 100 : 1000;
  }
}
