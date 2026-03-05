import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommercePricingService } from '../commerce/pricing/pricing.service';

@Injectable()
export class HomepageService {
  constructor(
    private prisma: PrismaService,
    private pricingService: CommercePricingService,
  ) {}

  private readonly productInclude = {
    category: true,
    variants: {
      include: { 
        color: true, 
        pattern: true,
        images: { orderBy: { sortOrder: 'asc' } }
      }
    }
  } as const;

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
            include: this.productInclude,
          });

          const products = await Promise.all(productsRaw.map(async (p: any) => ({
            ...p,
            basePriceUSD: p.basePriceUSD_cents,
            salePriceUSD: p.salePriceUSD_cents,
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
              include: this.productInclude,
            })).map(async (p: any) => ({
               ...p,
               basePriceUSD: p.basePriceUSD_cents,
               salePriceUSD: p.salePriceUSD_cents,
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
            include: this.productInclude,
          });

          return {
            title: "Most Popular",
            description: "Top picks based on community favorites and sales.",
            products: await Promise.all(popularProducts.map(async (p: any) => ({
              ...p,
              basePriceUSD: p.basePriceUSD_cents,
              salePriceUSD: p.salePriceUSD_cents,
              regional: await this.pricingService.getProductPrice(p.id, regionCode)
            })))
          };

        case 'FLASH_SALE':
          let flashSaleConfig = null;
          if (referenceId) {
            flashSaleConfig = await (this.prisma as any).flashSale.findUnique({ where: { id: referenceId } });
          } else {
            // Fallback: get the latest active flash sale config
            flashSaleConfig = await (this.prisma as any).flashSale.findFirst({
              where: { isActive: true },
              orderBy: { updatedAt: 'desc' }
            });
          }

          if (!flashSaleConfig) {
            // Fallback to old logic if no config exists yet: latest 4 products on sale
            const saleProducts = await this.prisma.product.findMany({
              where: { 
                isActive: true,
                salePriceUSD_cents: { not: null }
              },
              orderBy: { createdAt: 'desc' },
              take: 4,
              include: this.productInclude,
            });

            return {
              title: "Flash Sale",
              description: "Limited time offers on our best sellers!",
              endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              products: await Promise.all(saleProducts.map(async (p: any) => ({
                ...p,
                basePriceUSD: p.basePriceUSD_cents,
                salePriceUSD: p.salePriceUSD_cents,
                regional: await this.pricingService.getProductPrice(p.id, regionCode)
              })))
            };
          }

          // Use the specific config
          const saleProductsList = await this.prisma.product.findMany({
            where: { 
              id: { in: (flashSaleConfig as any).productIds },
              isActive: true
            },
            include: this.productInclude,
          });

          return {
            title: (flashSaleConfig as any).title,
            description: (flashSaleConfig as any).description,
            endsAt: (flashSaleConfig as any).endsAt,
            products: await Promise.all(saleProductsList.map(async (p: any) => ({
              ...p,
              basePriceUSD: p.basePriceUSD_cents,
              salePriceUSD: p.salePriceUSD_cents,
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
