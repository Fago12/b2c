import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: any): Promise<{
        items: {
            id: string;
            quantity: number;
            price: number;
            productId: string;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        email: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentId: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findMyOrders(req: any): Promise<({
        items: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                price: number;
                description: string;
                salePrice: number | null;
                stock: number;
                isActive: boolean;
                images: string[];
                slug: string;
                tags: string[];
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                categoryId: string;
            };
        } & {
            id: string;
            quantity: number;
            price: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        email: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentId: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    findAll(): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            emailVerified: boolean;
            image: string | null;
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
            quantity: number;
            price: number;
            productId: string;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        email: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentId: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            emailVerified: boolean;
            image: string | null;
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
                id: string;
                createdAt: Date;
                name: string;
                price: number;
                description: string;
                salePrice: number | null;
                stock: number;
                isActive: boolean;
                images: string[];
                slug: string;
                tags: string[];
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                categoryId: string;
            };
        } & {
            id: string;
            quantity: number;
            price: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        email: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentId: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
    }) | null>;
    findAllAdmin(status?: OrderStatus, search?: string, page?: string, limit?: string): Promise<{
        orders: ({
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string | null;
                email: string;
                emailVerified: boolean;
                image: string | null;
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
                    id: string;
                    createdAt: Date;
                    name: string;
                    price: number;
                    description: string;
                    salePrice: number | null;
                    stock: number;
                    isActive: boolean;
                    images: string[];
                    slug: string;
                    tags: string[];
                    attributes: import("@prisma/client/runtime/library").JsonValue | null;
                    categoryId: string;
                };
            } & {
                id: string;
                quantity: number;
                price: number;
                productId: string;
                orderId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            email: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentId: string | null;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
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
    updateStatus(id: string, status: OrderStatus): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            emailVerified: boolean;
            image: string | null;
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
                id: string;
                createdAt: Date;
                name: string;
                price: number;
                description: string;
                salePrice: number | null;
                stock: number;
                isActive: boolean;
                images: string[];
                slug: string;
                tags: string[];
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                categoryId: string;
            };
        } & {
            id: string;
            quantity: number;
            price: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        email: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentId: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
