import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly logger = new Logger(CurrencyService.name);
  private supportedCurrencies: string[] = ['usd'];
  private readonly CACHE_TTL = 28800; // 8 hours (3 times a day)
  private readonly REFRESH_INTERVAL = 28800 * 1000; // 8 hours in ms

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  private get apiKey(): string {
    return this.configService.get<string>('EXCHANGERATE_API_KEY') || '062a1e9b672e1dc18af81632';
  }

  async onModuleInit() {
    try {
      this.loadSupportedCurrencies();
      await this.ensureDefaultRates();
      // Proactively refresh rates
      await this.refreshRates();
      
      // Set up background refresh every 8 hours
      setInterval(() => {
        this.logger.log('Running scheduled exchange rate refresh...');
        this.refreshRates().catch(err => this.logger.error('Scheduled rate refresh failed', err));
      }, this.REFRESH_INTERVAL);
      
    } catch (error) {
      this.logger.error('CurrencyService onModuleInit failed', error);
    }
  }

  private loadSupportedCurrencies() {
    const currencies = this.configService.get<string>('STRIPE_SUPPORTED_CURRENCIES');
    if (currencies) {
      this.supportedCurrencies = currencies.split(',').map(c => c.trim().toLowerCase());
    }
  }

  private async ensureDefaultRates() {
    const defaults = [
      { currency: 'NGN', rate: '1500.00' },
      { currency: 'GHS', rate: '14.50' },
      { currency: 'GBP', rate: '0.79' },
      { currency: 'EUR', rate: '0.92' },
      { currency: 'INR', rate: '83.00' },
      { currency: 'CNY', rate: '7.20' },
      { currency: 'CAD', rate: '1.35' },
    ];

    for (const item of defaults) {
      const existing = await this.prisma.exchangeRate.findUnique({
        where: { currency: item.currency },
      });
      if (!existing) {
        await this.prisma.exchangeRate.create({ data: item });
        this.logger.log(`Created default exchange rate for ${item.currency}`);
      }
    }
  }

  async refreshRates() {
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/USD`);
      const data = await response.json();

      if (data.result === 'success') {
        const rates = data.conversion_rates;
        const updates: Promise<any>[] = [];

        for (const [currency, rate] of Object.entries(rates) as [string, number][]) {
          // We only update currencies we have in our DB to avoid bloating MongoDB
          const existing = await this.prisma.exchangeRate.findUnique({ where: { currency } });
          if (existing) {
            updates.push(
              this.prisma.exchangeRate.update({
                where: { currency },
                data: { rate: rate.toString() },
              })
            );
            // Also update Redis
            if (this.redis.isAvailable()) {
              await this.redis.getClient()?.setex(`fx:USD:${currency}`, this.CACHE_TTL, rate.toString());
            }
          }
        }
        await Promise.all(updates);
        this.logger.log('Exchange rates refreshed successfully from API.');
      }
    } catch (error) {
      this.logger.error('Failed to refresh exchange rates', error);
    }
  }

  async getRate(currency: string): Promise<string> {
    if (currency === 'USD') return '1';

    // 1. Try Redis
    if (this.redis.isAvailable()) {
      const cached = await this.redis.getClient()?.get(`fx:USD:${currency}`);
      if (cached) return cached;
    }

    // 2. Try Database
    const entry = await this.prisma.exchangeRate.findUnique({
      where: { currency },
    });

    if (entry) {
      // Background refresh cache
      if (this.redis.isAvailable()) {
        this.redis.getClient()?.setex(`fx:USD:${currency}`, this.CACHE_TTL, entry.rate);
      }
      return entry.rate;
    }

    return '1';
  }

  isStripeSupported(currency: string): boolean {
    return this.supportedCurrencies.includes(currency.toLowerCase());
  }
}
