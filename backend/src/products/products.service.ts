import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data: createProductDto });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({ 
      where: { id },
      include: { category: true },
    });
  }
  
  findBySlug(slug: string) {
    return this.prisma.product.findUnique({ where: { slug } });
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

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
    tags?: string[];
    attributes?: any;
  }) {
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

  async updateProduct(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    images?: string[];
    tags?: string[];
    attributes?: any;
  }) {
    const updateData: any = { ...data };
    
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

  async updateStock(id: string, stock: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock },
      include: { category: true },
    });
  }
}

