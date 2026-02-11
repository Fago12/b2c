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
let HomepageService = class HomepageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomepageContent() {
        const sections = await this.prisma.homepageSection.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        const hydratedSections = await Promise.all(sections.map(async (section) => {
            const data = await this.hydrateSectionData(section.type, section.referenceId);
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
    async hydrateSectionData(type, referenceId) {
        const today = new Date();
        switch (type) {
            case 'ANNOUNCEMENT':
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
                return this.prisma.heroSection.findFirst({
                    where: { isActive: true },
                    orderBy: { updatedAt: 'desc' }
                });
            case 'MARQUEE':
                return this.prisma.marqueeItem.findMany({
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
};
exports.HomepageService = HomepageService;
exports.HomepageService = HomepageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomepageService);
//# sourceMappingURL=homepage.service.js.map