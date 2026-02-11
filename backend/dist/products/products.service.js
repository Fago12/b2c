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
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createProductDto) {
        return this.prisma.product.create({ data: createProductDto });
    }
    findAll() {
        return this.prisma.product.findMany({
            include: { category: true },
        });
    }
    findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    }
    findBySlug(slug) {
        return this.prisma.product.findUnique({ where: { slug } });
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
                include: { category: true },
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
        const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return this.prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                images: data.images,
                tags: data.tags || [],
                attributes: data.attributes || {},
                slug: `${slug}-${Date.now()}`,
                category: { connect: { id: data.categoryId } },
            },
            include: { category: true },
        });
    }
    async updateProduct(id, data) {
        const updateData = { ...data };
        if (data.categoryId) {
            updateData.category = { connect: { id: data.categoryId } };
            delete updateData.categoryId;
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map