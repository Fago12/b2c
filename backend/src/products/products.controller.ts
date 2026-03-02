import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers, UseGuards, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() createProductDto: Prisma.ProductCreateInput) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Headers('x-region-code') regionCode?: string) {
    return this.productsService.findAll(regionCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-region-code') regionCode?: string) {
    return this.productsService.findOne(id, regionCode);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string, @Headers('x-region-code') regionCode?: string) {
    return this.productsService.findOneBySlug(slug, regionCode);
  }

  @Patch(':id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateProductDto: Prisma.ProductUpdateInput) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Robust parsing to prevent NaN skip/take errors in Prisma
    const parsedPage = parseInt(page || '1');
    const parsedLimit = parseInt(limit || '10');
    
    return this.productsService.findAllAdmin({
      search,
      categoryId,
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
    });
  }

  @Get('admin/stats')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.productsService.getProductStats();
  }

  @Post('admin/create')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: any
  ) {
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const upload = (await this.cloudinaryService.uploadImage(file)) as any;
        imageUrls.push(upload.secure_url);
      }
    }

    // Prepare data, converting strings to proper types if coming from FormData
    // Safe JSON parsing helper
    const safeParse = (val: any) => {
      if (typeof val !== 'string') return val;
      if (!val || val === 'undefined' || val === 'null') return undefined;
      try { return JSON.parse(val); } catch (e) { return undefined; }
    };

    const variants = safeParse(data.variants);
    const normalizedVariants = Array.isArray(variants) ? variants.map(v => ({
      ...v,
      priceUSD: (v.priceUSD != null && v.priceUSD !== '' && v.priceUSD !== 'null') 
        ? Math.round(Number(v.priceUSD) * 100) 
        : null,
      salePriceUSD: (v.salePriceUSD != null && v.salePriceUSD !== '' && v.salePriceUSD !== 'null') 
        ? Math.round(Number(v.salePriceUSD) * 100) 
        : null
    })) : undefined;

    const customizationOptions = safeParse(data.customizationOptions);
    if (customizationOptions?.embroidery) {
      const p = customizationOptions.embroidery.price;
      if (p != null && p !== '' && p !== 'null') {
        customizationOptions.embroidery.price = Math.round(Number(p) * 100);
      } else {
        customizationOptions.embroidery.price = 0;
      }
    }

    const hasVariants = data.hasVariants === 'true' || data.hasVariants === true;
    
    // 1. Variant Integrity Check
    if (hasVariants) {
      if (!Array.isArray(normalizedVariants) || normalizedVariants.length === 0) {
        throw new HttpException('A product with variants must have at least one variant defined.', HttpStatus.BAD_REQUEST);
      }
      const combinations = new Set();
      for (const v of normalizedVariants) {
        if (v.stock === undefined || v.stock === null || isNaN(Number(v.stock))) {
          throw new HttpException(`Variant ${v.sku || ''} is missing a valid stock quantity.`, HttpStatus.BAD_REQUEST);
        }
        const combo = JSON.stringify(v.options || {});
        if (combinations.has(combo)) {
          throw new HttpException(`Duplicate variant detected with options: ${combo}`, HttpStatus.BAD_REQUEST);
        }
        combinations.add(combo);
      }
    }

    const basePriceUSD = data.basePrice ? Math.round(Number(data.basePrice) * 100) : (data.price ? Math.round(Number(data.price) * 100) : 0);
    const salePriceUSD = (data.salePrice && data.salePrice !== 'null') ? Math.round(Number(data.salePrice) * 100) : null;

    // 2. Sale Price Validation (Base Level)
    if (salePriceUSD != null && salePriceUSD > basePriceUSD) {
       throw new HttpException('Base sale price cannot be higher than base price.', HttpStatus.BAD_REQUEST);
    }

    // 3. Sale Price Validation (Variant Level)
    if (hasVariants && normalizedVariants) {
      for (const v of normalizedVariants) {
        const vPrice = v.priceUSD || basePriceUSD;
        if (v.salePriceUSD != null && v.salePriceUSD > vPrice) {
          throw new HttpException(`Variant ${v.sku || ''} sale price ($${v.salePriceUSD/100}) cannot be greater than its price ($${vPrice/100}).`, HttpStatus.BAD_REQUEST);
        }
      }
    }

    const productData = {
      name: data.name,
      description: data.description,
      basePriceUSD,
      salePriceUSD,
      stock: hasVariants ? 0 : (data.stock ? Number(data.stock) : 0),
      images: imageUrls,
      slug: data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      tags: safeParse(data.tags),
      attributes: safeParse(data.attributes),
      customizationOptions,
      options: safeParse(data.options),
      variants: normalizedVariants,
      hasVariants: hasVariants,
      isActive: data.isActive === 'false' ? false : true,
      weightKG: data.weightKG ? Number(data.weightKG) : 0,
    };

    return this.productsService.createProduct({
      ...productData,
      categoryId: data.categoryId
    } as any);
  }

  @Patch('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FilesInterceptor('images'))
  async updateProduct(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: any,
  ) {
    const newImageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const upload = (await this.cloudinaryService.uploadImage(file)) as any;
        newImageUrls.push(upload.secure_url);
      }
    }

    // Combined Safe JSON helper
    const safeParse = (val: any) => {
      if (typeof val !== 'string') return val;
      if (!val || val === 'undefined' || val === 'null') return undefined;
      try { return JSON.parse(val); } catch (e) { return undefined; }
    };

    // Combine existing images (if any) with new uploads
    let finalImages = newImageUrls;
    const existingImages = safeParse(data.existingImages || data.images);
    if (Array.isArray(existingImages)) {
        finalImages = [...existingImages, ...newImageUrls];
    }

    const productData: any = {};
    if (data.name) productData.name = data.name;
    if (data.description) productData.description = data.description;
    if (data.basePrice || data.price) {
        productData.basePriceUSD = Math.round(Number(data.basePrice || data.price) * 100);
    }
    if (data.salePrice !== undefined) {
        productData.salePriceUSD = data.salePrice === 'null' ? null : Math.round(Number(data.salePrice) * 100);
    }
    if (data.stock !== undefined) productData.stock = Number(data.stock);
    if (finalImages.length > 0 || data.existingImages) productData.images = finalImages;
    
    if (data.tags) productData.tags = safeParse(data.tags);
    if (data.attributes) productData.attributes = safeParse(data.attributes);
    if (data.customizationOptions) {
      const customizationOptions = safeParse(data.customizationOptions);
      if (customizationOptions?.embroidery) {
        const p = customizationOptions.embroidery.price;
        if (p != null && p !== '' && p !== 'null') {
           customizationOptions.embroidery.price = Math.round(Number(p) * 100);
        } else {
           customizationOptions.embroidery.price = 0;
        }
      }
      productData.customizationOptions = customizationOptions;
    }
    if (data.options) productData.options = safeParse(data.options);
    if (data.weightKG !== undefined) productData.weightKG = Number(data.weightKG);
    
    if (data.variants) {
      const variants = safeParse(data.variants);
      productData.variants = Array.isArray(variants) ? variants.map(v => ({
        ...v,
        priceUSD: (v.priceUSD != null && v.priceUSD !== '' && v.priceUSD !== 'null') 
          ? Math.round(Number(v.priceUSD) * 100) 
          : null,
        salePriceUSD: (v.salePriceUSD != null && v.salePriceUSD !== '' && v.salePriceUSD !== 'null') 
          ? Math.round(Number(v.salePriceUSD) * 100) 
          : null
      })) : undefined;
    }

    const hasVariants = data.hasVariants === 'true' || data.hasVariants === true;
    if (data.hasVariants !== undefined) {
      const existingProduct = (await this.productsService.findOne(id)) as any;
      if (existingProduct.hasVariants !== hasVariants) {
        const orderCount = (existingProduct as any)._count?.orderItems || 0;
        if (orderCount > 0) {
          throw new HttpException(
            `Cannot toggle variants for a product with ${orderCount} existing orders. This would break historical order tracking.`,
            HttpStatus.BAD_REQUEST
          );
        }
      }

      productData.hasVariants = hasVariants;
      if (hasVariants) productData.stock = 0;
    }

    const existingForValidation = (await this.productsService.findOne(id)) as any;
    const finalHasVariants = productData.hasVariants !== undefined ? productData.hasVariants : existingForValidation.hasVariants;
    const finalVariants = productData.variants || existingForValidation.variants;
    const finalBasePrice = productData.basePriceUSD || existingForValidation.basePriceUSD;
    const finalSalePrice = productData.salePriceUSD !== undefined ? productData.salePriceUSD : existingForValidation.salePriceUSD;

    if (finalSalePrice != null && finalSalePrice > finalBasePrice) {
      throw new HttpException('Base sale price cannot be higher than base price.', HttpStatus.BAD_REQUEST);
    }

    if (finalHasVariants) {
      if (!Array.isArray(finalVariants) || finalVariants.length === 0) {
        throw new HttpException('A product with variants must have at least one variant defined.', HttpStatus.BAD_REQUEST);
      }
      const combinations = new Set();
      for (const v of finalVariants) {
        const combo = JSON.stringify(v.options || {});
        if (combinations.has(combo)) {
          throw new HttpException(`Duplicate variant detected with options: ${combo}`, HttpStatus.BAD_REQUEST);
        }
        combinations.add(combo);

        const vPrice = v.priceUSD || finalBasePrice;
        if (v.salePriceUSD != null && v.salePriceUSD > vPrice) {
          throw new HttpException(`Variant ${v.sku || ''} sale price ($${v.salePriceUSD/100}) cannot be greater than its price ($${vPrice/100}).`, HttpStatus.BAD_REQUEST);
        }
      }
    }

    if (data.isActive !== undefined) productData.isActive = data.isActive === 'false' ? false : true;
    if (data.slug) productData.slug = data.slug;

    return this.productsService.updateProduct(id, {
      ...productData,
      categoryId: data.categoryId
    });
  }

  @Patch('admin/:id/stock')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateStock(
    @Param('id') id: string,
    @Body('stock') stock: number,
  ) {
    return this.productsService.updateStock(id, stock);
  }

  @Delete('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

