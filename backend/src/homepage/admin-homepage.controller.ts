import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin/homepage')
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminHomepageController {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  // --- Homepage Sections (Control Layer) ---

  @Get('sections')
  async getSections() {
    return this.prisma.homepageSection.findMany({
      orderBy: { order: 'asc' }
    });
  }

  @Post('sections')
  async createSection(@Body() data: any) {
    // data should contain { type, order, isActive, referenceId? }
    return this.prisma.homepageSection.create({ data });
  }

  @Patch('sections/reorder')
  async reorderSections(@Body() items: { id: string; order: number }[]) {
    // Execute in transaction to ensure consistency
    const updates = items.map((item) =>
      this.prisma.homepageSection.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );
    return this.prisma.$transaction(updates);
  }

  @Patch('sections/:id')
  async updateSection(@Param('id') id: string, @Body() data: any) {
    return this.prisma.homepageSection.update({
      where: { id },
      data,
    });
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id') id: string) {
    return this.prisma.homepageSection.delete({ where: { id } });
  }

  // --- Announcement ---
  @Get('announcements')
  async getAnnouncements() {
    return this.prisma.announcement.findMany({ orderBy: { priority: 'desc' } });
  }

  @Post('announcements')
  async createAnnouncement(@Body() data: any) {
    return this.prisma.announcement.create({ data });
  }

  @Patch('announcements/:id')
  async updateAnnouncement(@Param('id') id: string, @Body() data: any) {
    return this.prisma.announcement.update({ where: { id }, data });
  }

  @Delete('announcements/:id')
  async deleteAnnouncement(@Param('id') id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }

  // --- Hero Section ---
  @Get('heroes')
  async getHeroes() {
    return this.prisma.heroSection.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Post('heroes')
  @UseInterceptors(FileInterceptor('image'))
  async createHero(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const { title, subtitle, ctaText, ctaLink, isActive } = body;
    let imageUrl = body.imageUrl;
    
    if (file) {
      const upload = await this.cloudinary.uploadImage(file);
      imageUrl = upload.secure_url;
    }
    
    return this.prisma.heroSection.create({
      data: {
        title,
        subtitle,
        ctaText,
        ctaLink,
        imageUrl,
        isActive: isActive === 'true' || isActive === true
      }
    });
  }

  @Patch('heroes/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateHero(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      console.log(`[DEBUG] Updating Hero ${id}`, { body, file: !!file });
      const { title, subtitle, ctaText, ctaLink, isActive } = body;
      
      let data: any = {};
      if (title !== undefined) data.title = title;
      if (subtitle !== undefined) data.subtitle = subtitle;
      if (ctaText !== undefined) data.ctaText = ctaText;
      if (ctaLink !== undefined) data.ctaLink = ctaLink;
      if (isActive !== undefined) {
         data.isActive = isActive === 'true' || isActive === true;
      }

      if (file) {
        const upload = await this.cloudinary.uploadImage(file);
        data.imageUrl = upload.secure_url;
      } else if (body.imageUrl) {
        data.imageUrl = body.imageUrl;
      }

      const result = await this.prisma.heroSection.update({ 
        where: { id }, 
        data 
      });
      console.log(`[DEBUG] Update Success:`, result.id);
      return result;
    } catch (error) {
      console.error(`[DEBUG] Update Hero Error:`, error);
      require('fs').appendFileSync('debug_upload.log', `[${new Date().toISOString()}] Hero Update Error ${id}: ${error.stack}\nBody: ${JSON.stringify(body)}\n\n`);
      throw error;
    }
  }

  // --- Marquee Items ---
  @Get('marquee')
  async getMarqueeItems() {
    return this.prisma.marqueeItem.findMany({ orderBy: { order: 'asc' } });
  }

  @Post('marquee')
  async createMarqueeItem(@Body() data: any) {
    return this.prisma.marqueeItem.create({ data });
  }

  @Patch('marquee/:id')
  async updateMarqueeItem(@Param('id') id: string, @Body() data: any) {
    return this.prisma.marqueeItem.update({ where: { id }, data });
  }

  @Delete('marquee/:id')
  async deleteMarqueeItem(@Param('id') id: string) {
    return this.prisma.marqueeItem.delete({ where: { id } });
  }

  // --- Featured Collections ---
  @Get('featured-collections')
  async getFeaturedCollections() {
    return this.prisma.featuredCollection.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Post('featured-collections')
  async createFeaturedCollection(@Body() data: any) {
    return this.prisma.featuredCollection.create({ data });
  }

  @Patch('featured-collections/:id')
  async updateFeaturedCollection(@Param('id') id: string, @Body() data: any) {
    return this.prisma.featuredCollection.update({ where: { id }, data });
  }

  @Delete('featured-collections/:id')
  async deleteFeaturedCollection(@Param('id') id: string) {
    return this.prisma.featuredCollection.delete({ where: { id } });
  }

  // --- Promo Banners ---
  @Get('promos')
  async getPromos() {
    return this.prisma.promoBanner.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Post('promos')
  @UseInterceptors(FileInterceptor('image'))
  async createPromo(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const { title, subtitle, ctaText, ctaLink, targetAudience, isActive } = body;
    let imageUrl = body.imageUrl;

    if (file) {
      const upload = await this.cloudinary.uploadImage(file);
      imageUrl = upload.secure_url;
    }
    
    return this.prisma.promoBanner.create({
      data: {
        title,
        subtitle,
        ctaText,
        ctaLink,
        targetAudience,
        imageUrl,
        isActive: isActive === 'true' || isActive === true
      }
    });
  }

  @Patch('promos/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updatePromo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      console.log(`[DEBUG] Updating Promo ${id}`, { body, file: !!file });
      const { title, subtitle, ctaText, ctaLink, targetAudience, isActive } = body;
      
      let data: any = {};
      if (title !== undefined) data.title = title;
      if (subtitle !== undefined) data.subtitle = subtitle;
      if (ctaText !== undefined) data.ctaText = ctaText;
      if (ctaLink !== undefined) data.ctaLink = ctaLink;
      if (targetAudience !== undefined) data.targetAudience = targetAudience;
      if (isActive !== undefined) {
           data.isActive = isActive === 'true' || isActive === true;
      }

      if (file) {
        const upload = await this.cloudinary.uploadImage(file);
        data.imageUrl = upload.secure_url;
      } else if (body.imageUrl) {
        data.imageUrl = body.imageUrl;
      }

      const result = await this.prisma.promoBanner.update({ where: { id }, data });
      console.log(`[DEBUG] Update Success:`, result.id);
      return result;
    } catch (error) {
      console.error(`[DEBUG] Update Promo Error:`, error);
      require('fs').appendFileSync('debug_upload.log', `[${new Date().toISOString()}] Promo Update Error ${id}: ${error.stack}\nBody: ${JSON.stringify(body)}\n\n`);
      throw error;
    }
  }

  @Delete('promos/:id')
  async deletePromo(@Param('id') id: string) {
    return this.prisma.promoBanner.delete({ where: { id } });
  }
}

