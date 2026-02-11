import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAllAdmin(params: {
    productId?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }) {
    const { productId, rating, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};
    
    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = rating;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, images: true } },
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewStats() {
    const [total, avgRating, byRating] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      Promise.all([
        this.prisma.review.count({ where: { rating: 5 } }),
        this.prisma.review.count({ where: { rating: 4 } }),
        this.prisma.review.count({ where: { rating: 3 } }),
        this.prisma.review.count({ where: { rating: 2 } }),
        this.prisma.review.count({ where: { rating: 1 } }),
      ]),
    ]);

    return {
      total,
      averageRating: avgRating._avg.rating || 0,
      byRating: {
        5: byRating[0],
        4: byRating[1],
        3: byRating[2],
        2: byRating[3],
        1: byRating[4],
      },
    };
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }
}
