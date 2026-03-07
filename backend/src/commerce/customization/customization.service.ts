import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomizationService {
  /**
   * Calculates extra cost for customizations in USD.
   * customization: { embroidery: string, etc. }
   * options: product.customizationOptions snapshot
   */
  calculateExtraCostUSD(customization: any, options: any): number {
    let extra = 0;
    if (!customization || !options) return 0;

    const embroideryValue = customization.embroideryName || customization.embroidery;
    if (embroideryValue && options.embroidery?.enabled) {
      extra += options.embroidery?.price || 0;
    }

    return extra;
  }
}
