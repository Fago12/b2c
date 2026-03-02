import { PrismaService } from '../../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
export declare class CommercePricingService {
    private prisma;
    private currencyService;
    private readonly logger;
    constructor(prisma: PrismaService, currencyService: CurrencyService);
    getProductPrice(productId: string, regionCode: string, variantId?: string): Promise<{
        basePrice: number;
        finalPrice: number;
        currency: string;
        symbol: string;
        exchangeRateUsed: string;
        isOverride: boolean;
        variantId?: string;
    }>;
}
