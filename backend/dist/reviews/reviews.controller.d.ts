import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAllAdmin(productId?: string, rating?: string, page?: string, limit?: string): Promise<{
        reviews: ({
            user: {
                id: string;
                email: string;
            };
            product: {
                id: string;
                name: string;
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
    getStats(): Promise<{
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
