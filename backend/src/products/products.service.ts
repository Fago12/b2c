import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CommercePricingService } from '../commerce/pricing/pricing.service';
import { RegionService } from '../commerce/region/region.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private pricingService: CommercePricingService,
    private regionService: RegionService,
  ) {}

  create(createProductDto: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAll(regionCode?: string) {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      where: { isActive: true },
    });

    const defaultRegion = await this.regionService.getDefaultRegion();
    const activeRegionCode = regionCode || defaultRegion?.code || 'US';

    return Promise.all(
      products.map(async (p) => {
        const regional = await this.pricingService.getProductPrice(p.id, activeRegionCode);
        return {
          ...p,
          regional,
        };
      }),
    );
  }

  async findOne(id: string, regionCode?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true,
        _count: {
          select: { orderItems: true }
        }
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const defaultRegion = await this.regionService.getDefaultRegion();
    const activeRegionCode = regionCode || defaultRegion?.code || 'US';
    const regional = await this.pricingService.getProductPrice(product.id, activeRegionCode);

    return {
      ...product,
      regional,
    };
  }

  async findOneBySlug(slug: string, regionCode?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { 
        category: true,
        _count: {
          select: { orderItems: true }
        }
      },
    });
    if (!product || !product.isActive) throw new NotFoundException('Product not found or inactive');

    const defaultRegion = await this.regionService.getDefaultRegion();
    const activeRegionCode = regionCode || defaultRegion?.code || 'US';
    const regional = await this.pricingService.getProductPrice(product.id, activeRegionCode);

    return {
      ...product,
      regional,
    };
  }

  update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  // ==================== ADMIN METHODS ====================

  async findAllAdmin(params: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    
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

  async createProduct(data: {
    name: string;
    description: string;
    basePriceUSD: number;
    salePriceUSD?: number;
    stock: number;
    categoryId: string;
    images: string[];
    slug: string;
    tags?: string[];
    attributes?: any;
    customizationOptions?: any;
    options?: any;
    variants?: any;
    isActive?: boolean;
  }) {
    const { categoryId, ...productData } = data;
    return this.prisma.product.create({
      data: {
        ...productData,
        category: { connect: { id: categoryId } },
      } as any, // Cast to any to bypass strict type check if schema is in flux
      include: { category: true },
    });
  }

  async updateProduct(id: string, data: {
    name?: string;
    description?: string;
    basePriceUSD?: number;
    salePriceUSD?: number;
    stock?: number;
    categoryId?: string;
    images?: string[];
    tags?: string[];
    attributes?: any;
    customizationOptions?: any;
    options?: any;
    variants?: any;
    isActive?: boolean;
    slug?: string;
  }) {
    const { categoryId, ...productData } = data;
    const updateData: any = { ...productData };
    
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

  async updateStock(id: string, stock: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock },
      include: { category: true },
    });
  }
}

