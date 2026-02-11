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
        createdAt: Date;
        role: string;
        isVerified: boolean;
        orders: ({
            items: {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
                price: number;
            }[];
        } & {
            id: string;
            email: string;
            createdAt: Date;
            userId: string | null;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentId: string | null;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        })[];
    } | null>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
}
