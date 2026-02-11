import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllAdmin(params: {
        productId?: string;
        rating?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        reviews: ({
            user: {
                id: string;
                email: string;
            };
            product: {
                name: string;
                id: string;
                images: string[];
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            productId: string;
            rating: number;
            comment: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getReviewStats(): Promise<{
        total: number;
        averageRating: number;
        byRating: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
    }>;
    deleteReview(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
        rating: number;
        comment: string;
    }>;
}
