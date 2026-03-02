import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Prisma } from '@prisma/client';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinary: CloudinaryService
  ) {}

  @Post()
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    let imageUrl = body.imageUrl;
    if (file) {
      const upload = await this.cloudinary.uploadImage(file);
      imageUrl = upload.secure_url;
    }

    const { name, slug, isActive, isComingSoon, displayOrder } = body;
    
    return this.categoriesService.create({
      name,
      slug,
      isActive: isActive === 'true' || isActive === true,
      isComingSoon: isComingSoon === 'true' || isComingSoon === true,
      displayOrder: parseInt(displayOrder) || 0,
      imageUrl
    });
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const activeFilter = isActive === undefined ? undefined : isActive === 'true';
    return this.categoriesService.findAll(activeFilter);
  }

  @Get('test-internal')
  test() {
    return { ok: true, source: 'CategoriesController' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    let data: any = { ...body };
    
    // Handle specific type conversions for multipart/form-data
    if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true;
    if (data.isComingSoon !== undefined) data.isComingSoon = data.isComingSoon === 'true' || data.isComingSoon === true;
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder);

    if (file) {
      const upload = await this.cloudinary.uploadImage(file);
      data.imageUrl = upload.secure_url;
    }

    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
