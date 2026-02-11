"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllAdmin(params) {
        const { productId, rating, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
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
    async deleteReview(id) {
        return this.prisma.review.delete({ where: { id } });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map