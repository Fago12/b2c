import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // Try to find the first settings record, or create default
    let settings = await this.prisma.storeSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.storeSettings.create({
        data: {
            storeName: "My Awesome Store",
            currency: "NGN",
            description: "The best store in town."
        }
      });
    }

    return settings;
  }

  async updateSettings(data: {
    storeName?: string;
    description?: string;
    currency?: string;
    supportEmail?: string;
    socialLinks?: any;
  }) {
    // Ensure existence
    const settings = await this.getSettings();

    return this.prisma.storeSettings.update({
      where: { id: settings.id },
      data,
    });
  }
}
