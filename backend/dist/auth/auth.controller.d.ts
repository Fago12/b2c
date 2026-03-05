import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(body: any, res: any): Promise<{
        message: string;
        user?: undefined;
    } | {
        message: string;
        user: any;
    }>;
    verify(token: string): Promise<{
        message: string;
    }>;
    register(body: any): Promise<{
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: any): Promise<{
        message: string;
    }>;
    refresh(req: any, res: any): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): Promise<{
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
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
}
