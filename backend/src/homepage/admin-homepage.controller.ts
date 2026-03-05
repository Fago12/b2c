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
// Cinema Hero Update: Standardized media field for video/image uploads
export class AdminHomepageController {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  // --- Homepage Sections (Control Layer) ---

  @Get('sections')
  async getSections() {
    const sections = await this.prisma.homepageSection.findMany({
      orderBy: { order: 'asc' }
    });

    // Enrich with titles for the Admin UI
    return Promise.all(sections.map(async (section) => {
      let title = section.type.replace('_', ' ');
      
      if (section.referenceId) {
        try {
          if (section.type === 'FEATURED') {
            const coll = await this.prisma.featuredCollection.findUnique({ where: { id: section.referenceId } });
            if (coll) title = `Featured: ${coll.title}`;
          } else if (section.type === 'HERO') {
            const hero = await this.prisma.heroSection.findUnique({ where: { id: section.referenceId } });
            if (hero) title = `Hero: ${hero.title}`;
          } else if (section.type === 'ANNOUNCEMENT') {
             const ann = await this.prisma.announcement.findUnique({ where: { id: section.referenceId } });
             if (ann) title = `Announce: ${ann.message.slice(0, 20)}...`;
          }
        } catch (e) {
          console.error(`Failed to fetch title for ${section.type} ${section.referenceId}`, e);
        }
      }

      return { ...section, title };
    }));
  }

  @Post('sections')
  async createSection(@Body() data: any) {
    // data should contain { type, order, isActive, referenceId? }
    return this.prisma.homepageSection.create({ data });
  }

  @Patch('sections/reorder')
  async reorderSections(@Body() items: { id: string; order: number }[]) {
    try {
      console.log(`[DEBUG] Reordering ${items.length} sections`);
      const results = [];
      for (const item of items) {
        // Use updateMany to quietly skip if an ID was deleted but remains in browser state
        await this.prisma.homepageSection.updateMany({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
      return { success: true };
    } catch (error) {
      console.error(`[DEBUG] Reorder Error:`, error);
      throw error;
    }
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
    const { title, isActive, mediaType } = body;
    let imageUrl = null;
    let videoUrl = null;
    
    if (file) {
      if (mediaType === 'VIDEO') {
        const upload = await this.cloudinary.uploadVideo(file);
        videoUrl = upload.secure_url;
      } else {
        const upload = await this.cloudinary.uploadImage(file);
        imageUrl = upload.secure_url;
      }
    }
    
    const heroData: any = {
      title,
      mediaType: mediaType || 'IMAGE',
      isActive: isActive === 'true' || isActive === true
    };

    if (imageUrl) heroData.imageUrl = imageUrl;
    if (videoUrl) heroData.videoUrl = videoUrl;
    
    return this.prisma.heroSection.create({
      data: heroData
    });
  }

  @Patch('heroes/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateHero(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    console.log(`[CINEMA LOG] updateHero hit for ${id}`);
    try {
      const { title, isActive, mediaType } = body;
      
      let data: any = {};
      if (title !== undefined) data.title = title;
      if (mediaType !== undefined) data.mediaType = mediaType;
      if (isActive !== undefined) {
         data.isActive = isActive === 'true' || isActive === true;
      }

      if (file) {
        if (mediaType === 'VIDEO') {
          const upload = await this.cloudinary.uploadVideo(file);
          data.videoUrl = upload.secure_url;
          data.imageUrl = null; // Clear image if it's now a video
        } else {
          const upload = await this.cloudinary.uploadImage(file);
          data.imageUrl = upload.secure_url;
          data.videoUrl = null; // Clear video if it's now an image
        }
      }

      return await this.prisma.heroSection.update({ 
        where: { id }, 
        data 
      });
    } catch (error) {
      console.error(`[AdminHomepageController] Update Hero Error:`, error);
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

  // --- Flash Sale ---
  @Get('flash-sale')
  async getFlashSales() {
    return this.prisma.flashSale.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Post('flash-sale')
  async createFlashSale(@Body() data: any) {
    return this.prisma.flashSale.create({
      data: {
        ...data,
        endsAt: new Date(data.endsAt)
      }
    });
  }

  @Patch('flash-sale/:id')
  async updateFlashSale(@Param('id') id: string, @Body() data: any) {
    const updateData = { ...data };
    if (data.endsAt) updateData.endsAt = new Date(data.endsAt);
    return this.prisma.flashSale.update({ where: { id }, data: updateData });
  }

  @Delete('flash-sale/:id')
  async deleteFlashSale(@Param('id') id: string) {
    return this.prisma.flashSale.delete({ where: { id } });
  }
}

