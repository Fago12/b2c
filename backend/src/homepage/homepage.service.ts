import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getHomepageContent() {
    // 1. Fetch active sections in order
    const sections = await this.prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // 2. Hydrate each section with content data
    const hydratedSections = await Promise.all(
      sections.map(async (section) => {
        const data = await this.hydrateSectionData(section.type, section.referenceId);
        
        // If data hydration failed (e.g. referenced item deleted), return null to filter out
        if (!data && section.type !== 'NEW_ARRIVALS' && section.type !== 'MARQUEE' && section.type !== 'ANNOUNCEMENT' && section.type !== 'PROMO') {
           return null;
        }

        return {
          id: section.id,
          type: section.type,
          order: section.order,
          data,
        };
      })
    );

    // 3. Filter out nulls (failed hydrations)
    return hydratedSections.filter((s) => s !== null);
  }

  private async hydrateSectionData(type: string, referenceId?: string | null): Promise<any> {
    const today = new Date();

    switch (type) {
      case 'ANNOUNCEMENT':
        // Fetch highest priority active announcement
        return this.prisma.announcement.findFirst({
          where: {
            isActive: true,
            OR: [
              { startAt: null, endAt: null },
              { startAt: { lte: today }, endAt: { gte: today } },
              { startAt: { lte: today }, endAt: null },
              { startAt: null, endAt: { gte: today } },
            ]
          },
          orderBy: { priority: 'desc' }
        });

      case 'HERO':
        if (referenceId) {
          return this.prisma.heroSection.findUnique({ where: { id: referenceId } });
        }
        // Fallback: latest active hero
        return this.prisma.heroSection.findFirst({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' }
        });

      case 'MARQUEE':
        // Return ALL active marquee items (referenceId ignored for this type currently)
        return this.prisma.marqueeItem.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' }
        });

      case 'FEATURED':
        if (!referenceId) return null;
        const collection = await this.prisma.featuredCollection.findUnique({
          where: { id: referenceId }
        });
        
        if (!collection) return null;
        
        // Hydrate products
        const products = await this.prisma.product.findMany({
          where: { id: { in: collection.productIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            images: true,
            category: { select: { name: true } }
          }
        });
        return { ...collection, products };

      case 'PROMO':
        // Return ALL active promos (or filtered by referenceId if we wanted single promo sections)
        // For now, let's assume 'PROMO' section shows ALL active banners (slide/grid)
        return this.prisma.promoBanner.findMany({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' }
        });

      case 'NEW_ARRIVALS':
        return {
          title: "New Arrivals",
          products: await this.prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 8,
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              images: true,
              category: { select: { name: true } }
            }
          })
        };

      default:
        console.warn(`Unknown section type: ${type}`);
        return null;
    }
  }
}
