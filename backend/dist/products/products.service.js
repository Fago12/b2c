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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pricing_service_1 = require("../commerce/pricing/pricing.service");
const region_service_1 = require("../commerce/region/region.service");
let ProductsService = class ProductsService {
    prisma;
    pricingService;
    regionService;
    constructor(prisma, pricingService, regionService) {
        this.prisma = prisma;
        this.pricingService = pricingService;
        this.regionService = regionService;
    }
    create(createProductDto) {
        return this.prisma.product.create({ data: createProductDto });
    }
    async findAll(regionCode) {
        const products = await this.prisma.product.findMany({
            include: {
                category: true,
                productImages: { orderBy: { sortOrder: 'asc' } },
                variants: {
                    include: {
                        color: true,
                        pattern: true,
                        images: { orderBy: { sortOrder: 'asc' } }
                    }
                }
            },
            where: { isActive: true },
        });
        const defaultRegion = await this.regionService.getDefaultRegion();
        const activeRegionCode = regionCode || defaultRegion?.code || 'US';
        return Promise.all(products.map(async (p) => {
            const regional = await this.pricingService.getProductPrice(p.id, activeRegionCode);
            return {
                ...p,
                regional,
            };
        }));
    }
    async findOne(id, regionCode) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                productImages: { orderBy: { sortOrder: 'asc' } },
                variants: {
                    include: {
                        color: true,
                        pattern: true,
                        images: { orderBy: { sortOrder: 'asc' } },
                    },
                },
                _count: {
                    select: { orderItems: true }
                }
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const defaultRegion = await this.regionService.getDefaultRegion();
        const activeRegionCode = regionCode || defaultRegion?.code || 'US';
        const regional = await this.pricingService.getProductPrice(product.id, activeRegionCode);
        return {
            ...product,
            regional,
        };
    }
    async findOneBySlug(slug, regionCode) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                productImages: { orderBy: { sortOrder: 'asc' } },
                variants: {
                    include: {
                        color: true,
                        pattern: true,
                        images: { orderBy: { sortOrder: 'asc' } },
                    },
                },
                _count: {
                    select: { orderItems: true }
                }
            },
        });
        if (!product || !product.isActive)
            throw new common_1.NotFoundException('Product not found or inactive');
        const defaultRegion = await this.regionService.getDefaultRegion();
        const activeRegionCode = regionCode || defaultRegion?.code || 'US';
        const regional = await this.pricingService.getProductPrice(product.id, activeRegionCode);
        return {
            ...product,
            regional,
        };
    }
    update(id, updateProductDto) {
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: { category: true },
        });
    }
    remove(id) {
        return this.prisma.product.delete({ where: { id } });
    }
    async findAllAdmin(params) {
        const { search, categoryId, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    productImages: true,
                    variants: {
                        include: {
                            color: true,
                            pattern: true,
                            images: { orderBy: { sortOrder: 'asc' } }
                        }
                    },
                    _count: {
                        select: { orderItems: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async createProduct(data) {
        const { categoryId, productImages, variants, ...productData } = data;
        return this.prisma.product.create({
            data: {
                ...productData,
                category: { connect: { id: categoryId } },
                productImages: productImages ? {
                    createMany: { data: productImages }
                } : undefined,
                variants: variants && variants.length > 0 ? {
                    create: await (async () => {
                        const colorMap = new Map();
                        const patternMap = new Map();
                        for (const v of variants) {
                            if (v.color && !colorMap.has(v.color.name)) {
                                const c = await this.prisma.color.upsert({
                                    where: { name: v.color.name },
                                    update: v.color.hexCode && v.color.hexCode !== '#000000' ? { hexCode: v.color.hexCode } : {},
                                    create: { name: v.color.name, hexCode: v.color.hexCode || '#000000' }
                                });
                                colorMap.set(v.color.name, c.id);
                            }
                            if (v.pattern && !patternMap.has(v.pattern.name)) {
                                const p = await this.prisma.pattern.upsert({
                                    where: { name: v.pattern.name },
                                    update: v.pattern.previewImageUrl ? { previewImageUrl: v.pattern.previewImageUrl } : {},
                                    create: { name: v.pattern.name, previewImageUrl: v.pattern.previewImageUrl || '' }
                                });
                                patternMap.set(v.pattern.name, p.id);
                            }
                        }
                        return variants.map(v => {
                            const { images, color, pattern, colorId, patternId } = v;
                            const resolvedColorId = color ? colorMap.get(color.name) : colorId;
                            const resolvedPatternId = pattern ? patternMap.get(pattern.name) : patternId;
                            return {
                                sku: v.sku,
                                stock: v.stock,
                                size: v.size,
                                imageUrl: v.imageUrl,
                                priceUSD_cents: v.priceUSD_cents,
                                salePriceUSD_cents: v.salePriceUSD_cents,
                                colorId: resolvedColorId,
                                patternId: resolvedPatternId,
                                options: v.options,
                                images: images ? {
                                    createMany: { data: images }
                                } : undefined,
                            };
                        });
                    })()
                } : undefined,
            },
            include: { category: true, productImages: true, variants: true },
        });
    }
    async updateProduct(id, data) {
        const { categoryId, productImages, variants, ...productDataWithoutRelations } = data;
        const updateData = { ...productDataWithoutRelations };
        try {
            const colorMap = new Map();
            const patternMap = new Map();
            if (variants) {
                for (const v of variants) {
                    if (v.color && !colorMap.has(v.color.name)) {
                        const c = await this.prisma.color.upsert({
                            where: { name: v.color.name },
                            update: v.color.hexCode && v.color.hexCode !== '#000000' ? { hexCode: v.color.hexCode } : {},
                            create: { name: v.color.name, hexCode: v.color.hexCode || '#000000' }
                        });
                        colorMap.set(v.color.name, c.id);
                    }
                    if (v.pattern && !patternMap.has(v.pattern.name)) {
                        const p = await this.prisma.pattern.upsert({
                            where: { name: v.pattern.name },
                            update: { previewImageUrl: v.pattern.previewImageUrl || '' },
                            create: { name: v.pattern.name, previewImageUrl: v.pattern.previewImageUrl || '' }
                        });
                        patternMap.set(v.pattern.name, p.id);
                    }
                }
            }
            return await this.prisma.$transaction(async (tx) => {
                if (categoryId) {
                    updateData.category = { connect: { id: categoryId } };
                }
                if (productImages) {
                    await tx.productImage.deleteMany({ where: { productId: id } });
                    updateData.productImages = {
                        createMany: { data: productImages }
                    };
                }
                if (variants) {
                    await tx.variant.deleteMany({ where: { productId: id } });
                    updateData.variants = {
                        create: variants.map(v => {
                            const { images, colorId, patternId, color, pattern } = v;
                            const resolvedColorId = color ? colorMap.get(color.name) : colorId;
                            const resolvedPatternId = pattern ? patternMap.get(pattern.name) : patternId;
                            const vData = {
                                sku: v.sku,
                                stock: Number(v.stock || 0),
                                size: v.size,
                                imageUrl: v.imageUrl,
                                priceUSD_cents: v.priceUSD_cents,
                                salePriceUSD_cents: v.salePriceUSD_cents,
                                colorId: (resolvedColorId && resolvedColorId.length === 24) ? resolvedColorId : undefined,
                                patternId: (resolvedPatternId && resolvedPatternId.length === 24) ? resolvedPatternId : undefined,
                                options: v.options,
                            };
                            return {
                                ...vData,
                                images: images ? {
                                    createMany: { data: images }
                                } : undefined,
                            };
                        })
                    };
                }
                return tx.product.update({
                    where: { id },
                    data: updateData,
                    include: { category: true, productImages: true, variants: { include: { images: true } } },
                });
            }, { timeout: 30000 });
        }
        catch (error) {
            console.error("[PRISMA ERROR in updateProduct]:", error);
            throw error;
        }
    }
    async getProductStats() {
        const [total, inStock, lowStock, outOfStock] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.product.count({ where: { stock: { gt: 10 } } }),
            this.prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
            this.prisma.product.count({ where: { stock: 0 } }),
        ]);
        return { total, inStock, lowStock, outOfStock };
    }
    async updateStock(id, stock) {
        return this.prisma.product.update({
            where: { id },
            data: { stock },
            include: { category: true },
        });
    }
    async findAllColors() {
        return this.prisma.color.findMany({ orderBy: { name: 'asc' } });
    }
    async createColor(data) {
        return this.prisma.color.create({ data });
    }
    async findAllPatterns() {
        return this.prisma.pattern.findMany({ orderBy: { name: 'asc' } });
    }
    async createPattern(data) {
        return this.prisma.pattern.create({ data });
    }
    async addVariant(productId, data) {
        const { images, colorId, patternId, color, pattern, size, sku, stock, imageUrl, priceUSD_cents, salePriceUSD_cents } = data;
        let resolvedColorId = colorId;
        if (color && color.name) {
            const c = await this.prisma.color.upsert({
                where: { name: color.name },
                update: color.hexCode && color.hexCode !== '#000000' ? { hexCode: color.hexCode } : {},
                create: { name: color.name, hexCode: color.hexCode || '#000000' }
            });
            resolvedColorId = c.id;
        }
        let resolvedPatternId = patternId;
        if (pattern && pattern.name) {
            const p = await this.prisma.pattern.upsert({
                where: { name: pattern.name },
                update: pattern.previewImageUrl ? { previewImageUrl: pattern.previewImageUrl } : {},
                create: { name: pattern.name, previewImageUrl: pattern.previewImageUrl || '' }
            });
            resolvedPatternId = p.id;
        }
        return this.prisma.variant.create({
            data: {
                sku,
                size,
                stock: Number(stock || 0),
                imageUrl,
                priceUSD_cents,
                salePriceUSD_cents,
                colorId: resolvedColorId,
                patternId: resolvedPatternId,
                product: { connect: { id: productId } },
                images: images ? {
                    createMany: { data: images }
                } : undefined,
            },
            include: { color: true, pattern: true, images: true }
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.CommercePricingService,
        region_service_1.RegionService])
], ProductsService);
//# sourceMappingURL=products.service.js.map