import { Controller, Post, Get, Delete, Param, Body, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MediaService } from './media.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('media')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * Get a signed upload URL for direct browser upload
   * Requires authentication
   */
  @Post('upload-url')
  @UseGuards(BetterAuthGuard)
  async getUploadUrl(@Body() body: { metadata?: Record<string, string> }) {
    const result = await this.mediaService.getSignedUploadUrl(body.metadata);
    return {
      uploadURL: result.uploadURL,
      id: result.id,
    };
  }

  /**
   * Get the CDN URL for an image
   */
  @Get(':imageId/url')
  getImageUrl(
    @Param('imageId') imageId: string,
    @Query('variant') variant?: string
  ) {
    return {
      url: this.mediaService.getImageUrl(imageId, variant),
    };
  }

  /**
   * Delete an image (admin only)
   */
  @Delete(':imageId')
  @UseGuards(BetterAuthGuard)
  async deleteImage(@Param('imageId') imageId: string) {
    await this.mediaService.deleteImage(imageId);
    return { message: 'Image deleted successfully' };
  }

  /**
   * List all images (admin only)
   */
  @Get()
  @UseGuards(BetterAuthGuard)
  async listImages(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string
  ) {
    return this.mediaService.listImages(
      parseInt(page || '1'),
      parseInt(perPage || '20')
    );
  }
  
  /**
   * Upload an image directly to Cloudinary
   * Returns the secure_url and public_id
   */
  @Post('upload')
  @UseGuards(BetterAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinary.uploadImage(file);
    return {
      url: result.secure_url,
      id: result.public_id,
    };
  }

  /**
   * Mock upload endpoint for development
   */
  @Post('mock-upload')
  mockUpload(@Body() body: any) {
    const mockId = `mock-${Date.now()}`;
    return {
      id: mockId,
      url: `https://placehold.co/400x400?text=Uploaded`,
      success: true,
    };
  }
}
