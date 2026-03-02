import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommercePricingService } from '../pricing/pricing.service';
import { ShippingService } from '../shipping/shipping.service';
import { CustomizationService } from '../customization/customization.service';
import { CurrencyService } from '../currency/currency.service';
import { RegionService } from '../region/region.service';
import { OrderStatus } from '@prisma/client';
import DecimalJS from 'decimal.js';

@Injectable()
export class CommerceOrdersService {
  private readonly logger = new Logger(CommerceOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private pricingService: CommercePricingService,
    private shippingService: ShippingService,
    private customizationService: CustomizationService,
    private currencyService: CurrencyService,
    private regionService: RegionService,
  ) {}

  /**
   * Orchestrates order creation with region-aware pricing and auditing.
   * Implements USD-canonical flow (Integer-based).
   */
  async createOrderedTransaction(data: {
    userId?: string;
    email: string;
    regionCode: string;
    shippingAddress: any;
    cartItems: any[];
    customerPhone?: string;
  }) {
    const region = await this.regionService.getRegion(data.regionCode);
    if (!region) throw new Error(`Region ${data.regionCode} not found`);

    const frozenRate = await this.currencyService.getRate(region.currency);
    const rateDec = new DecimalJS(frozenRate);

    // 1. Calculate Total Weight (kg)
    let totalWeightKg = 0;
    for (const item of data.cartItems) {
      const product = await this.prisma.product.findUnique({ 
        where: { id: item.productId },
        select: { attributes: true }
      });
      if (product) {
        // Assume weight is stored in attributes as 'weight_kg' or similar
        const weight = (product.attributes as any)?.weight_kg || (product.attributes as any)?.weight || 0.5; // Fallback 0.5kg
        totalWeightKg += weight * item.quantity;
      }
    }

    // 2. Calculate Shipping Cost (USD cents -> Regional cents)
    const baseShippingUSD_cents = await this.shippingService.calculateShipping(data.regionCode, totalWeightKg);
    const shippingCostRegional_cents = new DecimalJS(baseShippingUSD_cents)
      .mul(rateDec)
      .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
      .toNumber();

    let subtotalUSD_cents = 0;
    const orderItemsData: any[] = [];

    // 2. Process Items
    for (const item of data.cartItems) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      // Base Pricing (regional cents)
      const pricing = await this.pricingService.getProductPrice(item.productId, data.regionCode);
      
      // Customization Cost (USD cents -> Regional cents)
      const extraUSD_cents = this.customizationService.calculateExtraCostUSD(item.customization, product.customizationOptions);
      const extraRegional_cents = new DecimalJS(extraUSD_cents)
        .mul(rateDec)
        .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
        .toNumber();

      const unitPriceFinal_cents = pricing.finalPrice + extraRegional_cents;
      const lineTotalRegional_cents = unitPriceFinal_cents * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceUSD: product.basePriceUSD,
        exchangeRateUsed: frozenRate,
        unitPriceFinal: unitPriceFinal_cents,
        price: lineTotalRegional_cents,
        customization: item.customization || {},
      });

      subtotalUSD_cents += (product.basePriceUSD + extraUSD_cents) * item.quantity;
    }

    // 3. USD Canonical Base (Total cents)
    const canonicalTotalUSD_cents = subtotalUSD_cents + baseShippingUSD_cents;

    // 4. Display Total (USD cents -> Regional cents)
    const displayTotalRegional_cents = new DecimalJS(canonicalTotalUSD_cents)
      .mul(rateDec)
      .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
      .toNumber();

    // 5. Determine Charge Strategy
    const isSupported = this.currencyService.isStripeSupported(region.currency);
    
    const chargeCurrency = isSupported ? region.currency : 'USD';
    const chargeTotal_cents = isSupported ? displayTotalRegional_cents : canonicalTotalUSD_cents;

    if (!isSupported) {
      this.logger.log(`[ORDER-STRATEGY] Currency ${region.currency} unsupported. Snapping charge to USD: ${chargeTotal_cents} cents.`);
    }

    // 6. Create Order
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        email: data.email,
        status: OrderStatus.PENDING,
        
        // Snapshot Fields
        displayCurrency: region.currency,
        displayTotal: displayTotalRegional_cents,
        
        chargeCurrency: chargeCurrency,
        chargeTotal: chargeTotal_cents,
        totalUSD: canonicalTotalUSD_cents,

        // Legacy compatibility
        total: displayTotalRegional_cents,
        currency: region.currency,

        shippingAddress: data.shippingAddress,
        regionCode: data.regionCode,
        exchangeRateUsed: frozenRate,
        shippingCost: shippingCostRegional_cents,
        customerPhone: data.customerPhone,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });
  }
}
