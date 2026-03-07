import { NewsletterService } from './newsletter.service';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(email: string, source?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findAll(page?: string, limit?: string): Promise<{
        subscribers: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            source: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
    }>;
    delete(email: string): Promise<{
        success: boolean;
    }>;
}
