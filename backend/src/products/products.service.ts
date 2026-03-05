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

  async createProduct(data: {
    name: string;
    description: string;
    basePriceUSD_cents: number;
    salePriceUSD_cents?: number;
    stock: number;
    categoryId: string;
    productImages?: { imageUrl: string; sortOrder: number }[];
    slug: string;
    tags?: string[];
    attributes?: any;
    hasVariants?: boolean;
    isActive?: boolean;
    weightKG?: number;
    variants?: any[];
  }) {
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
            const colorMap = new Map<string, string>();
            const patternMap = new Map<string, string>();
            
            // Resolve unique attributes sequentially
            for (const v of variants) {
              if (v.color && !colorMap.has(v.color.name)) {
                const c = await this.prisma.color.upsert({
                  where: { name: v.color.name } as any,
                  update: v.color.hexCode && v.color.hexCode !== '#000000' ? { hexCode: v.color.hexCode } : {},
                  create: { name: v.color.name, hexCode: v.color.hexCode || '#000000' }
                });
                colorMap.set(v.color.name, c.id);
              }
              if (v.pattern && !patternMap.has(v.pattern.name)) {
                const p = await this.prisma.pattern.upsert({
                  where: { name: v.pattern.name } as any,
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

  async updateProduct(id: string, data: {
    name?: string;
    description?: string;
    basePriceUSD_cents?: number;
    salePriceUSD_cents?: number;
    stock?: number;
    categoryId?: string;
    productImages?: { imageUrl: string; sortOrder: number }[];
    tags?: string[];
    attributes?: any;
    hasVariants?: boolean;
    isActive?: boolean;
    slug?: string;
    variants?: any[];
    weightKG?: number;
  }) {
    const { categoryId, productImages, variants, ...productDataWithoutRelations } = data;
    const updateData: any = { ...productDataWithoutRelations };

    try {
      // 1. Pre-Resolution Phase (Outside Transaction to avoid lock contention)
      // Resolve all unique colors/patterns sequentially
      const colorMap = new Map<string, string>();
      const patternMap = new Map<string, string>();

      if (variants) {
        for (const v of variants) {
          if (v.color && !colorMap.has(v.color.name)) {
            const c = await this.prisma.color.upsert({
              where: { name: v.color.name } as any,
              update: v.color.hexCode && v.color.hexCode !== '#000000' ? { hexCode: v.color.hexCode } : {}, 
              create: { name: v.color.name, hexCode: v.color.hexCode || '#000000' }
            });
            colorMap.set(v.color.name, c.id);
          }
          if (v.pattern && !patternMap.has(v.pattern.name)) {
            const p = await this.prisma.pattern.upsert({
              where: { name: v.pattern.name } as any,
              update: { previewImageUrl: v.pattern.previewImageUrl || '' }, 
              create: { name: v.pattern.name, previewImageUrl: v.pattern.previewImageUrl || '' }
            });
            patternMap.set(v.pattern.name, p.id);
          }
        }
      }

      // 2. Transaction Phase
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
              
              // Use resolved ID if available, otherwise fallback to provided ID
              const resolvedColorId = color ? colorMap.get(color.name) : colorId;
              const resolvedPatternId = pattern ? patternMap.get(pattern.name) : patternId;

              const vData: any = {
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
    } catch (error) {
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

  async updateStock(id: string, stock: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock },
      include: { category: true },
    });
  }

  // ==================== COLOR & PATTERN METHODS ====================

  async findAllColors() {
    return this.prisma.color.findMany({ orderBy: { name: 'asc' } });
  }

  async createColor(data: { name: string; hexCode: string }) {
    return this.prisma.color.create({ data });
  }

  async findAllPatterns() {
    return this.prisma.pattern.findMany({ orderBy: { name: 'asc' } });
  }

  async createPattern(data: { name: string; previewImageUrl: string }) {
    return this.prisma.pattern.create({ data });
  }

  // ==================== VARIANT METHODS ====================

  async addVariant(productId: string, data: {
    colorId?: string;
    patternId?: string;
    color?: any;
    pattern?: any;
    size?: string;
    sku?: string;
    priceUSD_cents?: number;
    salePriceUSD_cents?: number;
    stock: number;
    imageUrl?: string;
    images?: { imageUrl: string; sortOrder: number }[];
  }) {
    const { images, colorId, patternId, color, pattern, size, sku, stock, imageUrl, priceUSD_cents, salePriceUSD_cents } = data;
    
    let resolvedColorId = colorId;
    if (color && (color as any).name) {
      const c = await this.prisma.color.upsert({
        where: { name: (color as any).name } as any,
        update: (color as any).hexCode && (color as any).hexCode !== '#000000' ? { hexCode: (color as any).hexCode } : {},
        create: { name: (color as any).name, hexCode: (color as any).hexCode || '#000000' }
      });
      resolvedColorId = c.id;
    }

    let resolvedPatternId = patternId;
    if (pattern && (pattern as any).name) {
      const p = await this.prisma.pattern.upsert({
        where: { name: (pattern as any).name } as any,
        update: (pattern as any).previewImageUrl ? { previewImageUrl: (pattern as any).previewImageUrl } : {},
        create: { name: (pattern as any).name, previewImageUrl: (pattern as any).previewImageUrl || '' }
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
      } as any,
      include: { color: true, pattern: true, images: true }
    });
  }
}

