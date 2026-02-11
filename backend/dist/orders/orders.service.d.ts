import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { LockService } from '../common/services/lock.service';
export declare class OrdersService {
    private prisma;
    private lockService;
    private readonly logger;
    constructor(prisma: PrismaService, lockService: LockService);
    create(data: any): Promise<{
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
        shippingAddress: Prisma.JsonValue;
    }>;
    findAll(): Promise<({
        user: {
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
        } | null;
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
        shippingAddress: Prisma.JsonValue;
    })[]>;
    findOne(id: string): Promise<({
        user: {
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
        } | null;
        items: ({
            product: {
                name: string;
                id: string;
                createdAt: Date;
                price: number;
                tags: string[];
                description: string;
                salePrice: number | null;
                stock: number;
                isActive: boolean;
                images: string[];
                categoryId: string;
                slug: string;
                attributes: Prisma.JsonValue | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            price: number;
        })[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        userId: string | null;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        shippingAddress: Prisma.JsonValue;
    }) | null>;
    attachGuestOrders(email: string, userId: string): Promise<Prisma.BatchPayload>;
    findByUserId(userId: string): Promise<({
        items: ({
            product: {
                name: string;
                id: string;
                createdAt: Date;
                price: number;
                tags: string[];
                description: string;
                salePrice: number | null;
                stock: number;
                isActive: boolean;
                images: string[];
                categoryId: string;
                slug: string;
                attributes: Prisma.JsonValue | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            price: number;
        })[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        userId: string | null;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        shippingAddress: Prisma.JsonValue;
    })[]>;
    findAllAdmin(params: {
        status?: OrderStatus;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        orders: ({
            user: {
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
            } | null;
            items: ({
                product: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    price: number;
                    tags: string[];
                    description: string;
                    salePrice: number | null;
                    stock: number;
                    isActive: boolean;
                    images: string[];
                    categoryId: string;
                    slug: string;
                    attributes: Prisma.JsonValue | null;
                };
            } & {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
                price: number;
            })[];
        } & {
            id: string;
            email: string;
            createdAt: Date;
            userId: string | null;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentId: string | null;
            shippingAddress: Prisma.JsonValue;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateStatus(id: string, status: OrderStatus): Promise<{
        user: {
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
        } | null;
        items: ({
            product: {
                name: string;
                id: string;
                createdAt: Date;
                price: number;
                tags: string[];
                description: string;
                salePrice: number | null;
                stock: number;
                isActive: boolean;
                images: string[];
                categoryId: string;
                slug: string;
                attributes: Prisma.JsonValue | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            price: number;
        })[];
    } & {
        id: string;
        email: string;
        createdAt: Date;
        userId: string | null;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        shippingAddress: Prisma.JsonValue;
    }>;
    getOrderStats(): Promise<{
        total: number;
        byStatus: {
            pending: number;
            paid: number;
            shipped: number;
            delivered: number;
            cancelled: number;
        };
        revenue: number;
    }>;
}
