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
        createdAt: Date;
        email: string;
        emailVerified: boolean;
        role: string;
        isVerified: boolean;
        orders: ({
            items: {
                id: string;
                exchangeRateUsed: string;
                variantId: string | null;
                quantity: number;
                unitPriceUSD: number;
                unitPriceFinal: number;
                weightKG: number | null;
                price: number;
                customization: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
                orderId: string;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            carrier: string | null;
            trackingNumber: string | null;
            paidAt: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
            displayCurrency: string;
            displayTotal: number;
            chargeCurrency: string;
            chargeTotal: number;
            totalUSD: number;
            total: number;
            currency: string;
            paymentId: string | null;
            createdAt: Date;
            email: string;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            exchangeRateUsed: string;
            shippingCost: number;
            isCustomOrder: boolean;
            customerPhone: string | null;
            couponCode: string | null;
            discountAmount: number | null;
            userId: string | null;
            regionCode: string;
        })[];
    } | null>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
}
