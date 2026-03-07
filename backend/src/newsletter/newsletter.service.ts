import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async subscribe(email: string, source: string = 'footer') {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const listId = Number(this.configService.get<string>('BREVO_LIST_ID_NEWSLETTER') || 1);
    const url = 'https://api.brevo.com/v3/contacts';

    this.logger.log(`Attempting newsletter subscription for ${email} (Source: ${source}, List ID: ${listId})`);

    // 1. Save to internal DB
    try {
      await this.prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { isActive: true, source },
        create: { email, source },
      });
    } catch (error) {
      this.logger.error(`Failed to save subscriber to DB: ${email}`, error.stack);
      // Continue to Brevo even if DB fail? Maybe better to throw.
      // For now, let's keep going to ensure sync.
    }

    // 2. Sync with Brevo
    const headers = {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    };

    try {
      // Step A: Create or Update the contact
      // Using updateEnabled: true to update attributes if contact already exists
      try {
        await firstValueFrom(
          this.httpService.post(url, {
            email,
            listIds: [listId],
            updateEnabled: true,
          }, { headers }),
        );
      } catch (postError) {
        // If it's a duplicate error, we ignore it here and proceed to step B
        if (postError?.response?.data?.code !== 'duplicate_parameter') {
          throw postError;
        }
        this.logger.log(`Contact ${email} already exists, proceeding to explicit list assignment.`);
      }

      // Step B: Explicitly add to list
      // This is the most reliable way to ensure an existing contact is assigned to the list
      // We wrap this in a try-catch because if they are ALREADY in the list, Brevo might return an error
      // but we still want to indicate overall success to the storefront.
      try {
        await firstValueFrom(
          this.httpService.post(`${url}/lists/${listId}/contacts/add`, {
            emails: [email],
          }, { headers }),
        );
      } catch (listError) {
        this.logger.warn(`Explicit list assignment failed for ${email} (likely already in list): ${JSON.stringify(listError?.response?.data)}`);
        // We don't throw here; Step A already ensured the contact exists/is updated.
      }

      return {
        success: true,
        message: 'Subscribed successfully',
      };
    } catch (error) {
      const responseData = error?.response?.data;
      this.logger.error(`Brevo sync failed for ${email}: ${JSON.stringify(responseData)}`);
      throw new Error('Failed to synchronize with newsletter service');
    }
  }

  async deleteSubscription(email: string) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const listId = Number(this.configService.get<string>('BREVO_LIST_ID_NEWSLETTER') || 1);
    const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`;

    this.logger.log(`Deleting newsletter subscription for ${email}`);

    // 1. Remove from DB
    await this.prisma.newsletterSubscriber.delete({
      where: { email },
    });

    // 2. Remove from Brevo List
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          emails: [email],
        }, {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (error) {
      const responseData = error?.response?.data;
      // If contact not found in list, we don't treat it as a critical failure for the cleanup
      this.logger.warn(`Brevo list removal failed for ${email}: ${JSON.stringify(responseData)}`);
    }

    return { success: true };
  }

  async findAll(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.newsletterSubscriber.count(),
    ]);

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    return { total, active };
  }
}
