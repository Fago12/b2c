import { PrismaService } from '../../prisma/prisma.service';
import { CommercePricingService } from '../pricing/pricing.service';
import { ShippingService } from '../shipping/shipping.service';
import { CustomizationService } from '../customization/customization.service';
import { CurrencyService } from '../currency/currency.service';
import { RegionService } from '../region/region.service';
export declare class CommerceOrdersService {
    private prisma;
    private pricingService;
    private shippingService;
    private customizationService;
    private currencyService;
    private regionService;
    private readonly logger;
    constructor(prisma: PrismaService, pricingService: CommercePricingService, shippingService: ShippingService, customizationService: CustomizationService, currencyService: CurrencyService, regionService: RegionService);
    createOrderedTransaction(data: {
        userId?: string;
        email: string;
        regionCode: string;
        shippingAddress: any;
        cartItems: any[];
        customerPhone?: string;
    }): Promise<{
        items: {
            id: string;
            weightKG: number | null;
            productId: string;
            variantId: string | null;
            quantity: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            price: number;
            exchangeRateUsed: string;
            orderId: string;
            unitPriceUSD: number;
            unitPriceFinal: number;
        }[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        userId: string | null;
        total: number;
        currency: string;
        isCustomOrder: boolean;
        customerPhone: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        regionCode: string;
        couponCode: string | null;
        exchangeRateUsed: string;
        chargeCurrency: string;
        chargeTotal: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        carrier: string | null;
        trackingNumber: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        displayCurrency: string;
        displayTotal: number;
        totalUSD: number;
        paymentId: string | null;
        shippingCost: number;
        discountAmount: number | null;
    }>;
}
