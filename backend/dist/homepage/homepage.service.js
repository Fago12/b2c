"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../commerce/pricing/pricing.service");
let HomepageService = class HomepageService {
    prisma;
    pricingService;
    constructor(prisma, pricingService) {
        this.prisma = prisma;
        this.pricingService = pricingService;
    }
    async getHomepageContent(regionCode = 'US') {
        try {
            const sections = await this.prisma.homepageSection.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' },
            });
            const hydratedSections = await Promise.all(sections.map(async (section) => {
                const data = await this.hydrateSectionData(section.type, section.referenceId, regionCode);
                if (!data && section.type !== 'NEW_ARRIVALS' && section.type !== 'MARQUEE' && section.type !== 'ANNOUNCEMENT' && section.type !== 'PROMO') {
                    return null;
                }
                return {
                    id: section.id,
                    type: section.type,
                    order: section.order,
                    data,
                };
            }));
            return hydratedSections.filter((s) => s !== null);
        }
        catch (error) {
            throw error;
        }
    }
    async hydrateSectionData(type, referenceId, regionCode = 'US') {
        const today = new Date();
        try {
            switch (type) {
                case 'ANNOUNCEMENT':
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
                    return await this.prisma.heroSection.findFirst({
                        where: { isActive: true },
                        orderBy: { updatedAt: 'desc' }
                    });
                case 'MARQUEE':
                    return await this.prisma.marqueeItem.findMany({
                        where: { isActive: true },
                        orderBy: { order: 'asc' }
                    });
                case 'FEATURED':
                    if (!referenceId)
                        return null;
                    const collection = await this.prisma.featuredCollection.findUnique({
                        where: { id: referenceId }
                    });
                    if (!collection)
                        return null;
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
                        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        products: await Promise.all(saleProducts.map(async (p) => ({
                            ...p,
                            regional: await this.pricingService.getProductPrice(p.id, regionCode)
                        })))
                    };
                case 'CATEGORIES':
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
        }
        catch (error) {
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
};
exports.HomepageService = HomepageService;
exports.HomepageService = HomepageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.CommercePricingService])
], HomepageService);
//# sourceMappingURL=homepage.service.js.map