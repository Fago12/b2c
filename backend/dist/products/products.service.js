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
            include: { category: true },
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
        const { categoryId, ...productData } = data;
        return this.prisma.product.create({
            data: {
                ...productData,
                category: { connect: { id: categoryId } },
            },
            include: { category: true },
        });
    }
    async updateProduct(id, data) {
        const { categoryId, ...productData } = data;
        const updateData = { ...productData };
        if (categoryId) {
            updateData.category = { connect: { id: categoryId } };
        }
        return this.prisma.product.update({
            where: { id },
            data: updateData,
            include: { category: true },
        });
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_service_1.CommercePricingService,
        region_service_1.RegionService])
], ProductsService);
//# sourceMappingURL=products.service.js.map