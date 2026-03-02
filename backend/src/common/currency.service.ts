import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Converts a value from USD to a target currency using internal exchange rates.
   */
  async convertFromUSD(amountInUSD: number, targetCurrency: string): Promise<number> {
    if (targetCurrency.toUpperCase() === 'USD') return amountInUSD;

    const rateEntry = await (this.prisma as any).exchangeRate.findUnique({
      where: { currency: targetCurrency.toUpperCase() },
    });

    if (!rateEntry || !rateEntry.isActive) {
      // Fallback or throw error? For now fallback to amount (or log)
      console.warn(`No active exchange rate found for ${targetCurrency}`);
      return amountInUSD;
    }

    return Math.round(amountInUSD * rateEntry.rate);
  }

  /**
   * Returns all active exchange rates.
   */
  async getRates() {
    return (this.prisma as any).exchangeRate.findMany({
      where: { isActive: true },
    });
  }

  /**
   * Formats a price with the correct currency symbol (can be expanded).
   */
  formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming prices are stored in cents
  }
}
