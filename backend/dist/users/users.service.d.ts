import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.UserCreateInput): Promise<User>;
    verifyUser(id: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        banned: boolean;
        banReason: string | null;
        banExpires: Date | null;
        favoriteNumber: number | null;
        password: string | null;
        isVerified: boolean;
        hashedRefreshToken: string | null;
        verificationToken: string | null;
        resetToken: string | null;
        resetTokenExpires: Date | null;
        avatar: string | null;
        legacyRole: import(".prisma/client").$Enums.Role;
    }>;
    findOne(email: string): Promise<User | null>;
    setResetToken(email: string, token: string, expires: Date): Promise<{
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        banned: boolean;
        banReason: string | null;
        banExpires: Date | null;
        favoriteNumber: number | null;
        password: string | null;
        isVerified: boolean;
        hashedRefreshToken: string | null;
        verificationToken: string | null;
        resetToken: string | null;
        resetTokenExpires: Date | null;
        avatar: string | null;
        legacyRole: import(".prisma/client").$Enums.Role;
    }>;
    updatePassword(id: string, password: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        banned: boolean;
        banReason: string | null;
        banExpires: Date | null;
        favoriteNumber: number | null;
        password: string | null;
        isVerified: boolean;
        hashedRefreshToken: string | null;
        verificationToken: string | null;
        resetToken: string | null;
        resetTokenExpires: Date | null;
        avatar: string | null;
        legacyRole: import(".prisma/client").$Enums.Role;
    }>;
    findAllAdmin(params: {
        search?: string;
        role?: Role | string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    findById(id: string): Promise<{
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
                customization: Prisma.JsonValue | null;
                price: number;
                exchangeRateUsed: string;
                unitPriceUSD: number;
                unitPriceFinal: number;
                orderId: string;
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
            shippingAddress: Prisma.JsonValue;
            regionCode: string;
            exchangeRateUsed: string;
            chargeCurrency: string;
            chargeTotal: number;
            status: import(".prisma/client").$Enums.OrderStatus;
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
    getTeamMembers(): Promise<{
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        role: string;
        isVerified: boolean;
    }[]>;
    getCustomerStats(): Promise<{
        total: number;
        admins: number;
        customers: number;
        verified: number;
        unverified: number;
    }>;
}
