import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async calculateShipping(countryCode: string, totalWeightKg: number = 0): Promise<number> {
    const config = await this.settingsService.getShippingConfig();
    const upperCode = countryCode.toUpperCase();

    // 1. United States - Flat Rate $15
    if (upperCode === 'US') {
      const rate = config?.usFlatRateInCents || 1500;
      this.logger.log(`[SHIPPING] Applying US Flat Rate: $${(rate / 100).toFixed(2)}`);
      return rate;
    }

    // 2. International (Everything else) - Weight Based
    // Priority: Dynamic rate from ShippingConfig -> Default $25/KG
    let ratePerKG = 2500; // Default $25 per KG

    if (config) {
      if (upperCode === 'NG' || upperCode === 'NIGERIA') {
        ratePerKG = config.nigeriaFlatRateInCents || 2500;
      } else if (upperCode === 'GH' || upperCode === 'GHANA') {
        ratePerKG = config.ghanaFlatRateInCents || 2500;
      } else if (upperCode === 'IN' || upperCode === 'INDIA') {
        ratePerKG = config.indiaFlatRateInCents || 2500;
      } else if (upperCode === 'CN' || upperCode === 'CHINA') {
        ratePerKG = config.chinaFlatRateInCents || 2500;
      } else {
        ratePerKG = config.internationalFlatRateInCents || 2500;
      }
    }
    
    // Fallback: If weight is 0 or missing, treat as 1KG minimum
    const billableWeight = Math.ceil(totalWeightKg || 1); 
    const shippingTotal = billableWeight * ratePerKG;
    
    this.logger.log(`[SHIPPING] ${upperCode} Order: ${totalWeightKg.toFixed(2)}kg -> ${billableWeight}kg billable @ $${(ratePerKG/100).toFixed(2)}/kg. Total: $${(shippingTotal/100).toFixed(2)}`);
    
    return shippingTotal;
  }
}
