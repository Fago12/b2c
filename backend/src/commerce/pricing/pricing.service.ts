import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import Decimal from 'decimal.js';

@Injectable()
export class CommercePricingService {
  private readonly logger = new Logger(CommercePricingService.name);

  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
  ) {}

  /**
   * Calculates the final price for a product in a given region.
   * Priority: 
   * 1. Regional Override (Manual Price)
   * 2. Automatic Currency Conversion (USD -> Regional)
   */
  async getProductPrice(productId: string, regionCode: string, variantId?: string): Promise<{
    basePrice: number;    // Regional cents
    finalPrice: number;   // Regional cents
    currency: string;
    symbol: string;
    exchangeRateUsed: string;
    isOverride: boolean;
    variantId?: string;
  }> {
    let region = await this.prisma.region.findUnique({ where: { code: regionCode } });
    
    // Fallback System
    if (!region) {
      this.logger.warn(`Region ${regionCode} not found, falling back to US`);
      region = await this.prisma.region.findUnique({ where: { code: 'US' } });
      if (!region) throw new Error(`Fallback region US not found in database`);
    }

    const product = await this.prisma.product.findUnique({ 
      where: { id: productId },
      include: { variants: true }
    });
    if (!product) throw new Error(`Product ${productId} not found`);

    const frozenRate = await this.currencyService.getRate(region.currency);
    const rateDec = new Decimal(frozenRate);

    // 1. Check for manual override
    const override = await this.prisma.productRegionalPrice.findUnique({
      where: {
        productId_regionCode: {
          productId,
          regionCode: region.code,
        },
      },
    });

    if (override) {
      // Manual overrides are already in regional cents
      const convertedBase = new Decimal(product.basePriceUSD_cents)
        .mul(rateDec)
        .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
        .toNumber();
      
      return {
        basePrice: convertedBase,
        finalPrice: override.price,
        currency: region.currency,
        symbol: (region as any).symbol,
        exchangeRateUsed: frozenRate,
        isOverride: true,
      };
    }

    // 2. Identify Price Point in USD
    // PRIORITY CHAIN:
    // 1. Variant Sale Price (if any)
    // 2. Variant Base Price (if any)
    // 3. Product Sale Price (if any)
    // 4. Product Base Price (required)
    
    let finalUSD = product.salePriceUSD_cents ?? product.basePriceUSD_cents;
    
    if (variantId) {
      const variant = await this.prisma.variant.findUnique({ where: { id: variantId } });
      if (variant && variant.productId === productId) {
        // Use variant's specific sale price if it exists
        if (variant.salePriceUSD_cents != null && variant.salePriceUSD_cents > 0) {
            finalUSD = variant.salePriceUSD_cents;
        } 
        // Else use variant's base price if it exists
        else if (variant.priceUSD_cents != null && variant.priceUSD_cents > 0) {
            finalUSD = variant.priceUSD_cents;
        }
        // Else it automatically stays as product.salePriceUSD_cents ?? product.basePriceUSD_cents (Inheritance)
      }
    }

    // 3. Automatic conversion for the selected price
    const conversionBase = new Decimal(product.basePriceUSD_cents)
      .mul(rateDec)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();

    const conversionFinal = new Decimal(finalUSD)
      .mul(rateDec)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();

    return {
      basePrice: conversionBase,
      finalPrice: conversionFinal,
      currency: region.currency,
      symbol: (region as any).symbol,
      exchangeRateUsed: frozenRate,
      isOverride: false,
      variantId
    };
  }
}
