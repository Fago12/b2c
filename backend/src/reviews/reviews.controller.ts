import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { BetterAuthGuard } from '../auth/better-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('admin/list')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAllAdmin(
    @Query('productId') productId?: string,
    @Query('rating') rating?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      console.log('ReviewsController.findAllAdmin called', { productId, rating, page, limit });
      return await this.reviewsService.findAllAdmin({
        productId,
        rating: rating ? parseInt(rating) : undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      });
    } catch (error) {
       console.error('ReviewsController.findAllAdmin ERROR:', error);
       throw error;
    }
  }

  @Get('admin/stats')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getStats() {
    try {
       console.log('ReviewsController.getStats called');
       return await this.reviewsService.getReviewStats();
    } catch (error) {
       console.error('ReviewsController.getStats ERROR:', error);
       throw error;
    }
  }

  @Delete('admin/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteReview(@Param('id') id: string) {
    try {
      return await this.reviewsService.deleteReview(id);
    } catch (error) {
       console.error('ReviewsController.deleteReview ERROR:', error);
       throw error;
    }
  }
}
