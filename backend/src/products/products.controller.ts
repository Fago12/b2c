import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
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
  create(@Body() createProductDto: Prisma.ProductCreateInput) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Prisma.ProductUpdateInput) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
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
    return this.productsService.findAllAdmin({
      search,
      categoryId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
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
    const productData = {
      ...data,
      price: data.price ? Number(data.price) : 0,
      stock: data.stock ? Number(data.stock) : 0,
      images: imageUrls,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
      attributes: typeof data.attributes === 'string' ? JSON.parse(data.attributes) : data.attributes,
    };

    return this.productsService.createProduct(productData);
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

    // Combine existing images (if any) with new uploads
    let finalImages = newImageUrls;
    if (data.existingImages) {
        const existing = typeof data.existingImages === 'string' ? JSON.parse(data.existingImages) : data.existingImages;
        finalImages = [...existing, ...newImageUrls];
    } else if (data.images) {
        // Fallback if images are passed directly as array/string
        const current = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
        finalImages = [...current, ...newImageUrls];
    }

    const productData = {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      stock: data.stock ? Number(data.stock) : undefined,
      images: finalImages,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
      attributes: typeof data.attributes === 'string' ? JSON.parse(data.attributes) : data.attributes,
    };

    // Remove raw multipart fields that shouldn't go to Prisma
    delete productData.existingImages;

    return this.productsService.updateProduct(id, productData);
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

