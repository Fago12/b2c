import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommercePricingService } from '../commerce/pricing/pricing.service';

@Injectable()
export class HomepageService {
  constructor(
    private prisma: PrismaService,
    private pricingService: CommercePricingService,
  ) {}

  async getHomepageContent(regionCode: string = 'US') {
    try {
      // 1. Fetch active sections in order
      const sections = await this.prisma.homepageSection.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });

      // 2. Hydrate each section with content data
      const hydratedSections = await Promise.all(
        sections.map(async (section) => {
          const data = await this.hydrateSectionData(section.type, section.referenceId, regionCode);
          
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
    } catch (error: any) {
      throw error;
    }
  }

  private async hydrateSectionData(type: string, referenceId?: string | null, regionCode: string = 'US'): Promise<any> {
    const today = new Date();

    try {
      switch (type) {
        case 'ANNOUNCEMENT':
          // Fetch highest priority active announcement
          return await this.prisma.announcement.findFirst({
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
            return await this.prisma.heroSection.findUnique({ where: { id: referenceId } });
          }
          // Fallback: latest active hero
          return await this.prisma.heroSection.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
          });

        case 'MARQUEE':
          // Return ALL active marquee items (referenceId ignored for this type currently)
          return await this.prisma.marqueeItem.findMany({
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
          const productsRaw = await this.prisma.product.findMany({
            where: { id: { in: collection.productIds } },
            select: {
              id: true,
              name: true,
              slug: true,
              basePriceUSD: true,
              salePriceUSD: true,
              images: true,
              variants: true,
              options: true,
              category: { select: { name: true } }
            }
          });

          const products = await Promise.all(productsRaw.map(async (p) => ({
            ...p,
            regional: await this.pricingService.getProductPrice(p.id, regionCode)
          })));

          return { ...collection, products };

        case 'PROMO':
          // Return ALL active promos (or filtered by referenceId if we wanted single promo sections)
          // For now, let's assume 'PROMO' section shows ALL active banners (slide/grid)
          return await this.prisma.promoBanner.findMany({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
          });

        case 'NEW_ARRIVALS':
          return {
            title: "New Arrivals",
            products: await Promise.all((await this.prisma.product.findMany({
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 8,
              select: {
                id: true,
                name: true,
                slug: true,
                basePriceUSD: true,
                salePriceUSD: true,
                images: true,
                variants: true,
                options: true,
                hasVariants: true,
                category: { select: { name: true } }
              }
            })).map(async (p) => ({
               ...p,
               regional: await this.pricingService.getProductPrice(p.id, regionCode)
            })))
          };

        case 'MOST_POPULAR':
          // Primary: Sales (orderItems count), Secondary: Reviews count, Tertiary: Recency
          const popularProducts = await this.prisma.product.findMany({
            where: { isActive: true },
            orderBy: [
              { orderItems: { _count: 'desc' } },
              { reviews: { _count: 'desc' } },
              { createdAt: 'desc' }
            ],
            take: 8,
            select: {
              id: true,
              name: true,
              slug: true,
              basePriceUSD: true,
              salePriceUSD: true,
              images: true,
              variants: true,
              options: true,
              category: { select: { name: true } }
            }
          });

          return {
            title: "Most Popular",
            description: "Top picks based on community favorites and sales.",
            products: await Promise.all(popularProducts.map(async (p) => ({
              ...p,
              regional: await this.pricingService.getProductPrice(p.id, regionCode)
            })))
          };

        case 'FLASH_SALE':
          // Fetch products with salePrice, focusing on those most recently updated
          const saleProducts = await this.prisma.product.findMany({
            where: { 
              isActive: true,
              salePriceUSD: { not: null }
            },
            orderBy: { createdAt: 'desc' },
            take: 4,
            select: {
              id: true,
              name: true,
              slug: true,
              basePriceUSD: true,
              salePriceUSD: true,
              images: true,
              variants: true,
              options: true,
              category: { select: { name: true } }
            }
          });

          return {
            title: "Flash Sale",
            description: "Limited time offers on our best sellers!",
            endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Placeholder: ends in 24h
            products: await Promise.all(saleProducts.map(async (p) => ({
              ...p,
              regional: await this.pricingService.getProductPrice(p.id, regionCode)
            })))
          };

        case 'CATEGORIES':
          // Fetch top 4 active categories by displayOrder
          return await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            take: 4,
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true
            }
          });

        default:
          console.warn(`Unknown section type: ${type}`);
          return null;
      }
    } catch (error: any) {
      console.error(`[HomepageService] Hydration Error (Type: ${type}, Ref: ${referenceId}):`, error);
      throw error;
    }
  }

  async getActiveAnnouncement() {
    const today = new Date();
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
  }
}
