import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAllAdmin(search?: string, role?: Role, page?: string, limit?: string): Promise<{
        users: {
            isVerified: boolean;
            id: string;
            email: string;
            emailVerified: boolean;
            createdAt: Date;
            role: string;
            _count: {
                orders: number;
            };
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
        admins: number;
        customers: number;
        verified: number;
        unverified: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        role: string;
        isVerified: boolean;
        orders: ({
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
        })[];
    } | null>;
    updateRole(id: string, role: Role): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
