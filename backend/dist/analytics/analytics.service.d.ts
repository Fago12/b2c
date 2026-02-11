import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        revenue: {
            total: number;
            today: number;
            change: number;
        };
        orders: {
            total: number;
            today: number;
            change: number;
        };
        customers: {
            total: number;
            change: number;
        };
    }>;
    getSalesChart(days?: number): Promise<{
        date: string;
        amount: number;
    }[]>;
    private calculatePercentageChange;
}
