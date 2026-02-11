import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
    getSalesChart(days: string): Promise<{
        date: string;
        amount: number;
    }[]>;
}
