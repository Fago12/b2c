import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NewsletterService {
    private readonly httpService;
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(httpService: HttpService, prisma: PrismaService, configService: ConfigService);
    subscribe(email: string, source?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteSubscription(email: string): Promise<{
        success: boolean;
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
    }): Promise<{
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
}
