import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CustomizationChoices {
  embroidery?: {
    enabled: boolean;
    text?: string;
  };
  customColor?: string;
  instructions?: string;
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculateProductPrice(productId: string, customization?: CustomizationChoices): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { basePriceUSD: true, customizationOptions: true },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    let finalPriceUSD_cents = product.basePriceUSD; // Already in cents

    // Check for customization options
    if (customization && product.customizationOptions) {
      const options = product.customizationOptions as any;

      // Handle Embroidery Price
      if (customization.embroidery?.enabled && options.allowEmbroidery) {
        // embroideryPriceUSD should be in cents
        finalPriceUSD_cents += options.embroideryPriceUSD || 0;
      }
    }

    return finalPriceUSD_cents;
  }

  /**
   * Calculates the total for a set of items including customizations.
   * Returns total in USD cents.
   */
  async calculateTotal(items: { productId: string; quantity: number; customization?: CustomizationChoices }[]): Promise<number> {
    let totalUSD_cents = 0;
    for (const item of items) {
      const pricePerUnitUSD_cents = await this.calculateProductPrice(item.productId, item.customization);
      totalUSD_cents += pricePerUnitUSD_cents * item.quantity;
    }
    return totalUSD_cents;
  }
}
