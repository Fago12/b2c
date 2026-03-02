import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await Promise.all([
        this.ensureShippingConfig(),
        this.ensureStoreSettings(),
      ]);
    } catch (error) {
      console.error('SettingsService onModuleInit failed', error);
    }
  }

  private async ensureShippingConfig() {
    const config = await this.prisma.shippingConfig.findFirst();
    if (!config) {
      await this.prisma.shippingConfig.create({
        data: {
          usFlatRateInCents: 1500, // $15.00
          nigeriaFlatRateInCents: 2500, // $25.00
          indiaFlatRateInCents: 2500, // $25.00
          ghanaFlatRateInCents: 2500, // $25.00
          chinaFlatRateInCents: 2500, // $25.00
          internationalFlatRateInCents: 2500, // $25.00
        },
      });
    }
  }

  private async ensureStoreSettings() {
    const settings = await this.prisma.storeSettings.findFirst();
    if (!settings) {
      await this.prisma.storeSettings.create({
        data: {
          storeName: 'Woven Kulture',
          currency: 'NGN',
        },
      });
    }
  }

  async getShippingConfig() {
    return this.prisma.shippingConfig.findFirst();
  }

  async updateShippingConfig(data: {
    usFlatRateInCents?: number;
    nigeriaFlatRateInCents?: number;
    indiaFlatRateInCents?: number;
    ghanaFlatRateInCents?: number;
    chinaFlatRateInCents?: number;
    internationalFlatRateInCents?: number;
  }) {
    const config = await this.prisma.shippingConfig.findFirst();
    if (!config) {
      return this.prisma.shippingConfig.create({
        data: {
          usFlatRateInCents: data.usFlatRateInCents || 1500,
          nigeriaFlatRateInCents: data.nigeriaFlatRateInCents || 2500,
          indiaFlatRateInCents: data.indiaFlatRateInCents || 2500,
          ghanaFlatRateInCents: data.ghanaFlatRateInCents || 2500,
          chinaFlatRateInCents: data.chinaFlatRateInCents || 2500,
          internationalFlatRateInCents: data.internationalFlatRateInCents || 2500,
        },
      });
    }

    return this.prisma.shippingConfig.update({
      where: { id: config.id },
      data,
    });
  }

  async getStoreSettings() {
    return this.prisma.storeSettings.findFirst();
  }

  async updateStoreSettings(data: any) {
    const settings = await this.prisma.storeSettings.findFirst();
    if (!settings) {
      return this.prisma.storeSettings.create({
        data: {
          ...data,
          storeName: data.storeName || 'Woven Kulture',
          currency: data.currency || 'NGN',
        },
      });
    }

    return this.prisma.storeSettings.update({
      where: { id: settings.id },
      data,
    });
  }
}
