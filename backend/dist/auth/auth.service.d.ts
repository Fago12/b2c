import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ResendService } from '../mail/resend.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private resendService;
    private prisma;
    private ordersService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, resendService: ResendService, prisma: PrismaService, ordersService: OrdersService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getTokens(userId: string, email: string, role: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string): Promise<void>;
    register(user: any): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPass: string): Promise<{
        message: string;
    }>;
}
